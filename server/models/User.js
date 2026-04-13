const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // User's preferred location to drive initial dashboard/map context
  preferred_location: { type: String, required: true },
  unique_citizen_id: { type: String, default: uuidv4, unique: true },
  nominee: {
    name: String,
    contact: String
  },
  land_records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Land' }],
  last_login: { type: Date },
  last_login_location: {
    lat: Number,
    lng: Number
  },
  // Security: Device & IP tracking
  lastIp: { type: String, default: null },
  lastDevice: { type: String, default: null },
  loginHistory: [{
    ip: String,
    device: String,
    timestamp: { type: Date, default: Date.now }
  }],
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorMethod: { type: String, enum: ['email', 'phone'], default: 'email' },

  // OTP & Verification
  is_verified: { type: Boolean, default: false },
  otp_code: { type: String }, // Hashed OTP
  otp_expires_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
