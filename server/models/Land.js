const mongoose = require('mongoose');

const LandSchema = new mongoose.Schema({
  survey_no: { type: String, required: true, index: true, unique: true },
  owner_name: { type: String },
  geography: {
    lat: { type: Number },
    lng: { type: Number },
    area_acres: { type: Number },
    area_sq_yards: { type: Number },
    zone_type: { type: String }
  },
  land_details: {
    land_use: { type: String },
    road_connectivity_score: { type: Number },
    distance_to_town_km: { type: Number },
    distance_to_highway_km: { type: Number },
    distance_to_beach_km: { type: Number },
    region_label: { type: String }
  },
  legal: {
    encumbrance_status: { type: String },
    kabja_risk_score: { type: Number },
    is_verified: { type: Boolean }
  },
  pricing: {
    registered_value_lakhs: { type: Number },
    ml_estimated_lakhs: { type: Number },
    history: [{
      date: { type: Date, default: Date.now },
      ml_estimated_lakhs: Number,
      registered_value_lakhs: Number
    }],
    last_prediction_date: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Land', LandSchema);
