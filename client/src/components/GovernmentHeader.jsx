import React from 'react';
import { Shield, Info, Phone, Calendar, Menu } from 'lucide-react';

const GovernmentHeader = () => {
  return (
    <div className="w-full font-sans">
      {/* 1. Top Utility Bar (Dark Blue) */}
      <div className="bg-[#1e3a8a] text-white text-[10px] md:text-xs py-1 px-4 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">Government of India</span>
          <span>|</span>
          <span className="hover:underline cursor-pointer">Ministry of Land & Revenue</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Skip to Main Content</a>
          <span>|</span>
          <a href="#" className="hover:underline flex items-center gap-1"><Info size={12} /> Accessibility</a>
          <span>|</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. Scrolling Ticker (Marquee) */}
      <div className="bg-[#d97706] text-white text-sm py-2 overflow-hidden relative flex items-center">
        <div className="bg-[#b45309] px-4 py-2 z-10 font-bold uppercase text-xs tracking-wider absolute left-0 h-full flex items-center shadow-md">
          Latest Updates
        </div>
        <div className="whitespace-nowrap animate-marquee pl-32">
          <span className="mx-8">• 📢 New Land Regularization Scheme (LRS) deadline extended to March 31st, 2026.</span>
          <span className="mx-8">• ⚠️ Alert: Report unauthorized encroachments via the new AI-powered mobile app.</span>
          <span className="mx-8">• 🚜 PM-Kisan Samman Nidhi inputs are now integrated with GeoValuator for faster processing.</span>
          <span className="mx-8">• 📜 Digitization of revenue records in Telangana & Andhra Pradesh is 98% complete.</span>
        </div>
      </div>

      {/* 3. Main Branding Header (White) */}
      <div className="bg-white border-b-4 border-[#d97706] shadow-sm py-4 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Emblem Placeholder */}
          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="National Emblem" className="w-full h-full object-contain" />
          </div>
          
          <div className="flex flex-col">
             <h1 className="text-xl md:text-2xl font-bold text-[#1e3a8a] serif tracking-wide leading-none">
               GeoValuator <span className="text-sm align-top text-[#d97706] ml-1">Beta</span>
             </h1>
             <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider mt-1">
               National Land Intelligence & Valuation Grid
             </p>
          </div>
        </div>

        {/* Right Side: G20 / Swachh Bharat / Validations (Placeholders) */}
        <div className="hidden md:flex items-center gap-6">
           <div className="text-right hidden lg:block">
              <p className="text-xs text-gray-500 font-semibold">Toll Free Helpline</p>
              <p className="text-lg font-bold text-[#1e3a8a] flex items-center justify-end gap-2">
                <Phone size={16} /> 1800-11-LAND
              </p>
           </div>
           <div className="h-10 w-[1px] bg-gray-300"></div>
           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/G20_India_2023_logo.svg/2560px-G20_India_2023_logo.svg.png" alt="G20" className="h-10 object-contain opacity-80" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Digital India" className="h-8 object-contain opacity-80" />
        </div>
        
        {/* Mobile Menu Toggle */}
         <button className="md:hidden text-[#1e3a8a]">
            <Menu size={24} />
         </button>
      </div>
    </div>
  );
};

export default GovernmentHeader;
