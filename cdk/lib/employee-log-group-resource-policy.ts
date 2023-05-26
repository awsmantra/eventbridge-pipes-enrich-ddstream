import * as cdk from 'aws-cdk-lib';
import {Construct} from "constructs";
import {StackProps} from "aws-cdk-lib";
import {Options} from "../types/options";
import * as logs from "aws-cdk-lib/aws-logs";
import {Effect, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {EmployeeEventBridgeRule} from "./employee-eventbridge-rule";

interface EmployeeLogGroupResourcePolicyStackProps extends StackProps {
    options: Options,
    logGroup: logs.LogGroup,
    employeeBusRule: EmployeeEventBridgeRule
}


export class EmployeeLogGroupResourcePolicy extends cdk.NestedStack {

    constructor(scope: Construct, id: string, props: EmployeeLogGroupResourcePolicyStackProps) {
        super(scope, id, props);

       const resourcePolicy  = new logs.ResourcePolicy(this,"employee-app-log-resource-policy" , {
            resourcePolicyName : "EventBridgeToCloudWatch",
            policyStatements :  [new PolicyStatement( {
                sid: 'LogStreamPolicy',
                effect: Effect.ALLOW,
                principals: [new ServicePrincipal('events.amazonaws.com')],
                actions: [
                    "logs:CreateLogStream"
                ],
                resources: [props.logGroup.logGroupArn],
            }),
            new PolicyStatement( {
                sid: 'LogEventPolicy',
                effect: Effect.ALLOW,
                principals: [new ServicePrincipal('events.amazonaws.com')],
                actions: [
                    "logs:PutLogEvents"
                ],
                resources: [props.logGroup.logGroupArn],
                conditions :  {
                    "ArnEquals": {"AWS:SourceArn": "${props.employeeBusRule.ruleArn}"}
                }
            })
            ]
        })

    }
}
