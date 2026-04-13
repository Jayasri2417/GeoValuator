const mongoose = require('mongoose');
const Land = require('./models/Land');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const lands = await Land.find({}).limit(1);
  console.log("Found land:", lands[0]?.survey_no, lands[0]?.survey_number);
  process.exit(0);
}
run();
