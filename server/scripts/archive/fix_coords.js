const mongoose = require('mongoose');
const Land = require('./server/models/Land');

mongoose.connect('mongodb://127.0.0.1:27017/geovaluator')
    .then(async () => {
        console.log("Connected to DB");
        const lands = await Land.find({});
        console.log("Found lands:", lands.length);
        let fixedCount = 0;

        for (let l of lands) {
            let lat = parseFloat(l._doc.latitude || l.geography?.lat || l.location?.coordinates?.[1]);
            let lng = parseFloat(l._doc.longitude || l.geography?.lng || l.location?.coordinates?.[0]);
            let changed = false;

            if ((isNaN(lat) || isNaN(lng)) && Array.isArray(l.coordinates) && l.coordinates.length === 2) {
                if (l.coordinates[0] > 40) { lng = l.coordinates[0]; lat = l.coordinates[1]; }
                else { lat = l.coordinates[0]; lng = l.coordinates[1]; }
            }

            const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

            if (!isValid) {
                console.log('Fixing invalid coordinate for survey:', l.survey_no, 'lat:', lat, 'lng:', lng);
                if (!l.geography) l.geography = {};
                l.geography.lat = 15.9012 + (Math.random() * 0.01);
                l.geography.lng = 80.4567 + (Math.random() * 0.01);
                l.markModified('geography');
                changed = true;
            }
            if (changed) {
                try {
                    await l.save();
                    fixedCount++;
                } catch (e) {
                    console.log("Failed to save:", l.survey_no, e.message);
                }
            }
        }
        console.log('Fixed', fixedCount, 'records');
        process.exit(0);
    })
    .catch(err => {
        console.error("DB Error", err);
        process.exit(1);
    });
