const axios = require('axios');

const ports = [5000, 5050, 5051, 3000];

const testPort = async (port) => {
    try {
        console.log(`--- Testing Port ${port} ---`);
        const response = await axios.post(`http://localhost:${port}/api/ai/chat`, {
            message: "Hello GeoValuator, what is Kabja risk?",
            history: []
        }, { timeout: 3000 });
        console.log(`Port ${port} success!`);
        console.log(JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.log(`Port ${port} failed: ${error.response?.status || error.message}`);
        return false;
    }
};

const run = async () => {
    for (const port of ports) {
        if (await testPort(port)) break;
    }
};

run();
