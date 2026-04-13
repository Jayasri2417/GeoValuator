const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        fs.writeFileSync('models.json', JSON.stringify(response.data, null, 2));
        console.log("✅ Saved to models.json");
    } catch (error) {
        console.error("❌ Failed");
        if (error.response) console.error(error.response.status);
        else console.error(error.message);
    }
}

listModels();
