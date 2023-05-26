import * as cdk from 'aws-cdk-lib';
import {Construct} from "constructs";
import {StackProps} from "aws-cdk-lib";
import {EventBus} from "aws-cdk-lib/aws-events";
import {Queue} from "aws-cdk-lib/aws-sqs";
import * as pipes from 'aws-cdk-lib/aws-pipes';
import {Options} from "../types/options";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {EmployeePipeRole} from "./employee-pipe-role";
import {EmployeeStateMachine} from "./employee-state-machine";
import * as logs from "aws-cdk-lib/aws-logs";
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import {EmployeeEventBus} from "./employee-event-bus";


interface EmployeeEventBridgePipeStackProps extends StackProps {
    options: Options,
    table: Table,
    employeePipeRole: EmployeePipeRole,
    employeeAppStateMachine:EmployeeStateMachine
    logGroup:logs.LogGroup,
    employeeEventBus : EmployeeEventBus,
    employeeDLQueue: Queue
}


export class EmployeeEventBridgePipe extends cdk.NestedStack {
    constructor(scope: Construct, id: string, props: EmployeeEventBridgePipeStackProps) {
        super(scope, id, props);

        // Create new Pipe
        const pipe = new pipes.CfnPipe(this, 'pipe', {
            name: 'employee-app-pipe',
            roleArn: props.employeePipeRole.roleArn,
            source: props.table.tableStreamArn!,
            target:  props.employeeEventBus.targetArn,
            sourceParameters: {
                dynamoDbStreamParameters: {
                    startingPosition: 'LATEST',
                    batchSize: 1,
                    deadLetterConfig: {
                        arn: props.employeeDLQueue.queueArn,
                    },
                    maximumRetryAttempts: 1,
                },
                filterCriteria: {
                    filters: [{
                        pattern: '{ "eventName": ["INSERT","MODIFY"] }',
                    }],
                }
            },
            enrichment: props.employeeAppStateMachine.stateMachine.attrArn,
            targetParameters: {
                eventBridgeEventBusParameters: {
                    detailType: 'EmployeeDetailsChanged',
                    source: 'employee-app',
                },
            },
        });
    }
}
