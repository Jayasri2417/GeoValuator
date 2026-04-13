import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Loader, Shield, Lock, Download } from 'lucide-react';

export default function EvidenceGenerator({ isOpen, onClose, landId }) {
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);

    const STAGES = [
        "Initializing Secure Context...",
        "Fetching Satellite Historical Archives...",
        "Validating Geo-Coordinates...",
        "Compiling Timeline Events...",
        "Digitally Signing Document...",
        "Finalizing Court-Ready PDF..."
    ];

    useEffect(() => {
        if (isOpen) {
            setProgress(0);
            setStage(0);

            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        const stageIndex = Math.min(Math.floor(progress / (100 / STAGES.length)), STAGES.length - 1);
        setStage(stageIndex);
    }, [progress]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative"
            >
                {/* Background Grid Animation */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <div className="p-8 relative z-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 relative">
                            {progress < 100 ? (
                                <Loader className="text-blue-400 animate-spin" size={32} />
                            ) : (
                                <CheckCircle className="text-emerald-400" size={32} />
                            )}
                            {progress < 100 && (
                                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full border-t-blue-500 animate-spin"></div>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {progress < 100 ? "Generating Evidence" : "Evidence Ready"}
                        </h2>
                        <p className="text-slate-400 text-sm">Property ID: <span className="text-mono text-blue-300">{landId}</span></p>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-xs mb-8">
                        <span className="text-blue-300 font-mono">{progress}%</span>
                        <span className="text-slate-400 italic">{STAGES[stage]}</span>
                    </div>

                    {/* Security Badge */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4 mb-6">
                        <Shield className="text-emerald-500 shrink-0" size={24} />
                        <div>
                            <p className="text-white font-bold text-sm">Blockchain Verified</p>
                            <p className="text-xs text-slate-500">This document is cryptographically signed and admissible in legal proceedings.</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {progress < 100 ? (
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition font-medium"
                            >
                                Cancel Generation
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    window.open(`/api/generate-evidence/${landId}`, '_blank');
                                    onClose();
                                }}
                                className="w-full py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50"
                            >
                                <Download size={18} /> Download Protected PDF
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
