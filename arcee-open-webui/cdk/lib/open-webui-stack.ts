import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";

import { VpcAttachment } from "./constructs/vpc-attachment";
import { EcsCluster } from "./constructs/ecs-cluster";
import {
  WebService,
  OpenWebUiAuthConfig,
  OpenWebUiAuthParams,
} from "./constructs/web-service";
import { PipelinesService } from "./constructs/pipelines-service";
import { ApiGateway } from "./constructs/api-gateway";
import { WebApplicationFirewall } from "./constructs/waf";

interface DefaultPromptSuggestion {
  title: string[];
  content: string;
}

export interface OpenWebUIStackProps extends cdk.StackProps {
  vpcId?: string;
  publicSubnets?: string[];
  privateSubnets?: string[];
  publicSubnetRouteTableIds?: string[];
  privateSubnetRouteTableIds?: string[];
  availabilityZones?: string[];
  publiclyAccessible?: boolean;
  openaiBaseUrl?: string;
  openaiKey?: string;
  sagemakerEndpointName?: string;
  openWebUiDockerImage?: string;
  openWebUiAuth?: OpenWebUiAuthConfig;
  openWebUiEnableRedis?: boolean;
  openwebUiMinCapacity?: number;
  openwebUiMaxCapacity?: number;
  defaultUserRole?: string;
  openWebUiCpu?: number;
  openWebUiMemory?: number;
  pipelinesDockerImage?: string;
  pipelinesCpu?: number;
  pipelinesMemory?: number;
  pipelinesMinCapacity?: number;
  pipelinesMaxCapacity?: number;
  domainName?: string;
  domainZoneId?: string;
  defaultPrompts?: DefaultPromptSuggestion[];
  introBanner?: string;
  enableApiGateway?: boolean;
  posthogKey?: string;
  posthogHost?: string;
  additionalPostgresIngressRules?: { peer: ec2.IPeer; description: string }[];
  logoImageUrl?: string;
  splashImageUrl?: string;

  // exposeAuthCfnParameters is a flag to expose auth-related parameters as CfnParameters
  // this is needed for our -oauth dist stacks, where we want to allow the user to provide their own auth config at deploy time
  exposeAuthCfnParameters?: boolean;
}

export class OpenWebUIStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: OpenWebUIStackProps) {
    super(scope, id, props);

    ////
    // STACK PARAMETERS
    // We use CloudFormation parameters to give some extra portability as a synthesized stack
    // Build once -- deploy artifact anywhere
    ////

    // VPC

    const vpcIdParam = new cdk.CfnParameter(this, "VpcID", {
      type: "AWS::EC2::VPC::Id",
      description: "Vpc to attach to",
      default: props?.vpcId,
    });

    const publicSubnetsParam = new cdk.CfnParameter(this, "PublicSubnets", {
      type: "List<AWS::EC2::Subnet::Id>",
      description: "Public subnets to attach to",
      default: props?.publicSubnets?.join(","),
    });

    const privateSubnetsParam = new cdk.CfnParameter(this, "PrivateSubnets", {
      type: "List<AWS::EC2::Subnet::Id>",
      description: "Private subnets to attach to",
      default: props?.privateSubnets?.join(","),
    });

    const domainZoneParam = new cdk.CfnParameter(this, "DomainZoneId", {
      type: "AWS::Route53::HostedZone::Id",
      description:
        "Hosted zone ID for DNS, must be valid for the specified DomainName.",
      default: props?.domainZoneId,
    });

    const domainNameParam = new cdk.CfnParameter(this, "DomainName", {
      type: "String",
      description:
        "Domain name open-webui will be accessible at. ACM certificate validation will fail until NS records are set up to delegate to the corresponding DomainZoneId hosted zone.",
      default: props?.domainName,
    });

    // Docker

    const openWebUiDockerImage = new cdk.CfnParameter(
      this,
      "OpenWebUiDockerImage",
      {
        type: "String",
        description: "Docker image to use for open-webui",
        default:
          props?.openWebUiDockerImage ||
          "ghcr.io/arcee-ai/arcee-open-webui:main",
      }
    );

    const pipelinesDockerImage = new cdk.CfnParameter(
      this,
      "PipelinesDockerImage",
      {
        type: "String",
        description: "Docker image to use for the pipelines backend",
        default:
          props?.pipelinesDockerImage ||
          "ghcr.io/arcee-ai/arcee-open-webui-pipelines:main",
      }
    );

