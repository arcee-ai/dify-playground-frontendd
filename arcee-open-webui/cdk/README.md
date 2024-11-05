# arcee-open-webui CDK (IaC)

> Manages AWS infrastructure for
> 1. Deployments within our our accounts
> 2. A synthesized CloudFormation template to distribute to other AWS accounts

This stack includes:
- arcee-open-webui/open-webio (configured + branded)
- arcee-open-webui/pipelines (with arcee_pipeline baked in)
- an API gateway for a hosted model API

## Deployment Instructions

> All within the `cdk` directory

1. pnpm install
2. assume Arcee-ModelHub-Dev/ArceeDev
3. pnpm cdk diff dev
4. pnpm cdk deploy dev

## Managing environments

`cdk/bin/open-webui.ts` declares all environments. In the instructions above, you can replace `dev` with any other environment, ie `pnpm cdk diff prod-supernova`

Note you will need to assume a role in the same account as the deployment.

To create new environments / instances of this openwebui stack, you can update `cdk/bin/open-webui.ts`

## CloudFormation Distribution

The `dist` environment is a special case that is not actually deployed, but instead is used to synthesize a plain CloudFormation template for customers to install on their own.

Importantly, it does not take most props through the stack construct but through declared CloudFormation parameters, which are passed at deploy-time. See our [CloudFormation GitHub workflow](https://github.com/arcee-ai/arcee-open-webui/actions/workflows/cloudformation.yml) for details on the synthesis, packaging, and distribution of this template.

Care must be taken to expose CloudFormation parameters consistently, and to handle differences between Construct props and CloudFormation parameters. It is ok for the CDK versions of our constructs to accept more options and configuration than we expose through the CloudFormation interface.

## AWS Environment Requirements

This stack does not provision a VPC, Route53 Hosted Zone, or deploy an inference endpoint. Requirements for the account being deployed into are:

1. A VPC with public and private subnets in at least two AZs
2. A Route53 Hosted Zone that matches the `DomainName` parameter that is correctly resolving
3. An OpenAI-compatible inference endpoint, in SageMaker or otherwise
