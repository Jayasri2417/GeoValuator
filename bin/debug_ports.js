const axios = require('axios');

const PORTS = [5050, 5051, 5052, 5053, 5000];

async function checkPort(port) {
    try {
        const url = `http://localhost:${port}/api/health`;
        const res = await axios.get(url, { timeout: 1000 });
        console.log(`✅ Port ${port} is OPEN. Status: ${res.status}`);
        return true;
    } catch (error) {
        // console.log(`❌ Port ${port} failed: ${error.message}`);
        return false;
    }
}

async function scan() {
    console.log("Scanning ports...");
    for (const port of PORTS) {
        if (await checkPort(port)) {
            console.log(`FOUND SERVER ON PORT ${port}`);
            return;
        }
    }
    console.log("❌ No server found on scanned ports.");
}

scan();
