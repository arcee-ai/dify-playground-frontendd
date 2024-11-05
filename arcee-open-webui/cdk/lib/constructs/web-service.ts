import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as efs from "aws-cdk-lib/aws-efs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as logs from "aws-cdk-lib/aws-logs";
import * as asm from "aws-cdk-lib/aws-secretsmanager";
import { Postgres } from "./postgres";
import { Redis } from "./redis";

export interface WebServiceParams {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  logGroup: logs.ILogGroup;
  image: string;
  publiclyAccessible: boolean;
  openaiBaseUrl: string;
  openaiKeySecret?: asm.ISecret;
  cpu: ecs_patterns.FargateServiceBaseProps["cpu"];
  memory: ecs_patterns.FargateServiceBaseProps["memoryLimitMiB"];

  domainZone: NonNullable<
    ecs_patterns.ApplicationLoadBalancedFargateServiceProps["domainZone"]
  >;
  domainName: NonNullable<
    ecs_patterns.ApplicationLoadBalancedFargateServiceProps["domainName"]
  >;
  certificate: NonNullable<
    ecs_patterns.ApplicationLoadBalancedFargateServiceProps["certificate"]
  >;

  defaultPrompts?: string;
  introBanner?: string;
  webhookUrl?: string;

  auth?: OpenWebUiAuthConfig;
  authCfnParams?: Partial<Record<OpenWebUiAuthParams, cdk.CfnParameter>>;

  defaultUserRole?: string;

  enableRedis?: boolean;

  minCapacity?: number;
  maxCapacity?: number;

  additionalPostgresIngressRules?: { peer: ec2.IPeer; description: string }[];

  logoImageUrl?: string;
  splashImageUrl?: string;
}

export type OpenWebUiAuthConfig = {
  disable?: boolean;
  disableSignup?: boolean;
  disableLoginForm?: boolean;

  // Enable Google Oauth
  // If set, must be a secret ARN that contains the client_id and client_secret for a Google Oauth connection
  googleOauthSecretArn?: string;

  // Enable OIDC
  // If set, must be a secret ARN that contains
  //  discovery_url
  //  client_id
  //  client_secret
  //  scopes
  //  display_name
  // for an OIDC connection
  oidcClientSecretArn?: string;
};

// Auth-related envnvironment variables we expose as deploy-time parameters to users
// To add new ones, update this type and the actual parameters in open-webui-stack.ts
export type OpenWebUiAuthParams =
  // A few general auth params https://docs.openwebui.com/getting-started/env-configuration/#general
  | "ENABLE_SIGNUP"
  | "ENABLE_LOGIN_FORM"
  // map to https://docs.openwebui.com/getting-started/env-configuration/#oauth
  | "ENABLE_OAUTH_SIGNUP"
  | "OAUTH_MERGE_ACCOUNTS_BY_EMAIL"
  | "OAUTH_USERNAME_CLAIM"
  | "OAUTH_EMAIL_CLAIM"
  | "OAUTH_PICTURE_CLAIM"
  | "OAUTH_CLIENT_ID"
  | "OAUTH_CLIENT_SECRET"
  | "OAUTH_SCOPES"
  | "OAUTH_PROVIDER_NAME"
  | "ENABLE_OAUTH_ROLE_MANAGEMENT"
  | "OAUTH_ROLES_CLAIM"
  | "OAUTH_ALLOWED_ROLES"
  | "OAUTH_ADMIN_ROLES"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GOOGLE_OAUTH_SCOPE"
  | "GOOGLE_REDIRECT_URI"
  | "MICROSOFT_CLIENT_ID"
  | "MICROSOFT_CLIENT_SECRET"
  | "MICROSOFT_CLIENT_TENANT_ID"
  | "MICROSOFT_OAUTH_SCOPE"
  | "MICROSOFT_REDIRECT_URI"
  | "OPENID_PROVIDER_URL"
  | "OPENID_REDIRECT_URI";

export class WebService extends Construct {
  public readonly service: ecs_patterns.ApplicationLoadBalancedFargateService;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly container: ecs.ContainerDefinition;
  public readonly url: string;

