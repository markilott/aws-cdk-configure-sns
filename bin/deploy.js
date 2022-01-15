/**
 * Will deploy into the current default CLI account.
 *
 * Deployment:
 * cdk deploy --all
 */

/* eslint-disable no-new */
const { App } = require('aws-cdk-lib');
const { SnsConfigStack } = require('../lib/sns-config-stack');
const { snsSmsAttr } = require('../lib/options');

const app = new App();

// Use account details from default AWS CLI credentials:
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
const env = { account, region };

// Create SNS Configuration Stack
new SnsConfigStack(app, 'SnsConfigStack', {
    description: 'SNS SMS Configuration Stack',
    env,
    snsSmsAttr,
});
