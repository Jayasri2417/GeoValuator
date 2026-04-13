const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro',
    'gemini-2.0-flash-exp'
];

async function testModel(model) {
    try {
        await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
            { contents: [{ parts: [{ text: "Hi" }] }] },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log(`✅ ${model} WORKS`);
        return true;
    } catch (error) {
        process.stdout.write(`❌ ${model} FAILED `);
        if (error.response) {
            console.log(`(${error.response.status})`);
        } else {
            console.log(`(${error.message})`);
        }
        return false;
    }
}

async function runTests() {
    console.log(`Testing Key: ${API_KEY.substring(0, 5)}...`);
    for (const model of MODELS) {
        await testModel(model);
    }
}

runTests();
