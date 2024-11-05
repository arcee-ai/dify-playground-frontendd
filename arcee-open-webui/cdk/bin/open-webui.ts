#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { accounts, vpcs, posthogConfig } from "../hardcoded";
import { OpenWebUIStack } from "../lib/open-webui-stack";

const app = new cdk.App();

////////////////////////
//
// Hosted stacks that we manage with CDK
//
// We manage these stacks in Arcee's AWS infrastructure right here, as IaC
// In this pathway, we configure the stacks with our own values
//
// WARNING: Due to the use of CfnParameter and the behavior of defaults values,
// changing certain props may require manual intervention
//
// **We will outgrow defining all stacks in code like this and should get to more like:**
//
// all_hosted_stacks = load_config_from_db_or_ssm_or_s3_or_something()
// all_hosted_stacks.forEach(stack => {
//   new OpenWebUIStack(app, stack.id, stack);
// })
//
////////////////////////

// Development stack
new OpenWebUIStack(app, "dev", {
  stackName: "arcee-dev-open-webui",
  env: {
    account: accounts.modelhub_dev,
    region: "us-east-1",
  },

  publiclyAccessible: false,
  vpcId: vpcs.dev["us-east-1"].vpcId,
  publicSubnets: vpcs.dev["us-east-1"].publicSubnetIds,
  privateSubnets: vpcs.dev["us-east-1"].privateSubnetIds,
  publicSubnetRouteTableIds: vpcs.dev["us-east-1"].publicSubnetRouteTableIds,
  privateSubnetRouteTableIds: vpcs.dev["us-east-1"].privateSubnetRouteTableIds,
  availabilityZones: vpcs.dev["us-east-1"].availabilityZones,
  domainZoneId: "Z09304252RWMY5CAFGJTO",
  domainName: "oui.dev.arcee.ai",
  enableApiGateway: true,

  openaiBaseUrl:
    "https://models.research.arcee.ai/openai/v1", // kubeai on research cluster, many models
  openaiKey: "UNUSED",
  openWebUiDockerImage: "ghcr.io/arcee-ai/arcee-open-webui:main",
  openWebUiAuth: {
    disableSignup: true,
    disableLoginForm: true,
    oidcClientSecretArn: 'arn:aws:secretsmanager:us-east-1:575108944663:secret:arcee-dev-open-webui/arcee-sso-8dk644',
    googleOauthSecretArn:
      "arn:aws:secretsmanager:us-east-1:575108944663:secret:arcee-dev-open-webui/google-sso-m37YUO",
  },
  openWebUiEnableRedis: true,
  pipelinesDockerImage: "ghcr.io/arcee-ai/arcee-open-webui-pipelines:main",

  additionalPostgresIngressRules: [
    {
      peer: cdk.aws_ec2.Peer.anyIpv4(),
      description: "Allow access from within VPC",
    },

    // {
    //   peer: cdk.aws_ec2.Peer.securityGroupId(
    //     "sg-0220bffb451854a12",
    //     "092189725097"
    //   ),
    //   description: "Arcee VPN Users (Dev)",
    // },
  ],

  introBanner: `This is a dev environment for arcee-open-webui. Please note this experience is limited. You may purchase this model to unlock higher limits, or to host yourself. :)`,

  // enable posthog tracking
  ...posthogConfig,

  tags: {
    product: "arcee",
    environment: "dev",
    component: "open-webui",
  },
});

new OpenWebUIStack(app, "dev-no-egress", {
  stackName: "dev-oui-no-egress",
  env: {
    account: accounts.modelhub_dev,
    region: "us-east-1",
  },

  publiclyAccessible: false,
  vpcId: vpcs.dev["us-east-1"].vpcId,
  publicSubnets: vpcs.dev["us-east-1"].publicSubnetIds,
  privateSubnets: vpcs.dev["us-east-1"].isolatedSubnetIds,
  publicSubnetRouteTableIds: vpcs.dev["us-east-1"].publicSubnetRouteTableIds,
  privateSubnetRouteTableIds: vpcs.dev["us-east-1"].isolatedSubnetRouteTableIds,
  availabilityZones: vpcs.dev["us-east-1"].availabilityZones,
  domainZoneId: "Z04393503GYINFKU2MCU8",
  domainName: "oui2.dev.arcee.ai",
  enableApiGateway: false,

  openaiBaseUrl:
    "https://models.research.arcee.ai/openai/v1", // kubeai on research cluster, many models
  openaiKey: "UNUSED",
  openWebUiDockerImage: "575108944663.dkr.ecr.us-east-1.amazonaws.com/ecr-public/v5o2z3j7/arcee-open-webui:main",
  openWebUiAuth: {
    disableSignup: false,
    disableLoginForm: false,
    oidcClientSecretArn: 'arn:aws:secretsmanager:us-east-1:575108944663:secret:arcee-dev-open-webui/arcee-sso-8dk644',
  },
  openWebUiEnableRedis: false,
  pipelinesDockerImage: "575108944663.dkr.ecr.us-east-1.amazonaws.com/ecr-public/v5o2z3j7/arcee-open-webui-pipelines:main",

  additionalPostgresIngressRules: [
    {
      peer: cdk.aws_ec2.Peer.anyIpv4(),
      description: "Allow access from within VPC",
    },
  ],

  introBanner: `This is a dev environment for arcee-open-webui WITH NO EGRESS, ymmv`,

  // enable posthog tracking
  // ...posthogConfig,

  tags: {
    product: "arcee",
    environment: "dev",
    component: "open-webui",
  },
});

// Production deployments

// NOTE: Root NS records must be set manually in the Network account's Route53 once after this zone is created
// ACM certificate validation will fail otherwise

