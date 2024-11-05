import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

interface WafParams {
  webAlbArn: string;
  apiGatewayStageArn?: string;
}

export class WebApplicationFirewall extends Construct {
  public readonly acl: cdk.aws_wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, params: WafParams) {
    super(scope, id);

    this.acl = new cdk.aws_wafv2.CfnWebACL(this, "WebAcl", {
      name: cdk.Aws.STACK_NAME,
      description: "Web application firewall for Arcee inference stack",
      defaultAction: {
        allow: {},
      },
      scope: "REGIONAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${cdk.Aws.STACK_NAME}-webacl`,
        sampledRequestsEnabled: false,
      },
      associationConfig: {
        requestBody: {
          API_GATEWAY: {
            defaultSizeInspectionLimit: "KB_64",
          },
        },
      },
      rules: [
        {
          name: "AWSManagedRulesAmazonIpReputationList",
          priority: 0,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesAmazonIpReputationList",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${cdk.Aws.STACK_NAME}-webacl-irl`,
            sampledRequestsEnabled: false,
          },
          overrideAction: {
            none: {},
          },
        },
        {
          name: "AWSManagedRulesCommonRuleSet",
          priority: 1,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesCommonRuleSet",
              vendorName: "AWS",
              ruleActionOverrides: [
                { name: 'SizeRestrictions_BODY', actionToUse: { allow: {} }},
                { name: 'CrossSiteScripting_BODY', actionToUse: { allow: {} }},
                { name: 'GenericRFI_BODY', actionToUse: { allow: {} }}
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${cdk.Aws.STACK_NAME}-webacl-crs`,
            sampledRequestsEnabled: false,
          },
          overrideAction: {
            none: {},
          },
        },
        {
          name: "AWSManagedRulesKnownBadInputsRuleSet",
          priority: 2,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesKnownBadInputsRuleSet",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${cdk.Aws.STACK_NAME}-webacl-kbi`,
            sampledRequestsEnabled: false,
          },
          overrideAction: {
            none: {},
          },
        },
        {
          name: "AWSManagedRulesATPRuleSet",
          priority: 3,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesATPRuleSet",
              vendorName: "AWS",
              managedRuleGroupConfigs: [
                {
                  awsManagedRulesAtpRuleSet: {
                    loginPath: "/api/v1/auths/signin",
                    enableRegexInPath: false,
                    requestInspection: {
                      payloadType: "JSON",
                      usernameField: { identifier: "/email" },
                      passwordField: { identifier: "/password" },
                    },
                  },
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${cdk.Aws.STACK_NAME}-webacl-atp`,
            sampledRequestsEnabled: false,
          },
          overrideAction: {
            none: {},
          },
        },
      ],
    });

    const logGroup = new cdk.aws_logs.LogGroup(this, "WebAclLogGroup", {
      logGroupName: `aws-waf-logs-${cdk.Aws.STACK_NAME}`, // WAF requires specific naming structure
      retention: cdk.aws_logs.RetentionDays.ONE_YEAR,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.aws_wafv2.CfnLoggingConfiguration(this, "WebAclLogConfig", {
      resourceArn: this.acl.attrArn,
      redactedFields: [
        { singleHeader: { Name: "Authorization" } },
        { singleHeader: { Name: "X-Api-Key" } },
        { singleHeader: { Name: "Cookie" } },
      ],
      logDestinationConfigs: [logGroup.logGroupArn],
      loggingFilter: {
        // Capitalized keys here bc CDK doesnt have sugar for this prop
        DefaultBehavior: "KEEP",
        Filters: [
          {
            Behavior: "DROP",
            Requirement: "MEETS_ANY",
            Conditions: [
              {
                ActionCondition: { Action: "ALLOW" },
              },
              {
                ActionCondition: { Action: "EXCLUDED_AS_COUNT" },
              },
            ],
          },
        ],
      },
    });

    new cdk.aws_wafv2.CfnWebACLAssociation(this, "WebAclAlbAssociation", {
      resourceArn: params.webAlbArn,
      webAclArn: this.acl.attrArn,
    });

    if (params.apiGatewayStageArn) {
      new cdk.aws_wafv2.CfnWebACLAssociation(this, "WebAclApigwAssociation", {
        resourceArn: params.apiGatewayStageArn,
        webAclArn: this.acl.attrArn,
      });
    }
  }
}
