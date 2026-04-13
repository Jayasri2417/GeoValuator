const axios = require('axios');

const ports = [5050, 5051, 5052];

async function checkPort(port) {
    try {
        console.log(`Checking Port ${port}...`);
        const res = await axios.get(`http://localhost:${port}/api/health`);
        if (res.status === 200) {
            console.log(`✅ Server found on Port ${port}`);
            return true;
        }
    } catch (e) {
        // console.log(`Port ${port} not reachable: ${e.message}`);
    }
    return false;
}

async function verifyFeatures(port) {
    console.log(`\n🔍 Verifying New Features on Port ${port}...`);

    // 1. Test Alert Trigger
    try {
        console.log("1️⃣ Testing Alert Trigger...");
        const alertRes = await axios.post(`http://localhost:${port}/api/alerts/trigger`, {
            type: 'Security',
            message: 'Port Scan Verification',
            email: 'test@geovaluator.com'
        });

        if (alertRes.data.success) {
            console.log("✅ Alert System Verified");
        } else {
            console.error("❌ Alert Trigger Failed (404 likely)");
        }
    } catch (e) {
        console.error(`❌ Alert Error: ${e.message}`);
    }

    // 2. Test PDF Report
    try {
        console.log("2️⃣ Testing PDF Report Generation...");
        const reportRes = await axios.get(`http://localhost:${port}/api/reports/TEST-LAND-123`, {
            responseType: 'arraybuffer'
        });

        if (reportRes.headers['content-type'] === 'application/pdf') {
            console.log("✅ Report System Verified");
        } else {
            console.error("❌ Report Verification Failed");
        }
    } catch (e) {
        console.error(`❌ Report Error: ${e.message}`);
    }
}

async function run() {
    for (const port of ports) {
        if (await checkPort(port)) {
            await verifyFeatures(port);
        }
    }
}

run();
