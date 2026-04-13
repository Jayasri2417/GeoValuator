const axios = require('axios');

(async () => {
    const baseUrl = 'http://127.0.0.1:5050/api/ai';

    try {
        console.log("Testing /chat (Known Good)...");
        try {
            const chatRes = await axios.post(`${baseUrl}/chat`, { message: "Hello" });
            console.log("Chat Response:", chatRes.status, chatRes.data.success);
        } catch (e) {
            console.error("Chat Failed:", e.message);
            if (e.response) console.error(e.response.data);
        }

        console.log("\nTesting /analyze-legal-risk...");
        const riskRes = await axios.post(`${baseUrl}/analyze-legal-risk`, {
            surveyNumber: "TEST-123",
            riskScore: 60,
            existingEncumbrance: "None",
            marketValue: "1 Cr"
        });
        console.log("Risk Analysis Response:", JSON.stringify(riskRes.data, null, 2));

        console.log("\nTesting /forecast-price...");
        const priceRes = await axios.post(`${baseUrl}/forecast-price`, {
            location: "Guntur",
            currentPrice: "1 Cr"
        });
        console.log("Price Forecast Response:", JSON.stringify(priceRes.data, null, 2));

        console.log("\nTesting /recommend-usage...");
        const usageRes = await axios.post(`${baseUrl}/recommend-usage`, {
            location: "Amaravati",
            zoneType: "Commercial",
            size: "1000 sqft"
        });
        console.log("Usage Recommendation Response:", JSON.stringify(usageRes.data, null, 2));

    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            const fs = require('fs');
            fs.writeFileSync('debug_error.log', JSON.stringify(error.response.data, null, 2));
        }
    }
})();
