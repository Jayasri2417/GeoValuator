const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log('Listing Gemini Models...');
    console.log('Key:', API_KEY ? 'Present' : 'Missing');

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await axios.get(url);

        console.log('✅ Models Available:');
        const models = response.data.models || [];
        models.forEach(m => console.log(`- ${m.name}`));

    } catch (error) {
        console.error('❌ Failed to list models:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

listModels();
