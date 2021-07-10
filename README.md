# AWS CDK SNS SMS Configuration

This Javascript CDK project configures default parameters and logging to S3 for SNS SMS messaging.

An S3 bucket is created for SMS usage reports and SNS configured to send daily reports to the bucket.

A more detailed explanation is available [in this Medium article](https://markilott.medium.com/configuring-sns-sms-using-aws-cdk-9ee21ab6028f).

&nbsp;

## Requirements

There are no specific requirements for this project, but you may want to modify the options file.

&nbsp;

## Setup

Assuming you have the AWS CLI and CDK installed and configured already...

Setup the project:
- Clone the repo
- run `npm install`
- Update the `lib/options.js` file with your own preferences

&nbsp;

## Options

- `spendLimit` - must be equal to or lower than your account spend limit. This is USD$1 by default.
- `senderId` - the default alpha sender id for SMS. Can be overridden when publishing messages.
- `statusSamplingRate` - Sampling rate for logging to S3. Zero will log only failed messages, 100 logs all messages
- `messageType` - default message type: `Transactional` or `Promotional`. Can be overridden when publishing messages.
- `logExpiry` - days before usage report logs are deleted from S3

&nbsp;

## Deployment

Use CDK to deploy:
`cdk deploy --all`

&nbsp;

## Testing

SMS messaging is in sandbox mode by default. You either need to verify each number you want to send to, or apply to have your account moved into production mode so you can send to any number.

To verify a number you need to send and confirm an OTP. You can use the console or CLI.

Create a verified number and send a verification OTP (phone number in E.164 format eg '+15551234567'):

`aws sns create-sms-sandbox-phone-number --phone-number <value>`

Verify the OTP you received:

`aws sns verify-sms-sandbox-phone-number --phone-number <value> --one-time-password <value>`

Send a message:

`aws sns publish --message "Hello world!" --phone-number <value>`

&nbsp;

## Costs and Cleanup

There is no cost other than any SMS messages you send and the S3 storage costs for the usage reports.

Use `cdk destroy` or delete the CloudFormation stacks.

If you have usage reports in the S3 bucket they will need to be manually deleted before CloudFormation can delete the bucket.
