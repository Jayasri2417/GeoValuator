/**
 * GeoValuator Backend - index.js
 * ============================================================
 * Startup Order:
 *  1. Load environment variables
 *  2. Connect MongoDB (with retry)
 *  3. Check dataset / auto-seed if empty
 *  4. Start Express server (auto-increment port on conflict)
 *  5. Python AI engine check (non-blocking warning only)
 * ============================================================
 */

// ── 1. Load environment variables FIRST ──────────────────────
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const net = require('net');


// ── MongoDB connection string ─────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/geovaluator';

// ── Import Routes ─────────────────────────────────────────────
const authRoute = require('./routes/auth');
const landRoute = require('./routes/land');
const geocodeRoute = require('./routes/geocode');
const marketRoute = require('./routes/market');
const apiRoute = require('./routes/api');
const aiRoute = require('./routes/ai');
const reportsRoute = require('./routes/reports');
const alertsRoute = require('./routes/alerts');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:5176'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// ── Route Middleware ──────────────────────────────────────────
app.use('/api/auth', authRoute);
app.use('/api/land', landRoute);
app.use('/api/geocode', geocodeRoute);
app.use('/api/market', marketRoute);
app.use('/api', apiRoute);
app.use('/api/ai', aiRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/alerts', alertsRoute);

// ── Serve uploaded files ──────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'GeoValuator Backend Running' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// ─────────────────────────────────────────────────────────────
//  Helper: Connect MongoDB with retry
// ─────────────────────────────────────────────────────────────
async function connectMongoDB(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
      console.log('MongoDB Connected Successfully');
      return true;
    } catch (err) {
      console.error(`MongoDB Connection Attempt ${attempt}/${retries} Failed: ${err.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${delayMs / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
//  Helper: Find next available port starting from basePort
// ─────────────────────────────────────────────────────────────
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────
//  Main Application Startup
// ─────────────────────────────────────────────────────────────
const startApp = async () => {
  // ── 2. Connect MongoDB ──────────────────────────────────────
  const connected = await connectMongoDB();
  if (!connected) {
    console.error('MongoDB Connection Failed after all retries. Exiting.');
    process.exit(1);
  }

  console.log("DB URI:", process.env.MONGO_URI);
  // ── 3. Check dataset / auto-seed if empty ──────────────────
  try {
    const Land = require('./models/Land');
    const landCount = await Land.countDocuments();
    console.log(`Total Lands in MongoDB: ${landCount}`);

    if (landCount === 0) {
      console.log('No land records found. Seeding database automatically...');
      try {
        const { seedDatabase } = require('./seed');
        await seedDatabase();
        const seededCount = await Land.countDocuments();
        console.log(`Total Lands in MongoDB: ${seededCount}`);
      } catch (seedErr) {
        console.error('Auto-seed failed:', seedErr.message);
        // Non-fatal: server still starts, data can be seeded manually
        console.warn('Run "node seed.js" from the server directory to seed manually.');
      }
    }
  } catch (dbErr) {
    console.error('Dataset check failed:', dbErr.message);
    // Non-fatal: server continues
  }

  // ── 4. Determine port (auto-increment if busy) ─────────────
  const desiredPort = parseInt(process.env.PORT) || 5050;
  const port = await findAvailablePort(desiredPort);

  if (port !== desiredPort) {
    console.warn(`Port ${desiredPort} is in use. Using port ${port} instead.`);
  }

  // ── 5. Start Express Server ─────────────────────────────────
  const server = app.listen(port, () => {
    console.log(`GeoValuator Backend running on Port ${port}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });

  // ── 6. Python AI Engine check (warning only, non-blocking) ──
  setImmediate(async () => {
    try {
      const axios = require('axios');
      const PYTHON_AI_ENGINE_URL =
        process.env.PYTHON_AI_ENGINE_URL || 'http://localhost:5001';
      await axios.get(`${PYTHON_AI_ENGINE_URL}/health`, { timeout: 3000 });
      console.log('Python AI Engine Status: OK');
    } catch {
      console.warn('Python AI Engine Warning: Not reachable at startup');
    }
  });

  // ── Graceful Shutdown ────────────────────────────────────────
  const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server closed.');
      mongoose.connection.close(false)
        .then(() => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        })
        .catch((err) => {
          console.error('MongoDB connection close error:', err);
          process.exit(1);
        });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startApp();


//console.log("DB URI:", process.env.MONGO_URI);
