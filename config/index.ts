export const snsSmsAttr = {
    spendLimit: 1, // USD, cannot be higher than the account limit
    senderId: 'MYID', // Default alpha sender Id for SMS
    statusSamplingRate: 100, // 0 will log only failed messages, 100 logs all messages
    messageType: 'Transactional', // Transactional or Promotional
    logExpiry: 60, // Days until logs are expired and deleted in S3
};
