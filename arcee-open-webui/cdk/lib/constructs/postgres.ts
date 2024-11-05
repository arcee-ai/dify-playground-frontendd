import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as asm from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

interface PostgresParams {
  vpc: ec2.IVpc;
  additionalIngressRules?: {
    peer: ec2.IPeer;
    description: string;
  }[];
}

export class Postgres extends Construct {
  public readonly db: rds.ServerlessCluster;
  public readonly dbConnStringSecret: asm.Secret;

  constructor(scope: Construct, id: string, params: PostgresParams) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    // create a security group for aurora db
    const dbSecurityGroup = new ec2.SecurityGroup(this, "DbSecurityGroup", {
      vpc: params.vpc,
      allowAllOutbound: false,
    });

    params.additionalIngressRules?.forEach((rule) => {
      dbSecurityGroup.addIngressRule(rule.peer, ec2.Port.POSTGRES, rule.description);
    });

    // create a parameter group for db
    const parameterGroup = rds.ParameterGroup.fromParameterGroupName(
      this,
      "DbParameterGroup",
      "default.aurora-postgresql13"
    );
    parameterGroup.addParameter("rds.force_ssl", "1");

    // create a db cluster
    const dbCluster = new rds.ServerlessCluster(this, "DbServerless", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_13_12,
      }),
      clusterIdentifier:
        stack.stackName === "arcee-open-webui"
          ? // For `dist` the stack name will be the above, and we don't want to name db clusters with this to allow multiple CFN deployments into one account
            // For whatever reason CDK fails if we use cdk.Aws.STACK_NAME here
            undefined
          : stack.stackName,
      defaultDatabaseName: "postgres",
      vpc: params.vpc,
      vpcSubnets: {
        subnets: params.vpc.privateSubnets,
      },
      securityGroups: [dbSecurityGroup],
      parameterGroup,
      scaling: {
        minCapacity: rds.AuroraCapacityUnit.ACU_2,
        maxCapacity: rds.AuroraCapacityUnit.ACU_4,
        autoPause: cdk.Duration.seconds(0),
      },
      credentials: rds.Credentials.fromGeneratedSecret("postgres", {
        secretName: `${cdk.Aws.STACK_NAME}/postgres`,
      }),
      backupRetention: cdk.Duration.days(7),
    });

    // Create another secret to convert the RDS secret into a conn string the app expects
    const dbConnString = new asm.Secret(this, "DbConnectionStringSecret", {
      secretName: `${cdk.Aws.STACK_NAME}/postgres/connectionstring`,
      secretStringValue: cdk.SecretValue.unsafePlainText(
        `postgres://${dbCluster
          .secret!.secretValueFromJson("username")
          .unsafeUnwrap()}:${dbCluster
          .secret!.secretValueFromJson("password")
          .unsafeUnwrap()}@${dbCluster
          .secret!.secretValueFromJson("host")
          .unsafeUnwrap()}:${dbCluster
          .secret!.secretValueFromJson("port")
          .unsafeUnwrap()}/${dbCluster
          .secret!.secretValueFromJson("dbname")
          .unsafeUnwrap()}`
      ),
    });

    this.db = dbCluster;
    this.dbConnStringSecret = dbConnString;
  }
}
