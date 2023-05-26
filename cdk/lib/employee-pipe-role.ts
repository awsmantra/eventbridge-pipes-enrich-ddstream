import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {CompositePrincipal, Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";
import * as iam from 'aws-cdk-lib/aws-iam';
import {Options} from "../types/options";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {EmployeeEventBus} from "./employee-event-bus";
import {Queue} from "aws-cdk-lib/aws-sqs";


interface EmployeePipeRoleStackProps extends StackProps {
    options: Options,
    table: Table,
    employeeEventBus : EmployeeEventBus,
    employeeDLQueue : Queue
}

export class EmployeePipeRole extends cdk.NestedStack  {
    private readonly _role: Role;

    constructor(scope: Construct, id: string, props: EmployeePipeRoleStackProps) {
        super(scope, id, props);


        this._role  = new Role(this,  "EmployeePipeRole", {
            assumedBy: new CompositePrincipal(
                new iam.ServicePrincipal(`states.${props.options.defaultRegion}.amazonaws.com`),
                new iam.ServicePrincipal('pipes.amazonaws.com'),
                new iam.ServicePrincipal('delivery.logs.amazonaws.com')
            ),
            roleName: "employee-pipe-role"
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

        // Add DynamoDB Policy
        this._role.addToPolicy(  new PolicyStatement( {
            sid: 'DynamoDBAccess',
            effect: Effect.ALLOW,
            actions: [
                'dynamodb:DescribeStream',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
                'dynamodb:ListStreams'
            ],
            resources: [props.table.tableStreamArn!],
        }))

         // Add Transfer Policy
         this._role.addToPolicy(  new PolicyStatement( {
            sid: 'EventBusAccess',
            effect: Effect.ALLOW,
            actions: [
                "events:PutEvents"
            ],
            resources: [props.employeeEventBus.targetArn],
        }))

        // Add PipeEnrichment Policy
        this._role.addToPolicy(  new PolicyStatement( {
            sid: 'PipeEnrichmentPolicy',
            effect: Effect.ALLOW,
            actions: [
                "states:StartExecution",
                "states:StartSyncExecution",
                "states:ListExecutions",
                "states:GetExecutionHistory"
            ],
            resources: ["*"],  // TODO this needs to be StateMachine
        }))

        // Add PipeEnrichment Policy
        this._role.addToPolicy(  new PolicyStatement( {
            sid: 'AmazonSQSFullAccess',
            effect: Effect.ALLOW,
            actions: [
                "sqs:*",
            ],
            resources: [props.employeeDLQueue.queueArn],
        }))
    }

    get roleArn(): string {
        return this._role.roleArn;
    }
    get role(): Role {
        return this._role
    }
}
