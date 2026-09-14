// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { Maximize2, MapPin, ExternalLink } from 'lucide-react';
import { FarmLocation } from '../types';

interface GoogleMapsHubViewProps {
  locations: FarmLocation[];
  selectedLocId: string;
  onSelectLocation: (loc: FarmLocation) => void;
  className?: string;
}

// Check if string is a genuine Google Maps API key (at least 35 characters, begins with AIza)
const isValidGoogleMapsKey = (key?: string): boolean => {
  if (!key) return false;
  const trimmed = key.trim();
  // Valid Google Maps API keys are typically 39 chars starting with 'AIza'
  // Discard empty strings, defaults, and container placeholders like 'Vite'
  return trimmed.startsWith('AIza') && trimmed.length >= 35;
};

// Controller component to smoothly pan & zoom camera when selected location changes
const MapCameraController: React.FC<{
  targetLocation: FarmLocation;
  allLocations: FarmLocation[];
}> = ({ targetLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetLocation) return;
    map.panTo({
      lat: targetLocation.coordinates.lat,
      lng: targetLocation.coordinates.lng,
    });
    // Zoom in on the active agricultural hub
    map.setZoom(11);
  }, [map, targetLocation]);

  return null;
};

// Fallback embed when API key is missing or invalid
const GoogleMapsEmbedFallback: React.FC<{
  selectedLocation: FarmLocation;
  allLocations: FarmLocation[];
  onSelectLocation: (loc: FarmLocation) => void;
}> = ({ selectedLocation }) => {
  const [embedType, setEmbedType] = useState<'k' | 'p' | 'm'>('k'); // k: satellite/hybrid, p: terrain, m: standard roadmap

  return (
    <div className="relative w-full h-full min-h-[440px] flex flex-col bg-[#142217] rounded-xl overflow-hidden border border-[#ded8c4]">
      <iframe
        title={`Google Maps - ${selectedLocation.name} Farming Hub`}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={`https://maps.google.com/maps?q=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}&z=11&t=${embedType}&output=embed`}
        className="w-full h-full min-h-[400px] flex-1"
      />

      {/* Floating Active Hub Indicator (Top-Left) */}
      <div className="absolute top-3 left-3 bg-[#1b2e20]/95 text-white border border-[#e5a952]/40 px-3.5 py-2 rounded-lg backdrop-blur-md shadow-lg flex items-center gap-2.5 z-10 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-[#e5a952] animate-pulse" />
        <div>
          <span className="text-xs font-bold font-serif text-[#e5a952] block">
            {selectedLocation.name} Farming Hub
          </span>
          <span className="text-[11px] text-[#d8e5d9]">
            {selectedLocation.province} • GPS {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Map Layer Controls & External Link (Top-Right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <div className="bg-[#faf9f5]/95 backdrop-blur-md rounded-lg border border-[#ded8c4] p-1 flex items-center gap-1 shadow-md text-xs">
          <button
            type="button"
            onClick={() => setEmbedType('k')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              embedType === 'k'
                ? 'bg-[#1b2e20] text-white'
                : 'text-[#554e3d] hover:bg-[#ede8d8]'
            }`}
            title="Satellite photography"
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setEmbedType('p')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              embedType === 'p'
                ? 'bg-[#1b2e20] text-white'
                : 'text-[#554e3d] hover:bg-[#ede8d8]'
            }`}
            title="Topographic terrain"
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => setEmbedType('m')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              embedType === 'm'
                ? 'bg-[#1b2e20] text-white'
                : 'text-[#554e3d] hover:bg-[#ede8d8]'
            }`}
            title="Roadmap view"
          >
            Roadmap
          </button>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#faf9f5]/95 hover:bg-white text-[#1b2e20] border border-[#ded8c4] shadow-md text-[11px] font-medium backdrop-blur-md transition-colors"
          title="Open directions in Google Maps"
        >
          <ExternalLink className="w-3 h-3 text-[#996f2a]" />
          <span className="hidden sm:inline">Directions</span>
        </a>
      </div>
    </div>
  );
};

// Internal Interactive Map component (rendered within APIProvider)
const InteractiveGoogleMap: React.FC<{
  locations: FarmLocation[];
  selectedLocation: FarmLocation;
  selectedLocId: string;
  onSelectLocation: (loc: FarmLocation) => void;
  mapType: 'hybrid' | 'satellite' | 'roadmap' | 'terrain';
  setMapType: (type: 'hybrid' | 'satellite' | 'roadmap' | 'terrain') => void;
  onAuthFailure?: () => void;
}> = ({
  locations,
  selectedLocation,
  selectedLocId,
  onSelectLocation,
  mapType,
  setMapType,
  onAuthFailure,
}) => {
  const map = useMap();
  const apiStatus = useApiLoadingStatus();
  const [activeInfoLocId, setActiveInfoLocId] = useState<string | null>(selectedLocId);

  // If Google Maps API authentication fails, notify parent to immediately revert to embed
  useEffect(() => {
    if (apiStatus === APILoadingStatus.AUTH_FAILURE || apiStatus === APILoadingStatus.FAILED) {
      onAuthFailure?.();
    }
  }, [apiStatus, onAuthFailure]);

  // Sync info window when selected location changes externally
  useEffect(() => {
    setActiveInfoLocId(selectedLocId);
  }, [selectedLocId]);

  const handleFitAllHubs = useCallback(() => {
    if (!map || typeof google === 'undefined') return;
    const bounds = new google.maps.LatLngBounds();
    locations.forEach((loc) => {
      bounds.extend({ lat: loc.coordinates.lat, lng: loc.coordinates.lng });
    });
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [map, locations]);

  return (
    <div className="relative w-full h-full min-h-[460px]">
      <Map
        id="dzinopona-farm-map"
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: selectedLocation.coordinates.lat, lng: selectedLocation.coordinates.lng }}
        defaultZoom={11}
        gestureHandling="greedy"
        mapTypeId={mapType}
        disableDefaultUI={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%', minHeight: '460px' }}
      >
        <MapCameraController
          targetLocation={selectedLocation}
          allLocations={locations}
        />

        {/* Render Advanced Markers for all 4 Dzinopona farming hubs */}
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocId;
          const isInfoOpen = activeInfoLocId === loc.id;

          return (
            <React.Fragment key={loc.id}>
              <AdvancedMarker
                position={{ lat: loc.coordinates.lat, lng: loc.coordinates.lng }}
                title={`${loc.name} Farming Hub`}
                zIndex={isSelected ? 100 : 10}
                onClick={() => {
                  onSelectLocation(loc);
                  setActiveInfoLocId(loc.id);
                }}
              >
                <Pin
                  background={isSelected ? '#e5a952' : '#1b2e20'}
                  borderColor={isSelected ? '#142217' : '#e5a952'}
                  glyphColor={isSelected ? '#142217' : '#e5a952'}
                  scale={isSelected ? 1.35 : 1.05}
                />
              </AdvancedMarker>

              {/* InfoWindow for the active selected marker */}
              {isInfoOpen && (
                <InfoWindow
                  position={{ lat: loc.coordinates.lat, lng: loc.coordinates.lng }}
                  onCloseClick={() => setActiveInfoLocId(null)}
                  maxWidth={280}
                  headerContent={
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#142217]">
                      <MapPin className="w-3.5 h-3.5 text-[#996f2a]" />
                      <span>{loc.name} Farming Hub</span>
                    </div>
                  }
                >
                  <div className="p-1 space-y-1.5 text-[#2c382f]">
                    <div className="flex items-center justify-between text-[10px] text-[#6e6858]">
                      <span>{loc.province}</span>
                      <span className="bg-[#eef3ee] text-[#2a6838] px-1.5 py-0.5 rounded font-medium">
                        Active Hub
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight text-[#423c2f]">
                      {loc.agroEcologicalZone}
                    </p>
                    <div className="pt-1 border-t border-[#e2dcce] text-[10px] text-[#8b5e20] font-medium">
                      Primary: {loc.primaryFocus[0]}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          );
        })}
      </Map>

      {/* Map Control Bar (Top-Right) */}
      <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5 z-10">
        <div className="bg-[#faf9f5]/95 backdrop-blur-md rounded-lg border border-[#ded8c4] p-1 flex items-center gap-1 shadow-md text-xs">
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              mapType === 'hybrid'
                ? 'bg-[#1b2e20] text-white'
                : 'text-[#554e3d] hover:bg-[#ede8d8]'
            }`}
            title="Satellite with street & border labels"
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapType('terrain')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              mapType === 'terrain'
                ? 'bg-[#1b2e20] text-white'
                : 'text-[#554e3d] hover:bg-[#ede8d8]'
            }`}
            title="Topographic terrain and elevation"
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              mapType === 'roadmap'
                ? 'bg-[#1b2e20] text-white'
                : 'text-[#554e3d] hover:bg-[#ede8d8]'
            }`}
            title="Standard vector street map"
          >
            Roadmap
          </button>
        </div>

        <button
          type="button"
          onClick={handleFitAllHubs}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#faf9f5]/95 hover:bg-white text-[#1b2e20] border border-[#ded8c4] shadow-md text-[11px] font-medium backdrop-blur-md transition-colors"
          title="Fit view to all 4 farming hubs across Zimbabwe"
        >
          <Maximize2 className="w-3 h-3 text-[#996f2a]" />
          <span>Fit All Hubs</span>
        </button>
      </div>

      {/* Floating Active Hub Badge (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 bg-[#1b2e20]/90 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/20 shadow-md flex items-center gap-2 z-10 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#e5a952] animate-ping" />
        <span className="font-serif text-[#f5d061] font-semibold">{selectedLocation.name} Farming Hub</span>
        <span className="text-[#a8bba9] text-[11px]">| {selectedLocation.province}</span>
      </div>
    </div>
  );
};

export const GoogleMapsHubView: React.FC<GoogleMapsHubViewProps> = ({
  locations,
  selectedLocId,
  onSelectLocation,
  className = '',
}) => {
  const rawApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [authError, setAuthError] = useState(false);
  const [mapType, setMapType] = useState<'hybrid' | 'satellite' | 'roadmap' | 'terrain'>('hybrid');

  // Listen globally to gm_authFailure if triggered by Google Maps script
  useEffect(() => {
    const win = window as unknown as { gm_authFailure?: () => void };
    const prevAuthFailure = win.gm_authFailure;
    win.gm_authFailure = () => {
      setAuthError(true);
      if (typeof prevAuthFailure === 'function') {
        prevAuthFailure();
      }
    };
    return () => {
      win.gm_authFailure = prevAuthFailure;
    };
  }, []);

  const selectedLocation =
    locations.find((l) => l.id === selectedLocId) || locations[0] || {
      id: 'loc-norton',
      name: 'Norton',
      province: 'Mashonaland West Province',
      agroEcologicalZone: 'Natural Region IIa',
      summary: '',
      primaryFocus: [],
      infrastructureOverview: '',
      coordinates: { lat: -17.8833, lng: 30.7000 },
      isCoordinatesConfirmed: false,
      imageSlotId: 'media-loc-norton',
      order: 1,
    };

  const hasValidKey = isValidGoogleMapsKey(rawApiKey) && !authError;

  // If no genuine API key is provided or authentication fails, show the synchronized satellite embed
  if (!hasValidKey) {
    return (
      <div className={`w-full h-full min-h-[440px] ${className}`}>
        <GoogleMapsEmbedFallback
          selectedLocation={selectedLocation}
          allLocations={locations}
          onSelectLocation={onSelectLocation}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[460px] relative rounded-xl overflow-hidden border border-[#ded8c4] shadow-inner ${className}`}>
      <APIProvider
        apiKey={rawApiKey.trim()}
        language="en"
        region="ZW"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        <InteractiveGoogleMap
          locations={locations}
          selectedLocation={selectedLocation}
          selectedLocId={selectedLocId}
          onSelectLocation={onSelectLocation}
          mapType={mapType}
          setMapType={setMapType}
          onAuthFailure={() => setAuthError(true)}
        />
      </APIProvider>
    </div>
  );
};
