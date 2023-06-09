import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from "constructs";
import {CfnOutput, StackProps} from "aws-cdk-lib";
import {StreamViewType} from "aws-cdk-lib/aws-dynamodb";


export class EmployeeTable extends cdk.NestedStack {
    private readonly _table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // dynamodb table
        this._table = new dynamodb.Table(this, id, {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            tableName: `Employee`,
            stream: StreamViewType.NEW_AND_OLD_IMAGES
            //encryptionKey: props.key, // commenting out KMS key to avoid any charges, but you must have
        });

        new CfnOutput(this, 'TableName', {
            exportName: `employee-table-name`,
            value: this._table.tableName
        });

        new CfnOutput(this, 'TableArn', {
            exportName: `employee-table-arn`,
            value: this._table.tableArn
        });
    }

    get table(): dynamodb.Table {
        return this._table;
    }
}

