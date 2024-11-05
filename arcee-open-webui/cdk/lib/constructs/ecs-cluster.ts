import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";

interface EcsClusterParams {
  vpc: ec2.IVpc;
}

export class EcsCluster extends Construct {
  public readonly cluster: ecs.ICluster;

  constructor(scope: Construct, id: string, params: EcsClusterParams) {
    super(scope, id);

    this.cluster = new ecs.Cluster(this, "EcsCluster", {
      clusterName: `${cdk.Aws.STACK_NAME}-${cdk.Aws.REGION}`,
      vpc: params.vpc,
      containerInsights: true,
      enableFargateCapacityProviders: true,
      executeCommandConfiguration: {
        logging: ecs.ExecuteCommandLogging.DEFAULT,
      },
    });

    // TODO bring the GPUs? Conditionally?
    // const clusterCapacityTemplate = new ec2.LaunchTemplate(this, 'EcsCapacityLt', {
    //   launchTemplateName: cdk.Aws.STACK_NAME,
    //   requireImdsv2: true,
    //   instanceMetadataTags: true,
    //   ebsOptimized: true,
    // })

    // const clusterAsg = new autoscaling.AutoScalingGroup(this, "EcsClusterAsg", {
    //   autoScalingGroupName: cdk.Aws.STACK_NAME,
    //   minCapacity: 1,
    //   // maxCapacity: props.maxCapacity || 1,
    //   vpc,
    //   vpcSubnets: {
    //     subnets: vpc.privateSubnets,
    //   },
    //   instanceType: new ec2.InstanceType("p5.48xlarge"),
    //   machineImage: ecs.EcsOptimizedImage.amazonLinux2(
    //     ecs.AmiHardwareType.GPU,
    //     {
    //       cachedInContext: true,
    //     }
    //   ),
    //   newInstancesProtectedFromScaleIn: true,
    //   signals: autoscaling.Signals.waitForMinCapacity(),
    //   updatePolicy: autoscaling.UpdatePolicy.rollingUpdate({
    //     minInstancesInService: 1,
    //   }),
    //   ssmSessionPermissions: true,
    //   launchTemplate: ''
    // });

    // const clusterCapacity = new ecs.AsgCapacityProvider(
    //   this,
    //   "EcsClusterCapacity",
    //   {
    //     capacityProviderName: `${cdk.Aws.STACK_NAME}-ec2`,
    //     autoScalingGroup: clusterAsg,
    //   }
    // );

    // cluster.addAsgCapacityProvider(clusterCapacity, {
    //   canContainersAccessInstanceRole: false,
    //   spotInstanceDraining: true,
    // });
  }
}
