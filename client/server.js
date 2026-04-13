const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.CLIENT_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve environment variables to frontend (only safe ones)
app.get('/api/config', (req, res) => {
    res.json({
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
        backendUrl: process.env.BACKEND_URL || process.env.CLIENT_BACKEND_URL || 'http://localhost:5051'
    });
});

app.use(express.static(path.join(__dirname, 'public')));

// API Routes (for future integration)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock API endpoints
app.get('/api/properties', (req, res) => {
    res.json({
        properties: [
            {
                id: 'land-001',
                survey_no: 'SRV-442/B',
                location: 'Sector 14, Karnal',
                value: 5040000,
                growth: '+12.0%',
                coordinates: { lat: 29.6857, lng: 76.9905 }
            }
        ]
    });
});

app.get('/api/valuation/:id', (req, res) => {
    res.json({
        land_id: req.params.id,
        current_value: 5040000,
        purchase_price: 4500000,
        growth_percentage: '+12.0%',
        market_status: 'Bullish',
        price_history: [
            { month: 'M1', value: 4500000 },
            { month: 'M2', value: 4590000 },
            { month: 'M3', value: 4710000 },
            { month: 'M4', value: 4860000 },
            { month: 'M5', value: 4950000 },
            { month: 'M6', value: 5040000 }
        ]
    });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🌍 GeoValuator Server Running      ║
║                                       ║
║   http://localhost:${PORT}              ║
║                                       ║
║   Ready to serve!                     ║
╚═══════════════════════════════════════╝
    `);
});
