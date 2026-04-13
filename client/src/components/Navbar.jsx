import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onLoginClick, onLogout, isLoggedIn, user }) => {
  return (
    <nav className="bg-govBlue text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full shadow-legal">
                <ShieldCheck className="h-8 w-8 text-govBlue" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold tracking-wide">GeoValuator</h1>
                <p className="text-xs text-geoGold font-medium tracking-wider uppercase">Unified Land Intelligence</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end mr-4">
               <span className="text-xs text-gray-300">System Status</span>
               <div className="flex items-center space-x-1">
                 <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                 <span className="text-xs font-bold text-green-400">SECURE</span>
               </div>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center space-x-3 bg-govBlue/80 px-4 py-2 rounded-lg border border-geoGold/30">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-geoGold font-mono">{user?.id}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-geoBlue flex items-center justify-center border-2 border-white">
                  <span className="font-bold text-lg">{(user?.name || 'U').charAt(0)}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-white text-govBlue hover:bg-geoGold hover:text-white transition-all duration-300 px-4 py-2 rounded-md font-bold text-xs shadow-md border-b-4 border-gray-300 hover:border-yellow-600 active:translate-y-1 active:border-0"
                >
                  LOG OUT
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/register"
                  className="hidden sm:inline-block bg-govBlue/80 text-white border border-geoGold/40 px-5 py-2 rounded-md text-sm font-semibold hover:bg-geoBlue transition"
                >
                  REGISTER
                </Link>
                <button 
                  onClick={onLoginClick}
                  className="bg-white text-govBlue hover:bg-geoGold hover:text-white transition-all duration-300 px-6 py-2.5 rounded-md font-bold text-sm shadow-md border-b-4 border-gray-300 hover:border-yellow-600 active:translate-y-1 active:border-0"
                >
                  SECURE LOGIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
