// Hardcoded values for Arcee's AWS Org
// See also https://github.com/arcee-ai/corp-infra/blob/main/internal/org/hardcoded.ts

export const accounts: Record<string, string> = {
  dev: "356660933719",
  prod: "812782781539",
  delivery_dev: "403915983575",
  delivery_prod: "604219264592",
  modelhub_dev: "575108944663",
  modelhub_prod: "982534348906",
};

// VPC config follows a very specific structure required by the VPC construct
// The number of availability zones must match the number of public and private subnets, and
// the subnet ids are index-aligned with the availability zones.
// NOTE: these can be generated from the outputs of https://app.pulumi.com/arcee/network/dev
// WARNING: these cannot change much without destructive effects on deployed stacks using them
export const vpcs = {
  dev: {
    'us-east-2': {
      vpcId: 'vpc-08bdb48932cdf6fee',
      publicSubnetIds: [
        "subnet-0fe442a9d3b065cfa",
        "subnet-096494b27044c7be2"
      ],
      privateSubnetIds: [
        "subnet-0acc6ee1c1363bf13",
        "subnet-08755254cc5039f14"
      ],
      isolatedSubnetIds: [
        "subnet-0a2b71abeb7c85f8e",
        "subnet-0b512fe793b4dd879"
      ],
      publicSubnetRouteTableIds: ['rtb-083888cf2f990c30a', 'rtb-0051292ad7b4264d6'],
      privateSubnetRouteTableIds: ['rtb-0a90ac435c75aabd2', 'rtb-015588fab481748cd'],
      isolatedSubnetRouteTableIds: ['rtb-0e7133d8f99dd33f3', 'rtb-0b6bf65c923573215'],
      availabilityZones: ['us-east-2a', 'us-east-2f'],
    },
    'us-east-1': {
      vpcId: 'vpc-05b33bea135d44d15',
      publicSubnetIds: [
        "subnet-0453cf02fe5ef77cf",
        "subnet-0e8b67fc2fccf4abe"
      ],
      privateSubnetIds: [
        "subnet-0bb0e74300c511683",
        "subnet-0a7452aea809b7d2c"
      ],
      isolatedSubnetIds: [
        "subnet-07ae1f8904f5a3916",
        "subnet-00ddb63a3f3594b47"
      ],
      publicSubnetRouteTableIds: ['rtb-03f69269882ace72c', 'rtb-0b82b59a276dff4df'],
      privateSubnetRouteTableIds: ['rtb-019eed255d38c38a5', 'rtb-071bb57a4b57b2286'],
      isolatedSubnetRouteTableIds: ['rtb-0617bfc20b22dec7a', 'rtb-0f98a1d34e088c260'],
      availabilityZones: ['us-east-1a', 'us-east-1b'],
    }
  },

  prod: {
    'us-east-2': {
      vpcId: 'vpc-0420d7e72d19d4052',
      publicSubnetIds: [
        "subnet-097ea2c7359d753e7",
        "subnet-07e4df58b4a593d4e",
        "subnet-0a27cfb47c2330327"
      ],
      privateSubnetIds: [
        "subnet-022d32e1123c47a5f",
        "subnet-0fa5434527a70a140",
        "subnet-0881bf40ce396c973"
      ],
      isolatedSubnetIds: [
        "subnet-054159e00d72d4103",
        "subnet-04862cd2005c412cc",
        "subnet-0d068c815ae953b2d"
      ],
      publicSubnetRouteTableIds: ['rtb-0f59a5950a70c561b', 'rtb-010b8e38c1d37b9fb', 'rtb-0770eeb2e0e0e68dc'],
      privateSubnetRouteTableIds: ['rtb-09a8d2fc3f264a9a8', 'rtb-0abb4252c12e21bab', 'rtb-0e14346b554e06915'],
      isolatedSubnetRouteTableIds: ['rtb-03d9b0076252de072', 'rtb-07681e796248d2a95', 'rtb-002bf757be5e76543'],
      availabilityZones: ['us-east-2a', 'us-east-2b', 'us-east-2c'],
    },
    'us-east-1': {
      vpcId: 'vpc-0866eee19dafc3887',
      publicSubnetIds: [
        "subnet-07e6382b5ac847298",
        "subnet-0421797db64f05a2c",
        "subnet-0890d249118f2ae82"
      ],
      privateSubnetIds: [
        "subnet-0171d3c418d0b5385",
        "subnet-07ad10c3715d92847",
        "subnet-0012de59ba0aed7b7"
      ],
      isolatedSubnetIds: [
        "subnet-04265701417a4be8e",
        "subnet-051fbb92f81651745",
        "subnet-0a51178eb87ffbbe0"
      ],
      publicSubnetRouteTableIds: ['rtb-0df51f8a74072935f', 'rtb-017764d776cce6209', 'rtb-080471d9cdf72f198'],
      privateSubnetRouteTableIds: ['rtb-07a4cd413fa44a2da', 'rtb-036771610b60d0311', 'rtb-09fb882bbd1940aa6'],
      isolatedSubnetRouteTableIds: ['rtb-0d2e82a9e3909fedc', 'rtb-0e5173d713c008a75', 'rtb-09291f32b08e3fb26'],
      availabilityZones: ['us-east-1a', 'us-east-1b', 'us-east-1f'],
    }
  },
};


// use this to enable posthog tracking on a stack by passing it like
// `...posthogConfig` to the OpenWebUIStack constructor
export const posthogConfig = {
  // this key is safe to commit, and belongs to the arcee project
  // https://us.posthog.com/project/35571/settings/project#variables
  posthogKey: "phc_y8QsgOJSRB1R9KjXgMzfYh1e4ZcxRnwqbUIPOjTEpz4",
  posthogHost: "https://us.i.posthog.com",
}
