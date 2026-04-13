const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const Land = require('./models/Land');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/geovaluator";
const CSV_FILE_PATH = path.join(__dirname, 'uploads', 'bapatla_land_dataset.csv');

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const hasDocs = await Land.countDocuments();
        if (hasDocs > 0) {
            console.log(`Database already contains ${hasDocs} records. Clearing records to re-seed...`);
            await Land.deleteMany({});
        }

        const results = [];
        const surveyCounts = {};

        fs.createReadStream(CSV_FILE_PATH)
            .pipe(csv())
            .on('data', (data) => {
                let survey_no = data.Survey_No;
                if (!survey_no) survey_no = 'UNKNOWN';

                // Keep track of counts to make them unique
                surveyCounts[survey_no] = (surveyCounts[survey_no] || 0) + 1;
                if (surveyCounts[survey_no] > 1) {
                    survey_no = `${survey_no}-${surveyCounts[survey_no]}`;
                }

                // Parse registered value
                const ml_price = parseFloat(data.Market_Price_Per_Acre);
                // Save Market_Price_Per_Acre as registered_value_lakhs (divided by 100000).
                const registered_value_lakhs = ml_price ? parseFloat((ml_price / 100000).toFixed(2)) : 0;

                const landDoc = {
                    survey_no: survey_no,
                    owner_name: data.Owner_Name || 'Unknown',
                    geography: {
                        lat: parseFloat(data.Latitude),
                        lng: parseFloat(data.Longitude),
                        area_acres: parseFloat(data.Area_Acres),
                        area_sq_yards: parseFloat(data.Area_Acres) * 4840,
                        zone_type: data.Zone_Type
                    },
                    land_details: {
                        land_use: data.Land_Use,
                        road_connectivity_score: parseInt(data.Road_Connectivity_Score) || 0,
                        distance_to_town_km: parseFloat(data.Distance_to_Town_km) || 0,
                        distance_to_highway_km: parseFloat(data.Distance_to_Highway_km) || 0,
                        distance_to_beach_km: parseFloat(data.Distance_to_Beach_km) || 0,
                        region_label: data.Region_Label || ''
                    },
                    legal: {
                        encumbrance_status: data.Encumbrance_Status || 'Clear',
                        kabja_risk_score: parseInt(data.Kabja_Risk_Score) || 0,
                        is_verified: data.Verified === 'Yes'
                    },
                    pricing: {
                        registered_value_lakhs: registered_value_lakhs,
                        ml_estimated_lakhs: null,
                        history: []
                    }
                };
                results.push(landDoc);
            })
            .on('end', async () => {
                try {
                    console.log(`Parsed ${results.length} records from CSV.`);
                    await Land.insertMany(results);
                    console.log(`Successfully seeded ${results.length} records into MongoDB.`);
                    mongoose.connection.close();
                    process.exit(0);
                } catch (err) {
                    console.error("Error inserting data into MongoDB:", err);
                    mongoose.connection.close();
                    process.exit(1);
                }
            });

    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

seedDatabase();
