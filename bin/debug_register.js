const axios = require('axios');

async function testRegistration(port) {
    const url = `http://localhost:${port}/api/auth`;
    try {
        // 1. Get Puzzle
        console.log(`[${port}] Fetching Puzzle...`);
        const pRes = await axios.get(`${url}/get-puzzle`);
        if (!pRes.data.success) throw new Error("Get Puzzle Failed");

        const { puzzleId } = pRes.data;
        console.log(`[${port}] Puzzle Got: ${puzzleId}`);

        // 2. Register with Dummy Answer (should fail with 400 Wrong Puzzle)
        console.log(`[${port}] Attempting Register...`);
        try {
            await axios.post(`${url}/register`, {
                name: "Test User",
                email: "test@example.com",
                phone: "1234567890",
                password: "password123",
                preferred_location: "Test Loc",
                puzzleId: puzzleId,
                puzzleAnswer: "WRONG"
            });
        } catch (e) {
            if (e.response) {
                console.log(`[${port}] Register Response: ${e.response.status} - ${e.response.data.error}`);
            } else {
                console.log(`[${port}] Register Network Error: ${e.message}`);
            }
        }
    } catch (e) {
        console.log(`[${port}] Error: ${e.message}`);
    }
}

async function run() {
    await testRegistration(5050);
}

run();
