async function testSearch() {
    const url = 'http://localhost:5050/api/geocode/search';
    const query = 'Hyderabad';

    try {
        console.log(`Searching for "${query}" via ${url}...`);
        const res = await fetch(`${url}?q=${query}&limit=1`);
        const data = await res.json();

        console.log("Status:", res.status);
        if (Array.isArray(data)) {
            console.log("Results Found:", data.length);
            if (data.length > 0) {
                console.log("First Result:", data[0].display_name);
                console.log("Lat/Lon:", data[0].lat, data[0].lon);
            }
        } else {
            console.log("Response:", data);
        }

    } catch (e) {
        console.log("Search Failed:", e.message);
    }
}

testSearch();