    // Configuration

    const defaultUserRole = new cdk.CfnParameter(this, "DefaultUserRole", {
      type: "String",
      description:
        "Setting this to 'pending' means an admin will need to approve each new user. Defaults to user.",
      default: props?.defaultUserRole || "user",
      allowedValues: ["user", "pending"],
    });

    const openaiBaseUrl = new cdk.CfnParameter(this, "InferenceApiBaseUrl", {
      type: "String",
      description:
        "An OpenAI-compatible base url. Only (InferenceApiBaseUrl + InferenceApiKey) OR SagemakerInferenceEndpointName should be used.",
      default: props?.openaiBaseUrl || "",
    });

    const openaiKey = new cdk.CfnParameter(this, "InferenceApiKey", {
      type: "String",
      description: "An API token to use with InferenceApiBaseUrl",
      noEcho: true,
      default: props?.openaiKey || "",
    });

    // Model

    const sagemakerInferenceEndpointName = new cdk.CfnParameter(
      this,
      "SagemakerInferenceEndpointName",
      {
        type: "String",
        description:
          "A SageMaker inference endpoint. Only (InferenceApiBaseUrl + InferenceApiKey) OR SagemakerInferenceEndpointName should be used.",
        default: props?.sagemakerEndpointName || "",
      }
    );

    // Optional Posthog tracking
    const posthogKey = new cdk.CfnParameter(this, "PosthogKey", {
      type: "String",
      description:
        "A public Posthog key to use for tracking. If not provided, tracking will be disabled.",
      noEcho: true,
      default: props?.posthogKey || "",
    });

    const posthogHost = new cdk.CfnParameter(this, "PosthogHost", {
      type: "String",
      description: "Set to override Posthog host",
      default: props?.posthogHost || "",
    });

    // Optional Branding
    const logoImageUrl = new cdk.CfnParameter(this, "LogoImageUrl", {
      type: "String",
      description:
        "An optional url to a PNG file for logo image. 130px x 130px minimum resolution. A square image with a transparent background is recommended.",
      default: props?.logoImageUrl || "",
    });

    const splashImageUrl = new cdk.CfnParameter(this, "SplashImageUrl", {
      type: "String",
      description:
        "An optional url to a PNG file for splash loading image. Same specs as LogoImageUrl, but a grayscale image provides a nicer experience here.",
      default: props?.splashImageUrl || "",
    });

    // OAUTH
    // These are exposed as CFN parameters only if the user has set exposeAuthCfnParameters to true
    // Otherwise, we are able to use CDK params like normal

    const optionalAuthParams: Partial<
      Record<OpenWebUiAuthParams, cdk.CfnParameter>
    > = {};

