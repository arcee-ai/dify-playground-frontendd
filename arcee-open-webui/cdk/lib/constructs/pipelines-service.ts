import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as logs from "aws-cdk-lib/aws-logs";
import * as asm from "aws-cdk-lib/aws-secretsmanager";

interface PipelinesServiceParams {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  logGroup: logs.ILogGroup;
  image: string;

  publiclyAccessible: boolean;
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

  minCapacity?: number;
  maxCapacity?: number;

  // Used for display
  defaultModel?: string;

  // Sagemaker Inference Endpoint
  sagemakerEndpointName?: string;

  // Other OpenAI compatible
  openaiBaseUrl?: string;
  openaiKey?: string;

  // Optional Posthog tracking
  posthogKey?: string;
  posthogHost?: string;
}

export class PipelinesService extends Construct {
  public readonly service: ecs_patterns.NetworkLoadBalancedFargateService;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly lbSecurityGroup: ec2.SecurityGroup;
  public readonly container: ecs.ContainerDefinition;
  public readonly url: string;
  public readonly tokenSecret: asm.ISecret;

  constructor(scope: Construct, id: string, params: PipelinesServiceParams) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    const pipelineSessionSecret = new asm.Secret(this, "PipelineSession", {
      secretName: `${cdk.Aws.STACK_NAME}/pipeline-session`,
    });

    this.tokenSecret = new asm.Secret(this, "PipelineToken", {
      secretName: `${cdk.Aws.STACK_NAME}/pipeline-token`,
      generateSecretString: {
        passwordLength: 48,
        excludePunctuation: true,
        requireEachIncludedType: true,
      },
    });

    this.securityGroup = new ec2.SecurityGroup(this, "PipelinesSecurityGroup", {
      vpc: params.vpc,
      description: "Allow traffic to Pipelines service",
      allowAllOutbound: true,
    });

    this.lbSecurityGroup = new ec2.SecurityGroup(
      this,
      "PipelinesLBSecurityGroup",
      {
        vpc: params.vpc,
        description: "Allow traffic to Pipelines LB",
        allowAllOutbound: true,
      }
    );

    // // Define the IAM role for Pipelines Backend
    const pipelinesRole = new iam.Role(this, "PipelinesRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    pipelinesRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "AnySagemakerEnpoint",
        effect: iam.Effect.ALLOW,
        actions: ["sagemaker:InvokeEndpoint"],
        resources: [`arn:aws:sagemaker:*:*:endpoint/*`],
      })
    );

    // Define the Pipelines Backend container
    const pipelinesTaskDef = new ecs.FargateTaskDefinition(
      this,
      "PipelinesTaskDef",
      {
        cpu: params.cpu,
        memoryLimitMiB: params.memory,
        taskRole: pipelinesRole,
      }
    );
    pipelinesTaskDef.addContainer("PipelinesContainer", {
      portMappings: [
        {
          name: "pipelines",
          containerPort: 9099,
        },
      ],
      image: ecs.ContainerImage.fromRegistry(params.image),
      environment: {
        PIPELINES_DOMAIN: params.domainName,
        MODEL_NAME: params.defaultModel || "",
        SAGEMAKER_ENDPOINT_NAME: params.sagemakerEndpointName || "",
        PIPELINES_DIR: "./pipelines",
        OPENAI_API_BASE_URL: params.openaiBaseUrl || "",
        OPENAI_API_KEY: params.openaiKey || "",
        RATE_LIMIT_PIPELINES: "*",
        RATE_LIMIT_REQUESTS_PER_MINUTE: "10",
        RATE_LIMIT_REQUESTS_PER_HOUR: "1000",
        RATE_LIMIT_SLIDING_WINDOW_LIMIT: "100",
        RATE_LIMIT_SLIDING_WINDOW_MINUTES: "15",
        POSTHOG_KEY: params.posthogKey || "",
        POSTHOG_HOST: params.posthogHost || "",
      },
      secrets: {
        SESSION_SECRET: ecs.Secret.fromSecretsManager(pipelineSessionSecret),
        PIPELINES_API_KEY: ecs.Secret.fromSecretsManager(this.tokenSecret),
      },
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost:9099/ || exit 1"],
        interval: cdk.Duration.seconds(30),
        startPeriod: cdk.Duration.seconds(30),
      },
      logging: new ecs.AwsLogDriver({
        logGroup: params.logGroup,
        streamPrefix: "pipelines",
      }),
    });

    const executionRole = pipelinesTaskDef.obtainExecutionRole();
    executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );

    const nlb = new elbv2.NetworkLoadBalancer(this, "ApiGatewayVpcNlb", {
      loadBalancerName: `${cdk.Aws.STACK_NAME}-api-nlb`,
      vpc: params.vpc,
      securityGroups: [this.lbSecurityGroup],
      internetFacing: false,
      crossZoneEnabled: false,
    });

    this.service = new ecs_patterns.NetworkLoadBalancedFargateService(
      this,
      "PipelinesService",
      {
        cluster: params.cluster,
        serviceName: "pipelines",
        taskDefinition: pipelinesTaskDef,
        securityGroups: [this.securityGroup],
        assignPublicIp: false,
        publicLoadBalancer: false,
        domainName: `pipelines.${params.domainName}`,
        domainZone: params.domainZone,
        loadBalancer: nlb,
        healthCheckGracePeriod: cdk.Duration.seconds(60),
        listenerPort: 443,
        propagateTags: ecs.PropagatedTagSource.TASK_DEFINITION,
        enableECSManagedTags: true,
        enableExecuteCommand: true,
      }
    );

    this.lbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "Allow VPC traffic"
    );
    this.securityGroup.addIngressRule(
      this.lbSecurityGroup,
      ec2.Port.tcp(9099),
      "LB to service"
    );

    this.service.listener.addCertificates("Cert", [
      elbv2.ListenerCertificate.fromCertificateManager(params.certificate),
    ]);
    // Escape-hatch: use a TLS listener with the cert
    (
      this.service.listener.node.defaultChild as elbv2.CfnListener
    ).addPropertyOverride("Protocol", "TLS");
    // Escape-hatch: set a SSL Policy
    (
      this.service.listener.node.defaultChild as elbv2.CfnListener
    ).addPropertyOverride("SslPolicy", elbv2.SslPolicy.RECOMMENDED_TLS);

    this.service.targetGroup.configureHealthCheck({
      protocol: elbv2.Protocol.HTTP,
      path: "/",
      port: "9099",
      interval: cdk.Duration.seconds(60),
      timeout: cdk.Duration.seconds(30),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      healthyHttpCodes: "200",
    });

    this.service.targetGroup.setAttribute(
      "deregistration_delay.timeout_seconds",
      "60"
    );

    this.service.targetGroup.setAttribute(
      "deregistration_delay.connection_termination.enabled",
      "true"
    );

    this.service.targetGroup.setAttribute("preserve_client_ip.enabled", "true");

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
      targetUtilizationPercent: 60,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    this.url = `https://pipelines.${params.domainName}`;
  }
}
