import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Upload, X, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

export default function ReportActivity({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [reportType, setReportType] = useState(null);
    const [image, setImage] = useState(null);

    if (!isOpen) return null;

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setStep(3);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        setStep(4); // Success state
        setTimeout(() => {
            onClose();
            setStep(1);
            setReportType(null);
            setImage(null);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" /> Report Activity
                    </h2>
                    <button onClick={onClose}><X className="text-slate-500 hover:text-white" /></button>
                </div>

                <div className="p-6">
                    {/* Step 1: Select Type */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm mb-4">What kind of suspicious activity did you observe?</p>
                            {[
                                { id: 'encroachment', label: 'Illegal Encroachment', icon: <MapPin /> },
                                { id: 'construction', label: 'Unauthorized Construction', icon: <Shield /> },
                                { id: 'dumping', label: 'Waste Dumping', icon: <AlertTriangle /> }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => { setReportType(type.id); setStep(2); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-left group"
                                >
                                    <div className="p-3 rounded-full bg-slate-900 text-blue-400 group-hover:scale-110 transition">{type.icon}</div>
                                    <span className="font-bold text-slate-200">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Camera/Upload */}
                    {step === 2 && (
                        <div className="text-center space-y-6">
                            <div className="w-full h-48 bg-slate-950 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center group hover:border-blue-500 transition cursor-pointer relative overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <Camera size={48} className="text-slate-600 group-hover:text-blue-500 mb-2 transition" />
                                <p className="text-slate-400 text-sm font-medium">Tap to Take Photo</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white text-sm">Go Back</button>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && image && (
                        <div className="space-y-4">
                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-600">
                                <img src={image} alt="Evidence" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-white text-center">
                                    Geo-Tag: 15.912° N, 80.474° E
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg shadow-lg shadow-amber-900/20 transition"
                            >
                                Submit Report
                            </button>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-8 space-y-4">
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle size={40} />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white">Report Submitted</h3>
                            <p className="text-slate-400 text-sm">Thank you for helping secure the community.<br />You earned <span className="text-amber-400 font-bold">+50 Citizen Points</span>.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
