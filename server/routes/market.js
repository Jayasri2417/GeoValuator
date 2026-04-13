const express = require('express');
const axios = require('axios');

const router = express.Router();

// Estimate market price using optional external APIs (Numbeo), else return not available
router.get('/estimate', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });

  // Try reverse geocode to get city + country for estimates
  try {
    const { data: rev } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'jsonv2', addressdetails: 1 },
      headers: { 'User-Agent': 'GeoValuator/1.0 (contact@geovaluator.com)', 'Accept-Language': 'en' },
      timeout: 10000,
    });

    const city = rev?.address?.city || rev?.address?.town || rev?.address?.village || rev?.address?.suburb || rev?.address?.county || 'Unknown';
    const country = rev?.address?.country || 'Unknown';

    // If NUMBEO_API_KEY is present, try to fetch price per sqm
    const apiKey = process.env.NUMBEO_API_KEY;
    if (apiKey && city) {
      try {
        const { data: priceData } = await axios.get('https://www.numbeo.com/api/city_prices', {
          params: { api_key: apiKey, query: city },
          timeout: 10000,
        });
        // Extract property price indices if present
        const items = priceData?.prices || [];
        const outsideCenter = items.find((x) => x.item_id === 236); // Apartment (outside of center) price per m2
        const cityCenter = items.find((x) => x.item_id === 225); // Apartment (center) price per m2

        if (outsideCenter || cityCenter) {
          const est = {
            available: true,
            city,
            country,
            currency: priceData?.currency ?? 'USD',
            price_per_sqm_low: Math.min(outsideCenter?.average_price || Infinity, cityCenter?.average_price || Infinity),
            price_per_sqm_high: Math.max(outsideCenter?.average_price || 0, cityCenter?.average_price || 0),
            source: 'numbeo',
            last_updated: new Date().toISOString(),
          };
          return res.json(est);
        }
      } catch (err) {
        console.warn('Numbeo price fetch failed:', err?.response?.status || err.message);
      }
    }

    // Fallback: no external data
    return res.json({
      available: false,
      city,
      country,
      message: 'No price provider configured. Add NUMBEO_API_KEY to enable global estimates.',
      last_updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Market estimate error', err.message);
    return res.status(500).json({ error: 'Estimation failed' });
  }
});

module.exports = router;