  constructor(scope: Construct, id: string, params: WebServiceParams) {
    super(scope, id);

    // Create Security Groups
    this.securityGroup = new ec2.SecurityGroup(this, "WebUISecurityGroup", {
      vpc: params.vpc,
      description: "Allow traffic to Web UI service",
      allowAllOutbound: true,
    });

    this.securityGroup.addIngressRule(this.securityGroup, ec2.Port.tcp(2049)); // Enable NFS service within security group

    const fileSystem = new efs.CfnFileSystem(this, "EFS", {
      encrypted: true,
      backupPolicy: {
        status: "ENABLED",
      },
      fileSystemProtection: {
        replicationOverwriteProtection: "ENABLED",
      },
      fileSystemTags: [{ key: "Name", value: cdk.Aws.STACK_NAME }],
      throughputMode: "elastic",
      lifecyclePolicies: [
        {
          transitionToIa: "AFTER_30_DAYS",
        },
        {
          transitionToArchive: "AFTER_365_DAYS",
        },
        {
          transitionToPrimaryStorageClass: "AFTER_1_ACCESS",
        },
      ],
    });

    const subnetIds = params.vpc.privateSubnets.map((s) => s.subnetId);
    for (let i = 0; i < subnetIds.length; i++) {
      const subnetId = cdk.Fn.select(i, subnetIds);
      new efs.CfnMountTarget(this, `EFSMount-${i}`, {
        fileSystemId: fileSystem.attrFileSystemId,
        securityGroups: [this.securityGroup.securityGroupId],
        subnetId: subnetId,
      });
    }

    const accessPoint = new efs.CfnAccessPoint(this, "EFSAccessPoint", {
      fileSystemId: fileSystem.attrFileSystemId,
      rootDirectory: {
        path: "/data",
        creationInfo: {
          ownerGid: "1000",
          ownerUid: "1000",
          permissions: "755",
        },
      },
      posixUser: {
        uid: "1000",
        gid: "1000",
      },
      accessPointTags: [{ key: "Name", value: cdk.Aws.STACK_NAME }],
    });

    const efsVolumeConfiguration: ecs.EfsVolumeConfiguration = {
      authorizationConfig: {
        accessPointId: accessPoint.attrAccessPointId,
        iam: "ENABLED",
      },
      fileSystemId: fileSystem.attrFileSystemId,
      transitEncryption: "ENABLED",
    };

    const postgres = new Postgres(this, "WebUIPostgres", {
      vpc: params.vpc,
      additionalIngressRules: params.additionalPostgresIngressRules,
    });

    postgres.db.connections.allowFrom(
      this.securityGroup,
      ec2.Port.POSTGRES,
      "ecs service to rds"
    );

    let redis: Redis | undefined;
    if (params.enableRedis) {
      redis = new Redis(this, "WebUIRedis", {
        vpc: params.vpc,
      });

      redis.redisSecurityGroup.connections.allowFrom(
        this.securityGroup,
        ec2.Port.tcpRange(6379, 6380),
        "ecs service to redis"
      );
    }

    const webUISecret = new asm.Secret(this, "WebUISecret", {
      secretName: `${cdk.Aws.STACK_NAME}/open-web-ui-secret-key`,
      generateSecretString: {
        excludePunctuation: true,
      },
    });

    // Define the Web UI container
    const webUITaskDef = new ecs.FargateTaskDefinition(this, "WebUITaskDef", {
      cpu: params.cpu,
      memoryLimitMiB: params.memory,
      volumes: [
        {
          name: "data",
          efsVolumeConfiguration,
        },
      ],
    });

    const getAuthEnv = (
      auth?: OpenWebUiAuthConfig,
      authCfnParams?: Partial<Record<OpenWebUiAuthParams, cdk.CfnParameter>>
    ): Record<string, string | cdk.CfnParameter> => {
      // If deploy-time auth paramaters are exposed, and provided, use them
      if (authCfnParams) {
        return authCfnParams
      }

      // Otherwise we are using CDK config to manage
      if (!auth) {
        return {
          WEBUI_AUTH: "True",
          ENABLE_SIGNUP: "True",
          ENABLE_LOGIN_FORM: "True",
          ENABLE_OAUTH_SIGNUP: "False",
        };
      }

      return {
        WEBUI_AUTH: auth.disable ? "False" : "True",
        ENABLE_SIGNUP: auth.disableSignup ? "False" : "True",
        ENABLE_LOGIN_FORM: auth.disableLoginForm ? "False" : "True",
        ENABLE_OAUTH_SIGNUP:
          auth.googleOauthSecretArn || auth.oidcClientSecretArn
            ? "True"
            : "False",
      };
    };

    // see https://github.com/open-webui/open-webui/blob/main/backend/open_webui/config.py for open-webui config options
    const environment: Record<string, string> = {
      // GLOBAL_LOG_LEVEL: 'DEBUG', // do NOT use this in production
      ENV: "prod", // all deployments of open-webui run in production mode
      WEBUI_NAME: `Arcee`,
      ADMIN_EMAIL: "support@arcee.ai",

      // Not OpenAI, but our inference servers
      OPENAI_API_BASE_URL: params.openaiBaseUrl,

      ENABLE_OLLAMA_API: "False",

      // # Auth settings
      ...getAuthEnv(params.auth, params.authCfnParams),

      DEFAULT_USER_ROLE: params.defaultUserRole || "user",
      WEBUI_SESSION_COOKIE_SECURE: "True",
      JWT_EXPIRES_IN: "2w",

      // # Model config
      // DEFAULT_MODELS: "arcee_pipeline",

      // # Feature Flags
      SAFE_MODE: "True", // TODO: do we want this?
      ENABLE_COMMUNITY_SHARING: "False",
      // # ENV ENABLE_ADMIN_EXPORT=False

      ENABLE_EVALUATION_ARENA_MODELS: "False",

      // Reduce RAM usage
      // https://docs.openwebui.com/tutorial/reduce-ram-usage
      // RAG_EMBEDDING_ENGINE: "ollama",
      // AUDIO_STT_ENGINE: "openai",

      // Branding
      LOGO_IMAGE_URL: params.logoImageUrl || "",
      SPLASH_IMAGE_URL: params.splashImageUrl || "",

      // To support running without egress
      OFFLINE_MODE: "True",
      HF_DATASETS_OFFLINE: "1",
      HF_HUB_OFFLINE: "1",
    };

    if (params.enableRedis) {
      // Enable Redis for websocket management
      environment.WEBSOCKET_MANAGER = "redis";
    }

    if (params.domainName) {
      environment.WEBUI_URL = params.domainName;
      environment.CORS_ALLOW_ORIGIN = `https://${params.domainName}`;
    }

    if (params.introBanner) {
      environment.WEBUI_BANNERS = JSON.stringify([
        {
          id: "intro",
          type: "info",
          title: "Welcome!",
          content: params.introBanner,
          dismissible: true,
          timestamp: 1000,
        },
      ]);
    }

    if (params.defaultPrompts) {
      environment.DEFAULT_PROMPT_SUGGESTIONS = params.defaultPrompts;
    }

    if (params.webhookUrl) {
      environment.WEBHOOK_URL = params.webhookUrl;
    }

    const secrets: Record<string, ecs.Secret> = {
      DATABASE_URL: ecs.Secret.fromSecretsManager(postgres.dbConnStringSecret),
      WEBUI_SECRET_KEY: ecs.Secret.fromSecretsManager(webUISecret),
    };

    if (params.openaiKeySecret) {
      secrets.OPENAI_API_KEY = ecs.Secret.fromSecretsManager(
        params.openaiKeySecret
      );
    }

    if (params.auth?.googleOauthSecretArn) {
      const googleSecret = cdk.aws_secretsmanager.Secret.fromSecretCompleteArn(
        this,
        "GoogleAuthSecretLookup",
        params.auth?.googleOauthSecretArn
      );
      secrets.GOOGLE_CLIENT_ID = ecs.Secret.fromSecretsManager(
        googleSecret,
        "client_id"
      );
      secrets.GOOGLE_CLIENT_SECRET = ecs.Secret.fromSecretsManager(
        googleSecret,
        "client_secret"
      );
    }

    if (params.auth?.oidcClientSecretArn) {
      const oidcConfig = cdk.aws_secretsmanager.Secret.fromSecretCompleteArn(
        this,
        "OidcAuthSecretLookup",
        params.auth?.oidcClientSecretArn
      );
      secrets.OPENID_PROVIDER_URL = ecs.Secret.fromSecretsManager(
        oidcConfig,
        "discovery_url"
      );
      secrets.OAUTH_CLIENT_ID = ecs.Secret.fromSecretsManager(
        oidcConfig,
        "client_id"
      );
      secrets.OAUTH_CLIENT_SECRET = ecs.Secret.fromSecretsManager(
        oidcConfig,
        "client_secret"
      );
      secrets.OAUTH_SCOPES = ecs.Secret.fromSecretsManager(
        oidcConfig,
        "scopes"
      );
      secrets.OAUTH_PROVIDER_NAME = ecs.Secret.fromSecretsManager(
        oidcConfig,
        "display_name"
      );
    }

    if (params.enableRedis && redis) {
      secrets.WEBSOCKET_REDIS_URL = ecs.Secret.fromSecretsManager(
        redis.redisConnStringSecret
      );
    }

    const executionRole = webUITaskDef.obtainExecutionRole();
    executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );

