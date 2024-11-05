import os
from typing import List, Optional
from pydantic import BaseModel
import time
from lago_python_client import Client as Lago
from lago_python_client.exceptions import LagoApiError
from lago_python_client.models import Event, BatchEvent
from enum import Enum

'''
TxEvent provides the structure for us to treat what is actually
3 separate events in Lago speak as a single transaction
in product speak.
'''
class TxEvent(BaseModel):
    base_transaction_id: str
    external_subscription_id: str
    timestamp: int
    model: str
    prompt_tokens: int
    completion_tokens: int

class LagoBillableMetricEnum(str, Enum):
    INPUT_TOKENS = "input_tokens"
    OUTPUT_TOKENS = "output_tokens"

class Pipeline:
    class Valves(BaseModel):
        # List target pipeline ids (models) that this filter will be connected to.
        # If you want to connect this filter to all pipelines, you can set pipelines to ["*"]
        pipelines: List[str] = []

        # Assign a priority level to the filter pipeline.
        # The priority level determines the order in which the filter pipelines are executed.
        # The lower the number, the higher the priority.
        priority: int = 0

        # Valves for rate limiting
        requests_per_minute: Optional[int] = None
        requests_per_hour: Optional[int] = None
        sliding_window_limit: Optional[int] = None
        sliding_window_minutes: Optional[int] = None

        # Lago
        lago_key: Optional[str] = None
        lago_host: Optional[str] = None
        lago_default_plan_code: Optional[str] = None

    def __init__(self):
        # Pipeline filters are only compatible with Open WebUI
        # You can think of filter pipeline as a middleware that can be used to edit the form data before it is sent to the OpenAI API.
        self.type = "filter"

        # Optionally, you can set the id and name of the pipeline.
        # Best practice is to not specify the id so that it can be automatically inferred from the filename, so that users can install multiple versions of the same pipeline.
        # The identifier must be unique across all pipelines.
        # The identifier must be an alphanumeric string that can include underscores or hyphens. It cannot contain spaces, special characters, slashes, or backslashes.
        # self.id = "rate_limit_filter_pipeline"
        self.name = "Rate Limit Filter"

        # Initialize rate limits
        self.valves = self.Valves(
            **{
                "pipelines": os.getenv("RATE_LIMIT_PIPELINES", "*").split(","),
                "requests_per_minute": int(
                    os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", 10)
                ),
                "requests_per_hour": int(
                    os.getenv("RATE_LIMIT_REQUESTS_PER_HOUR", 1000)
                ),
                "sliding_window_limit": int(
                    os.getenv("RATE_LIMIT_SLIDING_WINDOW_LIMIT", 100)
                ),
                "sliding_window_minutes": int(
                    os.getenv("RATE_LIMIT_SLIDING_WINDOW_MINUTES", 15)
                ),
                "lago_key": os.getenv("LAGO_KEY", None),
                "lago_host": os.getenv("LAGO_HOST", None),
                "lago_default_plan_code": os.getenv("LAGO_DEFAULT_PLAN_CODE", "standard_plan"),
            }
        )

        # Tracking data - user_id -> (timestamps of requests)
        self.user_requests = {}

        # Lago
        self.lago = None
        if self.valves.lago_key:
            print("Lago Events enabled. Unset LAGO_KEY to disable.")
            # TODO: Lago client can be configured to post to a custom ingest url (a number of message bus options are possible)
            self.lago = Lago(
                api_key=self.valves.lago_key, api_url=self.valves.lago_host
            )
        else:
            print("Lago Events disabled. Set LAGO_KEY and LAGO_HOST to enable.")

    async def on_startup(self):
        # This function is called when the server is started.
        print(f"on_startup:{__name__}")
        pass

    async def on_shutdown(self):
        # This function is called when the server is stopped.
        print(f"on_shutdown:{__name__}")
        pass

    def prune_requests(self, user_id: str):
        """Prune old requests that are outside of the sliding window period."""
        now = time.time()
        if user_id in self.user_requests:
            self.user_requests[user_id] = [
                req
                for req in self.user_requests[user_id]
                if (
                    (self.valves.requests_per_minute is not None and now - req < 60)
                    or (self.valves.requests_per_hour is not None and now - req < 3600)
                    or (
                        self.valves.sliding_window_limit is not None
                        and now - req < self.valves.sliding_window_minutes * 60
                    )
                )
            ]

    def log_request(self, user_id: str):
        """Log a new request for a user."""
        now = time.time()
        if user_id not in self.user_requests:
            self.user_requests[user_id] = []
        self.user_requests[user_id].append(now)

    def rate_limited(self, user_id: str) -> bool:
        """Check if a user is rate limited."""
        self.prune_requests(user_id)

        user_reqs = self.user_requests.get(user_id, [])

        if self.valves.requests_per_minute is not None:
            requests_last_minute = sum(1 for req in user_reqs if time.time() - req < 60)
            if requests_last_minute >= self.valves.requests_per_minute:
                return True

        if self.valves.requests_per_hour is not None:
            requests_last_hour = sum(1 for req in user_reqs if time.time() - req < 3600)
            if requests_last_hour >= self.valves.requests_per_hour:
                return True

        if self.valves.sliding_window_limit is not None:
            requests_in_window = len(user_reqs)
            if requests_in_window >= self.valves.sliding_window_limit:
                return True

        return False

    async def inlet(self, body: dict, user: Optional[dict] = None) -> dict:
        print(f"pipe:{__name__}")
        # print(body)
        # print(user)

        if user.get("role", "admin") == "user":
            user_id = user["id"] if user and "id" in user else "default_user"
            if self.rate_limited(user_id):
                raise Exception("Rate limit exceeded. Please try again later.")

            self.log_request(user_id)
        return body

    async def outlet(self, body: dict, user: Optional[dict] = None) -> dict:
        self.meter_usage(body, user)
        return body

    def meter_usage(self, body: dict, user: Optional[dict] = None):
        if not self.lago:
            print("Lago not enabled. Skipping sending metering events")
            return

        batch_event = self.extract_batch_event_from_body(body, user)
        lago_batch_event = self.to_lago_batch_event(batch_event)
        try:
            '''
            TODO: this is where we can swap out any blocking api requests to something
            more durable if necessary. options include message bus or a job scheduling service
            '''
            self.lago.events.batch_create(lago_batch_event)
        except (LagoApiError, Exception) as e:
            print(f"Error posting event to Lago: {e}")

    def extract_batch_event_from_body(self, body: dict, user: Optional[dict] = None) -> TxEvent:
        model_id = body["model"].replace("arcee_pipeline.", "", 1)
        tx_id = body["id"]

        # split the oidc provider annotation ending in @ from
        # ie oidc@123456789 -> oidc, 123456789
        _, user_id = user["oauth_sub"].split("@") if user and user["oauth_sub"] is not None else ("404_provider_not_found", "404_user_id_not_found")
        # TODO: extract different plan codes from the user or body object?
        plan_code = self.valves.lago_default_plan_code
        # TODO: cache subscription_id
        subscription_response = self.lago.subscriptions.find_all({'external_customer_id': user_id, 'plan_code': plan_code})
        if len(subscription_response['subscriptions']) != 1:
            print(f"No single { {plan_code} } found for user { {user_id} }")
            subscription_id = user_id
        else:
            subscription_id = subscription_response['subscriptions'][0].external_id
        prompt_tokens = 0
        completion_tokens = 0
        '''
        the last message has the token count results for the particular request. it is not until
        the assistant responds that we are provided data for metering. openwebui sends all messages
        from a session to the backend.
        '''
        message = body["messages"][-1]
        usage = message.get("info", {})
        if not usage:
            print("No usage found in turn", body["messages"])
        prompt_tokens += usage.get("prompt_tokens", 0)
        completion_tokens += usage.get("completion_tokens", 0)
        return TxEvent(
            base_transaction_id=tx_id,
            external_subscription_id=subscription_id,
            timestamp=int(time.time()), # Use current time in seconds
            model=model_id,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )

    def to_lago_batch_event(self, batch_event: TxEvent) -> BatchEvent:
        return BatchEvent(events=[
            Event(
                transaction_id=f"{batch_event.base_transaction_id}-{LagoBillableMetricEnum.INPUT_TOKENS.value}",
                external_subscription_id=batch_event.external_subscription_id,
                code=LagoBillableMetricEnum.INPUT_TOKENS.value,
                timestamp=batch_event.timestamp,
                properties={
                    "model": batch_event.model,
                    "prompt_tokens": batch_event.prompt_tokens
                }
            ),
            Event(
                transaction_id=f"{batch_event.base_transaction_id}-{LagoBillableMetricEnum.OUTPUT_TOKENS.value}",
                external_subscription_id=batch_event.external_subscription_id,
                code=LagoBillableMetricEnum.OUTPUT_TOKENS.value,
                timestamp=batch_event.timestamp,
                properties={
                    "model": batch_event.model,
                    "completion_tokens": batch_event.completion_tokens
                }
            )
        ])