new OpenWebUIStack(app, "prod-supernova", {
  stackName: "arcee-prod-supernova",
  env: {
    account: accounts.modelhub_prod,
    region: "us-east-1",
  },

  publiclyAccessible: true,
  vpcId: vpcs.prod["us-east-1"].vpcId,
  publicSubnets: vpcs.prod["us-east-1"].publicSubnetIds,
  privateSubnets: vpcs.prod["us-east-1"].privateSubnetIds,
  publicSubnetRouteTableIds: vpcs.prod["us-east-1"].publicSubnetRouteTableIds,
  privateSubnetRouteTableIds: vpcs.prod["us-east-1"].privateSubnetRouteTableIds,
  availabilityZones: vpcs.prod["us-east-1"].availabilityZones,
  domainZoneId: "Z0250999DCZRBB874SED",
  domainName: "supernova.arcee.ai",
  enableApiGateway: true,

  openaiBaseUrl: "http://10.2.150.153:30000/v1", // vllm on p5 in modelhub prod use1
  openaiKey: "UNUSED",
  openWebUiCpu: 2048,
  openWebUiMemory: 4096,
  openWebUiAuth: {
    googleOauthSecretArn:
      "arn:aws:secretsmanager:us-east-1:982534348906:secret:arcee-prod-supernova/google-sso-yUGJ8T",
  },
  openWebUiEnableRedis: true,

  openwebUiMinCapacity: 2,
  pipelinesMinCapacity: 2,

  introBanner: `This is a showcase for Arcee Supernova. Please note this experience is limited. You may purchase this model to unlock higher limits, or to host yourself. Please visit https://www.arcee.ai or email sales@arcee.ai for more details.`,

  // enable posthog tracking
  ...posthogConfig,

  tags: {
    product: "arcee",
    environment: "production",
    component: "open-webui/supernova",
  },
});

// This is a facade for SEC. It is pointed at the same inference engine as prod-supernova.
// Customizations:
// - No API provisioned
// - Model name + system prompt manually updated in Open WebUI Admin
new OpenWebUIStack(app, "prod-sec", {
  stackName: "arcee-prod-sec",
  env: {
    account: accounts.modelhub_prod,
    region: "us-east-1",
  },

  publiclyAccessible: true,
  vpcId: vpcs.prod["us-east-1"].vpcId,
  publicSubnets: vpcs.prod["us-east-1"].publicSubnetIds,
  privateSubnets: vpcs.prod["us-east-1"].privateSubnetIds,
  publicSubnetRouteTableIds: vpcs.prod["us-east-1"].publicSubnetRouteTableIds,
  privateSubnetRouteTableIds: vpcs.prod["us-east-1"].privateSubnetRouteTableIds,
  availabilityZones: vpcs.prod["us-east-1"].availabilityZones,
  domainZoneId: "Z07404121JJWAL23G79Z8",
  domainName: "sec.arcee.ai",

  openaiBaseUrl: "http://10.2.147.35:30000/v1", // vllm on p5 in modelhub prod use1, NOTE same as prod-supernova 🤫
  openaiKey: "UNUSED",
  openWebUiCpu: 2048,
  openWebUiMemory: 4096,
  openWebUiAuth: {
    googleOauthSecretArn:
      "arn:aws:secretsmanager:us-east-1:982534348906:secret:arcee-prod-sec/google-sso-mGQUc5",
  },
  openWebUiEnableRedis: true,
  defaultUserRole: "user",

  // introBanner: `This is a showcase for Arcee SEC. Please note this experience is limited. You may purchase this model to unlock higher limits, or to host yourself. Please visit https://www.arcee.ai or email sales@arcee.ai for more details.`,

  // enable posthog tracking
  ...posthogConfig,

  tags: {
    product: "arcee",
    environment: "production",
    component: "open-webui/sec",
  },
});

// This is a facade for Nextround. It is pointed at the same inference engine as prod-supernova.
// Customizations:
// - Access must be granted by admin
// - No API provisioned
// - Model name + system prompt manually updated in Open WebUI Admin
new OpenWebUIStack(app, "prod-nextround-sec", {
  stackName: "arcee-prod-nextround-sec",
  env: {
    account: accounts.modelhub_prod,
    region: "us-east-1",
  },

  publiclyAccessible: true,
  vpcId: vpcs.prod["us-east-1"].vpcId,
  publicSubnets: vpcs.prod["us-east-1"].publicSubnetIds,
  privateSubnets: vpcs.prod["us-east-1"].privateSubnetIds,
  publicSubnetRouteTableIds: vpcs.prod["us-east-1"].publicSubnetRouteTableIds,
  privateSubnetRouteTableIds: vpcs.prod["us-east-1"].privateSubnetRouteTableIds,
  availabilityZones: vpcs.prod["us-east-1"].availabilityZones,
  domainZoneId: "Z06090952SFQZ1XDY2G9I",
  domainName: "nextround.arcee.ai",

  openaiBaseUrl: "http://10.2.147.35:30000/v1", // vllm on p5 in modelhub prod use1, NOTE same as prod-supernova 🤫
  openaiKey: "UNUSED",
  openWebUiCpu: 2048,
  openWebUiMemory: 4096,
  defaultUserRole: "pending",

  // introBanner: `This is a showcase for Arcee SEC. Please note this experience is limited. You may purchase this model to unlock higher limits, or to host yourself. Please visit https://www.arcee.ai or email sales@arcee.ai for more details.`,

  // enable posthog tracking
  ...posthogConfig,

  tags: {
    product: "arcee",
    environment: "production",
    component: "open-webui/nextround-sec",
  },
});
