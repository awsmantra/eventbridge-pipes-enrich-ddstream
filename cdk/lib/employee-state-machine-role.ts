import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {CompositePrincipal, Effect, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import {Options} from "../types/options";
import * as iam from "aws-cdk-lib/aws-iam";

interface EmployeeStateMachineRoleProps extends StackProps {
    options: Options;
}

export class EmployeeStateMachineRole extends cdk.NestedStack  {
    private readonly _role: Role;
    constructor(scope: Construct, id: string, props: EmployeeStateMachineRoleProps) {
        super(scope, id, props);


        // Add Step Functions assumeRole
        this._role  = new Role(this,  "employee-state-machine-role", {
            assumedBy: new CompositePrincipal(
                new iam.ServicePrincipal(`states.${props.options.defaultRegion}.amazonaws.com`)
            ),
            roleName: "employee-state-machine-role"
        })

        // Add Cloudwatch Policy
        this._role.addToPolicy(  new PolicyStatement( {
            sid: 'WriteCloudWatchLogs',
            effect: Effect.ALLOW,
            actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:CreateLogDelivery",
                "logs:GetLogDelivery",
                "logs:UpdateLogDelivery",
                "logs:DeleteLogDelivery",
                "logs:ListLogDeliveries",
                "logs:PutResourcePolicy",
                "logs:DescribeResourcePolicies",
                "logs:DescribeLogGroups",
            ],
            resources: ["*"],
        }))
    }

    get roleArn(): string {
        return this._role.roleArn;
    }
}
