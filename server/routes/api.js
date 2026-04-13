const router = require('express').Router();
const PDFDocument = require('pdfkit');
const axios = require('axios');
const Land = require('../models/Land');

// --- 1. Fraud Detection & Registration ---
router.post('/register-land', async (req, res) => {
  try {
    const { survey_number, coordinates, owner_id } = req.body;

    const exists = await Land.findOne({ survey_number });
    if (exists) return res.status(400).json({ alert: "FRAUD ALERT: Duplicate Claim Detected!" });

    const newLand = new Land({
      owner_id,
      survey_number,
      geo_coordinates: coordinates,
      last_visit: new Date(),
      history: [{ date: new Date(), event: "Land Registered Systematically" }]
    });

    await newLand.save();
    res.json({ message: "Land Secured Successfully", id: newLand._id });
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- 2. Smart Evidence Generator (Feature 9) ---
router.get('/generate-evidence/:id', async (req, res) => {
  const land = await Land.findById(req.params.id);
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Legal_Proof_${land?.survey_number || 'Land'}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('OFFICIAL LAND STATUS REPORT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated via GeoValuator AI on ${new Date()}`);
  doc.text(`Survey No: ${land?.survey_number || 'N/A'}`);
  doc.text(`Owner ID: ${land?.owner_id || 'N/A'}`);
  doc.moveDown();

  doc.text('--- SECURITY TIMELINE ---');
  (land?.history || []).forEach(h => doc.text(`[${new Date(h.date).toISOString().split('T')[0]}] ${h.event}`));

  doc.end();
});

// Route removed during stabilization

module.exports = router;
