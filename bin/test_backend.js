const axios = require('axios');

async function testBackendAPIs() {
    console.log('🔍 Testing GeoValuator Backend APIs...\n');
    
    const baseURL = 'http://localhost:5050';
    
    // Test 1: Land Search
    try {
        console.log('1. Testing Land Search API...');
        const searchRes = await axios.get(`${baseURL}/api/land/search?q=guntur`);
        console.log('✅ Land Search Working:', searchRes.data.success);
        console.log(`   Found ${searchRes.data.results?.length || 0} results`);
    } catch (err) {
        console.log('❌ Land Search Failed:', err.message);
    }
    
    // Test 2: Geocode Search
    try {
        console.log('\n2. Testing Geocode Search API...');
        const geoRes = await axios.get(`${baseURL}/api/geocode/search?q=hyderabad&limit=5`);
        console.log('✅ Geocode Search Working');
        console.log(`   Found ${geoRes.data?.length || 0} locations`);
    } catch (err) {
        console.log('❌ Geocode Search Failed:', err.message);
    }
    
    // Test 3: AI Chat (without token - should still respond)
    try {
        console.log('\n3. Testing AI Chat API...');
        const aiRes = await axios.post(`${baseURL}/api/ai/chat`, {
            message: 'What is the average land price in Hyderabad?',
            history: []
        });
        console.log('✅ AI Chat Working:', aiRes.data.success);
        console.log(`   Response: ${aiRes.data.response?.substring(0, 100)}...`);
    } catch (err) {
        console.log('❌ AI Chat Failed:', err.message);
    }
    
    // Test 4: Demo Intelligence
    try {
        console.log('\n4. Testing Demo Intelligence API...');
        const demoRes = await axios.get(`${baseURL}/api/land/demo-intelligence`);
        console.log('✅ Demo Intelligence Working');
        console.log(`   Loaded ${demoRes.data?.length || 0} demo properties`);
    } catch (err) {
        console.log('❌ Demo Intelligence Failed:', err.message);
    }
    
    // Test 5: My Lands (requires authentication - should fail gracefully)
    try {
        console.log('\n5. Testing My Lands API (Auth Required)...');
        const myLandsRes = await axios.get(`${baseURL}/api/land/my-lands`);
        console.log('✅ My Lands endpoint responding');
    } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
            console.log('✅ My Lands endpoint working (requires auth as expected)');
        } else {
            console.log('❌ My Lands Failed:', err.message);
        }
    }
    
    console.log('\n✅ Backend API Tests Complete!');
}

testBackendAPIs();
