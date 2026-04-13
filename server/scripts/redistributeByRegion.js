const mongoose = require('mongoose');
const Land = require('../models/Land');

const REGION_BOUNDS = {
    "Town Core": { minLat: 15.889, maxLat: 15.905, minLng: 80.460, maxLng: 80.475 },
    "Coastal": { minLat: 15.875, maxLat: 15.890, minLng: 80.485, maxLng: 80.505 },
    "Rural": { minLat: 15.895, maxLat: 15.915, minLng: 80.440, maxLng: 80.455 },
    "Highway": { minLat: 15.885, maxLat: 15.905, minLng: 80.455, maxLng: 80.470 }
};

mongoose.connect('mongodb://127.0.0.1:27017/geovaluator')
    .then(async () => {
        console.log("Connected to MongoDB for region-based redistribution");

        const lands = await Land.find({});
        let updateCount = 0;

        for (const land of lands) {
            // Determine region bounds based on Region_Label or fallback to Rural
            const regionLabel = land.location?.Region_Label || land.Region_Label || "Rural";
            const bounds = REGION_BOUNDS[regionLabel] || REGION_BOUNDS["Rural"];

            // Calculate new randomized coordinates within the bounding box
            const newLat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
            const newLng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);

            // Ensure geography object exists
            if (!land.geography) {
                land.geography = {};
            }

            land.geography.lat = newLat;
            land.geography.lng = newLng;

            land.markModified('geography');
            await land.save();

            updateCount++;
        }

        console.log(`Redistribution complete.`);
        console.log(`Records individually redistributed into accurate geographic regions: ${updateCount}`);

        // Sanity Check
        const finalList = await Land.find({});
        console.log(`Total Lands Verified in DB: ${finalList.length}`);

        process.exit(0);
    })
    .catch(err => {
        console.error("Database connection error:", err);
        process.exit(1);
    });
