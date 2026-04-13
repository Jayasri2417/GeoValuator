async function checkPort(port) {
    const url = `http://localhost:${port}/api/auth/get-puzzle`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`Port ${port}: SUCCESS - Puzzle ID: ${data.puzzleId}`);
        return true;
    } catch (e) {
        console.log(`Port ${port}: FAILED - ${e.message}`);
        return false;
    }
}

async function run() {
    console.log("Checking backend connectivity...");
    await checkPort(5050);
    await checkPort(5051);
    await checkPort(5052);
    await checkPort(5000);
}

run();
