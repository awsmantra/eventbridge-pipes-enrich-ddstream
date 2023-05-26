import * as cdk from "aws-cdk-lib"
import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {EmployeeTable } from "./table-stack";
import {Options} from "../types/options";
import {EmployeeStateMachine } from "./employee-state-machine";
import {EmployeeStateMachineRole } from "./employee-state-machine-role";
import {EmployeePipeRole} from "./employee-pipe-role";
import {EmployeeEventBridgePipe} from "./employee-eventbridge-pipe";
import * as logs from "aws-cdk-lib/aws-logs";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {EmployeeLogGroupResourcePolicy} from "./employee-log-group-resource-policy";
import {EmployeeEventBus} from "./employee-event-bus";
import {Queue} from "aws-cdk-lib/aws-sqs";
import {EmployeeEventBridgeRule} from "./employee-eventbridge-rule";

interface EventBridgePipeEnrichStackProps extends StackProps {
  options: Options,
}

export class EventBridgePipeEnrich extends Stack {
  constructor(scope: Construct, id: string, props: EventBridgePipeEnrichStackProps) {
    super(scope, id, props);

     // Create LogGroup
      const logGroup = new logs.LogGroup(
          this,
          '/aws/events/employee-app',
          {
              logGroupName: "/aws/events/employee-app",
              retention: RetentionDays.ONE_DAY,
          }
      );

      const employeeDLQueue = new Queue(this, 'employee-dlq-queue',{
          queueName: "employee-dlq-queue"
      });

    // Create Employee DynamoDB table
     const tableStack = new EmployeeTable(this, 'EmployeeTableStack', {})

    // Create EventBridge Bus
     const employeeEventBus  = new EmployeeEventBus(this,"EmployeeEventBusStack", {})

    // Crete EventBridge Rule
    const employeeBusRule = new EmployeeEventBridgeRule(this,"EmployeeEventBridgeRuleStack", {
        options:props.options,
        employeeEventBus : employeeEventBus,
        logGroup: logGroup,
    })

    // Create StateMachine Execution Role
    const employeePipeRole = new EmployeePipeRole(this,"EmployeePipeRoleStack" ,{
          options:props.options,
          table: tableStack.table,
          employeeEventBus : employeeEventBus,
          employeeDLQueue : employeeDLQueue
        }
    )

    // Create StateMachine Execution Role
    const employeeStateMachineRole = new EmployeeStateMachineRole(this,"EmployeeStateMachineRoleStack" ,{
            options:props.options,
        }
    )
    // Create State Machine
    const employeeAppStateMachine = new EmployeeStateMachine(this, "EmployeeStateMachineStack" , {
        options:props.options,
        employeeStateMachineRole:employeeStateMachineRole,
      }
    )

   const eventBridgePipe = new EmployeeEventBridgePipe(this,"EmployeeEventBridgePipeStack", {
       options:props.options,
       table: tableStack.table,
       employeePipeRole: employeePipeRole,
       employeeAppStateMachine:employeeAppStateMachine,
       logGroup: logGroup,
       employeeEventBus : employeeEventBus,
       employeeDLQueue : employeeDLQueue
   })

   const emp  = new EmployeeLogGroupResourcePolicy(this,"EmployeeLogGroupResourcePolicyStack", {
       options:props.options,
       logGroup: logGroup,
       employeeBusRule: employeeBusRule
   })

    new cdk.CfnOutput(this, 'EmployeeStateMachineExport', {
      value: employeeAppStateMachine.stateMachine.attrArn,
      description: 'employee-app-state-machine-arn',
      exportName: 'employee-state-state-machine',
    });
  }
}
