require('dotenv').config();
const smsService = require('./utils/smsService');

const TEST_NUMBER = process.argv[2] || '9999999999'; // Allow passing number as arg

(async () => {
    console.log('--- SMS Configuration Verification ---');
    console.log(`API Key Present: ${!!process.env.SMS_API_KEY}`);
    console.log(`Provider: ${process.env.SMS_PROVIDER}`);
    console.log(`Target Number: ${TEST_NUMBER}`);

    if (!process.env.SMS_API_KEY) {
        console.error('❌ ERROR: SMS_API_KEY is not set.');
        return;
    }

    console.log('\nSending test SMS...');
    try {
        await smsService.sendSMS(TEST_NUMBER, "GeoValuator SMS Test: If you see this, SMS is working!");
        console.log('\n✅ Test execution completed. Check console output above for provider response.');
        console.log('NOTE: Since provider is "generic" or unknown, success depends on valid API Key/URL mapping in smsService.js');
    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
    }
})();
