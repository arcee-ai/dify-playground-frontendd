import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";

interface ApiGatewayParams {
  vpc: ec2.IVpc;
  certificate: acm.ICertificate;
  domainName: string;
  domainZone: route53.IHostedZone;

  pipelinesNlb: elbv2.NetworkLoadBalancer;
  pipelinesUrl: string;
  pipelinesApiToken: string;
}

export class ApiGateway extends Construct {
  public readonly url: string;
  public readonly api: apigw.RestApi;
  public readonly usagePlanStandard: apigw.UsagePlan;
  public readonly usagePlanLow: apigw.UsagePlan;
  public readonly usagePlanHigh: apigw.UsagePlan;

  constructor(scope: Construct, id: string, params: ApiGatewayParams) {
    super(scope, id);

    const vpcLink = new apigw.VpcLink(this, "ApiGatewayVpcLink", {
      vpcLinkName: `${cdk.Aws.STACK_NAME}-api`,
      description: `Exposes a private model inference endpoint through API Gateway with API Key authorization`,
      targets: [params.pipelinesNlb],
    });

    const apiLogGroup = new cdk.aws_logs.LogGroup(this, "ApiLogGroup", {
      logGroupName: `${cdk.Aws.STACK_NAME}/api-gateway`,
      retention: cdk.aws_logs.RetentionDays.ONE_YEAR,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const authorizerLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "AuthorizerLogGroup",
      {
        logGroupName: `${cdk.Aws.STACK_NAME}/authorizer`,
        retention: cdk.aws_logs.RetentionDays.ONE_YEAR,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    const authorizerHandler = new lambdaNodejs.NodejsFunction(
      this,
      "LambdaAuthorizer",
      {
        functionName: `${cdk.Aws.STACK_NAME}-authorizer`,
        description: `API Gateway Authorizer for api.${params.domainName}`,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: `index.handler`,
        code: lambda.Code.fromInline(`
// This is a barebones lambda authorizer that:
// 1. Maps the Authorization: Bearer <api key> header to a usage plan api key

exports.handler = async (event) => {
  let token = null;

  try {
    const authHeader =
      event.headers?.authorization || event.headers?.Authorization || "";
    token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Invalid token");
    }
  } catch (err) {
    console.error("Token error", err);
    // Return an authorization response indicating the request is not authorized
    return {
      principalId: token ?? "guest",
      usageIdentifierKey: token,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn,
          },
        ],
      },
    };
  }

  // return an authorization response indicating the request is authorized
  return {
    principalId: token,
    usageIdentifierKey: token,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: event.methodArn,
        },
      ],
    },
  };
};
      `),
        vpc: params.vpc,
        tracing: lambda.Tracing.PASS_THROUGH,
        logGroup: authorizerLogGroup,
        loggingFormat: lambda.LoggingFormat.JSON,
        runtimeManagementMode: lambda.RuntimeManagementMode.AUTO,
        environment: {
          NODE_ENV: "production",
          NODE_OPTIONS: "--enable-source-maps",
        },
        memorySize: 1024,
      }
    );

    const authorizer = new apigw.RequestAuthorizer(
      this,
      "ApiGatewayAuthorizer",
      {
        identitySources: [apigw.IdentitySource.header("Authorization")],
        handler: authorizerHandler,
        resultsCacheTtl: cdk.Duration.hours(1),
      }
    );

    this.api = new apigw.RestApi(this, "RestApi", {
      restApiName: cdk.Aws.STACK_NAME,
      description: `API Gateway for model inference. Requires API keys via usage plans.`,
      deployOptions: {
        stageName: "api",
        description: `API Gateway for model inference. Requires API keys via usage plans.`,
        loggingLevel: apigw.MethodLoggingLevel.ERROR,
        dataTraceEnabled: false,
        tracingEnabled: true,
        cacheDataEncrypted: true,
        metricsEnabled: true,
        accessLogDestination: new apigw.LogGroupLogDestination(apiLogGroup),
      },
      endpointTypes: [apigw.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
      defaultMethodOptions: {
        apiKeyRequired: true,
        authorizer,
      },
      apiKeySourceType: apigw.ApiKeySourceType.AUTHORIZER, // HEADER,
      disableExecuteApiEndpoint: true,
      domainName: {
        domainName: `api.${params.domainName}`,
        certificate: params.certificate,
        endpointType: apigw.EndpointType.REGIONAL,
        securityPolicy: apigw.SecurityPolicy.TLS_1_2,
        basePath: "v1",
      },
      failOnWarnings: true,
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Nicer error response
    this.api.addGatewayResponse("Default4XX", {
      type: apigw.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      },
      templates: {
        "application/json": '{"message":$context.error.messageString}',
      },
      statusCode: "400",
    });

    this.api.addGatewayResponse("Default5XX", {
      type: apigw.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      },
      templates: {
        "application/json": '{"message":$context.error.messageString}',
      },
      statusCode: "500",
    });

    this.api.addGatewayResponse("AccessDenied", {
      type: apigw.ResponseType.ACCESS_DENIED,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      },
      templates: {
        "application/json": '{"message":$context.error.messageString}',
      },
      statusCode: "401",
    });

    this.api.addGatewayResponse("AuthorizerFailure", {
      type: apigw.ResponseType.AUTHORIZER_FAILURE,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      },
      templates: {
        "application/json": '{"message": "Access denied"}',
      },
      statusCode: "401",
    });

    this.api.addGatewayResponse("AuthorizerConfigurationError", {
      type: apigw.ResponseType.AUTHORIZER_CONFIGURATION_ERROR,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      },
      templates: {
        "application/json":
          '{"message": "Something went wrong, please try again or contact Arcee for support"}',
      },
      statusCode: "500",
    });

    const chatIntegration = new apigw.HttpIntegration(
      `${params.pipelinesUrl}/v1/chat/completions`,
      {
        proxy: false, // must be false in order to use mapping templates
        httpMethod: "POST",
        options: {
          connectionType: apigw.ConnectionType.VPC_LINK,
          vpcLink,
          passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_MATCH,
          requestParameters: {
            // Single quotes denote a value as static, not a integration lookup
            "integration.request.header.Authorization": `'Bearer ${params.pipelinesApiToken}'`,
          },
          requestTemplates: {
            "application/json": `
#**
  Passes the incoming request body through to the backend service,
  with some added properties for tracking.
*#

## Inject gateway metadata into the body
## Prefixing these with api_ is important for arcee_pipeline to recognize them
#set($input.path('$').api_domain = '${params.domainName}')
#set($input.path('$').api_usage_type = 'api')
#set($input.path('$').api_id = "$context.apiId")
#set($input.path('$').api_key_id = "$context.identity.apiKeyId")
#set($input.path('$').api_user_agent = "$context.identity.userAgent")
#set($input.path('$').api_request_id = "$context.requestId")

$input.json('$')
  `.trim(),
          },
          integrationResponses: [
            {
              statusCode: "200",
            },
          ],
        },
      }
    );

    const statusIntegration = new apigw.HttpIntegration(
      `${params.pipelinesUrl}/v1`,
      {
        httpMethod: "GET",
        options: {
          connectionType: apigw.ConnectionType.VPC_LINK,
          vpcLink,
          passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_MATCH,
        },
      }
    );

    const chatResource = this.api.root.addResource("chat", {
      defaultMethodOptions: { methodResponses: [{ statusCode: "200" }] },
    });

    const completionsResource = chatResource.addResource("completions");

    this.api.root.addMethod("GET", statusIntegration);

    completionsResource.addMethod("POST", chatIntegration);

    this.usagePlanStandard = this.api.addUsagePlan("UsagePlanStandard", {
      name: `${cdk.Aws.STACK_NAME}-standard`,
      description: "Meters API requests -- standard",
      apiStages: [{ api: this.api, stage: this.api.deploymentStage }],
      throttle: {
        rateLimit: 10,
        burstLimit: 5,
      },
      quota: {
        limit: 1000,
        period: apigw.Period.DAY,
      },
    });

    this.usagePlanLow = this.api.addUsagePlan("UsagePlanLow", {
      name: `${cdk.Aws.STACK_NAME}-low`,
      description: "Meters API requests -- low usage",
      apiStages: [{ api: this.api, stage: this.api.deploymentStage }],
      throttle: {
        rateLimit: 2,
        burstLimit: 2,
      },
      quota: {
        limit: 200,
        period: apigw.Period.DAY,
      },
    });

    this.usagePlanHigh = this.api.addUsagePlan("UsagePlanHigh", {
      name: `${cdk.Aws.STACK_NAME}-high`,
      description: "Meters API requests -- high usage",
      apiStages: [{ api: this.api, stage: this.api.deploymentStage }],
      throttle: {
        rateLimit: 10,
        burstLimit: 5,
      },
      quota: {
        limit: 5000,
        period: apigw.Period.DAY,
      },
    });

    const deployment = new apigw.Deployment(this, "Deployment", {
      description: `API Gateway for ${params.domainName} model inference. Requires API keys via usage plans.`,
      api: this.api,
      stageName: this.api.deploymentStage.stageName,
    });

    deployment.node.addDependency(
      this.api,
      this.usagePlanHigh,
      this.usagePlanLow,
      this.usagePlanStandard,
    );

    new route53.ARecord(this, "ApiAliasRecord", {
      zone: params.domainZone,
      target: route53.RecordTarget.fromAlias(
        new route53targets.ApiGateway(this.api)
      ),
      recordName: `api.${params.domainName}`,
    });

    this.url = `api.${params.domainName}`;
  }
}
