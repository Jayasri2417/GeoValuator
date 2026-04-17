const express = require('express');
const router = express.Router();
const axios = require('axios');
const Land = require('../models/Land');

const PYTHON_AI_ENGINE_URL = process.env.PYTHON_AI_ENGINE_URL || 'https://geovaluator-ai.onrender.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log(`[AI SERVICE] Initialized with Engine URL: ${PYTHON_AI_ENGINE_URL}`);

async function refreshPredictionAsync(land) {
    try {
        const input = {
            Area_Acres: land.geography?.area_acres || 1.0,
            Land_Use: land.land_details?.land_use || 'Agricultural',
            Latitude: land.geography?.lat || 0,
            Longitude: land.geography?.lng || 0,
            Zone_Type: land.geography?.zone_type || 'Zone-B',
            Verified: land.legal?.is_verified ? 'Yes' : 'No',
            Region_Label: land.land_details?.region_label || 'Inland',
            Distance_to_Town_km: land.land_details?.distance_to_town_km || 5.0,
            Distance_to_Beach_km: land.land_details?.distance_to_beach_km || 10.0,
            Distance_to_Highway_km: land.land_details?.distance_to_highway_km || 1.0,
            Road_Connectivity_Score: land.land_details?.road_connectivity_score || 3,
            Encumbrance_Status: land.legal?.encumbrance_status || 'Clear',
            Kabja_Risk_Score: land.legal?.kabja_risk_score || 10
        };

        const response = await axios.post(`${PYTHON_AI_ENGINE_URL}/predict-price`, input, { timeout: 5000 });

        if (!land.pricing) land.pricing = {};
        if (!land.pricing.history) land.pricing.history = [];

        const ml_price = response.data.predicted_price_lakhs;
        const registered_value = land.pricing.registered_value_lakhs || 0;

        land.pricing.ml_estimated_lakhs = ml_price;
        land.pricing.last_prediction_date = new Date();

        land.pricing.history.push({
            date: new Date(),
            ml_estimated_lakhs: ml_price,
            registered_value_lakhs: registered_value
        });

        await land.save();
    } catch (e) {
        console.warn("AI engine offline. Using cached value.");
    }
}

router.post('/predict-price', async (req, res) => {
    try {
        const { survey_no, survey_number } = req.body;
        const targetSurveyNo = survey_no || survey_number;
        const land = await Land.findOne({ survey_no: targetSurveyNo });

        if (!land) {
            return res.status(404).json({ success: false, message: 'Land not found in Database' });
        }

        const axiosInstance = axios.create({
            timeout: 3000
        });

        let aiReachable = false;

        try {
            await axiosInstance.get(`${PYTHON_AI_ENGINE_URL}/health`);
            aiReachable = true;
        } catch (err) {
            aiReachable = false;
        }

        if (aiReachable === false) {
            console.warn("AI engine offline. Using cached value.");

            let basePrice =
                land.pricing?.ml_estimated_lakhs ??
                land.pricing?.registered_value_lakhs;

            if (!basePrice) {
                // Generate safe deterministic fallback
                const area = land.geography?.area_acres || 1;
                const zoneFactor =
                    land.geography?.zone_type === "Zone-A" ? 25 :
                        land.geography?.zone_type === "Zone-B" ? 18 :
                            land.geography?.zone_type === "Zone-C" ? 12 :
                                15;

                basePrice = parseFloat((area * zoneFactor).toFixed(2));
            }

            return res.json({
                success: true,
                fallback: true,
                survey_no: targetSurveyNo,
                predicted_price_lakhs: basePrice,
                source: land.pricing?.ml_estimated_lakhs
                    ? "ML"
                    : land.pricing?.registered_value_lakhs
                        ? "Registered"
                        : "None"
            });
        }

        if (land.pricing?.ml_estimated_lakhs) {
            const age_ms = land.pricing.last_prediction_date ? (new Date() - new Date(land.pricing.last_prediction_date)) : Infinity;
            const isExpired = age_ms > 24 * 60 * 60 * 1000;

            res.json({
                success: true,
                cached: true,
                refreshing: isExpired,
                survey_no: targetSurveyNo,
                predicted_price_lakhs: land.pricing.ml_estimated_lakhs
            });

            if (isExpired) {
                refreshPredictionAsync(land);
            }
            return;
        }

        // If no cache at all, await the first refresh
        await refreshPredictionAsync(land);

        if (!land.pricing?.ml_estimated_lakhs) {
            let basePrice =
                land.pricing?.ml_estimated_lakhs ??
                land.pricing?.registered_value_lakhs;

            if (!basePrice) {
                // Generate safe deterministic fallback
                const area = land.geography?.area_acres || 1;
                const zoneFactor =
                    land.geography?.zone_type === "Zone-A" ? 25 :
                        land.geography?.zone_type === "Zone-B" ? 18 :
                            land.geography?.zone_type === "Zone-C" ? 12 :
                                15;

                basePrice = parseFloat((area * zoneFactor).toFixed(2));
            }

            return res.json({
                success: true,
                fallback: true,
                survey_no: targetSurveyNo,
                predicted_price_lakhs: basePrice,
                source: land.pricing?.ml_estimated_lakhs
                    ? "ML"
                    : land.pricing?.registered_value_lakhs
                        ? "Registered"
                        : "None"
            });
        }

        res.json({
            success: true,
            survey_no: targetSurveyNo,
            predicted_price_lakhs: land.pricing.ml_estimated_lakhs
        });
    } catch (error) {
        console.warn("AI engine offline. Using cached value.");
        res.status(502).json({
            success: false,
            message: 'AI Prediction Service unavailable or failed'
        });
    }
});

