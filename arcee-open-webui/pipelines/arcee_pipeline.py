"""
title: Arcee Pipeline
author: Mike Nason
date: 2024-09-06
version: 1.0
license: MIT
description: A pipeline for generating text and processing images using either a Amazon SageMaker Endpoint, or an OpenAI Manifold.
# do not list requirements here, but in requirements.txt so they are installed in the image, not at runtime
# requirements: boto3, pydantic_core, posthog
environment_variables: SAGEMAKER_ENDPOINT_NAME, OPENAI_API_BASE_URL, OPENAI_API_KEY, MODEL_NAME
"""

import os
import io
import json
import boto3
import requests
from typing import List, Union, Generator, Iterator
from pydantic import BaseModel
from pydantic_core import from_json
from posthog import Posthog


class Pipeline:
    class Valves(BaseModel):
        MODEL_NAME: str | None = None
        SAGEMAKER_ENDPOINT_NAME: str | None = None
        OPENAI_API_BASE_URL: str | None = None
        OPENAI_API_KEY: str | None = None
        DEBUG_LOGGING: bool | None = None
        POSTHOG_KEY: str | None = None
        POSTHOG_HOST: str | None = None

    def __init__(self):
        self.type = "manifold"
        self.name = ""  # use the model ids directly
        self._pipelines_models_cache = (
            {}
        )  # map of pipeline ids to model ids, cant contain special characters

        self.valves = self.Valves(
            **{
                "MODEL_NAME": os.getenv("MODEL_NAME"),
                "SAGEMAKER_ENDPOINT_NAME": os.getenv("SAGEMAKER_ENDPOINT_NAME"),
                "OPENAI_API_BASE_URL": os.getenv("OPENAI_API_BASE_URL"),
                "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
                "DEBUG_LOGGING": os.getenv("DEBUG_LOGGING") is not None,
                "POSTHOG_KEY": os.getenv("POSTHOG_KEY"),
                "POSTHOG_HOST": os.getenv("POSTHOG_HOST"),
            }
        )

        self.posthog = None
        self.smr = None

        if self.valves.SAGEMAKER_ENDPOINT_NAME and self.valves.OPENAI_API_BASE_URL:
            raise ValueError(
                "Both SAGEMAKER_ENDPOINT_NAME and OPENAI_API_BASE_URL are provided. Please provide only one."
            )

        self.pipelines = self.get_pipelines()
        if self.valves.DEBUG_LOGGING:
            print(
                f"pipe.debug_pipelines:{__name__}",
                self.pipelines,
                self._pipelines_models_cache,
            )

    def get_pipelines(self):
        models = self.get_models()
        pipelines = []
        for model in models:
            pipeline_id = (
                model["id"].split("/")[-1] if "/" in model["id"] else model["id"]
            )
            self._pipelines_models_cache[pipeline_id] = model["id"]
            pipelines.append(
                {"id": pipeline_id, "name": model.get("name", model["id"])}
            )
        return pipelines

    async def on_startup(self):
        print(f"on_startup:{__name__}")
        if self.valves.POSTHOG_KEY:
            print("Posthog analytics enabled. Unset POSTHOG_KEY to disable.")
            self.posthog = Posthog(
                api_key=self.valves.POSTHOG_KEY, host=self.valves.POSTHOG_HOST
            )
        else:
            print("Posthog analytics disabled. Set POSTHOG_KEY to enable.")

        if self.valves.SAGEMAKER_ENDPOINT_NAME:
            self.smr = boto3.client(
                "sagemaker-runtime",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", None),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", None),
                aws_session_token=os.getenv("AWS_SESSION_TOKEN", None),
                region_name=os.getenv("AWS_REGION", None),
            )

    async def on_shutdown(self):
        print(f"on_shutdown:{__name__}")
        if self.posthog:
            self.posthog.flush()
            self.posthog = None

        if self.smr:
            self.smr = None

    async def on_valves_updated(self):
        print(f"on_valves_updated:{__name__}")
        await self.on_shutdown()
        await self.on_startup()

        self.pipelines = self.get_pipelines()
        if self.valves.DEBUG_LOGGING:
            print(
                f"pipe.debug_pipelines:{__name__}",
                self.pipelines,
                self._pipelines_models_cache,
            )

    def get_models(self):
        if self.valves.SAGEMAKER_ENDPOINT_NAME:
            return [
                {
                    "id": self.valves.SAGEMAKER_ENDPOINT_NAME,
                    "name": self.valves.SAGEMAKER_ENDPOINT_NAME,
                }
            ]
        elif self.valves.OPENAI_API_BASE_URL:
            return self.get_openai_models()
        else:
            return []

    def get_openai_models(self):
        if self.valves.OPENAI_API_KEY:
            try:
                headers = {
                    "Authorization": f"Bearer {self.valves.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                }
                r = requests.get(
                    f"{self.valves.OPENAI_API_BASE_URL}/models", headers=headers, timeout=10
                )
                models = r.json()
                return [
                    {
                        "id": model["id"],
                        "name": model["name"] if "name" in model else model["id"],
                    }
                    for model in models["data"]
                ]
            except Exception as e:
                print(f"Error fetching OpenAI models: {e}")
                return [
                    {
                        "id": "error",
                        "name": self.valves.MODEL_NAME
                        or "Could not fetch models, please check the pipeline connection.",
                    },
                ]
        else:
            return []

    def pipe(
        self, user_message: str, model_id: str, messages: List[dict], body: dict
    ) -> Union[str, Generator, Iterator]:
        print(f"pipe:{__name__}")

        if self.valves.DEBUG_LOGGING:
            print(
                f"pipe.debug:{__name__}: model_id={model_id}, user_message={user_message}, messages={messages}, body={body}"
            )

        if self.valves.SAGEMAKER_ENDPOINT_NAME:
            return self.sagemaker_pipe(user_message, model_id, messages, body)
        elif self.valves.OPENAI_API_BASE_URL:
            return self.openai_pipe(user_message, model_id, messages, body)
        else:
            return "Error: No valid endpoint configured"

    def sagemaker_pipe(
        self, user_message: str, model_id: str, messages: List[dict], body: dict
    ):
        try:
            payload = {
                "model": self.valves.SAGEMAKER_ENDPOINT_NAME,
                "messages": messages,
                "stream": body.get("stream", False),
                "top_p": body.get("top_p", 0.9),
                "temperature": body.get("temperature", 0.5),
                "max_tokens": body.get("max_tokens", 1024),
            }
            if payload["stream"]:
                return self.sagemaker_stream_response(model_id, payload)
            else:
                return self.sagemaker_get_completion(model_id, payload)
        except Exception as e:
            return f"SageMaker Error: {e}"

    def sagemaker_stream_response(self, endpoint_name: str, payload: dict) -> Generator:
        body, meta = self.extract_body_meta(payload)
        resp = self.smr.invoke_endpoint_with_response_stream(
            EndpointName=endpoint_name,
            Body=json.dumps(body),
            ContentType="application/json",
        )

        for c in LineIterator(resp["Body"]):
            c = c.decode("utf-8")
            if c.startswith("data:"):
                chunk = json.loads(c.lstrip("data:").rstrip("/n"))
                if chunk["choices"][0]["finish_reason"]:
                    break
                yield chunk["choices"][0]["delta"]["content"]

        # TODO log sagemaker usage, need to parse the usage from the stream
        # self.track(endpoint_name, payload, meta, r.get("usage"))

    def sagemaker_get_completion(self, model_id: str, payload: dict) -> str:
        body, meta = self.extract_body_meta(payload)
        resp = self.smr.invoke_endpoint(
            EndpointName=model_id,
            Body=json.dumps(body),
            ContentType="application/json",
        )
        r = json.loads(resp["Body"].read().decode("utf-8"))

        self.track(model_id, body, meta, r.get("usage"))

        return r["choices"][0]["message"]["content"]

    def openai_pipe(
        self, user_message: str, model_id: str, messages: List[dict], body: dict
    ):
        headers = {
            "Authorization": f"Bearer {self.valves.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        # model names can contain /, pipeline names cannot.
        # cache maps pipeline names (model_id here) to model names
        model = self._pipelines_models_cache.get(model_id) or model_id
        body, meta = self.extract_body_meta(body)

        payload = {**body, "model": model, "messages": messages}
        for key in ["chat_id", "title"]:
            payload.pop(key, None)
        if "user" in payload and not isinstance(payload["user"], str):
            payload["user"] = payload["user"]["id"]
        if payload.get("stream") is True:
            payload["stream_options"] = {
                "include_usage": True,
                "continuous_usage_stats": False,
            }

        try:
            r = requests.post(
                url=f"{self.valves.OPENAI_API_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
                stream=body.get("stream", False),
            )
            r.raise_for_status()

            if payload.get("stream", False):
                return self.handle_stream_response(r, model_id, body, meta)
            else:
                response_json = r.json()
                self.track(model_id, body, meta, response_json.get("usage"))
                return response_json["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Arcee Error: {e}"

    def handle_stream_response(self, response, model_id, body, meta):
        """
        Stream the response back to the client in realtime, and track usage data after the stream ends.
        """

        def stream_and_capture():
            usage = None
            for line in response.iter_lines():
                if line:
                    yield line

                    decoded_line = line.decode("utf-8").strip().removeprefix("data: ")
                    if decoded_line != "[DONE]":
                        try:
                            parsed = from_json(decoded_line, allow_partial=True)
                            if "usage" in parsed:
                                usage = parsed["usage"]
                        except Exception as e:
                            print(f"Error processing chunk: {e}")
                            pass

            # Log usage data after stream ends
            self.track(model_id, body, meta, usage)

        return stream_and_capture()

    def track(self, model_id: str, body: dict, meta: dict, usage: dict | None):
        user = body.get("user")

        if usage:
            print(
                f"track:{__name__}",
                f"usage={usage}, model_id={model_id}, user={user}",
            )

        # Prepare properties payload
        properties = {
            "domain": os.getenv("PIPELINES_DOMAIN"),
            "model": model_id,
            "usage_type": meta.get("api_usage_type") if meta else "chat",
        }

        if usage:
            properties["prompt_tokens"] = usage.get("prompt_tokens")
            properties["completion_tokens"] = usage.get("completion_tokens")
            properties["total_tokens"] = usage.get("total_tokens")

        if user:
            # Identify the user if present
            properties["$set"] = {
                "name": user.get("name"),
                "email": user.get("email"),
            }
        else:
            properties["$process_person_profile"] = False

        # Resolve the user id
        # If no user, use the session_id or chat_id
        # For API requests, use the api_key_id
        user_id = (
            user.get("id")
            if user
            else (
                meta.get("api_key_id")
                if (meta and meta.get("api_key_id") is not None)
                else body.get("session_id", body.get("chat_id", body.get("id")))
            )
        )

        # Emit
        if self.posthog:
            self.posthog.capture(user_id, event="inference", properties=properties)
        else:
            print("Posthog not enabled. Skipped tracking", user_id, properties, meta)

    def extract_body_meta(self, _body: dict):
        # Arcee's API Gateway integration injects metadata into the body with keys prefixed
        # by "api_" (e.g. "api_usage_type", "api_key_id", etc.). We need to extract these
        # keys and separate them from the main body payload.
        # Note: this metadata will not be present for chat requests, only API gateway requests.
        meta = {k: v for k, v in _body.items() if k.startswith("api_")}
        body = {k: v for k, v in _body.items() if not k.startswith("api_")}

        if body.get("user") is None and len(meta.keys()) == 0:
            print(
                f"warning:{__name__} no user details or api metadata found in body, unable to determine identity for request"
            )

        return body, meta




# Sagemaker Utils
# source: https://aws.amazon.com/blogs/machine-learning/elevating-the-generative-ai-experience-introducing-streaming-support-in-amazon-sagemaker-hosting/
# https://github.com/aws-samples/sagemaker-hosting/tree/main/GenAI-Hosting/Large-Language-Model-Hosting/LLM-Streaming/llama-2-hf-tgi


class LineIterator:
    """
    A helper class for parsing the byte stream input.

    The output of the model will be in the following format:
    ```
    b'{"outputs": [" a"]}\n'
    b'{"outputs": [" challenging"]}\n'
    b'{"outputs": [" problem"]}\n'
    ...
    ```

    While usually each PayloadPart event from the event stream will contain a byte array
    with a full json, this is not guaranteed and some of the json objects may be split across
    PayloadPart events. For example:
    ```
    {'PayloadPart': {'Bytes': b'{"outputs": '}}
    {'PayloadPart': {'Bytes': b'[" problem"]}\n'}}
    ```

    This class accounts for this by concatenating bytes written via the 'write' function
    and then exposing a method which will return lines (ending with a '\n' character) within
    the buffer via the 'scan_lines' function. It maintains the position of the last read
    position to ensure that previous bytes are not exposed again.
    """

    def __init__(self, stream):
        self.byte_iterator = iter(stream)
        self.buffer = io.BytesIO()
        self.read_pos = 0

    def __iter__(self):
        return self

    def __next__(self):
        while True:
            self.buffer.seek(self.read_pos)
            line = self.buffer.readline()
            if line and line[-1] == ord('\n'):
                self.read_pos += len(line)
                return line[:-1]
            try:
                chunk = next(self.byte_iterator)
            except StopIteration:
                if self.read_pos < self.buffer.getbuffer().nbytes:
                    continue
                raise
            if 'PayloadPart' not in chunk:
                print('Unknown event type:' + chunk)
                continue
            self.buffer.seek(0, io.SEEK_END)
            self.buffer.write(chunk['PayloadPart']['Bytes'])
