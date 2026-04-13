const axios = require('axios');

async function testSearch() {
    const url = 'http://localhost:5050/api/geocode/search';
    const query = 'Hyderabad';

    try {
        console.log(`Searching for "${query}" via ${url}...`);
        const res = await axios.get(url, { params: { q: query, limit: 1 } });

        console.log("Status:", res.status);
        console.log("Results Found:", res.data.length);
        if (res.data.length > 0) {
            console.log("First Result:", res.data[0].display_name);
            console.log("Lat/Lon:", res.data[0].lat, res.data[0].lon);
        } else {
            console.log("No results.");
        }
    } catch (e) {
        console.error("Search Failed:", e.message);
        if (e.response) console.error("Data:", e.response.data);
    }
}

testSearch();
