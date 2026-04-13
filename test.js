const fetch = require('node-fetch');
async function run() {
  try {
    const res = await fetch('http://localhost:5051/api/ai/predict-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ survey_no: "2/1" })
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text);
  } catch(e) { console.error(e); }
}
run();
