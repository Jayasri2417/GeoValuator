import React, { useState, useEffect } from 'react';
import { Search, Bot, LogOut, Map as MapIcon, Menu, Users, ShieldCheck, FileText, Bell, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapCanvas from '../components/dashboard/MapCanvas';
import RiskSidebar from '../components/dashboard/RiskSidebar';
import LandSearch from '../components/LandSearch';
import AIAgentChat from '../components/AIAgentChat';
import DigitalNominee from '../components/dashboard/DigitalNominee';
import EvidenceGenerator from '../components/dashboard/EvidenceGenerator';

import ReportActivity from '../components/dashboard/ReportActivity';
import MyProperties from '../components/dashboard/MyProperties';

export default function LandIntelligence() {
    const [landData, setLandData] = useState([]);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
    const [loading, setLoading] = useState(true);
    const [selectedLand, setSelectedLand] = useState(null);
    const [activeFeature, setActiveFeature] = useState(null);
    const [navigationCoords, setNavigationCoords] = useState(null);
    const navigate = useNavigate();

    // Map & Feature States
    // Defaulting to 'streets' (light mode) for Govt look
    const [mapMode, setMapMode] = useState('streets');
    const [sentinelMode, setSentinelMode] = useState(false);
    const [showForSale, setShowForSale] = useState(false);
    const [showNomineeModal, setShowNomineeModal] = useState(false);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        // Fetch strictly from MongoDB backend
        const loadData = async () => {
            try {
                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(`${API_BASE}/api/land`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error("Failed to fetch from /api/land");

                const data = await response.json();
                console.log("Frontend received lands:", data.length);
                if (Array.isArray(data)) {
                    const mappedData = data.map(item => ({
                        ...item, // Keep raw backend fields
                        property_id: item._id || item.survey_no,
                        survey_number: item.survey_no,
                        latitude: item.geography?.lat || item.latitude,
                        longitude: item.geography?.lng || item.longitude,
                        coordinates: {
                            lat: item.geography?.lat || item.latitude,
                            lng: item.geography?.lng || item.longitude
                        },
                        kabja_risk_score: item.legal?.kabja_risk_score || 0,
                        encumbrance_status: item.legal?.encumbrance_status || 'Clear',
                        is_verified: item.legal?.is_verified,
                        area_acres: item.geography?.area_acres,
                        market_value: item.pricing?.registered_value_lakhs,
                        // Provide fake UI fields for map colors if missing
                        risk_level: (item.legal?.kabja_risk_score > 60) ? 'High Risk' : (item.legal?.kabja_risk_score >= 30 ? 'Moderate' : 'Safe'),
                        address: {
                            formatted: item.land_details?.region_label || "Bapatla Region",
                            colony: item.land_details?.region_label || "Bapatla",
                            zone_type: item.geography?.zone_type || "Unknown"
                        }
                    }));
                    setLandData(mappedData);
                }
            } catch (e) {
                console.error("Critical Failure: Database not reachable", e);
                setFetchError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const toggleFeature = (feature) => {
        setActiveFeature(prev => prev === feature ? null : feature);
    };

    const displayedData = showForSale ? landData.filter(l => l.is_for_sale) : landData;

    const handleLandSelect = (land) => {
        setSelectedLand(land);

        // Auto-Zoom to selected land
        let lat, lng;
        if (land.geography?.lat && land.geography?.lng) {
            lat = parseFloat(land.geography.lat);
            lng = parseFloat(land.geography.lng);
        } else if (land.latitude && land.longitude) {
            lat = parseFloat(land.latitude);
            lng = parseFloat(land.longitude);
        } else if (Array.isArray(land.coordinates) && land.coordinates.length === 2) {
            // Heuristic: India Lat ~8-37, Lng ~68-97
            // If first coord > 40, it's likely Longitude (GeoJSON [Lng, Lat])
            if (land.coordinates[0] > 40) {
                lng = land.coordinates[0];
                lat = land.coordinates[1];
            } else {
                lat = land.coordinates[0];
                lng = land.coordinates[1];
            }
        } else if (land.location?.coordinates) {
            const c = land.location.coordinates;
            if (Array.isArray(c)) {
                lng = c[0]; lat = c[1]; // GeoJSON
            }
        }

        if (!isNaN(lat) && !isNaN(lng)) {
            setNavigationCoords([lat, lng]);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-slate-50 flex items-center justify-center text-govBlue">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-govBlue border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-serif font-bold text-lg">Loading Official Records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">

            {/* --- TOP OFFICIAL HEADER --- */}
            <header className="h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-serif font-bold text-xs shadow-emblem">GV</div>
                    <div>
                        <h1 className="text-lg font-serif font-bold text-govBlue leading-none">GeoValuator</h1>
                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="hidden md:block">Welcome, <span className="font-bold text-slate-900">Officer Admin</span></span>
                    <button title="Notifications" className="p-2 hover:bg-slate-100 rounded-full relative">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded text-xs font-bold flex items-center gap-2"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* --- LEFT SIDEBAR NAVIGATION --- */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-40 hidden md:flex relative">
                    <div className="p-4 space-y-1">
                        <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                        <NavBtn
                            icon={<Search size={18} />}
                            label="Search Records"
                            active={activeFeature === 'search'}
                            onClick={() => toggleFeature('search')}
                        />
                        <NavBtn
                            icon={<FileText size={18} />}
                            label="My Properties"
                            active={activeFeature === 'my_properties'}
                            onClick={() => toggleFeature('my_properties')}
                        />
                        <NavBtn
                            icon={<MapIcon size={18} />}
                            label="Map View"
                            active={activeFeature === null && !sentinelMode}
                            onClick={() => { setActiveFeature(null); setSentinelMode(false); }}
                        />
                        <NavBtn
                            icon={<Bot size={18} />}
                            label="AI Assistant"
                            active={activeFeature === 'chat'}
                            onClick={() => toggleFeature('chat')}
                        />
                    </div>

                    <div className="p-4 space-y-1">
                        <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Tools</p>
                        <NavBtn
                            icon={<ShieldCheck size={18} className={sentinelMode ? "text-govGold" : ""} />}
                            label={sentinelMode ? "Guardian Active" : "Activate Guardian"}
                            active={sentinelMode}
                            onClick={() => setSentinelMode(!sentinelMode)}
                        />
                        <NavBtn
                            icon={<Users size={18} />}
                            label="Digital Nominee"
                            onClick={() => setShowNomineeModal(true)}
                        />
                        <NavBtn
                            icon={<FileText size={18} />}
                            label="File Report"
                            onClick={() => setShowReportModal(true)}
                        />
                    </div>

                    <div className="mt-auto p-4 border-t border-gray-200">
                        <div className="bg-slate-50 p-3 rounded border border-slate-300">
                            <p className="text-xs font-bold text-govBlue mb-1 uppercase tracking-wider">System Status</p>
                            <div className="flex items-center gap-2 text-xs text-green-700 font-bold">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse border border-green-600"></span>
                                Online & Secure
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FEATURE DRAWER (Left Panel) --- */}
                {(activeFeature === 'search' || activeFeature === 'chat' || activeFeature === 'my_properties') && (
                    <div className={`absolute left-0 md:left-64 top-0 bottom-0 w-full ${activeFeature === 'my_properties' ? 'md:w-[600px]' : 'md:w-96'} bg-white shadow-[10px_0_30px_-10px_rgba(0,0,0,0.3)] z-30 border-r border-slate-300 flex flex-col transition-all duration-300 ease-in-out`}>

                        {/* Floating Close Button */}
                        <button
                            onClick={() => setActiveFeature(null)}
                            className="absolute top-3 right-3 z-50 bg-white p-1.5 rounded-full shadow-md text-slate-500 hover:text-red-600 hover:bg-slate-50 border border-gray-200 transition-all transform hover:scale-105"
                            title="Close Panel"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex-1 overflow-hidden relative bg-slate-50">
                            {activeFeature === 'search' && (
                                <div className="h-full flex flex-col">
                                    <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex items-center gap-2 mb-1">
                                        <Search size={20} className="text-govBlue" />
                                        <h2 className="font-serif font-bold text-govBlue text-lg">Record Search</h2>
                                    </div>
                                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                                        <LandSearch
                                            onSelectLand={handleLandSelect}
                                            onNavigate={(coords) => { setNavigationCoords(coords); }}
                                        />
                                    </div>
                                </div>
                            )}
                            {activeFeature === 'chat' && <div className="h-full"><AIAgentChat /></div>}
                            {activeFeature === 'my_properties' && <div className="h-full"><MyProperties onNavigate={(coords) => setNavigationCoords(coords)} /></div>}
                        </div>
                    </div>
                )}

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 relative bg-slate-200 overflow-hidden flex flex-col">
                    {/* Map Controls Floating */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <span className="bg-white/90 backdrop-blur px-3 py-2 rounded shadow border border-slate-300 text-xs font-bold text-slate-600 flex items-center gap-2">
                            <MapIcon size={14} /> Mode:
                        </span>
                        <button
                            onClick={() => setMapMode(prev => prev === 'streets' ? 'satellite' : 'streets')}
                            className="bg-govBlue text-white px-3 py-2 rounded shadow-lg text-xs font-bold hover:bg-govBlue/90 border border-transparent flex items-center gap-2 transition transform active:scale-95"
                        >
                            {mapMode === 'streets' ? 'Switch to Satellite' : 'Switch to Map'}
                        </button>
                    </div>

                    <div className="w-full h-full bg-slate-200 relative">
                        <MapCanvas
                            data={displayedData}
                            onSelectLand={handleLandSelect}
                            selectedLand={selectedLand}
                            navigationCoords={navigationCoords}
                            mapMode={mapMode}
                            sentinelMode={sentinelMode}
                            showForSale={showForSale}
                        />
                        {/* Overlay Gradient for Depth */}
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-[5]"></div>
                    </div>
                </div>

                {/* --- RIGHT INFO SIDEBAR (Selected Land) --- */}
                {selectedLand && (
                    <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.3)] z-40 border-l border-slate-300">
                        <RiskSidebar
                            selectedLand={selectedLand}
                            onClose={() => setSelectedLand(null)}
                            onGenerateEvidence={() => setShowEvidenceModal(true)}
                        />
                    </div>
                )}
                <DigitalNominee isOpen={showNomineeModal} onClose={() => setShowNomineeModal(false)} />
                <EvidenceGenerator isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)} landId={selectedLand?.property_id || "BPT-GEN-001"} />
                <ReportActivity isOpen={showReportModal} onClose={() => setShowReportModal(false)} />

            </div>
        </div>
    );
}

const NavBtn = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors
            ${active
                ? 'bg-govBlue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-govBlue'
            }
        `}
    >
        {icon}
        {label}
    </button>
);
