const axios = require('axios');

const API_KEY = 'jbdFwgqGv4xa7lT0NS5ezKBMQc2yI31XHntUZ9JOoRhpusmVAkGXP1uD9ElhRZLiOeAfV6g4zYTHUqKn';
// Use a generically valid 10-digit number to pass regex checks.
const TEST_NUMBER = '9999999999';

async function testFast2SMS() {
    console.log("\n--- Testing Fast2SMS (Deep Dive) ---");
    // Fast2SMS V2 Bulk
    try {
        console.log("Attempting Route 'q' (Quick)...");
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            headers: { "authorization": API_KEY },
            params: {
                "message": "This is a test OTP 1234",
                "language": "english",
                "route": "q",
                "numbers": TEST_NUMBER
            }
        });
        console.log("✅ Fast2SMS Route 'q' Success:", response.data);
    } catch (error) {
        console.log("❌ Fast2SMS Route 'q' Failed:", error.message);
        if (error.response) {
            console.log("   Full Error Data:", JSON.stringify(error.response.data, null, 2));
        }
    }

    // Testing Bulk V1 (Legacy) just in case
    try {
        console.log("Attempting Bulk V1...");
        const response = await axios.post('https://www.fast2sms.com/dev/bulk', {
            "authorization": API_KEY,
            "sender_id": "FSTSMS",
            "message": "This is a test message",
            "language": "english",
            "route": "p",
            "numbers": TEST_NUMBER
        });
        console.log("✅ Fast2SMS V1 Success:", response.data);
    } catch (error) {
        console.log("❌ Fast2SMS V1 Failed:", error.message);
    }
}

async function testTextLocal() {
    console.log("\n--- Testing TextLocal ---");
    try {
        const response = await axios.get('https://api.textlocal.in/send/', {
            params: {
                "apikey": API_KEY,
                "numbers": TEST_NUMBER,
                "message": "Test message from GeoValuator",
                "sender": "TXTLCL"
            }
        });
        console.log("TextLocal Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log("TextLocal Failed:", error.message);
        if (error.response) console.log(error.response.data);
    }
}

(async () => {
    await testFast2SMS();
    await testTextLocal();
})();
