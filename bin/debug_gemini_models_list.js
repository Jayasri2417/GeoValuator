const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from current directory (server/)
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log(`Testing Key: ${API_KEY}`);
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        console.log("✅ Models Available:");
        response.data.models.forEach(m => console.log(`- ${m.name}`));
    } catch (error) {
        console.error("❌ Failed to list models:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

listModels();
