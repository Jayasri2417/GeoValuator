const axios = require('axios');

const TEST_URL = 'http://localhost:5050/api/ai/chat';

async function testAiChat() {
    console.log('Testing AI Chat Endpoint via Backend...');
    try {
        const response = await axios.post(TEST_URL, {
            message: "What are the land rates in Jubilee Hills?",
            history: []
        });

        console.log('✅ Response Received:');
        console.log('Success:', response.data.success);
        console.log('Source:', response.data.source);
        console.log('AI Reply:', response.data.response);
    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testAiChat();
