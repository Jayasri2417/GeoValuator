// 📂 Path: client/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck, FileText, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats] = useState({
    lhi: 88,
    risk: "Safe",
    price: 4500000,
    alerts: [],
    history: [4200000, 4300000, 4350000, 4420000, 4500000]
  });

  const landCoords = [
    [17.3850, 78.4867],
    [17.3855, 78.4867],
    [17.3855, 78.4872],
    [17.3850, 78.4872]
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Land Value (INR)',
      data: stats.history,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-[#1B4D3E] text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8" />
          <h1 className="text-2xl font-bold font-serif">GeoValuator</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs bg-green-500 px-2 py-1 rounded">SECURE CONNECTION</span>
          <div className="h-8 w-8 bg-gray-200 rounded-full text-[#1B4D3E] flex items-center justify-center font-bold">U</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4 h-[500px] border border-gray-200 relative">
          <div className="absolute top-4 right-4 z-[400] bg-white/90 p-2 rounded shadow text-xs">
            <p className="font-bold text-[#1B4D3E]">📡 LIVE SATELLITE FEED</p>
            <p>Geo-Fence: <span className="text-green-600">ACTIVE</span></p>
          </div>
          <MapContainer center={[17.3852, 78.4869]} zoom={18} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
            <TileLayer url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
            <Polygon positions={landCoords} pathOptions={{ color: '#F39C12', fillColor: '#F39C12', fillOpacity: 0.3 }} />
          </MapContainer>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border-t-4 border-[#1B4D3E]">
            <h3 className="text-gray-600 font-bold flex items-center"><Activity className="w-5 h-5 mr-2" /> Land Health Index</h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-5xl font-bold text-[#1B4D3E]">{stats.lhi}</span>
              <div className="text-right">
                <p className="text-green-600 font-bold text-lg">{stats.risk}</p>
                <p className="text-xs text-gray-400">AI Confidence: 98%</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#1B4D3E] h-2 rounded-full" style={{ width: `${stats.lhi}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Current Valuation</p>
            <h2 className="text-3xl font-bold text-gray-800">₹ {(stats.price).toLocaleString()}</h2>
            <div className="h-32 mt-4">
              <Line data={chartData} options={{ plugins: { legend: false }, scales: { x: { display: false }, y: { display: false } } }} />
            </div>
          </div>

          <button className="w-full bg-[#2C3E50] text-white py-3 rounded-lg font-bold shadow hover:bg-[#1a252f] flex items-center justify-center">
            <FileText className="w-5 h-5 mr-2" /> Generate Legal Evidence PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