router.post('/analyze-legal-risk', async (req, res) => {
    try {
        const { surveyNumber } = req.body;
        const land = await Land.findOne({ survey_no: surveyNumber });

        if (!land) return res.status(404).json({ success: false });

        const riskScore = land.legal?.kabja_risk_score || land.kabja_risk_score || 0;

        // Return existing risk immediately (background refresh simulation if needed)
        res.json({
            success: true,
            cached: true,
            dispute_probability: riskScore,
            legal_summary: riskScore > 60 ? "High probability of dispute. Evidence of unauthorized encroachment." : riskScore >= 30 ? "Moderate risk. Verification of boundaries recommended." : "Clear title. No immediate risk detected."
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// --- AI Chat Assistant (Gemini) ---
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                response: "AI Assistant is currently offline (Missing API Key)."
            });
        }

        // Format history for Gemini API
        // Gemini expects: { role: 'user'|'model', parts: [{ text: '...' }] }
        const formattedHistory = (history || [])
            .filter(msg => msg.id !== 'initial') // Skip the UI-only initial message
            .map(msg => ({
                role: msg.type === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

        const systemInstruction = `You are the GeoValuator AI Assistant, an expert in land valuation, legal risk (Kabja), and geospatial intelligence for the Bapatla region. 
Keep responses professional, concise, and helpful. 
When asked about risks, mention factors like boundary walls, owner absence, and nearby disputes. 
If asked about prices, explain that you use XGBoost machine learning models for predictions.`;

        const payload = {
            contents: [
                ...formattedHistory,
                { role: 'user', parts: [{ text: message }] }
            ],
            system_instruction: {
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(geminiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
            || "I'm having trouble processing your request right now. Please try again.";

        res.json({
            success: true,
            response: botResponse
        });

    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        
        const status = error.response?.status;
        let errorMsg = `The AI agent is resting (Status ${status || 'Unknown'}). Please try again in 30 seconds.`;
        
        if (status === 403) {
            errorMsg = "API Key Error: Your Gemini API Key has been reported as leaked or is invalid. Please update it in the server/.env file or root .env file.";
        } else if (status === 429) {
            errorMsg = "Quota Exceeded: Your Gemini API key has reached its free tier limit. Please wait a moment or use a different key.";
        } else if (status === 400) {
            errorMsg = "Model Error: There was an issue with the AI model configuration. We are working on a fix.";
        }

        res.status(500).json({
            success: false,
            response: errorMsg,
            details: error.message,
            statusCode: status
        });
    }
});

module.exports = router;
