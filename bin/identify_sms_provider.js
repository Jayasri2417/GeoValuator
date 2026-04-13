const axios = require('axios');

const API_KEY = 'jbdFwgqGv4xa7lT0NS5ezKBMQc2yI31XHntUZ9JOoRhpusmVAkGXP1uD9ElhRZLiOeAfV6g4zYTHUqKn';
const TEST_NUMBER = '9999999999'; // Dummy number

async function testFast2SMS() {
    console.log("Testing Fast2SMS...");
    try {
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            headers: {
                "authorization": API_KEY
            },
            params: {
                "message": "Test Message",
                "language": "english",
                "route": "q",
                "numbers": TEST_NUMBER
            }
        });
        console.log("Fast2SMS Response:", response.status, response.data);
        if (response.data.return === true || response.data.message.includes('Invalid Numbers') || response.data.message.includes('insufficient')) {
            return true;
        }
    } catch (error) {
        console.log("Fast2SMS Error:", error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) return false; // Invalid Key
    }
    return false;
}

async function testTextLocal() {
    console.log("Testing TextLocal...");
    try {
        const response = await axios.get('https://api.textlocal.in/send/', {
            params: {
                "apikey": API_KEY,
                "numbers": TEST_NUMBER,
                "message": "Test",
                "sender": "TXTLCL"
            }
        });
        console.log("TextLocal Response:", response.data);
        if (response.data.status === 'success' || (response.data.errors && response.data.errors.length > 0 && response.data.errors[0].code !== 192)) {
            // Code 192 is API key invalid
            return true;
        }
    } catch (error) {
        console.log("TextLocal Error:", error.message);
    }
    return false;
}

// Add more if needed, but Fast2SMS is most common for Indian users with long keys

(async () => {
    console.log("--- Detecting SMS Provider ---");

    // Fast2SMS
    if (await testFast2SMS()) {
        console.log("\n✅ Provider Identified: Fast2SMS");
        return;
    }

    // TextLocal
    if (await testTextLocal()) {
        console.log("\n✅ Provider Identified: TextLocal");
        return;
    }

    console.log("\n❌ Could not identify provider. Please check key or manually specify provider.");
})();
