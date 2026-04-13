const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function checkModels() {
    console.log("Checking Gemini Models with key:", GEMINI_API_KEY ? "Present" : "Missing");
    if (!GEMINI_API_KEY) return;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const resp = await axios.get(url);
        console.log("✅ Models Available:", resp.data.models.map(m => m.name));
    } catch (e) {
        console.error("❌ Failed to list models:", e.response ? e.response.data : e.message);
    }
}

checkModels();
