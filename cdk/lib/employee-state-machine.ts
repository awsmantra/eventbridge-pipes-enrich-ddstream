import { Construct } from "constructs";
import { StackProps} from "aws-cdk-lib";
import * as sf from "aws-cdk-lib/aws-stepfunctions";
import { LogLevel, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Options } from "../types/options";
import * as fs from "fs";
import * as path from "path";
import * as logs from "aws-cdk-lib/aws-logs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {EmployeeStateMachineRole} from "./employee-state-machine-role";


interface EmployeeStateMachineProps extends StackProps {
    options: Options;
    employeeStateMachineRole: EmployeeStateMachineRole,
}

export class EmployeeStateMachine extends Construct {
    private readonly _employeeStateMachine: sf.CfnStateMachine;

    get stateMachine(): sf.CfnStateMachine {
        return this._employeeStateMachine
    }

    constructor(scope: Construct, id: string, props: EmployeeStateMachineProps) {
        super(scope, id);

        const file = fs.readFileSync(
            path.resolve(__dirname, "../../statemachine/create-employee-app-ddstream-state-machine.json")
        );

        // State Machine LogGroup
        const logGroup = new logs.LogGroup(
            this,
            '/aws/vendedlogs/states/employee-app',
            {
                logGroupName: "employee-state-machine",
                retention: RetentionDays.ONE_DAY,
            }
        );

        this._employeeStateMachine = new sf.CfnStateMachine(
            this,
            'employee-app-state-machine',
            {
                stateMachineName: "employee-app-state-machine",
                stateMachineType: StateMachineType.EXPRESS,
                roleArn: props.employeeStateMachineRole.roleArn,
                definitionString: file.toString(),
                loggingConfiguration: {
                    destinations: [
                        {
                            cloudWatchLogsLogGroup: {
                                logGroupArn: logGroup.logGroupArn,
                            },
                        },
                    ],
                    includeExecutionData: true,
                    level: LogLevel.ALL,
                },
            }
        );
  }
}
