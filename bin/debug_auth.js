const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api/auth';

async function testAuth() {
    try {
        console.log("1. Fetching Puzzle...");
        const pResponse = await axios.get(`${BASE_URL}/get-puzzle`);
        console.log("Puzzle Response:", pResponse.data);

        if (!pResponse.data.success) {
            throw new Error("Failed to get puzzle");
        }

        const { puzzleId, answer } = { puzzleId: pResponse.data.puzzleId, answer: "????" }; // We don't know answer client side
        // Wait, for this test to work I need to know the answer. 
        // In the real app, I see the SVG and type it.
        // For debugging, I can't solve it programmatically unless I cheat or mock.

        // CHEAT: I'll use the fact that I'm running locally. 
        // Actually, I can't cheat easily without modifying server code to return answer or log it.
        // BUT, I can inspect the svg? No, SVG has text.

        // ALTERNATIVE: I will temporarily modify authController.js to LOG the answer.
        console.log("!!! MANUALLY CHECK SERVER CONSOLE FOR PUZZLE ANSWER !!!");

    } catch (e) {
        console.error("Test Failed:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
}

testAuth();
