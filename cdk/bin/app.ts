#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {EventBridgePipeEnrich} from '../lib/employee-eventbridge-pipe-enrich';
import {getConfig} from "./config";

const app = new cdk.App();
const options = getConfig();

new EventBridgePipeEnrich(app, 'EventBridgePipeEnrich', {
    options: options,
});
