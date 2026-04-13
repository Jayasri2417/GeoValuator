const axios = require('axios');
async function run() {
  try {
    const res = await axios.post('http://localhost:5051/api/ai/predict-price', {
      survey_no: "2/1"
    });
    console.log("STATUS:", res.status);
    console.log("BODY:", res.data);
  } catch(e) { 
    if(e.response) {
      console.log("STATUS:", e.response.status);
      console.log("BODY:", e.response.data);
    } else {
      console.error(e.message); 
    }
  }
}
run();
