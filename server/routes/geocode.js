const express = require('express');
const axios = require('axios');
const { Client } = require("@googlemaps/google-maps-services-js");

const router = express.Router();
const googleMapClient = new Client({});

// Simple in-memory cache to reduce calls during dev
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

const setCache = (key, value) => cache.set(key, { value, ts: Date.now() });
const getCache = (key) => {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
};

router.get('/', async (req, res) => {
  const address = (req.query.address || '').toString().trim();
  if (!address) return res.status(400).json({ error: 'Missing address' });

  const cacheKey = `geocode:${address}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = 'https://nominatim.openstreetmap.org/search';
    const { data } = await axios.get(url, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'GeoValuator/1.0 (contact@geovaluator.com)',
      },
      timeout: 10000,
    });

    if (data && data.length > 0) {
      const result = {
        location: {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        },
        formatted_address: data[0].display_name,
        address: address
      };
      setCache(cacheKey, result);
      return res.json(result);
    }

    res.status(404).json({ error: 'Address not found' });
  } catch (err) {
    console.error('Geocode error', err.message);
    res.status(500).json({ error: 'Geocoding failed', fallback: true });
  }
});

router.get('/search', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 20);
  if (!q) return res.status(400).json({ error: 'Missing q' });

  const cacheKey = `search:${q}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  // Step 1: Try Google Maps if a valid key is present
  if (process.env.GOOGLE_MAPS_API_KEY && !process.env.GOOGLE_MAPS_API_KEY.startsWith('your_') && process.env.GOOGLE_MAPS_API_KEY.length >= 20) {
    try {
      console.log(`[Geocode] Trying Google Maps for: ${q}`);
      const googleRes = await googleMapClient.geocode({
        params: {
          address: q,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (googleRes.data.results.length > 0) {
        const results = googleRes.data.results.map(p => ({
          id: p.place_id,
          display_name: p.formatted_address,
          lat: p.geometry.location.lat,
          lon: p.geometry.location.lng,
          type: p.types[0],
          class: 'google',
          importance: 1,
          address: p.formatted_address,
          boundingbox: null
        }));
        setCache(cacheKey, results);
        return res.json(results);
      }
    } catch (gErr) {
      console.warn('[Geocode] Google Maps failed, falling back to Nominatim:', gErr.message);
      // Fall through to Nominatim below
    }
  }

  // Step 2: Fallback to Nominatim (OpenStreetMap) - free, no key needed
  try {
    console.log(`[Geocode] Searching Nominatim for: ${q}, limit: ${limit}`);
    const url = 'https://nominatim.openstreetmap.org/search';

    const response = await axios.get(url, {
      params: {
        q,
        format: 'jsonv2',
        addressdetails: 1,
        limit,
      },
      headers: {
        'User-Agent': 'GeoValuator/1.0 (contact@geovaluator.com)',
        'Accept-Language': 'en',
      },
      timeout: 10000,
    });
    const data = response.data;
    console.log(`[Geocode] Got ${(data || []).length} results`);

    const results = (data || []).map((p) => ({
      id: p.place_id,
      display_name: p.display_name,
      lat: parseFloat(p.lat),
      lon: parseFloat(p.lon),
      type: p.type,
      class: p.class,
      importance: p.importance,
      address: p.address || {},
      boundingbox: p.boundingbox || null,
    }));

    setCache(cacheKey, results);
    res.json(results);
  } catch (err) {
    console.error('[Geocode] Search error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Geocoding failed', details: err.message });
  }
});

router.get('/reverse', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });

  const cacheKey = `reverse:${lat}:${lon}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = 'https://nominatim.openstreetmap.org/reverse';
    const { data } = await axios.get(url, {
      params: {
        lat,
        lon,
        format: 'jsonv2',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'GeoValuator/1.0 (contact@geovaluator.com)',
        'Accept-Language': 'en',
      },
      timeout: 10000,
    });

    const result = {
      display_name: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      address: data.address || {},
    };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Geocode reverse error', err.message);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

module.exports = router;
