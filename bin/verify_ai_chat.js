const axios = require('axios');

async function testChat() {
    try {
        console.log("Testing /api/ai/chat...");

        // Wait for server to be ready (optional, but good practice if I just restarted it)
        // But server should be running already.

        const response = await axios.post('http://localhost:5050/api/ai/chat', {
            message: "What is the expected price trend for land in Jubilee Hills?"
        });

        console.log("✅ Response Received:");
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.source === 'gemini') {
            console.log("🎉 SUCCESS: Response is from Gemini AI!");
        } else if (response.data.source === 'simulated_ai') {
            console.log("⚠️ WARNING: Response is Simulated (AI Failed or Mocked).");
        }

    } catch (error) {
        console.error("❌ Error:");
        if (error.response) console.error(error.response.data);
        else console.error(error.message);
    }
}

testChat();
