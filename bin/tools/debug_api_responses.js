const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5050,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`\n--- Response from ${path} ---`);
                console.log(`Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    console.log('JSON Body:', JSON.stringify(json, null, 2));
                    resolve(json);
                } catch (e) {
                    console.log('Raw Body (Not JSON):', data);
                    resolve(data);
                }
            });
        });

        req.on('error', error => {
            console.error(`Error calling ${path}:`, error.message);
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function debugAPIs() {
    console.log("Debugging 3 Main Functions...");

    // 1. Search (LandSearch.jsx) - Test Location Search
    await makeRequest('/api/geocode/search?q=Hyderabad');

    // 2. Search (LandSearch.jsx) - Test Property Search
    await makeRequest('/api/land/search?q=Survey');

    // 3. My Properties (MyProperties.jsx)
    await makeRequest('/api/land/my-lands');

    // 4. AI Chat (AIAgentChat.jsx)
    await makeRequest('/api/ai/chat', 'POST', {
        message: "Hello, can you help me?",
        history: []
    });

    // 5. Risk Analysis (RiskSidebar.jsx)
    await makeRequest('/api/ai/analyze-legal-risk', 'POST', {
        surveyNumber: "123",
        riskScore: 45,
        existingEncumbrance: "None",
        marketValue: 5000000
    });
}

debugAPIs();
