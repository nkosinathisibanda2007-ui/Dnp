import React, { useState } from 'react';
import { MapPin, ExternalLink, ShieldCheck, Compass, Layers, Info, CheckCircle2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { FarmLocation } from '../types';

interface ZimbabweMapProps {
  onSelectLocation?: (location: FarmLocation) => void;
  className?: string;
  showFullDetailsCard?: boolean;
}

export const ZimbabweMap: React.FC<ZimbabweMapProps> = ({
  onSelectLocation,
  className = '',
  showFullDetailsCard = true,
}) => {
  const { data, openEnquiryModal, setIsAdminOpen } = useCms();
  const [selectedLocId, setSelectedLocId] = useState<string>(data.locations[0]?.id || 'loc-norton');
  const [mapMode, setMapMode] = useState<'cartographic' | 'satellite_embed'>('cartographic');

  const selectedLocation = data.locations.find((l) => l.id === selectedLocId) || data.locations[0];

  const handlePinClick = (loc: FarmLocation) => {
    setSelectedLocId(loc.id);
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  // Projected coordinates for stylized SVG of Zimbabwe (Bounding box: Lat -15.6 to -22.4, Lng 25.2 to 33.1)
  // X: (lng - 25.2) / (33.1 - 25.2) * 500
  // Y: (lat - (-15.6)) / (-22.4 - (-15.6)) * 420
  const projectCoords = (lat: number, lng: number) => {
    const minLng = 25.0;
    const maxLng = 33.3;
    const minLat = -15.4;
    const maxLat = -22.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 520;
    const y = ((lat - minLat) / (maxLat - minLat)) * 440;
    return { x: Math.max(30, Math.min(490, x)), y: Math.max(30, Math.min(410, y)) };
  };

  return (
    <div className={`relative bg-[#f8f7f2] border border-[#e2dcce] rounded-2xl overflow-hidden shadow-xs ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#e2dcce] bg-[#faf9f5]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#996f2a]">
            <Compass className="w-3.5 h-3.5" />
            <span>Operational Geography • Zimbabwe</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#18261b] mt-0.5">
            Growing Across Zimbabwe
          </h3>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ede8d8] rounded-lg border border-[#ded8c4] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMapMode('cartographic')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mapMode === 'cartographic'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#57503f] hover:text-[#1b2e20]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Regional Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMapMode('satellite_embed')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mapMode === 'satellite_embed'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#57503f] hover:text-[#1b2e20]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google Maps View</span>
          </button>
        </div>
      </div>

      {/* Main Map & Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Map Canvas Column */}
        <div className="lg:col-span-7 bg-[#f3f0e6] relative min-h-[380px] sm:min-h-[460px] p-4 sm:p-6 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-[#e2dcce]">
          {/* Subtle background grid */}
          <div className="absolute inset-0 bg-subtle-lines opacity-70 pointer-events-none" />

          {mapMode === 'cartographic' ? (
            <div className="relative w-full max-w-[500px] aspect-[520/440]">
              {/* Stylized Zimbabwe National SVG outline */}
              <svg
                viewBox="0 0 520 440"
                className="w-full h-full drop-shadow-md"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simplified realistic contour of Zimbabwe */}
                <path
                  d="M 120,40 
                     C 160,30 240,40 280,60 
                     C 320,50 370,70 410,110 
                     C 440,140 450,180 430,220 
                     C 450,260 460,310 430,350 
                     C 400,380 340,395 300,410 
                     C 250,420 200,410 160,380 
                     C 120,350 90,320 80,270 
                     C 60,230 40,190 70,140 
                     C 90,100 95,60 120,40 Z"
                  fill="#e5dfcb"
                  stroke="#c5baa0"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Regional Agricultural Natural Region bands (subtle decorative paths) */}
                <path
                  d="M 180,65 C 260,75 340,90 390,135"
                  stroke="#9a8e70"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <path
                  d="M 110,160 C 220,180 320,200 420,240"
                  stroke="#9a8e70"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <path
                  d="M 90,260 C 200,270 290,290 360,340"
                  stroke="#9a8e70"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />

                {/* Major Urban anchors (Harare & Bulawayo reference points) */}
                <g opacity="0.6">
                  <circle cx="345" cy="135" r="3.5" fill="#6d6550" />
                  <text x="354" y="139" fontSize="10" fontFamily="sans-serif" fill="#6d6550" fontWeight="600">
                    Harare
                  </text>

                  <circle cx="170" cy="275" r="3.5" fill="#6d6550" />
                  <text x="178" y="279" fontSize="10" fontFamily="sans-serif" fill="#6d6550" fontWeight="600">
                    Bulawayo
                  </text>
                </g>

                {/* Connecting corridors between Dzinopona Farming Hubs */}
                <path
                  d="M 320,145 L 290,215 L 180,285 L 175,270"
                  stroke="#c48a39"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />

                {/* Map Legend on bottom left */}
                <g transform="translate(16, 360)">
                  <rect width="130" height="52" rx="6" fill="#f5f2e8" stroke="#ded8c4" strokeWidth="1" />
                  <circle cx="12" cy="16" r="4" fill="#1b2e20" />
                  <text x="22" y="19" fontSize="9.5" fill="#3a3427" fontWeight="500">
                    Dzinopona Hub
                  </text>
                  <line x1="8" y1="36" x2="18" y2="36" stroke="#c48a39" strokeWidth="2" strokeDasharray="2 2" />
                  <text x="24" y="39" fontSize="9.5" fill="#6a6350">
                    Supply Network
                  </text>
                </g>
              </svg>

              {/* Interactive Location Pins placed precisely over SVG coordinates */}
              {data.locations.map((loc) => {
                const pos = projectCoords(loc.coordinates.lat, loc.coordinates.lng);
                const isSelected = loc.id === selectedLocId;

                return (
                  <div
                    key={loc.id}
                    style={{ left: `${(pos.x / 520) * 100}%`, top: `${(pos.y / 440) * 100}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                    onClick={() => handlePinClick(loc)}
                  >
                    {/* Pulsing ring for selected pin */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-[#c48a39]/30 animate-ping pointer-events-none" />
                    )}

                    <div
                      className={`relative flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'w-9 h-9 bg-[#1b2e20] text-white shadow-lg scale-110 ring-4 ring-[#c48a39]/40 rounded-full'
                          : 'w-7 h-7 bg-[#faf9f5] text-[#1b2e20] shadow-md hover:scale-105 border-2 border-[#1b2e20] rounded-full'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#e5a952]' : 'text-[#1b2e20]'}`} />
                    </div>

                    {/* Pin Label tooltip */}
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shadow-sm pointer-events-none transition-all ${
                        isSelected
                          ? 'bg-[#1b2e20] text-[#faf9f5] opacity-100 z-30'
                          : 'bg-[#faf9f5]/90 text-[#302b1f] border border-[#ded8c4] opacity-80 group-hover:opacity-100'
                      }`}
                    >
                      {loc.name}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Google Maps Preview Embed based on current selected coordinates */
            <div className="w-full h-full min-h-[380px] rounded-xl overflow-hidden border border-[#ded8c4] shadow-inner relative">
              <iframe
                title={`Google Map - ${selectedLocation.name} Hub`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}&z=11&output=embed`}
                className="w-full h-full min-h-[380px]"
              />
              <div className="absolute bottom-3 left-3 bg-[#1b2e20]/90 text-white text-[11px] px-3 py-1.5 rounded-md backdrop-blur-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d39c4a]" />
                <span>Showing regional vicinity of {selectedLocation.name} Hub</span>
              </div>
            </div>
          )}

          {/* Legal / Data notice pill strictly enforcing prompt guideline */}
          <div className="absolute bottom-3 right-3 max-w-xs bg-[#faf9f5]/95 border border-[#ded8c4] px-3 py-1.5 rounded-lg shadow-xs text-[10px] text-[#69614e] backdrop-blur-xs">
            <div className="flex items-center gap-1.5 font-medium text-[#18261b]">
              <Info className="w-3 h-3 text-[#9a7029]" />
              <span>Confirmed Regional Hubs</span>
            </div>
            <p className="mt-0.5 leading-tight">
              Precise farm perimeter boundaries and GPS gate coordinates are CMS-managed upon client verification.
            </p>
          </div>
        </div>

        {/* Selected Location Details Panel */}
        {showFullDetailsCard && (
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-[#faf9f5]">
            <div className="space-y-4">
              {/* Location selector pills */}
              <div className="flex flex-wrap gap-1.5">
                {data.locations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handlePinClick(loc)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      loc.id === selectedLocId
                        ? 'bg-[#1b2e20] text-[#faf9f5] shadow-xs'
                        : 'bg-[#ede8d8] text-[#554e3d] hover:bg-[#e4ddc9]'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>

              {/* Active Hub Title & Regional details */}
              <div className="pt-1 border-t border-[#e2dcce]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#996f2a]">
                    {selectedLocation.province}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#526356] bg-[#eef3ee] px-2 py-0.5 rounded border border-[#d6e3d6]">
                    <ShieldCheck className="w-3 h-3 text-[#2a6838]" />
                    Strategic Hub
                  </span>
                </div>
                <h4 className="text-2xl font-serif font-bold text-[#142217] mt-1">
                  {selectedLocation.name} Farming Hub
                </h4>
                <p className="text-xs text-[#6e6858] font-medium mt-0.5">
                  {selectedLocation.agroEcologicalZone}
                </p>
              </div>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-[#3a443c] leading-relaxed">
                {selectedLocation.summary}
              </p>

              {/* Primary Focus Areas */}
              <div className="space-y-2 pt-2 border-t border-[#e2dcce]">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#18261b]">
                  Core Operational Focus
                </h5>
                <ul className="space-y-1.5">
                  {selectedLocation.primaryFocus.map((focus, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-[#2c382f]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#a8742b] shrink-0 mt-0.5" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Infrastructure */}
              <div className="p-3 rounded-lg bg-[#f3efe4] border border-[#ded7c4] text-xs text-[#524b3c]">
                <span className="font-semibold text-[#18261b] block mb-0.5">Infrastructure Deployed:</span>
                {selectedLocation.infrastructureOverview}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-5 border-t border-[#e2dcce] flex flex-wrap items-center justify-between gap-3 mt-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#7d581f] hover:text-[#523912] transition-colors underline underline-offset-4"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(true)}
                  className="px-2.5 py-1.5 text-xs text-[#605847] hover:text-[#18261b] border border-[#ded8c4] rounded-md hover:bg-[#ede8d8] transition-colors"
                >
                  Edit in CMS
                </button>
                <button
                  type="button"
                  onClick={() => openEnquiryModal('partnership', `${selectedLocation.name} Hub Partnership`)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1b2e20] hover:bg-[#122016] rounded-md shadow-xs transition-colors"
                >
                  Enquire for {selectedLocation.name}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