    if (props?.exposeAuthCfnParameters) {
      optionalAuthParams.ENABLE_SIGNUP = new cdk.CfnParameter(
        this,
        "EnableSignup",
        {
          type: "String",
          description:
            "Allows users to create accounts by registering with an email and password, or oauth if configured. If this is set to false no users will be able to sign up.",
          default: "true",
          allowedValues: ["true", "false"],
        }
      );

      optionalAuthParams.ENABLE_LOGIN_FORM = new cdk.CfnParameter(
        this,
        "EnableLoginForm",
        {
          type: "String",
          description:
            "Toggles email, password, sign in and 'or' (only when ENABLE_OAUTH_SIGNUP is set to True) elements. This should only ever be set to False when ENABLE_OAUTH_SIGNUP is also being used and set to True. Failure to do so will result in the inability to login.",
          default: "true",
          allowedValues: ["true", "false"],
        }
      );

      optionalAuthParams.ENABLE_OAUTH_SIGNUP = new cdk.CfnParameter(
        this,
        "EnableOauthSignup",
        {
          type: "String",
          description: "Enables user account creation via OAuth",
          default: "false",
          allowedValues: ["true", "false"],
        }
      );

      optionalAuthParams.OAUTH_MERGE_ACCOUNTS_BY_EMAIL = new cdk.CfnParameter(
        this,
        "OauthMergeAccountsByEmail",
        {
          type: "String",
          description:
            "If enabled, merges OAuth accounts with existing accounts using the same email address. This is considered unsafe as providers may not verify email addresses and can lead to account takeovers",
          default: "false",
          allowedValues: ["true", "false"],
        }
      );

      optionalAuthParams.OAUTH_USERNAME_CLAIM = new cdk.CfnParameter(
        this,
        "OauthUserNameClaim",
        {
          type: "String",
          description: "Username claim for OpenID",
          default: "name",
        }
      );

      optionalAuthParams.OAUTH_EMAIL_CLAIM = new cdk.CfnParameter(
        this,
        "OauthEmailClaim",
        {
          type: "String",
          description: "Email claim for OpenID",
          default: "email",
        }
      );

      optionalAuthParams.OAUTH_PICTURE_CLAIM = new cdk.CfnParameter(
        this,
        "OauthPictureClaim",
        {
          type: "String",
          description: "Picture claim for OpenID",
          default: "picture",
        }
      );

      optionalAuthParams.OAUTH_CLIENT_ID = new cdk.CfnParameter(
        this,
        "OauthClientId",
        {
          type: "String",
          description: "OAuth client ID",
        }
      );

      optionalAuthParams.OAUTH_CLIENT_SECRET = new cdk.CfnParameter(
        this,
        "OauthClientSecret",
        {
          type: "String",
          description: "OAuth client secret",
          noEcho: true,
        }
      );

      optionalAuthParams.OAUTH_SCOPES = new cdk.CfnParameter(
        this,
        "OauthScopes",
        {
          type: "String",
          description:
            "Sets the scope for OIDC authentication. openid and email are required",
          default: "openid email profile",
        }
      );

      optionalAuthParams.OAUTH_PROVIDER_NAME = new cdk.CfnParameter(
        this,
        "OauthProviderName",
        {
          type: "String",
          description: "Sets the display name for the OAuth provider",
          default: "SSO",
        }
      );

      optionalAuthParams.ENABLE_OAUTH_ROLE_MANAGEMENT = new cdk.CfnParameter(
        this,
        "EnableOauthRoleManagement",
        {
          type: "String",
          description: "Enables role management to oauth delegation",
          default: "false",
          allowedValues: ["true", "false"],
        }
      );

      optionalAuthParams.OAUTH_ROLES_CLAIM = new cdk.CfnParameter(
        this,
        "OauthRolesClaim",
        {
          type: "String",
          description: "Sets the roles claim to look for in the OIDC token",
          default: "roles",
        }
      );

      optionalAuthParams.OAUTH_ALLOWED_ROLES = new cdk.CfnParameter(
        this,
        "OauthAllowedRoles",
        {
          type: "String",
          description:
            "Sets the roles that are allowed access to the platform. This should be a comma separated list",
          default: "user,admin",
        }
      );

      optionalAuthParams.OAUTH_ADMIN_ROLES = new cdk.CfnParameter(
        this,
        "OauthAdminRoles",
        {
          type: "String",
          description:
            "Sets the roles that are considered administrators. This should be a comma separated list",
          default: "admin",
        }
      );

      optionalAuthParams.GOOGLE_CLIENT_ID = new cdk.CfnParameter(
        this,
        "GoogleClientId",
        {
          type: "String",
          description: "Sets the client ID for Google OAuth",
        }
      );

      optionalAuthParams.GOOGLE_CLIENT_SECRET = new cdk.CfnParameter(
        this,
        "GoogleClientSecret",
        {
          type: "String",
          description: "Sets the client secret for Google OAuth",
          noEcho: true,
        }
      );

      optionalAuthParams.GOOGLE_OAUTH_SCOPE = new cdk.CfnParameter(
        this,
        "GoogleOauthScope",
        {
          type: "String",
          description: "Sets the scope for Google OAuth",
          default: "openid email profile",
        }
      );

      optionalAuthParams.GOOGLE_REDIRECT_URI = new cdk.CfnParameter(
        this,
        "GoogleRedirectUri",
        {
          type: "String",
          description: "Sets the redirect URI for Google OAuth",
        }
      );

      optionalAuthParams.MICROSOFT_CLIENT_ID = new cdk.CfnParameter(
        this,
        "MicrosoftClientId",
        {
          type: "String",
          description: "Sets the client ID for Microsoft OAuth",
        }
      );

      optionalAuthParams.MICROSOFT_CLIENT_SECRET = new cdk.CfnParameter(
        this,
        "MicrosoftClientSecret",
        {
          type: "String",
          description: "Sets the client secret for Microsoft OAuth",
          noEcho: true,
        }
      );

      optionalAuthParams.MICROSOFT_CLIENT_TENANT_ID = new cdk.CfnParameter(
        this,
        "MicrosoftClientTenantId",
        {
          type: "String",
          description: "Sets the tenant ID for Microsoft OAuth",
        }
      );

      optionalAuthParams.MICROSOFT_OAUTH_SCOPE = new cdk.CfnParameter(
        this,
        "MicrosoftOauthScope",
        {
          type: "String",
          description: "Sets the scope for Microsoft OAuth",
          default: "openid email profile",
        }
      );

      optionalAuthParams.MICROSOFT_REDIRECT_URI = new cdk.CfnParameter(
        this,
        "MicrosoftRedirectUri",
        {
          type: "String",
          description: "Sets the redirect URI for Microsoft OAuth",
        }
      );

      optionalAuthParams.OPENID_PROVIDER_URL = new cdk.CfnParameter(
        this,
        "OpenidProviderUrl",
        {
          type: "String",
          description:
            "Path to the OpenID provider's .well-known/openid-configuration endpoint",
        }
      );

      optionalAuthParams.OPENID_REDIRECT_URI = new cdk.CfnParameter(
        this,
        "OpenidRedirectUri",
        {
          type: "String",
          description: "Sets the redirect URI for OIDC",
        }
      );
    }

