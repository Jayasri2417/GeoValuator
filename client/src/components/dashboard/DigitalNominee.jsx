import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, Check, X, Bell } from 'lucide-react';

export default function DigitalNominee({ isOpen, onClose }) {
    const [nominees, setNominees] = useState([
        { id: 1, name: "Arjun Varma", relation: "Son", phone: "+91 98765 43210", status: "Verified" }
    ]);
    const [newNominee, setNewNominee] = useState({ name: '', relation: '', phone: '' });
    const [step, setStep] = useState('list'); // list, add

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newNominee.name || !newNominee.phone) return;
        setNominees([...nominees, { ...newNominee, id: Date.now(), status: "Pending Verification" }]);
        setNewNominee({ name: '', relation: '', phone: '' });
        setStep('list');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="text-blue-400" /> Digital Nominee
                        </h2>
                        <p className="text-xs text-blue-200/60 mt-1">Secure Land Inheritance Protocol</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 'list' ? (
                        <>
                            <div className="space-y-4 mb-6">
                                {nominees.map(nominee => (
                                    <div key={nominee.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white">{nominee.name}</p>
                                            <p className="text-xs text-slate-400">{nominee.relation} • {nominee.phone}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${nominee.status === 'Verified'
                                                ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400'
                                                : 'bg-amber-900/30 border-amber-500/30 text-amber-400'
                                            }`}>
                                            {nominee.status}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep('add')}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition flex items-center justify-center gap-2 font-medium"
                            >
                                <UserPlus size={18} /> Add Trusted Nominee
                            </button>

                            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                                <div className="flex gap-3">
                                    <Bell className="text-blue-400 shrink-0" size={20} />
                                    <p className="text-xs text-blue-200/80 leading-relaxed">
                                        Nominees will receive instant alerts if <strong>Sentinel AI</strong> detects critical risks like unauthorized fencing or ownership disputes on your lands.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase font-bold">Full Name</label>
                                <input
                                    type="text"
                                    value={newNominee.name}
                                    onChange={e => setNewNominee({ ...newNominee, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                                    placeholder="Enter nominee name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase font-bold">Relationship</label>
                                <select
                                    value={newNominee.relation}
                                    onChange={e => setNewNominee({ ...newNominee, relation: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">Select Relation</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Son">Son</option>
                                    <option value="Daughter">Daughter</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Legal Advisor">Legal Advisor</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase font-bold">Phone Number</label>
                                <input
                                    type="tel"
                                    value={newNominee.phone}
                                    onChange={e => setNewNominee({ ...newNominee, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                                    placeholder="+91"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setStep('list')}
                                    className="flex-1 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition font-bold"
                                >
                                    Add Nominee
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
