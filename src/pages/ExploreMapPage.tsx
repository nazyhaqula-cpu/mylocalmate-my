import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { useAuth } from '../context/AuthContext';
import { Destination } from '../types';
import { INITIAL_DESTINATIONS } from '../data/initialData';
import {
  TRANSIT_LINES,
  INITIAL_TRACKING_STEPS,
  TransitLine,
  TransitStation,
  TrackingStep,
  getAllTransitStations,
} from '../data/transitData';
import {
  MapOverlayMode,
  getOverlayModeMeta,
  calculateTrackingProgress,
} from '../utils/planner';
import {
  MapPin,
  Navigation,
  Compass,
  Heart,
  Plus,
  Search,
  ExternalLink,
  Layers,
  Train,
  Check,
  Info,
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  Milestone,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Radio,
  ArrowRight,
  ChevronRight,
  Shuffle,
  Ticket,
  Maximize2,
  Map as MapIcon,
  Zap,
} from 'lucide-react';

// Controller for camera, Google Maps native TransitLayer, and planner polylines
const MapController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
  overlayMode: MapOverlayMode;
  showGoogleTransitLayer: boolean;
  plannerCoordinates?: { lat: number; lng: number }[];
}> = ({
  center,
  zoom,
  overlayMode,
  showGoogleTransitLayer,
  plannerCoordinates,
}) => {
  const map = useMap();
  const polylinesRef = useRef<any[]>([]);
  const transitLayerRef = useRef<any>(null);

  // Update map camera
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  // Manage Google Maps authoritative TransitLayer
  useEffect(() => {
    if (!map) return;
    const googleMaps = (window as any).google?.maps;
    if (!googleMaps) return;

    if (overlayMode === 'transit' && showGoogleTransitLayer) {
      if (!transitLayerRef.current) {
        transitLayerRef.current = new googleMaps.TransitLayer();
      }
      transitLayerRef.current.setMap(map);
    } else {
      if (transitLayerRef.current) {
        transitLayerRef.current.setMap(null);
      }
    }

    return () => {
      if (transitLayerRef.current) {
        transitLayerRef.current.setMap(null);
      }
    };
  }, [map, overlayMode, showGoogleTransitLayer]);

  // Manage custom polylines based on active overlay mode
  useEffect(() => {
    if (!map) return;

    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const googleMaps = (window as any).google?.maps;
    if (!googleMaps) return;

    // Overlay 1: Clean & Empty -> No polylines
    if (overlayMode === 'clean') {
      return;
    }

    // Overlay 2: Transportation Tracking Maps
    // Note: Custom rail polylines removed as requested — relying purely on Google Maps authoritative TransitLayer!

    // Overlay 3: Tracking Planner -> Draw sequenced itinerary route
    if (overlayMode === 'planner' && plannerCoordinates && plannerCoordinates.length >= 2) {
      const casing = new googleMaps.Polyline({
        path: plannerCoordinates,
        geodesic: true,
        strokeColor: '#ffffff',
        strokeOpacity: 0.9,
        strokeWeight: 7,
        zIndex: 10,
      });
      casing.setMap(map);
      polylinesRef.current.push(casing);

      const plannerPolyline = new googleMaps.Polyline({
        path: plannerCoordinates,
        geodesic: true,
        strokeColor: '#073f3a',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        zIndex: 11,
      });
      plannerPolyline.setMap(map);
      polylinesRef.current.push(plannerPolyline);
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, overlayMode, plannerCoordinates]);

  return null;
};

export const ExploreMapPage: React.FC = () => {
  const { pageParams, navigateTo, toggleFavorite, isFavorite, showToast, openChatWithPrompt } =
    useAuth();
  const mapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyDjlVnfu4uBho9gHFpbRB__DXPlvleP21I';

  // ----------------------------------------------------
  // OVERLAY MODE: 'clean' | 'transit' | 'planner'
  // ----------------------------------------------------
  const [overlayMode, setOverlayMode] = useState<MapOverlayMode>('transit');

  // Transit options (All, KTM Komuter, LRT, MRT, Monorail, Express)
  const [selectedTransitType, setSelectedTransitType] = useState<
    'all' | 'ktm' | 'lrt' | 'mrt' | 'monorail' | 'express'
  >('all');
  const [selectedStation, setSelectedStation] = useState<TransitStation | null>(null);

  // Google Maps official Transit Layer toggle
  const [showGoogleTransitLayer, setShowGoogleTransitLayer] = useState(true);

  // Station search input and results dropdown
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [showStationDropdown, setShowStationDropdown] = useState(false);

  // Tracking Planner steps state
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>(INITIAL_TRACKING_STEPS);
  const [selectedTrackingStep, setSelectedTrackingStep] = useState<TrackingStep | null>(
    INITIAL_TRACKING_STEPS.find((s) => s.status === 'active') || INITIAL_TRACKING_STEPS[2]
  );

  // Standard Destination selection for clean/general browsing
  const [selectedPlace, setSelectedPlace] = useState<Destination | null>(
    INITIAL_DESTINATIONS.find((d) => d.id === pageParams?.selectedPlaceId) || null
  );

  // Camera coordinates (centered at KL Sentral & City Centre)
  const [mapCenter, setMapCenter] = useState({ lat: 3.1412, lng: 101.6938 });
  const [mapZoom, setMapZoom] = useState(13);
  const [searchMapQuery, setSearchMapQuery] = useState('');

  // Filtered transit lines based on sub-option
  const activeTransitLines = useMemo(() => {
    if (selectedTransitType === 'all') return TRANSIT_LINES;
    return TRANSIT_LINES.filter((line) => line.type === selectedTransitType);
  }, [selectedTransitType]);

  // All stations for search and directory
  const allStations = useMemo(() => getAllTransitStations(), []);

  // Search filtered stations
  const matchingStations = useMemo(() => {
    const q = stationSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return allStations
      .filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.code.toLowerCase().includes(q) ||
          st.lineName.toLowerCase().includes(q) ||
          (st.interchanges && st.interchanges.some((i) => i.toLowerCase().includes(q)))
      )
      .slice(0, 6);
  }, [allStations, stationSearchQuery]);

  // Active tracking route coordinates
  const plannerCoordinates = useMemo(() => {
    return trackingSteps.map((s) => ({ lat: s.lat, lng: s.lng }));
  }, [trackingSteps]);

  // Progress metrics for tracking planner
  const trackingProgress = useMemo(() => {
    return calculateTrackingProgress(trackingSteps);
  }, [trackingSteps]);

  // Handle destination selection from URL params
  useEffect(() => {
    if (pageParams?.selectedPlaceId) {
      const match = INITIAL_DESTINATIONS.find((d) => d.id === pageParams.selectedPlaceId);
      if (match) {
        setSelectedPlace(match);
        setMapCenter({ lat: match.lat, lng: match.lng });
        setMapZoom(15);
      }
    }
  }, [pageParams]);

  // Advance tracker milestone in Tracking Planner
  const handleAdvanceStep = () => {
    const activeIdx = trackingSteps.findIndex((s) => s.status === 'active');
    if (activeIdx === -1 || activeIdx === trackingSteps.length - 1) {
      showToast('All planned itinerary stops completed! 🎉');
      return;
    }

    const updated = trackingSteps.map((step, idx) => {
      if (idx === activeIdx) return { ...step, status: 'completed' as const };
      if (idx === activeIdx + 1) return { ...step, status: 'active' as const };
      return step;
    });

    setTrackingSteps(updated);
    const nextStep = updated[activeIdx + 1];
    setSelectedTrackingStep(nextStep);
    setMapCenter({ lat: nextStep.lat, lng: nextStep.lng });
    setMapZoom(15);
    showToast(`Tracking advanced to: ${nextStep.title}`);
  };

  const handleResetTracker = () => {
    setTrackingSteps(INITIAL_TRACKING_STEPS);
    setSelectedTrackingStep(INITIAL_TRACKING_STEPS[2]);
    setMapCenter({ lat: INITIAL_TRACKING_STEPS[2].lat, lng: INITIAL_TRACKING_STEPS[2].lng });
    showToast('Itinerary tracker reset.');
  };

  const handleSelectStation = (station: TransitStation) => {
    setSelectedStation(station);
    setMapCenter({ lat: station.lat, lng: station.lng });
    setMapZoom(15);
    setShowStationDropdown(false);
    setStationSearchQuery('');
  };

  const overlayMeta = getOverlayModeMeta(overlayMode);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ---------------------------------------------------- */}
      {/* HEADER & 3 OVERLAY SELECTOR TABS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
        <div>
          <span className="text-xs font-bold text-[#398077] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Compass className="w-3.5 h-3.5 text-[#ff5c7a]" />
            <span>Interactive Map & Transportation Overlays</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#172b2a] tracking-tight">
            Kuala Lumpur & Klang Valley Map
          </h1>
          <p className="text-xs sm:text-sm text-[#6f7d79] mt-1 max-w-xl">
            Switch between 3 map overlays: Clean & Empty view, live Klang Valley Transportation Tracking (KTM, LRT, MRT, Monorail), and Tracking Planner.
          </p>
        </div>

        {/* The 3 Overlays Main Switcher */}
        <div className="bg-white border-2 border-[#073f3a]/15 rounded-2xl p-1.5 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-1">
          {/* Overlay 1: Clean & Empty */}
          <button
            onClick={() => {
              setOverlayMode('clean');
              setSelectedStation(null);
            }}
            className={`flex-1 sm:flex-initial text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              overlayMode === 'clean'
                ? 'bg-[#073f3a] text-white shadow-xs'
                : 'text-[#52615c] hover:bg-[#f0ece3]'
            }`}
          >
            <EyeOff className="w-4 h-4 text-[#ffeb9a]" />
            <span>1. Clean & Empty</span>
          </button>

          {/* Overlay 2: Transportation Tracking Maps */}
          <button
            onClick={() => {
              setOverlayMode('transit');
              setSelectedPlace(null);
            }}
            className={`flex-1 sm:flex-initial text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              overlayMode === 'transit'
                ? 'bg-[#073f3a] text-white shadow-xs'
                : 'text-[#52615c] hover:bg-[#f0ece3]'
            }`}
          >
            <Train className="w-4 h-4 text-[#20bf6b]" />
            <span>2. Transportation Tracking</span>
          </button>

          {/* Overlay 3: Tracking Planner */}
          <button
            onClick={() => {
              setOverlayMode('planner');
              setSelectedStation(null);
              setSelectedPlace(null);
            }}
            className={`flex-1 sm:flex-initial text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              overlayMode === 'planner'
                ? 'bg-[#073f3a] text-white shadow-xs'
                : 'text-[#52615c] hover:bg-[#f0ece3]'
            }`}
          >
            <Navigation className="w-4 h-4 text-[#ff5c7a]" />
            <span>3. Tracking Planner</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-HEADER CONTROLS BASED ON ACTIVE OVERLAY */}
      {/* ---------------------------------------------------- */}
      <div className="mb-4 bg-white border border-[#e9e5dc] rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Overlay Info Tag */}
          <div className="flex items-center gap-2.5">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${overlayMeta.badgeColor}`}>
              {overlayMeta.tagline}
            </span>
            <span className="text-xs text-[#52615c] hidden lg:inline">
              {overlayMeta.description}
            </span>
          </div>

          {/* Overlay 2 GOOGLE MAPS TRANSIT LAYER TOGGLE */}
          {overlayMode === 'transit' && (
            <div className="flex items-center gap-2 bg-[#f4f8f5] border border-[#d2ecde] rounded-xl px-2.5 py-1">
              <span className="text-[11px] font-bold text-[#073f3a] flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5 text-[#009432]" />
                <span className="hidden sm:inline">Google Maps Transit Layer:</span>
                <span className="sm:hidden">Google Transit:</span>
              </span>
              <button
                onClick={() => {
                  setShowGoogleTransitLayer((prev) => !prev);
                  showToast(
                    !showGoogleTransitLayer
                      ? 'Google Maps Transit Database overlay enabled'
                      : 'Google Maps Transit Database overlay disabled'
                  );
                }}
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all ${
                  showGoogleTransitLayer
                    ? 'bg-[#073f3a] text-white shadow-2xs'
                    : 'bg-white text-[#6f7d79] border border-[#e9e5dc]'
                }`}
              >
                {showGoogleTransitLayer ? 'ON (Active)' : 'OFF'}
              </button>
            </div>
          )}
        </div>

        {/* Overlay 2 SUB-OPTIONS: Rail Line Filters (All, KTM, LRT, MRT, Monorail, Express) */}
        {overlayMode === 'transit' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#f0ece3]">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[11px] font-bold text-[#6f7d79] uppercase mr-1 whitespace-nowrap">
                Rail Filter:
              </span>
              {[
                { id: 'all', label: 'All Transit (KVITS)', color: '#073f3a' },
                { id: 'ktm', label: 'KTM Komuter (1 & 2)', color: '#1e3799' },
                { id: 'lrt', label: 'LRT (Kelana Jaya & Ampang)', color: '#d63031' },
                { id: 'mrt', label: 'MRT (Kajang & Putrajaya)', color: '#009432' },
                { id: 'monorail', label: 'Rapid KL Monorail', color: '#84cc16' },
                { id: 'express', label: 'KLIA Airport Link', color: '#0284c7' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTransitType(tab.id as any)}
                  className={`text-[11px] px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedTransitType === tab.id
                      ? 'bg-[#073f3a] text-white shadow-xs'
                      : 'bg-[#faf8f3] text-[#52615c] border border-[#e9e5dc] hover:bg-[#ede7da]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tab.color }}
                  />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Station Quick Search Box with dropdown */}
            <div className="relative w-full md:w-64">
              <div className="flex items-center gap-2 bg-[#faf8f3] border border-[#e9e5dc] rounded-xl px-3 py-1.5 text-xs text-[#52615c]">
                <Search className="w-3.5 h-3.5 text-[#6f7d79]" />
                <input
                  type="text"
                  value={stationSearchQuery}
                  onChange={(e) => {
                    setStationSearchQuery(e.target.value);
                    setShowStationDropdown(true);
                  }}
                  onFocus={() => setShowStationDropdown(true)}
                  placeholder="Search KTM, LRT, MRT station..."
                  className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                />
              </div>

              {/* Station search dropdown */}
              {showStationDropdown && matchingStations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e9e5dc] rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-1.5 max-h-56 overflow-y-auto">
                    {matchingStations.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectStation(st)}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#f7f3eb] transition-all flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-[#172b2a] truncate">
                            {st.name}
                          </div>
                          <div className="text-[10px] text-[#6f7d79] truncate">
                            {st.lineName}
                          </div>
                        </div>
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded text-white flex-shrink-0"
                          style={{ backgroundColor: st.lineColor }}
                        >
                          {st.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay 3 SUB-OPTIONS: Tracking Controls */}
        {overlayMode === 'planner' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f0ece3]">
            <div className="text-xs font-bold text-[#073f3a] bg-[#e5f1dc] px-3 py-1.5 rounded-xl border border-[#cbe4bf]">
              Progress: {trackingProgress.percentage}% ({trackingProgress.completedCount}/{trackingProgress.totalCount} stops)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdvanceStep}
                className="bg-[#073f3a] hover:bg-[#052e2a] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span>Advance Next Stop</span>
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetTracker}
                title="Reset progress"
                className="bg-[#faf8f3] hover:bg-[#ede7da] text-[#52615c] p-1.5 rounded-xl border border-[#e9e5dc]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Overlay 1 SUB-OPTIONS: Search box for clean exploration */}
        {overlayMode === 'clean' && (
          <div className="flex items-center gap-2 bg-[#faf8f3] border border-[#e9e5dc] rounded-xl px-3 py-1.5 text-xs text-[#52615c] w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#6f7d79]" />
            <input
              type="text"
              value={searchMapQuery}
              onChange={(e) => setSearchMapQuery(e.target.value)}
              placeholder="Search landmark on clean map..."
              className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
            />
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN MAP & SIDEBAR GRID */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Map Canvas */}
        <div className="lg:col-span-8 bg-white border border-[#e9e5dc] rounded-3xl overflow-hidden shadow-sm flex flex-col">
          {/* Active Overlay Status Bar */}
          <div className="px-4 py-2.5 bg-[#faf8f3] border-b border-[#e9e5dc] flex items-center justify-between text-xs text-[#52615c]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20bf6b] animate-pulse" />
              <strong className="text-[#172b2a]">Active Layer:</strong>
              <span>{overlayMeta.title}</span>
            </div>

            {overlayMode === 'transit' && (
              <div className="text-[11px] text-[#073f3a] font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#ff5c7a] animate-pulse" />
                <span>Google Maps Official Transit Layer Active</span>
              </div>
            )}
            {overlayMode === 'planner' && (
              <div className="text-[11px] text-[#073f3a] font-semibold">
                Leg: {selectedTrackingStep?.locationName || 'Waypoints connected'}
              </div>
            )}
            {overlayMode === 'clean' && (
              <div className="text-[11px] text-[#6f7d79]">
                Zero clutter view
              </div>
            )}
          </div>

          {/* Interactive Google Map Canvas */}
          <div className="relative w-full h-[560px] bg-[#d5e4d7]">
            <APIProvider apiKey={mapsApiKey}>
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={mapCenter}
                defaultZoom={mapZoom}
                gestureHandling="greedy"
                disableDefaultUI={false}
                style={{ width: '100%', height: '100%' }}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <MapController
                  center={mapCenter}
                  zoom={mapZoom}
                  overlayMode={overlayMode}
                  showGoogleTransitLayer={showGoogleTransitLayer}
                  plannerCoordinates={plannerCoordinates}
                />

                {/* -------------------------------------------------- */}
                {/* OVERLAY 1: CLEAN & EMPTY MAP VIEW */}
                {/* Minimalist: Only render marker if user explicitly searched/clicked */}
                {/* -------------------------------------------------- */}
                {overlayMode === 'clean' && selectedPlace && (
                  <AdvancedMarker
                    position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                    title={selectedPlace.name}
                  >
                    <Pin background="#073f3a" borderColor="#ffffff" glyphColor="#ffffff" />
                  </AdvancedMarker>
                )}

                {/* -------------------------------------------------- */}
                {/* OVERLAY 2: TRANSPORTATION TRACKING MAPS */}
                {/* Official Google Maps TransitLayer renders all tracks & lines! */}
                {/* Only render pin and InfoWindow for the focused selected station */}
                {/* -------------------------------------------------- */}
                {overlayMode === 'transit' && selectedStation && (
                  <>
                    <AdvancedMarker
                      position={{ lat: selectedStation.lat, lng: selectedStation.lng }}
                      title={`${selectedStation.name} (${selectedStation.code}) - ${selectedStation.lineName}`}
                    >
                      <div className="relative flex flex-col items-center cursor-pointer scale-110">
                        <div
                          style={{ backgroundColor: selectedStation.lineColor }}
                          className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-xl border-2 border-white flex items-center gap-1.5"
                        >
                          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
                          <span>{selectedStation.code} · {selectedStation.name}</span>
                        </div>
                        <div
                          style={{ borderTopColor: selectedStation.lineColor }}
                          className="w-0 h-0 border-x-4 border-x-transparent border-t-4"
                        />
                      </div>
                    </AdvancedMarker>

                    {/* Station InfoWindow when clicked */}
                    <InfoWindow
                      position={{ lat: selectedStation.lat, lng: selectedStation.lng }}
                      onCloseClick={() => setSelectedStation(null)}
                    >
                      <div className="p-1 max-w-[260px] space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: selectedStation.lineColor }}
                          >
                            {selectedStation.code} · {selectedStation.operator}
                          </span>
                          <span className="text-[10px] font-bold text-[#28583d] bg-[#e5f1dc] px-1.5 py-0.5 rounded">
                            {selectedStation.status}
                          </span>
                        </div>

                        <div className="font-extrabold text-xs text-[#172b2a]">
                          {selectedStation.name}
                        </div>
                        <div className="text-[10px] text-[#6f7d79]">
                          {selectedStation.lineName}
                        </div>

                        {selectedStation.interchanges && selectedStation.interchanges.length > 0 && (
                          <div className="bg-[#f0f7f3] rounded-lg p-1.5 border border-[#d2ecde] text-[10px]">
                            <strong className="text-[#073f3a] block">Interchange:</strong>
                            <span className="text-[#2d4b43]">
                              {selectedStation.interchanges.join(' · ')}
                            </span>
                          </div>
                        )}

                        <div className="text-[11px] bg-[#faf8f3] text-[#172b2a] font-bold px-2 py-1 rounded-md flex items-center justify-between border border-[#e9e5dc]">
                          <span>Next Arrival:</span>
                          <span className="text-[#073f3a]">{selectedStation.nextArrivalMins} mins</span>
                        </div>

                        {selectedStation.fareEst && (
                          <div className="text-[10px] text-[#6f7d79]">
                            Fare: {selectedStation.fareEst}
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  </>
                )}

                {/* -------------------------------------------------- */}
                {/* OVERLAY 3: TRACKING PLANNER */}
                {/* Render numbered sequenced waypoint milestone pins */}
                {/* -------------------------------------------------- */}
                {overlayMode === 'planner' &&
                  trackingSteps.map((step) => {
                    const isSelected = selectedTrackingStep?.id === step.id;
                    const isActive = step.status === 'active';
                    const isCompleted = step.status === 'completed';

                    return (
                      <AdvancedMarker
                        key={step.id}
                        position={{ lat: step.lat, lng: step.lng }}
                        title={`${step.order}. ${step.title}`}
                        onClick={() => {
                          setSelectedTrackingStep(step);
                          setMapCenter({ lat: step.lat, lng: step.lng });
                        }}
                      >
                        <div className="flex flex-col items-center cursor-pointer">
                          <div
                            className={`w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-black text-xs text-white transition-transform ${
                              isActive
                                ? 'bg-[#ff5c7a] scale-125 ring-4 ring-[#ff5c7a]/30 animate-pulse'
                                : isCompleted
                                ? 'bg-[#20bf6b]'
                                : 'bg-[#073f3a]'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.order}
                          </div>
                          <span className="text-[10px] font-extrabold text-[#073f3a] bg-white/95 px-1.5 py-0.5 rounded shadow-xs mt-1 whitespace-nowrap max-w-[120px] truncate">
                            {step.locationName}
                          </span>
                        </div>
                      </AdvancedMarker>
                    );
                  })}
              </Map>
            </APIProvider>

            {/* In-Map Floating Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-[#e9e5dc] rounded-2xl p-3 shadow-md text-[11px] text-[#172b2a] space-y-1.5 z-10 pointer-events-none sm:pointer-events-auto max-w-[260px]">
              <div className="font-extrabold text-[#073f3a] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {overlayMode === 'clean'
                    ? 'Clean Overlay Active'
                    : overlayMode === 'transit'
                    ? 'Klang Valley Transit Legend'
                    : 'Planner Tracking Legend'}
                </span>
              </div>

              {overlayMode === 'clean' && (
                <p className="text-[10px] text-[#6f7d79]">
                  Empty canvas for unobstructed city navigation.
                </p>
              )}

              {overlayMode === 'transit' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#1e3799]" />
                    <span>KTM Komuter (Lines 1 & 2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#d63031]" />
                    <span>LRT Kelana Jaya (Line 5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#e67e22]" />
                    <span>LRT Ampang / Sri Petaling (3 & 4)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#009432]" />
                    <span>MRT Kajang & Putrajaya (9 & 12)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#84cc16]" />
                    <span>Rapid KL Monorail (Line 8)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#0284c7]" />
                    <span>KLIA Airport Express / Transit</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#8c6a13] font-semibold pt-1 border-t border-[#e9e5dc]">
                    <Train className="w-3 h-3 text-[#172b2a]" />
                    <span>Live train positions animated</span>
                  </div>
                </div>
              )}

              {overlayMode === 'planner' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#20bf6b]" /> Reached / Completed
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5c7a]" /> Current Target Leg
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#073f3a]" /> Upcoming Leg
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Right Side: DYNAMIC SIDEBAR BASED ON ACTIVE OVERLAY */}
        {/* ---------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. SIDEBAR FOR OVERLAY 2: TRANSPORTATION TRACKING */}
          {overlayMode === 'transit' && (
            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#398077] uppercase tracking-wider">
                    Klang Valley Integrated Transit
                  </span>
                  <h3 className="font-extrabold text-base text-[#172b2a]">
                    Rail & Transit Network
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-[#e5f1dc] text-[#28583d] px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#20bf6b] animate-ping" />
                  <span>KTM · Rapid KL Normal</span>
                </span>
              </div>

              {/* Selected Station Card if clicked */}
              {selectedStation ? (
                <div className="bg-[#f7fbf8] border-2 border-[#d2ecde] rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: selectedStation.lineColor }}
                        >
                          {selectedStation.code}
                        </span>
                        <span className="text-[10px] font-bold text-[#52615c] uppercase bg-white border border-[#e9e5dc] px-1.5 py-0.5 rounded">
                          {selectedStation.operator}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#172b2a] mt-1.5">
                        {selectedStation.name}
                      </h4>
                      <p className="text-[11px] text-[#52615c]">{selectedStation.lineName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[#073f3a]">
                        {selectedStation.nextArrivalMins} min
                      </span>
                      <div className="text-[10px] text-[#28583d] font-bold">
                        {selectedStation.status}
                      </div>
                    </div>
                  </div>

                  {selectedStation.interchanges && selectedStation.interchanges.length > 0 && (
                    <div className="bg-white rounded-xl p-2.5 border border-[#d2ecde] text-[11px] space-y-1">
                      <strong className="text-[#073f3a] flex items-center gap-1">
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Transfer & Interchanges:</span>
                      </strong>
                      <div className="text-[#2d4b43] text-xs">
                        {selectedStation.interchanges.join(' • ')}
                      </div>
                    </div>
                  )}

                  {selectedStation.facilities && (
                    <div className="flex flex-wrap gap-1 text-[10px] text-[#52615c]">
                      {selectedStation.facilities.map((fac, i) => (
                        <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-[#e9e5dc]">
                          {fac}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedStation.fareEst && (
                    <div className="text-xs text-[#073f3a] font-semibold flex items-center gap-1.5 bg-[#e5f1dc]/70 px-2.5 py-1.5 rounded-xl">
                      <Ticket className="w-3.5 h-3.5 text-[#073f3a]" />
                      <span>{selectedStation.fareEst}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() =>
                        openChatWithPrompt(
                          `How do I travel to ${selectedStation.name} station via ${selectedStation.lineName} (${selectedStation.operator}), and what are the best tips?`
                        )
                      }
                      className="flex-1 bg-[#073f3a] text-white text-[11px] font-bold py-2 rounded-xl hover:bg-[#052e2a] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffeb9a]" />
                      <span>Ask Fast AI Guide</span>
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedStation.name + ' Station Malaysia'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-[#e9e5dc] text-[#172b2a] p-2 rounded-xl hover:bg-[#f0ece3]"
                      title="Google Maps station location"
                    >
                      <ExternalLink className="w-4 h-4 text-[#6f7d79]" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-[#faf8f3] border border-[#e9e5dc] rounded-2xl p-3.5 text-xs text-[#6f7d79] space-y-2">
                  <p>
                    Click any station code badge (e.g. <strong>KA01 KL Sentral</strong>, <strong>KC05 Batu Caves</strong>, <strong>KJ10 KLCC</strong>, <strong>KG18 Bukit Bintang</strong>) on the map or select from the quick hubs below:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { name: 'KL Sentral', code: 'KA01' },
                      { name: 'Batu Caves', code: 'KC05' },
                      { name: 'KLCC', code: 'KJ10' },
                      { name: 'Bukit Bintang', code: 'KG18' },
                      { name: 'TRX', code: 'KG20' },
                      { name: 'Mid Valley', code: 'KB01' },
                      { name: 'Titiwangsa', code: 'AG3' },
                    ].map((hub) => (
                      <button
                        key={hub.code}
                        onClick={() => {
                          const match = allStations.find(
                            (s) => s.code === hub.code || s.name.includes(hub.name)
                          );
                          if (match) handleSelectStation(match);
                        }}
                        className="text-[10px] bg-white border border-[#e9e5dc] hover:bg-[#ede7da] text-[#172b2a] font-bold px-2 py-1 rounded-lg"
                      >
                        {hub.name} ({hub.code})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rail Lines List */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#172b2a] flex items-center justify-between">
                  <span>Active Lines in View ({activeTransitLines.length})</span>
                  <span className="text-[10px] text-[#6f7d79] font-normal">Click line to zoom</span>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {activeTransitLines.map((line) => (
                    <div
                      key={line.id}
                      onClick={() => {
                        if (line.coordinates[0]) {
                          setMapCenter(line.coordinates[Math.floor(line.coordinates.length / 2)]);
                          setMapZoom(13);
                        }
                      }}
                      className="p-3 rounded-2xl border border-[#e9e5dc] bg-[#faf8f3] hover:bg-white transition-all space-y-1.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: line.color }}
                          />
                          <span className="font-bold text-xs text-[#172b2a]">
                            {line.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-[#52615c] border border-[#e9e5dc]">
                          {line.operator}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6f7d79] flex items-center justify-between">
                        <span>{line.frequency}</span>
                        <span>{line.stations.length} key stations</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigateTo('transport-guide', { tab: 'transit' })}
                className="w-full bg-[#f7f3eb] hover:bg-[#ede7da] text-[#073f3a] text-xs font-bold py-2.5 rounded-xl transition-colors border border-[#e4ded3] flex items-center justify-center gap-1.5"
              >
                <span>Full Rail Guides & Fares (KTM, LRT, MRT)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. SIDEBAR FOR OVERLAY 3: TRACKING PLANNER */}
          {overlayMode === 'planner' && (
            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#398077] uppercase tracking-wider">
                    Real-Time Itinerary Tracker
                  </span>
                  <h3 className="font-extrabold text-base text-[#172b2a]">
                    Tracking Planner Stops
                  </h3>
                </div>
                <button
                  onClick={handleAdvanceStep}
                  className="bg-[#073f3a] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#052e2a] transition-all flex items-center gap-1 shadow-2xs"
                >
                  <span>Advance</span>
                  <Play className="w-3 h-3" />
                </button>
              </div>

              {/* Active Step Highlight Card */}
              {selectedTrackingStep && (
                <div className="bg-[#fff9f4] border-2 border-[#ff5c7a]/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5c7a] bg-[#ff5c7a]/10 px-2 py-0.5 rounded-full">
                      Current Waypoint ({selectedTrackingStep.order} of {trackingSteps.length})
                    </span>
                    <span className="text-xs font-extrabold text-[#073f3a]">
                      {selectedTrackingStep.arrivalWindow}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-[#172b2a]">
                    {selectedTrackingStep.title}
                  </h4>
                  <p className="text-xs text-[#52615c]">
                    <strong>Transit Mode:</strong> {selectedTrackingStep.transitMode}
                  </p>
                  <p className="text-xs text-[#6f7d79] italic">
                    "{selectedTrackingStep.notes}"
                  </p>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() =>
                        openChatWithPrompt(
                          `Can you give me fast directions and tips for: ${selectedTrackingStep.title}?`
                        )
                      }
                      className="flex-1 bg-[#073f3a] text-white text-[11px] font-bold py-2 rounded-xl hover:bg-[#052e2a] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffeb9a]" />
                      <span>Ask AI Route Tips</span>
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        selectedTrackingStep.locationName + ' Malaysia'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-[#e9e5dc] text-[#172b2a] p-2 rounded-xl hover:bg-[#f0ece3]"
                      title="Google Maps turn-by-turn navigation"
                    >
                      <ExternalLink className="w-4 h-4 text-[#6f7d79]" />
                    </a>
                  </div>
                </div>
              )}

              {/* Waypoint Checklist */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {trackingSteps.map((step) => {
                  const isActive = step.status === 'active';
                  const isCompleted = step.status === 'completed';
                  const isSelected = selectedTrackingStep?.id === step.id;

                  return (
                    <div
                      key={step.id}
                      onClick={() => {
                        setSelectedTrackingStep(step);
                        setMapCenter({ lat: step.lat, lng: step.lng });
                        setMapZoom(15);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'border-[#073f3a] bg-[#f7f3eb]'
                          : 'border-[#e9e5dc] bg-[#faf8f3] hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${
                          isCompleted
                            ? 'bg-[#20bf6b]'
                            : isActive
                            ? 'bg-[#ff5c7a]'
                            : 'bg-[#073f3a]'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.order}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-[#172b2a] truncate">
                          {step.title}
                        </div>
                        <div className="text-[10px] text-[#6f7d79] flex items-center gap-2 mt-0.5">
                          <span>{step.timeEstimate}</span>
                          <span>•</span>
                          <span
                            className={`font-semibold capitalize ${
                              isCompleted
                                ? 'text-[#20bf6b]'
                                : isActive
                                ? 'text-[#ff5c7a]'
                                : 'text-[#6f7d79]'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigateTo('trip-planner')}
                className="w-full bg-[#073f3a] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#052e2a] transition-colors"
              >
                Customize Route in Trip Planner →
              </button>
            </div>
          )}

          {/* 3. SIDEBAR FOR OVERLAY 1: CLEAN & EMPTY MAP VIEW */}
          {overlayMode === 'clean' && (
            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#398077] uppercase tracking-wider">
                  Minimalist Mode
                </span>
                <h3 className="font-extrabold text-base text-[#172b2a]">
                  Clean & Empty Map View
                </h3>
                <p className="text-xs text-[#6f7d79] mt-1 leading-relaxed">
                  Enjoy an uncluttered map layer without marker distraction or tracking lines. Ideal for freely exploring streets, coastlines, and city architecture.
                </p>
              </div>

              <div className="bg-[#faf8f3] border border-[#e9e5dc] rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-[#172b2a] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff5c7a]" />
                  <span>Looking for something specific?</span>
                </div>
                <p className="text-[11px] text-[#6f7d79]">
                  Type a landmark in the search box above, or switch to <strong>Transportation Tracking</strong> or <strong>Tracking Planner</strong> to activate live routing overlays.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Petronas Towers', 'Batu Caves', 'Merdeka Square', 'Central Market'].map((spot) => (
                    <button
                      key={spot}
                      onClick={() => {
                        const match = INITIAL_DESTINATIONS.find((d) => d.name.includes(spot));
                        if (match) {
                          setSelectedPlace(match);
                          setMapCenter({ lat: match.lat, lng: match.lng });
                          setMapZoom(16);
                        }
                      }}
                      className="text-[11px] bg-white border border-[#e9e5dc] hover:bg-[#ede7da] text-[#172b2a] px-2.5 py-1 rounded-full font-medium transition-colors"
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              {selectedPlace && (
                <div className="p-4 rounded-2xl border border-[#073f3a]/20 bg-[#f7fbf8] space-y-2">
                  <div className="font-bold text-xs text-[#073f3a]">Inspected Landmark:</div>
                  <h4 className="font-extrabold text-sm text-[#172b2a]">{selectedPlace.name}</h4>
                  <p className="text-[11px] text-[#6f7d79]">{selectedPlace.description}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => toggleFavorite(selectedPlace.id)}
                      className="flex-1 bg-white border border-[#e9e5dc] text-xs font-bold py-2 rounded-xl hover:bg-[#f0ece3] text-[#ff5c7a] flex items-center justify-center gap-1"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(selectedPlace.id) ? 'fill-[#ff5c7a]' : ''}`} />
                      <span>{isFavorite(selectedPlace.id) ? 'Saved' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => openChatWithPrompt(`Tell me more about ${selectedPlace.name}`)}
                      className="flex-1 bg-[#073f3a] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#052e2a] flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffeb9a]" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