    ////
    // CONSTRUCTS
    ////

    // Attach to an existing VPC
    const { vpc } = new VpcAttachment(this, "Vpc", {
      vpcId: props?.vpcId || vpcIdParam.valueAsString,
      publicSubnets: props?.publicSubnets || publicSubnetsParam.valueAsList,
      privateSubnets: props?.privateSubnets || privateSubnetsParam.valueAsList,
      availabilityZones: props?.availabilityZones,
      publicSubnetRouteTableIds: props?.publicSubnetRouteTableIds,
      privateSubnetRouteTableIds: props?.privateSubnetRouteTableIds,
    });

    // Create an ECS cluster
    const { cluster } = new EcsCluster(this, "Cluster", {
      vpc,
    });

    // Create a log group for ECS services
    const logGroup = new logs.LogGroup(this, "LogGroup", {
      retention: logs.RetentionDays.ONE_YEAR,
    });

    const zoneLookup = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZoneLookup",
      {
        zoneName: domainNameParam.valueAsString,
        hostedZoneId: domainZoneParam.valueAsString,
      }
    );

    // Create Certificate

    const certificate = new cdk.aws_certificatemanager.Certificate(
      this,
      "Certificate",
      {
        domainName: domainNameParam.valueAsString,
        subjectAlternativeNames: [`*.${domainNameParam.valueAsString}`],
        validation:
          cdk.aws_certificatemanager.CertificateValidation.fromDnsMultiZone({
            [domainNameParam.valueAsString]: zoneLookup,
          }),
        certificateName: domainNameParam.valueAsString,
      }
    );

    ////
    // Services
    ////

    // Pipelines
    const pipelines = new PipelinesService(this, "PipelinesSvc", {
      vpc,
      cluster,
      logGroup,
      domainZone: zoneLookup,
      domainName: domainNameParam.valueAsString,
      certificate,
      publiclyAccessible: props?.publiclyAccessible ?? true,
      cpu: props?.pipelinesCpu || 1024,
      memory: props?.pipelinesMemory || 2048,
      image: props?.pipelinesDockerImage || pipelinesDockerImage.valueAsString,
      minCapacity: props?.pipelinesMinCapacity,
      maxCapacity: props?.pipelinesMaxCapacity,

      openaiBaseUrl: openaiBaseUrl.valueAsString,
      openaiKey: openaiKey.valueAsString,

      sagemakerEndpointName: sagemakerInferenceEndpointName.valueAsString,

      posthogKey: posthogKey.valueAsString,
      posthogHost: posthogHost.valueAsString,
    });

    // Open-WebUI
    const webUI = new WebService(this, "WebUISvc", {
      vpc,
      cluster,
      logGroup,
      domainZone: zoneLookup,
      domainName: domainNameParam.valueAsString,
      certificate,
      publiclyAccessible: props?.publiclyAccessible ?? true,
      cpu: props?.openWebUiCpu || 1024,
      memory: props?.openWebUiMemory || 2048,
      image: props?.openWebUiDockerImage || openWebUiDockerImage.valueAsString,
      minCapacity: props?.openwebUiMinCapacity,
      maxCapacity: props?.openwebUiMaxCapacity,

      auth: props?.openWebUiAuth,
      authCfnParams: optionalAuthParams,
      defaultUserRole: props?.defaultUserRole || defaultUserRole.valueAsString,
      openaiBaseUrl: pipelines.url,
      openaiKeySecret: pipelines.tokenSecret,

      enableRedis: props?.openWebUiEnableRedis,
      additionalPostgresIngressRules: props?.additionalPostgresIngressRules,

      logoImageUrl: props?.logoImageUrl || logoImageUrl.valueAsString,
      splashImageUrl: props?.splashImageUrl || splashImageUrl.valueAsString,

      defaultPrompts: props?.defaultPrompts
        ? JSON.stringify(props.defaultPrompts)
        : undefined,
      introBanner: props?.introBanner,
    });

    // Allow WebUI to call Pipelines
    pipelines.securityGroup.addIngressRule(
      webUI.securityGroup,
      ec2.Port.tcp(9099),
      `Allow open-webui to access pipelines backend`
    );

    // API Gateway
    let apiGateway: ApiGateway | null = null;
    if (props?.enableApiGateway) {
      apiGateway = new ApiGateway(this, "API", {
        vpc,
        domainZone: zoneLookup,
        domainName: domainNameParam.valueAsString,
        certificate,
        pipelinesNlb: pipelines.service.loadBalancer,
        pipelinesUrl: pipelines.url,
        pipelinesApiToken: pipelines.tokenSecret.secretValue.unsafeUnwrap(),
      });
    }

    // WAF
    const waf = new WebApplicationFirewall(this, "WAF", {
      webAlbArn: webUI.service.loadBalancer.loadBalancerArn,
      apiGatewayStageArn: apiGateway?.api.deploymentStage.stageArn,
    });

    // Outputs

    new cdk.CfnOutput(this, "WebUI", {
      value: webUI.url,
    });

    new cdk.CfnOutput(this, "WebUIDomainZoneId", {
      value: domainZoneParam.valueAsString,
    });

    new cdk.CfnOutput(this, "WebUICertificateArn", {
      value: certificate.certificateArn,
    });

    new cdk.CfnOutput(this, "Pipelines", {
      value: pipelines.url,
    });

    new cdk.CfnOutput(this, "PipelinesTokenSecretArn", {
      value: pipelines.tokenSecret.secretArn,
    });

    new cdk.CfnOutput(this, "ApiGateway", {
      value: apiGateway?.url || "",
    });

    new cdk.CfnOutput(this, "ApiGatewayArn", {
      value: apiGateway?.api.arnForExecuteApi() || "",
    });

    new cdk.CfnOutput(this, "ApiGatewayStandardUsagePlanId", {
      value: apiGateway?.usagePlanStandard.usagePlanId || "",
    });

    new cdk.CfnOutput(this, "ApiGatewayHighUsagePlanId", {
      value: apiGateway?.usagePlanHigh.usagePlanId || "",
    });

    new cdk.CfnOutput(this, "WafAclId", {
      value: waf.acl.attrId,
    });

    // Add https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cloudformation-interface.html to the stack
    // to control the display of CFN parameters in the console
    this.templateOptions.metadata = {
      ...this.templateOptions.metadata,
      "AWS::CloudFormation::Interface": {
        ParameterGroups: [
          {
            Label: { default: "Network" },
            Parameters: [
              vpcIdParam.logicalId,
              publicSubnetsParam.logicalId,
              privateSubnetsParam.logicalId,
              domainZoneParam.logicalId,
              domainNameParam.logicalId,
            ],
          },
          {
            Label: { default: "Docker Images" },
            Parameters: [
              openWebUiDockerImage.logicalId,
              pipelinesDockerImage.logicalId,
            ],
          },
          {
            Label: { default: "Configuration" },
            Parameters: [
              defaultUserRole.logicalId,
              posthogKey.logicalId,
              posthogHost.logicalId,
            ],
          },
          {
            Label: { default: "Inference" },
            Parameters: [
              sagemakerInferenceEndpointName.logicalId,
              openaiBaseUrl.logicalId,
              openaiKey.logicalId,
            ],
          },
          {
            Label: { default: "Branding" },
            Parameters: [logoImageUrl.logicalId, splashImageUrl.logicalId],
          },
        ],
      }
    };

    if (props?.exposeAuthCfnParameters) {
      this.templateOptions.metadata['AWS::CloudFormation::Interface'].ParameterGroups.push({
        Label: { default: "Auth" },
        Parameters: Object.values(optionalAuthParams).map(
          (param) => param.logicalId
        ),
      });
    }
  }
}
