import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as asm from "aws-cdk-lib/aws-secretsmanager";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";

interface RedisParams {
  vpc: ec2.IVpc;
}

export class Redis extends Construct {
  public readonly redis: elasticache.CfnReplicationGroup;
  public readonly redisConnStringSecret: asm.Secret;
  public readonly redisSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, params: RedisParams) {
    super(scope, id);

    const subnetGroup = new elasticache.CfnSubnetGroup(
      this,
      "RedisSubnetGroup",
      {
        cacheSubnetGroupName: `${cdk.Aws.STACK_NAME}-redis-subnet`,
        subnetIds: params.vpc.privateSubnets.map((subnet) => subnet.subnetId),
        description: "ElastiCache Redis Subnet Group",
      }
    );

    const securityGroup = new ec2.SecurityGroup(this, "RedisSecurityGroup", {
      vpc: params.vpc,
      allowAllOutbound: true,
      description: "Redis Security Group",
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(6379),
      "Redis port"
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(6380),
      "Redis port"
    );

    const redisAuthToken = new asm.Secret(this, "RedisAuthTokenSecret", {
      secretName: `${cdk.Aws.STACK_NAME}/redis/auth-token`,
      generateSecretString: {
        excludePunctuation: true,
        passwordLength: 48,
      },
    });

    const redis = new elasticache.CfnReplicationGroup(
      this,
      "ReplicationGroup",
      {
        authToken: redisAuthToken.secretValue.unsafeUnwrap(),
        autoMinorVersionUpgrade: true,
        atRestEncryptionEnabled: true,
        automaticFailoverEnabled: false,
        engine: "Redis",
        engineVersion: "7.1",
        cacheNodeType: "cache.t4g.micro",
        cacheSubnetGroupName: subnetGroup.ref,
        multiAzEnabled: false,
        numCacheClusters: 1,
        replicationGroupDescription: `${cdk.Aws.STACK_NAME} Redis Replication Group`,
        securityGroupIds: [securityGroup.securityGroupId],
        transitEncryptionEnabled: true,
      }
    );

    redis.addDependency(subnetGroup);

    // Create another secret to convert the RDS secret into a conn string the app expects
    const redisConnString = new asm.Secret(
      this,
      "RedisConnectionStringSecret",
      {
        secretName: `${cdk.Aws.STACK_NAME}/redis/connectionstring`,
        secretStringValue: cdk.SecretValue.unsafePlainText(
          `rediss://:${redis.authToken}@${redis.attrPrimaryEndPointAddress}:${redis.attrPrimaryEndPointPort}/0`
        ),
      }
    );

    this.redis = redis;
    this.redisConnStringSecret = redisConnString;
    this.redisSecurityGroup = securityGroup;
  }
}
