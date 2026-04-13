const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGeminiDirect() {
    console.log("Using API Key:", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + "..." : "MISSING");

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: "Hi" }] }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log("✅ Success! Gemini replied:");
        console.log(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("❌ Gemini Call Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testGeminiDirect();
