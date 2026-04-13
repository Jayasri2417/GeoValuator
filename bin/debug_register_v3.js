const axios = require('axios');

const API_URL = 'http://localhost:5050/api/auth/register';

async function testRegister() {
    console.log(`Testing Registration at ${API_URL}...`);
    try {
        const payload = {
            name: "Test User",
            email: `test${Date.now()}@example.com`,
            phone: `999${Date.now().toString().slice(-7)}`,
            password: "password123",
            preferred_location: "Test Location"
        };
        console.log("Payload:", payload);

        const res = await axios.post(API_URL, payload);
        console.log("✅ Success!", res.status);
        console.log("Response:", res.data);
    } catch (error) {
        console.error("❌ Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testRegister();
