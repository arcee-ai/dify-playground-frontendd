import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

interface VpcAttachmentParams {
  vpcId: string;
  publicSubnets: string[];
  privateSubnets: string[];
  availabilityZones?: string[];
  publicSubnetRouteTableIds?: string[]
  privateSubnetRouteTableIds?: string[]
}

export class VpcAttachment extends Construct {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, params: VpcAttachmentParams) {
    super(scope, id);

    // Lookup a VPC and specify subnets in order to attach correctly
    // We pass these in a specific way to make this work at the cloudformation level,
    // but with cdk convenience

    this.vpc = ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: params.vpcId,
      vpcCidrBlock: cdk.Aws.NO_VALUE,
      availabilityZones: params.availabilityZones || params.publicSubnets.map(_ => cdk.Aws.NO_VALUE),
      publicSubnetIds: params.publicSubnets,
      privateSubnetIds: params.privateSubnets,
      publicSubnetRouteTableIds: params.publicSubnetRouteTableIds || params.publicSubnets.map(_ => cdk.Aws.NO_VALUE),
      privateSubnetRouteTableIds: params.privateSubnetRouteTableIds || params.privateSubnets.map(_ => cdk.Aws.NO_VALUE),
    });
  }
}
