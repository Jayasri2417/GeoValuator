const axios = require('axios');

const API_KEY = 'jbdFwgqGv4xa7lT0NS5ezKBMQc2yI31XHntUZ9JOoRhpusmVAkGXP1uD9ElhRZLiOeAfV6g4zYTHUqKn';
const TEST_NUMBER = '9999999999'; // Invalid number but should trigger "Invalid Number" error not "Auth Failed"

async function testFast2SMS() {
    console.log("\n--- Testing Fast2SMS ---");
    try {
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            headers: { "authorization": API_KEY },
            params: {
                "message": "Test Verification",
                "language": "english",
                "route": "q",
                "numbers": TEST_NUMBER
            }
        });
        console.log("Status:", response.status);
        console.log("Data:", response.data);
        return true;
    } catch (error) {
        console.log("Error:", error.message);
        if (error.response) {
            console.log("Response:", error.response.data);
        }
        return false;
    }
}

async function testMsg91() {
    console.log("\n--- Testing Msg91 (Flow mode) ---");
    // Msg91 usually uses authkey in headers or params
    try {
        const response = await axios.post('https://control.msg91.com/api/v5/flow/', {}, {
            headers: { "authkey": API_KEY }
        });
        console.log("Status:", response.status);
        console.log("Data:", response.data);
    } catch (error) {
        console.log("Error:", error.message);
        if (error.response) console.log("Response:", error.response.data);
    }
}

async function test2Factor() {
    console.log("\n--- Testing 2Factor ---");
    try {
        const response = await axios.get(`https://2factor.in/API/V1/${API_KEY}/BAL/GET`);
        console.log("Status:", response.status);
        console.log("Data:", response.data);
    } catch (error) {
        console.log("Error:", error.message);
        // 2Factor returns 200 even on error sometimes with Status: Error
    }
}

(async () => {
    console.log(`Checking API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}`);
    await testFast2SMS();
    await testMsg91();
    await test2Factor();
})();
