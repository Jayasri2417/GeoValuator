async function testRegistration(port) {
    const url = `http://localhost:${port}/api/auth`;
    try {
        // 1. Get Puzzle
        console.log(`[${port}] Fetching Puzzle...`);
        const pRes = await fetch(`${url}/get-puzzle`);
        const pData = await pRes.json();

        if (!pData.success) throw new Error("Get Puzzle Failed");

        const { puzzleId } = pData;
        console.log(`[${port}] Puzzle Got: ${puzzleId}`);

        // 2. Register with Dummy Answer (should fail with 400 Wrong Puzzle)
        console.log(`[${port}] Attempting Register...`);
        const rRes = await fetch(`${url}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User",
                email: "test@example.com",
                phone: "1234567890",
                password: "password123",
                preferred_location: "Test Loc",
                puzzleId: puzzleId,
                puzzleAnswer: "WRONG"
            })
        });

        const rData = await rRes.json();
        console.log(`[${port}] Register Response: ${rRes.status} - ${rData.error}`);

    } catch (e) {
        console.log(`[${port}] Error: ${e.message}`);
    }
}

async function run() {
    await testRegistration(5050);
}

run();
