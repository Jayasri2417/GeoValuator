import React from 'react';
import { MapContainer, TileLayer, useMap, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapController = ({ coords }) => {
    const map = useMap();
    React.useEffect(() => {
        if (coords) {
            map.flyTo(coords, 18, { duration: 1.5 });
        }
    }, [coords, map]);
    return null;
};

function getRiskColor(land) {
    const risk = land.legal?.kabja_risk_score ?? land.kabja_risk_score ?? 0;
    if (risk > 60) return '#DC2626';
    if (risk >= 30) return '#F59E0B';
    return '#10B981';
}

const createColoredIcon = (color) => {
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

const getDeterministicHash = (id) => {
    let hash = 0;
    const str = String(id || Math.random());
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    // MurmurHash3 avalanche mixer to destroy linear correlation for sequential IDs (SRV-1, SRV-2, etc.)
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return Math.abs(hash);
};

const INITIAL_CENTER = [16.15, 80.52]; // Regional View
const INITIAL_ZOOM = 10;

export default function MapCanvas({ data, onSelectLand, selectedLand, navigationCoords, mapMode = 'dark', sentinelMode, showForSale }) {
    // Safety check for data
    const lands = Array.isArray(data) ? data : [];

    return (
        <div className="w-full h-full relative bg-gray-900 z-0 overflow-hidden">
            <MapContainer
                center={INITIAL_CENTER}
                zoom={INITIAL_ZOOM}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <MapController coords={navigationCoords} />

                {/* Base Map Layers */}
                {mapMode === 'dark' && (
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='CARTO'
                    />
                )}

                {mapMode === 'satellite' && (
                    <TileLayer
                        url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                        attribution='Google Maps Hybrid'
                        maxZoom={20}
                    />
                )}

                {mapMode === 'streets' && (
                    <TileLayer
                        url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
                        attribution='Google Maps Streets'
                        maxZoom={20}
                    />
                )}

                {lands.map((land, index) => {
                    let lat = parseFloat(land.latitude || land.geography?.lat || land.location?.coordinates?.[1]);
                    let lng = parseFloat(land.longitude || land.geography?.lng || land.location?.coordinates?.[0]);

                    if ((isNaN(lat) || isNaN(lng)) && Array.isArray(land.coordinates)) {
                        if (land.coordinates[0] > 40) {
                            lng = land.coordinates[0];
                            lat = land.coordinates[1];
                        } else {
                            lat = land.coordinates[0];
                            lng = land.coordinates[1];
                        }
                    }

                    if (isNaN(lat) || isNaN(lng)) return null;

                    // Apply a deterministic spread using a polar coordinate approach for an even cloud
                    const uniqueId = land._id || land.survey_number || land.property_id || index;
                    const hash = getDeterministicHash(uniqueId);
                    
                    // Use modulo to extract pseudo-random angle (0-359 degrees) and radius (0.001 to 0.008)
                    const angle = (hash % 360) * (Math.PI / 180);
                    const radius = (((hash / 360) | 0) % 100) / 100 * 0.008; // between 0 and 0.008
                    
                    lat += radius * Math.cos(angle);
                    lng += radius * Math.sin(angle);

                    const riskScore = land.legal?.kabja_risk_score ?? land.kabja_risk_score ?? 0;
                    const markerColor = getRiskColor(land);

                    return (
                        <Marker
                            key={uniqueId}
                            position={[lat, lng]}
                            icon={createColoredIcon(markerColor)}
                            eventHandlers={{
                                click: (e) => {
                                    L.DomEvent.stopPropagation(e);
                                    onSelectLand(land);
                                }
                            }}
                        >
                            <Popup>
                                <div className="p-1 font-sans min-w-[150px]">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2 mb-2">
                                        <img
                                            src={land.owner_photo || "https://ui-avatars.com/api/?name=" + (land.owner_name || 'Unknown')}
                                            alt={land.owner_name || 'Unknown'}
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        />
                                        <div>
                                            <p className="font-bold text-xs text-gray-900 leading-tight">{land.owner_name || 'Unknown'}</p>
                                            <p className="text-[10px] text-gray-500">{land.owner_id || "ID: UNKNOWN"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Survey No:</span>
                                            <span className="font-mono font-medium">{land.survey_number || land.survey_no || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Risk Score:</span>
                                            <span className="font-bold">{riskScore}/100</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Overlay Title */}
            <div className="absolute top-4 right-4 pointer-events-none z-[1000] flex flex-col gap-2 items-end">
                <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 shadow-xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Bapatla Land Intelligence
                    </h2>
                    <div className="flex gap-4 text-xs mt-1">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Safe (&lt;30)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Moderate (30-60)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> High Risk (&gt;60)</span>
                    </div>
                </div>

                {sentinelMode && (
                    <div className="bg-amber-500/90 backdrop-blur-md px-3 py-1.5 rounded border border-amber-600 shadow-lg animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Guardian Active</span>
                    </div>
                )}
            </div>

            {/* Guardian Scanning Effect Overlay */}
            {sentinelMode && (
                <div className="absolute inset-0 pointer-events-none z-[500] overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>
                    <div className="absolute top-[-100%] left-0 w-full h-[50%] bg-gradient-to-b from-transparent via-amber-400/20 to-transparent animate-scan-slow"></div>
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(245,158,11,0.2)]"></div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan-slow {
                    0% { top: -100%; }
                    100% { top: 200%; }
                }
                .animate-scan-slow {
                    animation: scan-slow 8s linear infinite;
                }
            `}} />
        </div>
    );
}
