import React, { useState, useEffect } from 'react';
import { Plus, MapPin, FileText, Upload, Trash2, ExternalLink, Loader, X } from 'lucide-react';

export default function MyProperties({ onNavigate }) {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        survey_number: '',
        area_sq_yards: '',
        purchase_price: '',
        address_formatted: '',
        coordinates_lat: '',
        coordinates_lng: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_BASE}/api/land/my-lands`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProperties(data);
                }
            } else {
                console.error("API returned error, no properties loaded.");
                setProperties([]);
            }
        } catch (error) {
            console.error("Failed to fetch properties", error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        // Strict Document Requirement
        if (!selectedFile) {
            alert('MANDATORY: Please upload a valid proof document (Deed/Sale Agreement) to register the asset.');
            setUploading(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');

            // 1. Upload Document if exists
            let uploadedDoc = null;
            let uploadSuccess = false;

            try {
                if (selectedFile) {
                    const docData = new FormData();
                    docData.append('document', selectedFile);

                    const uploadRes = await fetch(`${API_BASE}/api/land/upload`, {
                        method: 'POST',
                        body: docData
                    });

                    if (uploadRes.ok) {
                        const uploadJson = await uploadRes.json();
                        uploadedDoc = {
                            name: selectedFile.name,
                            url: uploadJson.path,
                            type: 'Indenture/Deed'
                        };
                        uploadSuccess = true;
                    }
                }
            } catch (err) {
                console.warn("Upload failed (Back-end offline?), using placeholder");
            }

            // 2. Register Land
            const payload = {
                survey_no: formData.survey_number,
                area_sq_yards: Number(formData.area_sq_yards),
                purchase_price: Number(formData.purchase_price),
                address: { formatted: formData.address_formatted },
                lng: Number(formData.coordinates_lng || 80.6),
                lat: Number(formData.coordinates_lat || 16.5),
                documents: uploadedDoc ? [uploadedDoc] : []
            };

            let apiSuccess = false;
            try {
                const res = await fetch(`${API_BASE}/api/land/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    alert('Property Registered Successfully!');
                    apiSuccess = true;
                    fetchProperties();
                }
            } catch (err) {
                console.warn("Add Land API failed");
            }

            if (!apiSuccess) {
                alert('Property Registration Failed. Please try again.');
            } else {
                setShowAddForm(false);
                setFormData({ survey_number: '', area_sq_yards: '', purchase_price: '', address_formatted: '', coordinates_lat: '', coordinates_lng: '' });
                setSelectedFile(null);
            }

        } catch (error) {
            console.error(error);
            alert('Something went wrong during registration.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your portfolio...</div>;

    return (
        <div className="h-full flex flex-col bg-slate-100 font-sans">
            {/* Header */}
            <div className="p-6 border-b-2 border-govBlue bg-white shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-govBlue flex items-center gap-2">
                        <FileText className="text-govBlue" size={28} /> My Land Registry
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage your registered land assets and official documents</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded shadow-sm font-bold transition border-2 ${showAddForm ? 'bg-white text-slate-600 border-slate-300' : 'bg-govBlue text-white border-transparent hover:bg-govBlue/90'}`}
                >
                    {showAddForm ? <><X size={18} /> Cancel Registration</> : <><Plus size={18} /> Register Property</>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

                {/* Registration Form - Enhanced Visibility */}
                {showAddForm && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border-2 border-blue-100">
                        <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-govBlue border border-blue-200">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">New Asset Registration</h2>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Official Form 1-A</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Survey Number *</label>
                                <input required name="survey_number" value={formData.survey_number} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-300 rounded focus:border-govBlue focus:ring-1 focus:ring-govBlue outline-none font-medium" placeholder="e.g. 123/A" />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Area (Sq. Yards) *</label>
                                <input required type="number" name="area_sq_yards" value={formData.area_sq_yards} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-300 rounded focus:border-govBlue focus:ring-1 focus:ring-govBlue outline-none font-medium" placeholder="0.00" />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Purchase Price (₹)</label>
                                <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-300 rounded focus:border-govBlue focus:ring-1 focus:ring-govBlue outline-none font-medium" placeholder="0" />
                            </div>

                            <div className="md:col-span-8">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Property Address / Location *</label>
                                <input required name="address_formatted" value={formData.address_formatted} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-300 rounded focus:border-govBlue focus:ring-1 focus:ring-govBlue outline-none font-medium" placeholder="Flat/Plot No, Colony, City, District" />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Proof Document / Deed * (Mandatory)</label>
                                <div className="relative">
                                    <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept=".pdf,.jpg,.jpeg,.png" />
                                    <label htmlFor="file-upload" className="flex items-center justify-between w-full p-3 bg-white border border-dashed border-slate-400 rounded cursor-pointer hover:bg-slate-50 transition">
                                        <span className="text-sm text-slate-600 truncate">{selectedFile ? selectedFile.name : "Choose File..."}</span>
                                        <Upload size={16} className="text-slate-400" />
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-12 pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-8 py-2.5 bg-govBlue text-white font-bold rounded shadow-md hover:bg-govBlue/90 hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all">
                                    {uploading && <Loader className="animate-spin" size={18} />}
                                    {uploading ? 'Registering...' : 'Submit Official Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Property List - Enhanced Cards */}
                {properties.length === 0 ? (
                    !showAddForm && (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border-2 border-dashed border-slate-300">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
                                <FileText size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">No Properties Registered</h3>
                            <p className="text-slate-500 mt-2 max-w-md text-center">Your digital portfolio is empty. Register your first land asset to enable automated monitoring and valuation.</p>
                            <button onClick={() => setShowAddForm(true)} className="mt-8 text-govBlue font-bold hover:underline">Register New Property &rarr;</button>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {Array.isArray(properties) && properties.map(property => (
                            <div
                                key={property._id}
                                onClick={() => {
                                    if (onNavigate && (property.coordinates || property.location)) {
                                        // Handle Coordinate Format Safely
                                        let coords = null;
                                        if (Array.isArray(property.coordinates) && property.coordinates.length === 2) {
                                            // Check if already Lat, Lng or Lng, Lat
                                            // India Lat: 8-37, Lng: 68-97
                                            const [a, b] = property.coordinates;
                                            if (a > 40) coords = [b, a]; // [Lng, Lat] -> [Lat, Lng]
                                            else coords = [a, b];
                                        } else if (property.location && property.location.coordinates) {
                                            const c = property.location.coordinates;
                                            // GeoJSON Polygon/Point
                                            if (Array.isArray(c) && c.length === 2 && typeof c[0] === 'number') {
                                                coords = [c[1], c[0]]; // [Lng, Lat]
                                            } else if (Array.isArray(c) && Array.isArray(c[0])) {
                                                // Handle nested polygon point
                                                const p = c[0][0]; // First point of first ring
                                                if (Array.isArray(p)) coords = [p[1], p[0]];
                                                else coords = [c[0][1], c[0][0]]; // Fallback
                                            }
                                        }

                                        if (coords) onNavigate(coords);
                                    }
                                }}
                                className="bg-white p-0 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-govBlue transition-all duration-200 flex flex-col md:flex-row overflow-hidden cursor-pointer group"
                            >
                                {/* Left Status Strip */}
                                <div className={`w-2 md:w-3 ${property.legal?.kabja_risk_score > 60 ? 'bg-red-500' : property.legal?.kabja_risk_score >= 30 ? 'bg-amber-500' : 'bg-green-500'}`}></div>

                                <div className="p-5 flex-1 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">Ref: {property._id || "PENDING"}</span>
                                            {property.is_watch_active && <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Monitoring Active</span>}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-govBlue transition-colors">Survey No. {property.survey_no || property.survey_number}</h3>
                                        <div className="flex items-center gap-2 text-slate-600 mt-1">
                                            <MapPin size={14} className="text-slate-400" />
                                            <span className="text-sm font-medium">{property.address?.formatted || property.land_details?.region_label || "Location Unspecified"}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 mt-4 border-t border-dashed border-gray-200 pt-3 w-full md:w-3/4">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Registered Area</p>
                                                <p className="text-sm font-bold text-slate-700">{property.geography?.area_sq_yards || property.area_sq_yards || 0} <span className="text-xs font-normal text-slate-500">sq.yd</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Current Value</p>
                                                <p className="text-sm font-bold text-slate-700">₹{((property.pricing?.registered_value_lakhs || 0) * 100000).toLocaleString() || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Risk Status</p>
                                                <p className={`text-sm font-bold ${(property.legal?.kabja_risk_score > 60) ? 'text-red-600' : 'text-green-600'}`}>{property.legal?.kabja_risk_score > 60 ? 'High Risk' : 'Safe/Moderate'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        {property.documents?.length > 0 ? (
                                            <a href={`${API_BASE}${property.documents[0].url}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded border border-blue-100 text-sm font-bold hover:bg-blue-100 transition">
                                                <FileText size={16} /> View Deal
                                            </a>
                                        ) : (
                                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded border border-slate-100 text-sm font-bold cursor-not-allowed">
                                                <FileText size={16} /> No Docs
                                            </button>
                                        )}
                                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 rounded border border-red-200 text-sm font-bold hover:bg-red-50 transition">
                                            <Trash2 size={16} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

}
