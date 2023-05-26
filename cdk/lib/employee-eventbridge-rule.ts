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
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";


interface EmployeeEventBridgePipeStackProps extends StackProps {
    options: Options,
    logGroup:logs.LogGroup,
    employeeEventBus : EmployeeEventBus,
}


export class EmployeeEventBridgeRule extends cdk.NestedStack {
    private readonly _rule : events.Rule

    constructor(scope: Construct, id: string, props: EmployeeEventBridgePipeStackProps) {
        super(scope, id, props);

        // create an Amazon EventBridge rule to send all events to Amazon CloudWatch Logs:
        this._rule = new events.Rule(this, 'employee-app-rule', {
            ruleName: 'employee-app-rule',
            eventBus: props.employeeEventBus.target,
            eventPattern: {
                source: events.Match.prefix('employee-app'),
            },
            targets: [new targets.CloudWatchLogGroup(props.logGroup)],
        });
    }

    get ruleArn(): string {
        return this._rule.ruleArn;
    }
}