    this.container = webUITaskDef.addContainer("WebUiAppContainer", {
      image: ecs.ContainerImage.fromRegistry(params.image),
      portMappings: [{ name: "open-webui", containerPort: 8080 }],
      essential: true,
      privileged: false,
      environment: environment,
      secrets,
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost:8080/ || exit 1"],
        interval: cdk.Duration.seconds(30),
        startPeriod: cdk.Duration.seconds(30),
      },
      logging: new ecs.AwsLogDriver({
        logGroup: params.logGroup,
        streamPrefix: "open-webui",
      }),
    });

    this.container.addMountPoints({
      readOnly: false,
      containerPath: "/app/backend/data",
      sourceVolume: "data",
    });

    // Create the Web UI service
    this.service = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "WebUiService",
      {
        cluster: params.cluster,
        loadBalancerName: `${cdk.Aws.STACK_NAME}-web`,
        serviceName: "open-webui",
        taskDefinition: webUITaskDef,
        publicLoadBalancer: params.publiclyAccessible,
        securityGroups: [this.securityGroup],
        listenerPort: 443,
        sslPolicy: cdk.aws_elasticloadbalancingv2.SslPolicy.RECOMMENDED_TLS,
        redirectHTTP: true,
        domainZone: params.domainZone,
        domainName: params.domainName,
        protocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTPS,
        certificate: params.certificate,
        taskSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        propagateTags: ecs.PropagatedTagSource.TASK_DEFINITION,
        enableECSManagedTags: true,
        enableExecuteCommand: true,
        circuitBreaker: {
          enable: true,
          rollback: true,
        },
      }
    );

    // Enable sticky sessions based on openwebui's token cookie
    this.service.targetGroup.enableCookieStickiness(
      cdk.Duration.minutes(10),
      "token"
    );

    this.service.targetGroup.configureHealthCheck({
      port: "8080",
      interval: cdk.Duration.seconds(60),
      timeout: cdk.Duration.seconds(30),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    this.service.targetGroup.setAttribute(
      "deregistration_delay.timeout_seconds",
      "60"
    );

    this.service.loadBalancer.setAttribute(
      "routing.http.drop_invalid_header_fields.enabled",
      "true"
    );
    this.service.loadBalancer.setAttribute("waf.fail_open.enabled", "true");

    // Setup AutoScaling policy
    const scaling = this.service.service.autoScaleTaskCount({
      minCapacity: params.minCapacity || 1,
      maxCapacity: params.maxCapacity || 5,
    });
    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });
    scaling.scaleOnMemoryUtilization("MemoryScaling", {
      targetUtilizationPercent: 75,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    this.url = `https://${params.domainName}`;
  }
}
