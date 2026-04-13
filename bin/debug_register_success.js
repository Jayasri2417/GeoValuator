async function testRegistrationSuccess(port) {
    const url = `http://localhost:${port}/api/auth`;
    try {
        // 1. Get Puzzle
        console.log(`[${port}] Fetching Puzzle...`);
        const pRes = await fetch(`${url}/get-puzzle`);
        const pData = await pRes.json();

        if (!pData.success) throw new Error("Get Puzzle Failed");

        const { puzzleId, debug_answer } = pData;
        console.log(`[${port}] Puzzle Got: ${puzzleId} | Answer: ${debug_answer}`);

        // 2. Register with CORRECT Answer
        console.log(`[${port}] Attempting Register...`);
        const rRes = await fetch(`${url}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Auto Tester",
                email: `auto_${Date.now()}@test.com`,
                phone: `${Date.now()}`,
                password: "password123",
                preferred_location: "Test Loc",
                puzzleId: puzzleId,
                puzzleAnswer: debug_answer // CORRECT ANSWER
            })
        });

        const rData = await rRes.json();
        if (rRes.ok) {
            console.log(`[${port}] Register SUCCESS: ${rRes.status}`);
            console.log(`[${port}] User ID: ${rData.user.id}`);
        } else {
            console.log(`[${port}] Register FAILED: ${rRes.status} - ${rData.error}`);
            if (rData.details) console.log(`[${port}] Details: ${rData.details}`);
        }

    } catch (e) {
        console.log(`[${port}] Error: ${e.message}`);
    }
}

async function run() {
    await testRegistrationSuccess(5050);
}

run();
