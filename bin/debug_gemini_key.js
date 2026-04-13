const axios = require('axios');

const API_KEY = 'AIzaSyBvDGtsb_4EFoKvf3OZMMMqYV8N3ZIT_LI'; // The key from .env

async function testGemini() {
    console.log(`Testing Gemini API with key: ${API_KEY}`);

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: "Say hello"
                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        console.log("✅ API Success!");
        console.log("Response:", response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("❌ API Failed!");
        console.error("Status:", error.response ? error.response.status : "Unknown");
        // console.error("Message:", error.message);
        if (error.response && error.response.data) {
            console.error("Details:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

testGemini();
