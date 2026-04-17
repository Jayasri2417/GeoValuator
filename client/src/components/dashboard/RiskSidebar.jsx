import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, MapPin, TrendingUp, Scale, FileText, ShieldAlert, Clock, Gavel, Coins } from 'lucide-react';

export default function RiskSidebar({ selectedLand, onClose, onGenerateEvidence }) {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://geovaluator-backend.onrender.com';
    const [legalAnalysis, setLegalAnalysis] = useState(null);
    const [priceForecast, setPriceForecast] = useState(null);
    const [usageRec, setUsageRec] = useState(null);
    const [xgboostPrice, setXgboostPrice] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const lastLoaded = useRef(null);

    useEffect(() => {
        if (!selectedLand) return;
        const survey_no = selectedLand.survey_number || selectedLand.survey_no;
        if (!survey_no) return;
        if (lastLoaded.current === survey_no) return;

        console.log("AI call triggered");
        lastLoaded.current = survey_no;
        fetchAIInsights();
    }, [selectedLand]);

    const fetchAIInsights = async () => {
        setLoadingAI(true);
        try {
            // FIRE ALL API REQUESTS CONCURRENTLY FOR FASTER LOAD

            // 1. Precise XGBoost Valuation (Fastest < 100ms)
            const p1 = fetch(`${API_BASE}/api/ai/predict-price`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedLand)
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    setXgboostPrice({
                        predicted_price_lakhs: data.predicted_price_lakhs,
                        source: data.source,
                        refreshing: data.refreshing,
                        top_drivers: data.top_drivers
                    });
                } else {
                    setXgboostPrice({ error: true });
                }
            }).catch(err => {
                console.error("XGBoost error", err);
                setXgboostPrice({ error: true });
            });

            // 2. Legal Risk Analysis (Gemini)
            const p2 = fetch(`${API_BASE}/api/ai/analyze-legal-risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    surveyNumber: selectedLand.survey_number,
                    riskScore: selectedLand.kabja_risk_score,
                    existingEncumbrance: selectedLand.encumbrance_status,
                    marketValue: selectedLand.market_value
                })
            }).then(res => res.json()).then(data => {
                if (data.success) setLegalAnalysis(data);
            }).catch(err => console.error("Risk error", err));

            // Wait for active models to finish independently
            await Promise.allSettled([p1, p2]);

        } catch (error) {
            console.error("Failed to fetch AI insights", error);
        } finally {
            setLoadingAI(false);
        }
    };

    if (!selectedLand) return null;

    const riskScore = selectedLand.kabja_risk_score || 0;
    const isHighRisk = riskScore > 60;
    const isModerate = riskScore >= 30 && riskScore <= 60;
    const isSafe = riskScore < 30;

    return (
        <div className="h-full bg-white flex flex-col font-sans">
            {/* Header - File Dossier Style */}
            <div className="p-6 border-b-2 border-govBlue bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-govBlue text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-blue-900 shadow-sm">Official Record</span>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200 hover:border-slate-400 transition"><X size={18} /></button>
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">Survey No. {selectedLand.survey_number || selectedLand.survey_no || 'N/A'}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-bold mt-2 bg-white px-2 py-1 rounded border border-slate-200 inline-block shadow-sm">
                    <MapPin size={12} className="text-govBlue" />
                    {selectedLand.address?.formatted || `${selectedLand.address?.colony || ''}`}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Risk Status Banner */}
                <div className={`p-4 rounded border-l-4 shadow-sm ${isHighRisk ? 'bg-red-50 border-red-500' :
                    isSafe ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'
                    }`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold uppercase ${isHighRisk ? 'text-red-700' : isSafe ? 'text-green-700' : 'text-amber-700'
                            }`}>
                            {isHighRisk ? 'High Risk' : isSafe ? 'Verified Safe' : 'Moderate Risk'}
                        </span>
                        <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-slate-600">
                            Score: {riskScore}/100
                        </span>
                    </div>
                    <p className="text-xs text-slate-600">
                        {isHighRisk ? 'Immediate attention required. Unauthorized activity detected.' : isSafe ? 'Property checks passed. Routine monitoring active.' : 'Warning: Partial risks detected. Proceed with caution.'}
                    </p>
                </div>

                {/* Estimated Price Card */}
                <div className="bg-govBlue text-white p-4 rounded shadow-md border-b-4 border-blue-900">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Coins size={14} className="text-govGold" /> Estimated Price
                        </h3>
                        {loadingAI && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    </div>

                    {xgboostPrice ? (
                        xgboostPrice.error ? (
                            <p className="text-xs text-red-200 italic">Prediction unavailable.</p>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl font-serif font-bold tracking-tight">
                                        {(xgboostPrice.predicted_price_lakhs !== null && xgboostPrice.predicted_price_lakhs !== undefined) ? (
                                            <>
                                                ₹ {xgboostPrice.predicted_price_lakhs >= 100
                                                    ? (xgboostPrice.predicted_price_lakhs / 100).toFixed(2)
                                                    : parseFloat(xgboostPrice.predicted_price_lakhs).toFixed(2)} <span className="text-sm">{xgboostPrice.predicted_price_lakhs >= 100 ? 'Cr' : 'Lakhs'}</span>
                                            </>
                                        ) : "Prediction unavailable"}
                                    </div>
                                    {xgboostPrice.refreshing && (
                                        <span className="text-[10px] text-blue-200 animate-pulse bg-blue-900/50 px-2 py-0.5 rounded border border-blue-700">Updating...</span>
                                    )}
                                </div>
                                <div className="text-[10px] text-blue-100 flex items-center gap-1">
                                    <TrendingUp size={10} />
                                    {xgboostPrice.source === 'Registered'
                                        ? 'Registered Value Cache • Standby'
                                        : 'XGBoost Intelligence • Bapatla Region Opt.'}
                                </div>

                                {xgboostPrice.top_drivers && (
                                    <div className="mt-3 pt-2 border-t border-blue-800">
                                        <p className="text-[9px] font-bold uppercase text-blue-200 mb-1">Key Value Drivers:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {xgboostPrice.top_drivers.map((d, i) => (
                                                <span key={i} className="text-[8px] bg-blue-900/50 px-1.5 py-0.5 rounded border border-blue-700">
                                                    {d.feature.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <p className="text-xs text-blue-200 italic">Fetching latest valuation...</p>
                    )}
                </div>

                {/* Property Details Table */}
                <div>
                    <h3 className="text-sm font-bold text-govBlue border-b border-gray-200 pb-2 mb-3">Property Details</h3>
                    <table className="w-full text-xs text-left">
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 text-slate-500">Owner Name</td>
                                <td className="py-2 font-medium text-slate-800">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={selectedLand.owner_photo || "https://ui-avatars.com/api/?name=" + selectedLand.owner_name}
                                            alt="Owner"
                                            className="w-6 h-6 rounded-full border border-gray-200"
                                        />
                                        <span>{selectedLand.owner_name}</span>
                                    </div>
                                    <span className="block text-[10px] text-slate-400 mt-0.5 ml-8">{selectedLand.owner_id || "ID: -"}</span>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 text-slate-500">Zone Type</td>
                                <td className="py-2 font-medium text-slate-800">{selectedLand.address?.zone_type}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 text-slate-500">Area (Acres)</td>
                                <td className="py-2 font-medium text-slate-800">
                                    {selectedLand.area_acres
                                        ? parseFloat(selectedLand.area_acres).toFixed(2)
                                        : (selectedLand.area_sq_yards || selectedLand.area_sqyd)
                                            ? ((selectedLand.area_sq_yards || selectedLand.area_sqyd) / 4840).toFixed(2)
                                            : "N/A"}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 text-slate-500">Last Verified</td>
                                <td className="py-2 font-medium text-slate-800">{selectedLand.last_visit || "Not Verified"}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 text-slate-500">Verified</td>
                                <td className="py-2 font-medium text-slate-800">
                                    {selectedLand.is_verified ? (
                                        <span className="flex items-center gap-1 text-green-600 font-bold">
                                            <CheckCircle size={12} /> Yes
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Pending</span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* AI Legal Advisor Section */}
                <div className="bg-slate-50 p-4 rounded border border-gray-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
                        <Scale size={14} className="text-govBlue" /> Legal Risk Assessment
                    </h3>
                    {legalAnalysis ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-600">Dispute Probability</span>
                                <span className={`font-bold ${legalAnalysis.dispute_probability > 30 ? 'text-red-600' : 'text-green-600'}`}>
                                    {legalAnalysis.dispute_probability}%
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 italic border-l-2 border-govBlue pl-2">
                                "{legalAnalysis.legal_summary}"
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Analyzing legal records...</p>
                    )}
                </div>

                {/* Actions / Reports */}
                <div>
                    <h3 className="text-sm font-bold text-govBlue border-b border-gray-200 pb-2 mb-3">Official Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={async () => {
                                try {
                                    const userStr = localStorage.getItem('user');
                                    const user = userStr ? JSON.parse(userStr) : null;
                                    const userEmail = user?.email || 'citizen@gov.in';
                                    const userName = user?.name || 'jayasri';

                                    const response = await fetch(`${API_BASE}/api/reports/request-verify`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            landId: selectedLand._id,
                                            email: userEmail,
                                            userName: userName,
                                            surveyNumber: selectedLand.survey_no || selectedLand.survey_number
                                        })
                                    });

                                    if (response.ok) {
                                        alert(`Verification Email Sent to ${userEmail}. Please check your inbox to download the report.`);
                                    } else {
                                        alert('Failed to send verification email.');
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert('Error connecting to verification service.');
                                }
                            }}
                            className="flex flex-col items-center justify-center p-3 border border-blue-200 bg-blue-50 text-govBlue rounded hover:bg-blue-100 transition"
                        >
                            <FileText size={20} className="mb-1" />
                            <span className="text-xs font-bold">Download Report</span>
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const userStr = localStorage.getItem('user');
                                    const user = userStr ? JSON.parse(userStr) : null;
                                    const userEmail = user?.email || 'citizen@gov.in';
                                    const userName = user?.name || 'jayasri';

                                    const alertData = {
                                        type: 'Security',
                                        message: `Manual Security Alert triggered for Survey ${selectedLand.survey_number} by ${userName}`,
                                        email: userEmail,
                                        userName: userName,
                                        surveyNumber: selectedLand.survey_number,
                                        time: new Date().toLocaleString(),
                                        device: navigator.userAgent,
                                        ip: '::1',
                                        location: selectedLand.address?.formatted || 'Bapatla'
                                    };

                                    await fetch(`${API_BASE}/api/alerts/trigger`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(alertData)
                                    });

                                    alert(`Security Alert Sent to ${userEmail}`);
                                } catch (e) {
                                    console.error(e);
                                    alert('Failed to send alert');
                                }
                            }}
                            className="flex flex-col items-center justify-center p-3 border border-red-200 bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                        >
                            <ShieldAlert size={20} className="mb-1" />
                            <span className="text-xs font-bold">Trigger Alert</span>
                        </button>

                        <button
                            onClick={onGenerateEvidence}
                            className="col-span-2 py-3 bg-govBlue text-white rounded shadow hover:bg-govBlue/90 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide"
                        >
                            <Gavel size={16} /> Generate Legal Evidence Pack
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
