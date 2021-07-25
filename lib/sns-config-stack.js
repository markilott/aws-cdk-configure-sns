/* eslint-disable no-new */
const cdk = require('@aws-cdk/core');
const { Bucket, BlockPublicAccess, BucketEncryption } = require('@aws-cdk/aws-s3');
const { AwsCustomResource, AwsCustomResourcePolicy } = require('@aws-cdk/custom-resources');
const { Role, ServicePrincipal, PolicyStatement } = require('@aws-cdk/aws-iam');
const { RemovalPolicy, Duration } = require('@aws-cdk/core');

class SnsConfigStack extends cdk.Stack {
    /**
     * Configures SNS SMS settings.
     * Sets the SMS spend limit and the default alpha sender Id.
     * Creates a bucket for usage reports and sets logging for SMS.
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const {
            spendLimit, senderId, statusSamplingRate, messageType, logExpiry,
        } = props.snsSmsAttr;

        // CloudWatch Role for Logs
        const statusRole = new Role(this, 'smsStatusRole', {
            assumedBy: new ServicePrincipal('sns.amazonaws.com'),
            description: 'SNS SMS CloudWatch logging Role',
        });
        statusRole.addToPolicy(new PolicyStatement({
            sid: 'CreateLogs',
            actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:PutMetricFilter',
                'logs:PutRetentionPolicy',
            ],
            resources: ['*'],
        }));

        // S3 Bucket for Usage Reports
        const bucket = new Bucket(this, 'smsReportBucket', {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY, // Will cause an error on delete in CloudFormation if the bucket includes objects
            lifecycleRules: [{
                expiration: Duration.days(logExpiry),
            }],
        });
        // Add bucket object policy
        bucket.addToResourcePolicy(new PolicyStatement({
            sid: 'AllowPutObject',
            principals: [new ServicePrincipal('sns.amazonaws.com')],
            resources: [bucket.arnForObjects('*')],
            actions: ['s3:PutObject'],
            conditions: {
                StringEquals: {
                    'aws:SourceAccount': this.account,
                },
            },
        }));
        // Add bucket policies
        bucket.addToResourcePolicy(new PolicyStatement({
            sid: 'AllowGetBucket',
            principals: [new ServicePrincipal('sns.amazonaws.com')],
            resources: [bucket.bucketArn],
            actions: ['s3:GetBucketLocation'],
            conditions: {
                StringEquals: {
                    'aws:SourceAccount': this.account,
                },
            },
        }));
        bucket.addToResourcePolicy(new PolicyStatement({
            sid: 'AllowListBucket',
            principals: [new ServicePrincipal('sns.amazonaws.com')],
            resources: [bucket.bucketArn],
            actions: ['s3:ListBucket'],
        }));

        // SNS Attributes
        const setParameters = {
            attributes: {
                MonthlySpendLimit: String(spendLimit),
                DeliveryStatusIAMRole: statusRole.roleArn,
                DeliveryStatusSuccessSamplingRate: String(statusSamplingRate),
                DefaultSenderID: senderId,
                DefaultSMSType: messageType,
                UsageReportS3Bucket: bucket.bucketName,
            },
        };
        const deleteParameters = {
            attributes: {
                MonthlySpendLimit: '',
                DeliveryStatusIAMRole: '',
                DeliveryStatusSuccessSamplingRate: '0',
                DefaultSenderID: '',
                UsageReportS3Bucket: '',
            },
        };

        // Configure SNS using custom resource
        new AwsCustomResource(this, 'snsConfig', {
            onUpdate: {
                service: 'SNS',
                action: 'setSMSAttributes',
                parameters: setParameters,
                physicalResourceId: {},
            },
            onDelete: {
                service: 'SNS',
                action: 'setSMSAttributes',
                parameters: deleteParameters,
                physicalResourceId: {},
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: ['*'] }),
            logRetention: 7,
        });
    }
}
module.exports = { SnsConfigStack };
