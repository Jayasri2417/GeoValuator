const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function verifyFeatures() {
    console.log("🔍 Verifying New Features...");

    // 1. Test Alert Trigger
    try {
        console.log("\n1️⃣ Testing Alert Trigger...");
        const alertRes = await axios.post('http://localhost:5050/api/alerts/trigger', {
            type: 'Security',
            message: 'Automated verification test alert',
            email: 'test_admin@geovaluator.com'
        });

        if (alertRes.data.success) {
            console.log("✅ Alert System Verified: Response Success");
        } else {
            console.error("❌ Alert Trigger Failed:", alertRes.data);
        }
    } catch (e) {
        console.error("❌ Alert Error:", e.message);
    }

    // 2. Test PDF Report
    try {
        console.log("\n2️⃣ Testing PDF Report Generation...");
        // Using a mock ID, backend handles it gracefully
        const reportRes = await axios.get('http://localhost:5050/api/reports/TEST-LAND-123', {
            responseType: 'arraybuffer' // Important for PDF
        });

        if (reportRes.headers['content-type'] === 'application/pdf') {
            console.log("✅ Report System Verified: Content-Type is application/pdf");
            const pdfSize = reportRes.data.length;
            console.log(`📄 PDF Generated Size: ${pdfSize} bytes`);

            // Optionally save it to check manually
            // fs.writeFileSync('test_report.pdf', reportRes.data);
        } else {
            console.error("❌ Report Verification Failed. Content-Type:", reportRes.headers['content-type']);
        }
    } catch (e) {
        console.error("❌ Report Error:", e.message);
    }
}

verifyFeatures();
