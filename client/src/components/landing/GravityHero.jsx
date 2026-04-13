import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, TrendingUp, Search, Building2, FileText, CheckCircle, Activity, Globe } from "lucide-react";
import { motion } from "framer-motion";

const GravityHero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 flex content-center items-center justify-center min-h-[85vh] overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-blue-50 to-slate-50 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        {/* Animated Orbs/Glows for "Attractiveness" */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container relative mx-auto px-4 z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-govBlue text-xs font-bold uppercase tracking-widest mb-8 shadow-legal hover:shadow-md transition cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live National Land Grid
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-slate-900 leading-tight mb-8 tracking-tight"
          >
            Secure Land <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-govBlue to-blue-600">Intelligence</span> &
            <span className="relative inline-block ml-4">
              Protection
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-govGold opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg md:text-2xl text-slate-600 max-w-4xl leading-relaxed font-light"
          >
            Advanced satellite monitoring, <span className="font-semibold text-slate-800">Gemini AI</span> risk analysis, and fraud detection for a transparent and secure real estate ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row gap-6"
          >
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-govBlue text-white text-lg font-bold rounded-lg shadow-lg hover:bg-blue-900 transition flex items-center gap-3 transform hover:-translate-y-1"
            >
              Access Dashboard <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-govBlue border border-blue-200 text-lg font-bold rounded-lg shadow-sm hover:shadow-md hover:border-govBlue transition flex items-center gap-3 transform hover:-translate-y-1"
            >
              <Globe size={20} /> Public Map
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition duration-500"
          >
            {/* Placeholders for logos if we had them, simple text for now */}
            <span className="text-sm font-semibold text-slate-400">Trusted by:</span>
            <span className="text-sm font-bold text-slate-500">Revenue Dept.</span>
            <span className="text-sm font-bold text-slate-500">Survey of India</span>
            <span className="text-sm font-bold text-slate-500">Municipal Corp.</span>
          </motion.div>
        </div>
      </section>

      {/* --- STATISTICS STRIP --- */}
      <div className="w-full bg-[#1e3a8a] text-white py-16 border-t-8 border-govGold relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl relative mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-800/50">
          <Stat number="1.2M+" label="Acres Monitored" icon={<Globe size={20} className="mb-2 mx-auto text-blue-300" />} />
          <Stat number="9,400+" label="Fraud Cases Detected" icon={<ShieldCheck size={20} className="mb-2 mx-auto text-blue-300" />} />
          <Stat number="24/7" label="Satellite Surveillance" icon={<Activity size={20} className="mb-2 mx-auto text-blue-300" />} />
          <Stat number="100%" label="Legal Compliance" icon={<CheckCircle size={20} className="mb-2 mx-auto text-blue-300" />} />
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50 rounded-tr-full opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Core Capabilities</h2>
            <div className="w-24 h-1.5 bg-govGold mx-auto rounded-full"></div>
            <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-lg">
              Leveraging <span className="text-govBlue font-semibold">Gemini AI</span> and <span className="text-govBlue font-semibold">Sentinel Satellite Data</span> for unmatched land security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Search className="text-white" size={28} />}
              title="Smart Land Search"
              desc="Instant retrieval of survey records, legal status, and market history using survey numbers."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={<TrendingUp className="text-white" size={28} />}
              title="Value Forecasting"
              desc="AI-driven price prediction models based on infrastructure developments and market trends."
              color="bg-green-600"
            />
            <FeatureCard
              icon={<FileText className="text-white" size={28} />}
              title="Digital Evidence"
              desc="Generate court-ready PDFs with timestamped satellite imagery logs for legal disputes."
              color="bg-amber-600"
            />
            <FeatureCard
              icon={<ShieldCheck className="text-white" size={28} />}
              title="Kabja Prevention"
              desc="Real-time alerts for unauthorized boundary changes or construction activities."
              color="bg-red-600"
            />
            <FeatureCard
              icon={<Building2 className="text-white" size={28} />}
              title="Zoning Compliance"
              desc="Automated verification of land usage against official master plans."
              color="bg-purple-600"
            />
            <FeatureCard
              icon={<CheckCircle className="text-white" size={28} />}
              title="Ownership Verification"
              desc="Blockchain-ready secure record verification system."
              color="bg-teal-600"
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-16 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">GeoValuator</h4>
            <p className="text-sm leading-relaxed mb-6">The official unified platform for land intelligence and protection. Empowering citizens with transparent data.</p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              <div className="w-8 h-8 rounded bg-slate-800 hover:bg-govBlue transition cursor-pointer"></div>
              <div className="w-8 h-8 rounded bg-slate-800 hover:bg-govBlue transition cursor-pointer"></div>
              <div className="w-8 h-8 rounded bg-slate-800 hover:bg-govBlue transition cursor-pointer"></div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition">Services</a></li>
              <li><a href="#" className="hover:text-white transition">Public Reports</a></li>
              <li><a href="#" className="hover:text-white transition">Grievance Redressal</a></li>
              <li><a href="#" className="hover:text-white transition">Citizen Charter</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition">Disclaimer</a></li>
              <li><a href="#" className="hover:text-white transition">Right to Information</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Contact</h4>
            <p className="mb-2">Helpline: <span className="text-white font-bold">1800-GEO-HELP</span></p>
            <p className="mb-4">Email: support@geovaluator.gov.in</p>
            <button className="w-full py-2 bg-slate-800 hover:bg-govBlue text-white rounded transition">
              Contact Support
            </button>
          </div>
        </div>
        <div className="text-center flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4">
          <p>© 2026 GeoValuator. An Official Land Intelligence Initiative.</p>
          <p className="mt-2 md:mt-0">Built with ❤️ for Digital India</p>
        </div>
      </footer>
    </div>
  );
};

const Stat = ({ number, label, icon }) => (
  <div className="hover:transform hover:scale-105 transition duration-300">
    {icon}
    <p className="text-4xl md:text-5xl font-bold text-white mb-2 font-sans">{number}</p>
    <p className="text-blue-200 uppercase text-[10px] md:text-xs tracking-widest font-semibold">{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="group p-8 rounded-xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
    <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center shadow-md mb-6 transform group-hover:rotate-6 transition duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 font-serif group-hover:text-govBlue transition">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default GravityHero;
