import React, { useState } from 'react';
import { Search, MapPin, History, Hash, Globe, X, Loader, FileText, ShieldCheck, DollarSign } from 'lucide-react';

const LandSearch = ({ onSelectLand = () => { }, onNavigate = () => { } }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // Search Mode: 'location' or 'property'
  const [searchMode, setSearchMode] = useState('location');
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'history'


  const searchHistory = [
    { query: 'Karlapalem', type: 'location', time: '2 hours ago', results: 8 },
    { query: 'SR_9281', type: 'property', time: 'Yesterday', results: 1 },
    { query: 'Stuartpuram', type: 'location', time: '3 days ago', results: 12 },
  ];

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://geovaluator-backend.onrender.com';

  const handleSearch = async (queryOverride) => {
    const q = (typeof queryOverride === 'string' ? queryOverride : searchQuery).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResults([]);
    setShowResults(true);

    try {
      let data = [];
      let mode = searchMode;

      // Auto-detect survey number pattern if in location mode
      if (searchMode === 'location' && /^(srv|plt|num|survey|crda|gnt)-/i.test(q)) {
        mode = 'property';
        setSearchMode('property'); // Switch UI to property mode
      }

      if (mode === 'location') {
        const resp = await fetch(`${API_BASE}/api/geocode/search?q=${encodeURIComponent(q)}&limit=10`);
        if (!resp.ok) throw new Error('Location search failed');
        data = await resp.json();
        // Tag results
        if (Array.isArray(data)) {
          data = data.map(item => ({ ...item, _resultType: 'location' }));
        } else {
          data = [];
        }
      } else {
        const resp = await fetch(`${API_BASE}/api/land/search?q=${encodeURIComponent(q)}`);
        if (!resp.ok) throw new Error('Property search failed');
        const json = await resp.json();
        const items = json.results || json || [];
        // Tag results
        if (Array.isArray(items)) {
          data = items.map(item => ({ ...item, _resultType: 'property' }));
        } else {
          data = [];
        }
      }

      setResults(data);
    } catch (err) {
      console.error(err);
      setError(`Failed to search ${searchMode}.`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = async (item) => {
    if (item._resultType === 'location') {
      // Logic for Location Result
      const coords = [Number(item.lat), Number(item.lon)];
      let estimate = null;
      try {
        const estResp = await fetch(`${API_BASE}/api/market/estimate?lat=${item.lat}&lon=${item.lon}`);
        if (estResp.ok) estimate = await estResp.json();
      } catch (e) { }

      onSelectLand({
        id: item.id,
        location: item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        survey_no: 'N/A',
        address: item.display_name,
        price: estimate?.available ? 'Estimated' : '—',
        status: 'Unregistered',
        coords,
        estimate
      });
      onNavigate(coords);

    } else {
      // Logic for Property Result
      const coords = item.coordinates
        ? [item.coordinates.lat, item.coordinates.lng]
        : item.location?.coordinates
          ? [item.location.coordinates[1], item.location.coordinates[0]] // GeoJSON is LngLat
          : null;

      onSelectLand({
        id: item.id || item._id || item.property_id,
        latitude: coords ? coords[0] : null,
        longitude: coords ? coords[1] : null,
        survey_no: item.survey_no || item.survey_number || 'N/A',
        location: item.location_name || item.address?.formatted || item.address || '—',
        address: item.address?.formatted || item.address || '—',
        owner: item.owner_name || item.owner || '—',
        area: item.area_sqyd ? `${item.area_sqyd} sq.yd` : '—',
        price: item.sale_price || item.current_value ? `₹ ${Number(item.current_value).toLocaleString('en-IN')}` : '—',
        status: item.risk_level || 'Registered',
        risk_score: item.kabja_risk_score,
        encumbrance: item.encumbrance_status,
        coords
      });
      if (coords) onNavigate(coords);
    }
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Tabs: Search vs History */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'search' ? 'border-govBlue text-govBlue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Search
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'history' ? 'border-govBlue text-govBlue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          History
        </button>
      </div>

      {/* SEARCH PANEL */}
      {activeTab === 'search' && (
        <div className="p-4 flex flex-col flex-1 overflow-hidden">

          {/* Search Type Toggle */}
          <div className="flex bg-gray-200 rounded-lg p-1 mb-4 select-none">
            <button
              onClick={() => { setSearchMode('location'); setResults([]); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${searchMode === 'location' ? 'bg-white text-govBlue shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Globe size={14} /> Location
            </button>
            <button
              onClick={() => { setSearchMode('property'); setResults([]); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${searchMode === 'property' ? 'bg-white text-govBlue shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Hash size={14} /> Survey No.
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchMode === 'location' ? "Search city, area, landmark..." : "Enter survey no (e.g., SR_9281)..."}
              className="w-full pl-10 pr-12 py-3 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-govBlue focus:ring-1 focus:ring-govBlue shadow-sm text-sm font-medium transition-all"
            />
            {searchMode === 'location'
              ? <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              : <FileText className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
            }

            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-2 p-1.5 bg-govBlue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-[10px] text-gray-500 text-center mb-4">
            {searchMode === 'location'
              ? "Find any location on the map using Geocoding."
              : "Search official land records by Survey Number or Property ID."}
          </p>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            {!loading && !error && results.length === 0 && showResults && (
              <div className="text-center py-8 opacity-50">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">No results found.</p>
                <button onClick={() => { setSearchMode(searchMode === 'location' ? 'property' : 'location'); handleSearch(); }} className="mt-2 text-[10px] text-govBlue underline">
                  Try searching by {searchMode === 'location' ? 'Survey No.' : 'Location'}
                </button>
              </div>
            )}

            {results.map((item, i) => (
              <div
                key={i}
                onClick={() => handleSelectResult(item)}
                className="group bg-white p-3 rounded-lg border border-gray-200 hover:border-govBlue hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
              >
                {item._resultType === 'location' ? (
                  // Location Card
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">{item.display_name.split(',')[0]}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{item.display_name}</p>
                    </div>
                  </div>
                ) : (
                  // Property Card
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded text-indigo-600 font-bold text-xs border border-indigo-100">
                          {item.survey_no || item.survey_number}
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncated w-32 truncate">{item.location_name || item.location || 'Unknown'}</span>
                      </div>
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${(item.risk_level === 'High Risk' || (item.kabja_risk_score > 50))
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-green-50 text-green-600 border-green-100'
                        }`}>
                        {item.risk_level || (item.kabja_risk_score > 50 ? 'Risk' : 'Safe')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <DollarSign size={10} />
                        <span>{item.sale_price || item.current_value || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <ShieldCheck size={10} />
                        <span>{item.encumbrance_status || 'Clear'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY PANEL */}
      {activeTab === 'history' && (
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Searches</h3>
          <div className="space-y-2">
            {searchHistory.map((h, i) => (
              <div
                key={i}
                onClick={() => {
                  setActiveTab('search');
                  setSearchMode(h.type || 'location');
                  setSearchQuery(h.query);
                  handleSearch(h.query);
                }}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-govBlue hover:shadow-sm cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  {h.type === 'property'
                    ? <Hash size={16} className="text-indigo-400" />
                    : <Globe size={16} className="text-blue-400" />
                  }
                  <span className="text-sm font-medium text-slate-700">{h.query}</span>
                </div>
                <span className="text-[10px] text-gray-400">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandSearch;
