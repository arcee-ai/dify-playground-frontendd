#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { OpenWebUIStack, OpenWebUIStackProps } from "../lib/open-webui-stack";
import { BootstraplessStackSynthesizer } from "cdk-bootstrapless-synthesizer";

const app = new cdk.App({
  analyticsReporting: false,
  stackTraces: false,
});

const getDistDefaults: () => OpenWebUIStackProps = () => ({
  synthesizer: new BootstraplessStackSynthesizer({
    fileAssetBucketName: "UNUSED",
  }),
  stackName: "arcee-open-webui",
  publiclyAccessible: true,
  enableApiGateway: false,
  exposeAuthCfnParameters: false,
  tags: {
    product: "arcee",
    component: "open-webui",
  },
  introBanner: `Welcome to Arcee. Please contact support@arcee.ai if you have any questions or issues.`,
  // omit posthog tracking, user may configure their own at deploy time
})

////////////////////////
//
// `dist` stacks are for distribution as a cloudformation template
// Each stack declared in this file will output its own template, this allows us to publish multiple variations
//
// Targeting raw cloudformation from cdk is how we distribute the stack to consumers, and has some quirks
// - the stack `env` must not be set, so that the stack can be deployed to any account/region
// - anything that requires a value to be set at deploy time should be a CfnParameter in OpenWebUIStack
//    - this allows the user to provide the value at deploy time
//    - from this entrypoint, only high-level props/flags should be passed to these stacks (build time)
// - there is a post-processing step to remove cdk-specific aspects from the generated template
//    - this allows the stack to be deployed into an account that is not bootstrapped for cdk
//    - this requires _not_ using constructs and cdk features that are not supported in raw cloudformation
//
////////////////////////

// Stack to distribute as a cloudformation template for consumers
// pnpm synth-dist to generate
new OpenWebUIStack(app, "dist", {
  ...getDistDefaults(),
  description:
    "This stack provisions a public Web UI to use with a model hosted in your AWS account. You may provide either a SageMaker endpoint name, or a URL and API Key, to use for inference. Please note this stack has VPC and DNS reqrequisites. Please contact support@arcee.ai if you have any questions or need help.",
});

new OpenWebUIStack(app, "dist-oauth", {
  ...getDistDefaults(),
  description:
    "This stack provisions a public Web UI with OAuth authentication to use with a model hosted in your AWS account. You may provide either a SageMaker endpoint name, or a URL and API Key, to use for inference. Please note this stack has VPC and DNS reqrequisites. Please contact support@arcee.ai if you have any questions or need help.",
  exposeAuthCfnParameters: true,
});

new OpenWebUIStack(app, "dist-private", {
  ...getDistDefaults(),
  description:
    "This stack provisions a private Web UI to use with a model hosted in your AWS account. You may provide either a SageMaker endpoint name, or a URL and API Key, to use for inference. Please note this stack has VPC and DNS reqrequisites. Please contact support@arcee.ai if you have any questions or need help.",
  publiclyAccessible: false,
});

new OpenWebUIStack(app, "dist-private-oauth", {
  ...getDistDefaults(),
  description:
    "This stack provisions a private Web UI with OAuth authentication to use with a model hosted in your AWS account. You may provide either a SageMaker endpoint name, or a URL and API Key, to use for inference. Please note this stack has VPC and DNS reqrequisites. Please contact support@arcee.ai if you have any questions or need help.",
  publiclyAccessible: false,
  exposeAuthCfnParameters: true,
});

// new OpenWebUIStack(app, "dist-with-api", {
//   ...getDistDefaults(),
//   synthesizer: new BootstraplessStackSynthesizer(),
//   description:
//     "This stack provisions a Web UI and API to use with a model hosted in your AWS account. You may provide either a SageMaker endpoint name, or a URL and API Key, to use for inference. Please note this stack has VPC and DNS reqrequisites. Please contact support@arcee.ai if you have any questions or need help.",
//   enableApiGateway: true,
// });
