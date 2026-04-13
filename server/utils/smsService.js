const axios = require('axios');

// Configurations
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'unknown'; // 'fast2sms', 'textlocal', 'twilio', 'generic'

/**
 * Sends an SMS alert
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} message - The message text
 */
exports.sendSMS = async (phoneNumber, message) => {
    if (!SMS_API_KEY) {
        console.warn('[SMS] ⚠️ Skipped: SMS_API_KEY is not set in .env');
        return;
    }

    // Basic cleaning of phone number (remove +91 or spaces if needed, depending on provider)
    // Most Indian providers expect 10 digits or sometimes with country code without +.
    // This is a generic cleaner.
    const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);

    console.log(`[SMS] Attempting to send to ${cleanNumber} via ${SMS_PROVIDER}...`);

    try {
        let response;

        switch (SMS_PROVIDER.toLowerCase()) {
            case 'fast2sms':
                response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                    headers: { "authorization": SMS_API_KEY },
                    params: {
                        "message": message,
                        "language": "english",
                        "route": "q",
                        "numbers": cleanNumber
                    }
                });
                break;

            case 'textlocal':
                response = await axios.get('https://api.textlocal.in/send/', {
                    params: {
                        "apikey": SMS_API_KEY,
                        "numbers": cleanNumber,
                        "message": message,
                        "sender": "TXTLCL" // Default sender ID, often needs changing
                    }
                });
                break;

            case 'generic':
            default:
                // Generic GET request structure often used by many bulk SMS providers
                // Example: https://api.example.com/send?key=...&mobile=...&msg=...
                console.log(`[SMS] ⚠️ Provider '${SMS_PROVIDER}' not fully configured. API Key present.`);
                console.log(`[SMS] 📧 CHECK EMAIL for OTP as fallback.`);
                console.log(`[SMS] Mock Send: "${message}" to ${cleanNumber}`);
                return;
        }

        console.log(`[SMS] ✅ Sent successfully. Response:`, response ? response.data : 'Mock Success');

    } catch (error) {
        console.error(`[SMS] ❌ Failed to send SMS via ${SMS_PROVIDER}:`);
        console.error(error.message);
        if (error.response) console.error(error.response.data);
    }
};
