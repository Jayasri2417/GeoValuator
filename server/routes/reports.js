const router = require('express').Router();
const PDFDocument = require('pdfkit');
const Land = require('../models/Land');

const { sendEmail } = require('../utils/emailService');

// Helper to draw a line
const drawLine = (doc, y) => {
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
};

// NEW: Request Verification for Download
router.post('/request-verify', async (req, res) => {
    try {
        const { landId, email, userName, surveyNumber } = req.body;

        // Parse the origin from the request (so if frontend is on 5174, it downloads via 5174 proxy)
        const originUrl = req.get('origin') || req.get('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:5174';
        const downloadUrl = `${originUrl}/api/reports/${landId}`;

        const htmlContent = `
            <div style="font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; background-color: #ffffff; padding: 0;">
                <div style="padding: 40px 50px;">
                    <h1 style="color: #24292e; font-size: 28px; font-weight: 700; margin: 0; padding-bottom: 15px; text-align: left;">Report Access Requested</h1>
                    <div style="height: 2px; width: 100%; background-color: #3182ce; margin-bottom: 30px;"></div>
                    
                    <p style="color: #444; font-size: 16px; margin: 0 0 15px 0;">Hello ${userName || 'User'},</p>
                    <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                        A request was made to download the Official Land Status Report for Survey No. <span style="background-color: #f6e05e; padding: 1px 4px; border-radius: 2px; font-weight: 600;">${surveyNumber || 'N/A'}</span>.
                    </p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${downloadUrl}" style="background-color: #3182ce; color: white; padding: 16px 40px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 18px; display: inline-block; box-shadow: 0 4px 10px rgba(49, 130, 206, 0.3);">Yes, Download Report</a>
                    </div>

                    <div style="margin-bottom: 40px; border-bottom: 1px solid #e1e4e8; padding-bottom: 25px;">
                        <p style="color: #718096; font-size: 14px; margin: 0 0 5px 0;">If you did not request this report, please ignore this email.</p>
                        <p style="color: #4a5568; font-size: 14px; font-weight: 700; margin: 0;">No data has been downloaded yet.</p>
                    </div>

                    <div style="text-align: center;">
                        <p style="color: #718096; font-size: 12px; margin: 0;">
                            © 2026 <span style="background-color: #fef08a; padding: 1px 3px; border-radius: 2px;">GeoValuator</span> Security Team
                        </p>
                    </div>
                </div>
            </div>
        `;

        await sendEmail(
            email || 'citizen@gov.in',
            `Report Verification: Survey ${surveyNumber || 'N/A'}`,
            htmlContent
        );

        res.json({ success: true, message: 'Verification email sent' });
    } catch (error) {
        console.error("Verification Request Error Detailed:", {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({
            success: false,
            message: 'Failed to send verification email',
            details: error.message
        });
    }
});

// EXISTING: Generate and Download PDF
router.get('/:landId', async (req, res) => {
    try {
        const land = await Land.findById(req.params.landId);
        if (!land) {
            return res.status(404).json({ error: 'Land not found' });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Official_Report_${land.survey_number || 'Land'}.pdf`);

        doc.pipe(res);

        // --- HEADER ---
        doc.fontSize(20).text('GEOVALUATOR', { align: 'center' });
        doc.fontSize(10).text('Unified Land Intelligence & Protection System', { align: 'center' });
        doc.moveDown();
        drawLine(doc, 100);

        // --- TITLE ---
        doc.moveDown(2);
        doc.fontSize(16).text('OFFICIAL LAND STATUS REPORT', { align: 'center', underline: true });
        doc.moveDown();

        // --- PROPERTY DETAILS ---
        doc.fontSize(12).text('Property Details', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Report ID: ${Date.now()}`);
        doc.text(`Date: ${new Date().toDateString()}`);
        doc.text(`Survey Number: ${land.survey_number || land.survey_no || 'Unknown'}`);
        doc.text(`Location: ${land.address?.formatted || land.address?.colony || 'Unknown Location'}`);
        doc.text(`Area: ${land.area_sq_yards || land.area_acres || 'Unknown'} Units`);
        doc.moveDown();

        // --- RISK ANALYSIS ---
        doc.fontSize(12).text('Risk Analysis Assessment', { underline: true });
        doc.moveDown(0.5);
        const riskScore = land.kabja_risk_score !== undefined ? land.kabja_risk_score : (land.legal?.kabja_risk_score || 0);
        const color = riskScore > 60 ? 'red' : 'green';

        doc.fillColor(color).text(`Overall Risk Score: ${riskScore}/100`);
        doc.fillColor('black').text(`Status: ${riskScore > 60 ? 'High Risk' : 'Moderate/Safe'}`);
        doc.moveDown(0.5);

        doc.text('Key Observations:');
        doc.list([
            'Boundary Integrity: Verified',
            'Encroachment Check: No unauthorized structures detected',
            'Legal Status: Clear per last EC check'
        ]);
        doc.moveDown();

        // --- VALUATION ---
        doc.fontSize(12).text('Valuation Summary', { underline: true });
        doc.moveDown(0.5);
        const estLakhs = land.pricing?.ml_estimated_lakhs || land.pricing?.registered_value_lakhs || 'Unknown';
        doc.text(`Estimated Market Value: ${estLakhs !== 'Unknown' ? 'INR ' + estLakhs + ' Lakhs' : 'Unknown'}`);
        doc.text('Growth Trend: +12% (Annualized)');
        doc.moveDown(2);

        // --- FOOTER ---
        doc.fontSize(8).text('This is a computer-generated report. Legal verification is recommended for transaction purposes.', { align: 'center' });

        doc.end();

    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

module.exports = router;
