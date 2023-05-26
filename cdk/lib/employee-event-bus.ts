import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {StackProps} from "aws-cdk-lib";
import {EventBus} from "aws-cdk-lib/aws-events";

export class EmployeeEventBus extends cdk.NestedStack {
    private readonly _eventBus: EventBus;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this._eventBus = new EventBus(this, 'employee-event-bus', {
            eventBusName : "EmployeeEventBus"
        });
    }

    get target(): EventBus {
        return this._eventBus;
    }

    get targetArn(): string {
        return this._eventBus.eventBusArn;
    }
}
