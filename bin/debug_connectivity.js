const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

console.log('--- DIAGNOSTIC START ---');
console.log('GEMINI_API_KEY present:', !!GEMINI_API_KEY);
console.log('GOOGLE_MAPS_API_KEY present:', !!GOOGLE_MAPS_API_KEY);

async function testGemini() {
    console.log('\nTesting Gemini API...');
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_')) {
        console.error('❌ GEMINI_API_KEY is missing or default.');
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello, answer with 'OK'." }] }]
        });

        if (response.data && response.data.candidates) {
            console.log('✅ Gemini API Connected Successfully.');
            console.log('Response:', response.data.candidates[0].content.parts[0].text);
        } else {
            console.error('⚠️ Gemini API connected but returned unexpected format.');
        }
    } catch (error) {
        console.error('❌ Gemini API Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

async function testGeocoding() {
    console.log('\nTesting Google Maps Geocoding...');
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('your_')) {
        console.warn('⚠️ GOOGLE_MAPS_API_KEY is missing or default. Backend should fallback to OSN/Nominatim.');
        return;
    }

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=Hyderabad&key=${GOOGLE_MAPS_API_KEY}`);
        if (response.data.status === 'OK') {
            console.log('✅ Google Maps API Connected Successfully.');
        } else {
            console.error('❌ Google Maps API Error:', response.data.status, response.data.error_message);
        }
    } catch (error) {
        console.error('❌ Google Maps Network Error:', error.message);
    }
}

async function runTests() {
    await testGemini();
    await testGeocoding();
    console.log('\n--- DIAGNOSTIC END ---');
}

runTests();
