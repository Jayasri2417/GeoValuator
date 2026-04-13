const router = require('express').Router();
const { sendEmail } = require('../utils/emailService');

let alerts = [];

// GET Alerts
router.get('/', (req, res) => {
    res.json(alerts);
});

// TRIGGER Alert (e.g., from AI Engine or external sensor)
router.post('/trigger', async (req, res) => {
    try {
        const { type, message, email, userName, surveyNumber, time, device, ip, location } = req.body;

        const newAlert = {
            id: Date.now(),
            type: type || 'System',
            message: message || 'New alert triggered',
            date: new Date(),
            read: false
        };

        alerts.unshift(newAlert);

        // Send Email Notification if critical
        if (type === 'Risk' || type === 'Security') {
            const htmlContent = `
                <div style="font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; background-color: #ffffff; padding: 0;">
                    <div style="padding: 40px 50px;">
                        <h1 style="color: #24292e; font-size: 28px; font-weight: 700; margin: 0; padding-bottom: 15px; text-align: left;">New Login Detected</h1>
                        <div style="height: 2px; width: 100%; background-color: #3182ce; margin-bottom: 30px;"></div>
                        
                        <p style="color: #444; font-size: 16px; margin: 0 0 15px 0;">Hello ${userName || 'jaya'},</p>
                        <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                            We detected a manual security alert triggered for your <span style="background-color: #f6e05e; padding: 1px 4px; border-radius: 2px; font-weight: 600;">GeoValuator</span> account.
                        </p>

                        <div style="background-color: #f7f9fa; border-radius: 4px; margin-bottom: 30px; overflow: hidden;">
                            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                                <tr style="background-color: #f7f9fa;">
                                    <td style="padding: 16px 20px; color: #1a202c; font-size: 15px; font-weight: 700; width: 150px;">Time:</td>
                                    <td style="padding: 16px 20px; color: #2d3748; font-size: 15px;">${time || new Date().toLocaleString()}</td>
                                </tr>
                                <tr style="background-color: #ffffff;">
                                    <td style="padding: 16px 20px; color: #1a202c; font-size: 15px; font-weight: 700;">Device:</td>
                                    <td style="padding: 16px 20px; color: #2d3748; font-size: 15px;">${device || 'Chrome 144.0.0 / Windows 10.0.0'}</td>
                                </tr>
                                <tr style="background-color: #f7f9fa;">
                                    <td style="padding: 16px 20px; color: #1a202c; font-size: 15px; font-weight: 700;">IP Address:</td>
                                    <td style="padding: 16px 20px; color: #2d3748; font-size: 15px;">${ip || '::1'}</td>
                                </tr>
                                <tr style="background-color: #ffffff;">
                                    <td style="padding: 16px 20px; color: #1a202c; font-size: 15px; font-weight: 700;">Location:</td>
                                    <td style="padding: 16px 20px; color: #2d3748; font-size: 15px;">${location || 'Bapatla'}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="margin-bottom: 40px; border-bottom: 1px solid #e1e4e8; padding-bottom: 25px;">
                            <p style="color: #718096; font-size: 14px; margin: 0 0 5px 0;">If this was you, you can safely ignore this email.</p>
                            <p style="color: #4a5568; font-size: 14px; font-weight: 700; margin: 0;">If you did not log in, please reset your password immediately.</p>
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
                email || 'demo_owner@gmail.com',
                `Security Alert: Manual Trigger for GeoValuator`,
                htmlContent
            );
        }

        res.json({ success: true, alert: newAlert });
    } catch (error) {
        res.status(500).json({ error: 'Alert Trigger Failed' });
    }
});

module.exports = router;
