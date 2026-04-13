const express = require('express');
const router = express.Router();
const Land = require('../models/Land');
const multer = require('multer');
const path = require('path');

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, unique + '-' + safeName);
  }
});
const upload = multer({ storage });

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ====== PUBLIC SEARCH (NO AUTH REQUIRED) ======
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ success: false, message: 'Query required' });

    const results = await Land.find({
      $or: [
        { survey_no: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// Document upload endpoint
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, filename: req.file.filename, path: `/uploads/${req.file.filename}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// ====== AUTHENTICATED ROUTES ======

// 1. REGISTER LAND with Documents
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { survey_no, lat, lng, area_sq_yards, purchase_price, documents } = req.body;

    if (!survey_no || lat === undefined || lng === undefined || area_sq_yards === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLand = new Land({
      survey_no,
      owner_name: req.user.name || 'Unknown',
      geography: {
        lat,
        lng,
        area_sq_yards
      },
      pricing: {
        registered_value_lakhs: purchase_price ? purchase_price / 100000 : 0
      }
    });

    const savedLand = await newLand.save();

    res.status(200).json({
      message: 'Land registered successfully',
      land: savedLand
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register land', details: err.message });
  }
});

// 2. GET ALL LANDS API
router.get('/', async (req, res) => {
  try {
    const lands = await Land.find();
    console.log("API /api/land returning:", lands.length);
    res.status(200).json(lands);
  } catch (err) {
    res.status(500).json(err);
  }
});
// 3. GET MY LANDS by Token
router.get('/my-lands', verifyToken, async (req, res) => {
  try {
    const ownerName = req.user?.name || 'Unknown';
    const lands = await Land.find({ owner_name: ownerName });
    res.status(200).json(lands);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. GET SINGLE LAND by ID
router.get('/:survey_no', async (req, res) => {
  try {
    const land = await Land.findOne({ survey_no: req.params.survey_no });
    if (!land) return res.status(404).json('Land not found');
    res.status(200).json(land);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
