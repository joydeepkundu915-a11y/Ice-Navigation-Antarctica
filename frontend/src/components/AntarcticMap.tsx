import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  Compass, 
  Waves, 
  Anchor, 
  Navigation, 
  Eye, 
  Radio, 
  Thermometer, 
  Wind, 
  ShieldAlert, 
  ShieldCheck,
  Info,
  Ship,
  AlertOctagon,
  Sparkles,
  Crosshair,
  Maximize2,
  Shield,
  Plus,
  Minus
} from 'lucide-react';
import { Station, Iceberg, RoutePlan, VesselState, DisplayPalette, AISVessel, DistressSOSState } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

// Custom Leaflet DivIcons
const createVesselIcon = (heading: number, palette: DisplayPalette, isEvasive: boolean) => {
  const strokeColor = isEvasive ? '#ef4444' : palette === 'night' ? '#ef4444' : palette === 'day' ? '#0284c7' : '#f59e0b';
  const fillColor = isEvasive ? '#dc2626' : palette === 'night' ? '#991b1b' : palette === 'thermal' ? '#f59e0b' : '#fbbf24';

  return L.divIcon({
    className: 'vessel-marker',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease; filter: drop-shadow(0 0 10px ${isEvasive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.7)'});">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="${isEvasive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.3)'}" stroke-width="1.5" stroke-dasharray="3, 3" />
          <polygon points="20,4 32,34 20,27 8,34" fill="${fillColor}" stroke="#ffffff" stroke-width="2" />
          <circle cx="20" cy="20" r="4" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const createAISVesselIcon = (heading: number, isCritical: boolean, isEvasive: boolean) => {
  const color = isCritical ? '#ef4444' : isEvasive ? '#f59e0b' : '#a855f7';
  return L.divIcon({
    className: 'ais-vessel-marker',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease; filter: drop-shadow(0 0 8px ${isCritical ? 'rgba(239, 68, 68, 0.9)' : 'rgba(168, 85, 247, 0.6)'});">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="14,3 23,23 14,18 5,23" fill="${color}" stroke="#ffffff" stroke-width="1.8" />
          <circle cx="14" cy="14" r="3" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createIcebergIcon = (threatLevel: string, isMega: boolean) => {
  const color = threatLevel === 'EXTREME' ? '#ef4444' : threatLevel === 'HIGH' ? '#f59e0b' : '#38bdf8';
  return L.divIcon({
    className: 'iceberg-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style="background-color: ${color};"></span>
        <div style="width: ${isMega ? '24px' : '16px'}; height: ${isMega ? '24px' : '16px'}; background-color: ${color}; border: 2px solid white; transform: rotate(45deg); filter: drop-shadow(0 0 6px ${color});" class="shadow-lg"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createStationIcon = (isShelter: boolean) => L.divIcon({
  className: 'station-marker',
  html: `
    <div style="background-color: ${isShelter ? '#0284c7' : '#059669'}; border: 2px solid #ffffff; width: 20px; height: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.8);">
      <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 2px;"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// React component to capture the Leaflet map instance
const MapController: React.FC<{ onMapReady: (map: L.Map) => void }> = ({ onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
};

interface AntarcticMapProps {
  vessel: VesselState;
  stations: Station[];
  icebergs: Iceberg[];
  iceGrid: any[];
  activeRoute: RoutePlan | null;
  palette?: DisplayPalette;
  aisVessels?: AISVessel[];
  sosState?: DistressSOSState;
  onSelectIceberg: (iceberg: Iceberg) => void;
  onSelectStation: (station: Station) => void;
  onSelectAISVessel?: (vessel: AISVessel) => void;
}

export const AntarcticMap: React.FC<AntarcticMapProps> = ({
  vessel,
  stations,
  icebergs,
  iceGrid,
  activeRoute,
  palette = 'dusk',
  aisVessels = [],
  sosState,
  onSelectIceberg,
  onSelectStation,
  onSelectAISVessel
}) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [showSIC, setShowSIC] = useState<boolean>(true);
  const [showIcebergs, setShowIcebergs] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [showTrajectoryCones, setShowTrajectoryCones] = useState<boolean>(true);
  const [showRoute, setShowRoute] = useState<boolean>(true);
  const [showWake, setShowWake] = useState<boolean>(true);
  const [showAIS, setShowAIS] = useState<boolean>(true);
  const [showSafetyDomains, setShowSafetyDomains] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-65.0, -60.0]);

  // Synchronize zoom state with Leaflet map events
  useEffect(() => {
    if (!mapInstance) return;
    const updateZoom = () => setCurrentZoom(mapInstance.getZoom());
    mapInstance.on('zoomend', updateZoom);
    setCurrentZoom(mapInstance.getZoom());
    return () => {
      mapInstance.off('zoomend', updateZoom);
    };
  }, [mapInstance]);

  const tileUrl = palette === 'day'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : palette === 'night'
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const lookaheadDistNm = 4.0;
  const lookaheadLat = vessel.lat + (lookaheadDistNm / 60.0) * Math.cos((vessel.heading_deg * Math.PI) / 180);
  const lookaheadLon = vessel.lon + (lookaheadDistNm / (60.0 * Math.cos((vessel.lat * Math.PI) / 180))) * Math.sin((vessel.heading_deg * Math.PI) / 180);

  const wakePoints = vessel.wake_history && vessel.wake_history.length > 0
    ? vessel.wake_history.map(w => [w.lat, w.lon] as [number, number])
    : [];

  const criticalThreatVessels = aisVessels.filter(v => (v.distance_nm || 99) < 4.0 && (v.dcpa_nm || 99) < 2.0);
  const isOwnShipEvasive = criticalThreatVessels.length > 0;

  return (
    <div className="relative w-full h-full bg-polar-900 overflow-hidden flex flex-col select-none">
      
      {/* ========================================================================= */}
      {/* GUARANTEED INTERACTIVE ZOOM CONTROLLER HUD (TOP-LEFT, Z-INDEX 1200)       */}
      {/* Fully independent HTML overlay: 100% click guaranteed for 2x, 3x, 5x etc. */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-4 z-[1200] pointer-events-auto flex flex-col space-y-1.5 font-mono select-none">
        <div className="glass-panel p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center space-y-1.5 backdrop-blur-2xl">
          
          {/* Zoom In Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (mapInstance) {
                mapInstance.zoomIn();
                bridgeAudio.playTacticalClick();
              }
            }}
            className="w-9 h-9 rounded-xl glass-card hover:bg-sky-600 text-white font-bold flex items-center justify-center transition active:scale-90 border border-white/10 shadow-lg"
            title="Zoom In [ + ]"
          >
            <Plus className="w-5 h-5 text-sky-300" />
          </button>

          {/* Current Zoom Badge */}
          <div className="px-1.5 py-0.5 rounded text-center text-[10px] text-amber-300 font-extrabold tracking-wider bg-black/40 border border-white/10 w-full">
            {currentZoom}x
          </div>

          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (mapInstance) {
                mapInstance.zoomOut();
                bridgeAudio.playTacticalClick();
              }
            }}
            className="w-9 h-9 rounded-xl glass-card hover:bg-sky-600 text-white font-bold flex items-center justify-center transition active:scale-90 border border-white/10 shadow-lg"
            title="Zoom Out [ − ]"
          >
            <Minus className="w-5 h-5 text-sky-300" />
          </button>

          {/* Direct 1-Click Quick Zoom Pills (2x, 3x, 5x, 7x, 10x) */}
          <div className="flex flex-col space-y-1 pt-1.5 border-t border-white/10 w-full">
            <span className="text-[8px] text-slate-400 text-center font-extrabold tracking-wider">ZOOM</span>
            {[2, 3, 5, 7, 10].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (mapInstance) {
                    mapInstance.setZoom(lvl);
                    bridgeAudio.playTacticalClick();
                  }
                }}
                className={
                  'w-9 py-1 rounded-lg text-[10px] font-extrabold transition active:scale-90 border ' +
                  (currentZoom === lvl
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white border-sky-300 shadow-lg shadow-sky-500/50 ring-1 ring-white/50'
                    : 'glass-card text-slate-300 hover:text-white border-white/10 hover:bg-white/10')
                }
                title={`Instantly set map magnification to ${lvl}x`}
              >
                {lvl}x
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-white/10 my-0.5" />

          {/* Recenter on Vessel */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (mapInstance) {
                mapInstance.flyTo([vessel.lat, vessel.lon], Math.max(6, currentZoom), { animate: true, duration: 1.0 });
                bridgeAudio.playTacticalClick();
              }
            }}
            className="w-9 h-9 rounded-xl glass-card hover:bg-emerald-600 text-emerald-300 flex items-center justify-center transition active:scale-90 border border-white/10 shadow-lg"
            title="Center camera on Ship Conning position"
          >
            <Crosshair className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Reset Polar Overview */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (mapInstance) {
                mapInstance.flyTo([-65.0, -60.0], 4, { animate: true, duration: 1.0 });
                bridgeAudio.playTacticalClick();
              }
            }}
            className="w-9 h-9 rounded-xl glass-card hover:bg-amber-600 text-amber-300 flex items-center justify-center transition active:scale-90 border border-white/10 shadow-lg"
            title="Reset Antarctic continent overview"
          >
            <Maximize2 className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Floating Tactical Layer Overlay HUD (Top-Right) */}
      <div className="absolute top-3 right-3 z-[1100] glass-panel p-3 rounded-xl border border-white/10 shadow-2xl flex flex-col space-y-2 text-[11px] font-mono">
        <div className="flex items-center space-x-2 text-slate-200 font-bold border-b border-white/10 pb-1.5">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide">POLAR CHART OVERLAYS</span>
        </div>

        <label className="flex items-center space-x-2.5 text-slate-300 hover:text-white cursor-pointer group">
          <input
            type="checkbox"
            checked={showSafetyDomains}
            onChange={(e) => setShowSafetyDomains(e.target.checked)}
            className="rounded bg-polar-950 border-white/20 text-emerald-400 focus:ring-0"
          />
          <span className="flex items-center space-x-1.5 font-bold text-emerald-300 group-hover:text-emerald-200 transition">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Anti-Collision Safety Shield</span>
          </span>
        </label>

        <label className="flex items-center space-x-2.5 text-slate-300 hover:text-white cursor-pointer group">
          <input
            type="checkbox"
            checked={showRoute}
            onChange={(e) => setShowRoute(e.target.checked)}
            className="rounded bg-polar-950 border-white/20 text-amber-400 focus:ring-0"
          />
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-1.5 rounded-sm bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 shadow-sm" />
            <span className="font-bold text-amber-300 group-hover:text-amber-200 transition">Golden POLARIS Route</span>
          </span>
        </label>

        <label className="flex items-center space-x-2.5 text-slate-300 hover:text-white cursor-pointer group">
          <input
            type="checkbox"
            checked={showAIS}
            onChange={(e) => setShowAIS(e.target.checked)}
            className="rounded bg-polar-950 border-white/20 text-purple-500 focus:ring-0"
          />
          <span className="group-hover:text-purple-300 transition">AIS Vessel Fleet ({aisVessels.length})</span>
        </label>

        <label className="flex items-center space-x-2.5 text-slate-300 hover:text-white cursor-pointer group">
          <input
            type="checkbox"
            checked={showSIC}
            onChange={(e) => setShowSIC(e.target.checked)}
            className="rounded bg-polar-950 border-white/20 text-sky-500 focus:ring-0"
          />
          <span className="group-hover:text-sky-300 transition">Sea Ice Concentration (SIC)</span>
        </label>

        <label className="flex items-center space-x-2.5 text-slate-300 hover:text-white cursor-pointer group">
          <input
            type="checkbox"
            checked={showIcebergs}
            onChange={(e) => setShowIcebergs(e.target.checked)}
            className="rounded bg-polar-950 border-white/20 text-sky-500 focus:ring-0"
          />
          <span className="group-hover:text-sky-300 transition">Icebergs & 72h Cones</span>
        </label>
      </div>

      {/* Dynamic Anti-Collision Threat Alert Banner on Map */}
      {isOwnShipEvasive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1100] bg-red-950/90 border-2 border-red-500 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-md flex items-center space-x-3 text-xs font-mono animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
          <div>
            <span className="font-extrabold text-white block">
              🛡️ ACTIVE COLREGs ANTI-COLLISION EVASION EXECUTING
            </span>
            <span className="text-[10px] text-red-200">
              Vessels altering course to Starboard • Guaranteed separation &gt; 1.5 NM enforced
            </span>
          </div>
        </div>
      )}

      {/* Floating Tactical Nautical Compass Rose HUD (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-[1100] glass-panel p-3 rounded-2xl border border-white/10 shadow-2xl flex items-center space-x-3 text-xs font-mono pointer-events-auto">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div 
            className="w-full h-full rounded-full border border-sky-400/40 border-dashed flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${-vessel.heading_deg}deg)` }}
          >
            <span className="absolute -top-1 font-bold text-[9px] text-red-400">N</span>
            <span className="absolute -bottom-1 font-bold text-[9px] text-slate-400">S</span>
            <span className="absolute -left-1 font-bold text-[9px] text-slate-400">W</span>
            <span className="absolute -right-1 font-bold text-[9px] text-slate-400">E</span>
          </div>
          <div className="absolute w-1 h-7 bg-gradient-to-t from-transparent via-amber-400 to-yellow-300 rounded-full shadow-lg shadow-amber-400/50" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[10px]">GYRO HDG:</span>
            <span className="text-amber-300 font-bold text-xs">{vessel.heading_deg.toFixed(0)}° TRUE</span>
          </div>
          <div className="text-[10px] text-slate-400">
            SCALE: <strong className="text-white">1:1,500,000</strong>
          </div>
          <div className="text-[9px] text-emerald-400 font-semibold">
            WGS-84 • EPSG:3031
          </div>
        </div>
      </div>

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-3 z-[1100] glass-panel p-2.5 rounded-xl border border-white/10 shadow-2xl text-[10px] font-mono flex flex-col space-y-1.5 pointer-events-auto">
        <span className="text-slate-400 font-bold border-b border-white/10 pb-1 flex items-center space-x-1">
          <Compass className="w-3 h-3 text-amber-400" />
          <span>NAVIGATION & SAFETY LEGEND</span>
        </span>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-1.5 rounded-sm bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 shadow-md shadow-amber-500/50" />
          <span className="text-amber-300 font-bold">Golden Optimal Lead Track</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full border border-emerald-400 bg-emerald-400/20" />
          <span className="text-emerald-300 font-bold">1.5 NM Anti-Collision Safety Zone</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-sm bg-[#00f2fe]/40 border border-[#00f2fe]" />
          <span className="text-slate-300">Open Leads (&lt;15% SIC)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-sm bg-[#f43f5e]/40 border border-[#f43f5e]" />
          <span className="text-slate-300">Fast Heavy Ice (&gt;85% SIC)</span>
        </div>
      </div>

      {/* Primary Interactive ECDIS Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={5}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        zoomControl={false}
        className="w-full h-full z-10"
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />

        {/* Map Controller Hook */}
        <MapController onMapReady={(map) => setMapInstance(map)} />

        {/* 1. Sea Ice Concentration Circles */}
        {showSIC && iceGrid && iceGrid.map((pt, idx) => {
          const conc = pt.sea_ice_concentration_pct;
          if (conc <= 5) return null;

          let color = '#00f2fe';
          if (conc > 85) color = '#f43f5e';
          else if (conc > 60) color = '#818cf8';
          else if (conc > 30) color = '#38bdf8';

          return (
            <Circle
              key={'ice-' + idx}
              center={[pt.lat, pt.lon]}
              radius={28000}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: Math.min(0.55, conc / 150),
                weight: 1,
                dashArray: conc < 40 ? '4, 4' : undefined
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-mono p-1">
                  <p className="font-bold text-sky-400">ICE REGIME</p>
                  <p>Conc: {conc}% ({pt.ice_stage})</p>
                  <p>Thick: {pt.sea_ice_thickness_m}m</p>
                  <p>Drift: {pt.ice_drift_speed_kts} kts @ {pt.ice_drift_heading_deg}°</p>
                </div>
              </Tooltip>
            </Circle>
          );
        })}

        {/* 2. Radiant Golden Navigation Route */}
        {showRoute && activeRoute && activeRoute.waypoints && (
          <>
            <Polyline
              positions={activeRoute.waypoints.map((w) => [w.lat, w.lon])}
              pathOptions={{
                color: '#f59e0b',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            <Polyline
              positions={activeRoute.waypoints.map((w) => [w.lat, w.lon])}
              pathOptions={{
                color: '#fbbf24',
                weight: 4.5,
                opacity: 0.75,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            <Polyline
              positions={activeRoute.waypoints.map((w) => [w.lat, w.lon])}
              pathOptions={{
                color: '#fef08a',
                weight: 2.5,
                dashArray: '10, 6',
                opacity: 1.0,
                lineCap: 'round'
              }}
            />

            {activeRoute.waypoints.map((wpt) => {
              const isAuth = wpt.polaris_status === 'AUTHORIZED';
              return (
                <Circle
                  key={'wpt-' + wpt.index}
                  center={[wpt.lat, wpt.lon]}
                  radius={7000}
                  pathOptions={{
                    color: '#fbbf24',
                    fillColor: isAuth ? '#10b981' : '#ef4444',
                    fillOpacity: 0.85,
                    weight: 2.5
                  }}
                >
                  <Tooltip>
                    <div className="text-xs font-mono p-1">
                      <span className="font-bold text-amber-300 block">⭐ WPT {wpt.index}: {wpt.name}</span>
                      <span>RIO: {wpt.rio} ({wpt.polaris_status})</span>
                      <span className="block text-slate-300">Ice: {wpt.ice_concentration_pct}%</span>
                      <span className="block text-slate-300">Speed: {wpt.speed_kts} kn</span>
                    </div>
                  </Tooltip>
                </Circle>
              );
            })}
          </>
        )}

        {/* 3. Own Ship Dynamic Anti-Collision Safety Domain (1.5 NM Enforced Buffer) */}
        {showSafetyDomains && (
          <>
            <Circle
              center={[vessel.lat, vessel.lon]}
              radius={2778}
              pathOptions={{
                color: isOwnShipEvasive ? '#ef4444' : '#10b981',
                fillColor: isOwnShipEvasive ? '#ef4444' : '#10b981',
                fillOpacity: isOwnShipEvasive ? 0.25 : 0.08,
                weight: isOwnShipEvasive ? 2.5 : 1.5,
                dashArray: isOwnShipEvasive ? '4, 4' : undefined
              }}
            >
              <Tooltip sticky>
                <span className="text-xs font-mono">
                  {isOwnShipEvasive ? '⚠️ SAFETY DOMAIN BREACH: COLREGs Evasion Active' : '🛡️ Own Ship 1.5 NM Anti-Collision Safety Barrier'}
                </span>
              </Tooltip>
            </Circle>

            <Circle
              center={[vessel.lat, vessel.lon]}
              radius={5556}
              pathOptions={{
                color: isOwnShipEvasive ? '#f59e0b' : 'rgba(56, 189, 248, 0.4)',
                fillColor: 'transparent',
                weight: 1.2,
                dashArray: '3, 5'
              }}
            />
          </>
        )}

        {/* 4. Vessel Dynamic Wake */}
        {showWake && wakePoints.length > 1 && (
          <Polyline
            positions={wakePoints}
            pathOptions={{
              color: '#38bdf8',
              weight: 2.5,
              opacity: 0.65,
              dashArray: '3, 4'
            }}
          />
        )}

        {/* 5. Conning Heading Lookahead Vector */}
        <Polyline
          positions={[
            [vessel.lat, vessel.lon],
            [lookaheadLat, lookaheadLon]
          ]}
          pathOptions={{
            color: isOwnShipEvasive ? '#f87171' : '#fde047',
            weight: 2.8,
            dashArray: '4, 4',
            opacity: 0.95,
            lineCap: 'round'
          }}
        />

        {/* 6. Vessel Live Marker */}
        <Marker
          position={[vessel.lat, vessel.lon]}
          icon={createVesselIcon(vessel.heading_deg, palette, isOwnShipEvasive)}
        >
          <Popup>
            <div className="text-xs font-mono space-y-1 p-1">
              <span className="font-bold text-amber-400 block">{vessel.name}</span>
              <span className="block text-slate-300">Class: {vessel.polar_class}</span>
              <span className="block text-slate-300">Speed: {vessel.speed_kts.toFixed(1)} kts</span>
              <span className="block text-slate-300">Heading: {vessel.heading_deg.toFixed(0)}°</span>
              <span className="block text-emerald-400 font-bold">ANTI-COLLISION SHIELD: ACTIVE</span>
            </div>
          </Popup>
        </Marker>

        {/* 7. SOS Distress Beacon Pulse on Own Ship */}
        {sosState && sosState.active && (
          <Circle
            center={[vessel.lat, vessel.lon]}
            radius={25000}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.25,
              weight: 2.5,
              dashArray: '4, 4'
            }}
          >
            <Tooltip permanent>
              <div className="bg-red-950 text-white font-bold px-2.5 py-1 rounded-lg border border-red-500 text-xs animate-bounce shadow-xl">
                🚨 MAYDAY DISTRESS ACTIVE (POB: {sosState.souls_on_board})
              </div>
            </Tooltip>
          </Circle>
        )}

        {/* 8. AIS Target Vessels with Safety Domains & Mutual Anti-Collision Trajectories */}
        {showAIS && aisVessels.map((tgt) => {
          const isCrit = (tgt.distance_nm || 99) < 4.0 && (tgt.dcpa_nm || 99) < 2.0;
          const isEvasive = tgt.evasive_active || false;

          const tgtLookLat = tgt.lat + (3.0 / 60.0) * Math.cos((tgt.heading_deg * Math.PI) / 180);
          const tgtLookLon = tgt.lon + (3.0 / (60.0 * Math.cos((tgt.lat * Math.PI) / 180))) * Math.sin((tgt.heading_deg * Math.PI) / 180);

          return (
            <React.Fragment key={tgt.id}>
              {showSafetyDomains && (
                <Circle
                  center={[tgt.lat, tgt.lon]}
                  radius={2778}
                  pathOptions={{
                    color: isCrit ? '#ef4444' : '#a855f7',
                    fillColor: isCrit ? '#ef4444' : '#a855f7',
                    fillOpacity: isCrit ? 0.2 : 0.05,
                    weight: isCrit ? 2 : 1.2,
                    dashArray: isCrit ? '3, 3' : undefined
                  }}
                />
              )}

              {isCrit && (
                <Polyline
                  positions={[
                    [vessel.lat, vessel.lon],
                    [tgt.lat, tgt.lon]
                  ]}
                  pathOptions={{
                    color: '#ef4444',
                    weight: 2,
                    dashArray: '4, 6',
                    opacity: 0.9
                  }}
                >
                  <Tooltip sticky permanent>
                    <div className="bg-red-950 text-red-200 px-2 py-0.5 rounded border border-red-500 text-[10px] font-mono font-bold animate-pulse">
                      ⚠️ SEPARATION: {tgt.distance_nm?.toFixed(1)} NM • STARBOARD EVASION
                    </div>
                  </Tooltip>
                </Polyline>
              )}

              <Polyline
                positions={[
                  [tgt.lat, tgt.lon],
                  [tgtLookLat, tgtLookLon]
                ]}
                pathOptions={{
                  color: isCrit ? '#ef4444' : '#a855f7',
                  weight: 1.8,
                  dashArray: '2, 3'
                }}
              />

              <Marker
                position={[tgt.lat, tgt.lon]}
                icon={createAISVesselIcon(tgt.heading_deg, isCrit, isEvasive)}
                eventHandlers={{
                  click: () => onSelectAISVessel && onSelectAISVessel(tgt)
                }}
              >
                <Popup>
                  <div className="text-xs font-mono space-y-1 p-1">
                    <span className="font-bold text-purple-400 block">{tgt.name}</span>
                    <span className="block text-slate-300">IMO: {tgt.imo} • Flag: {tgt.flag}</span>
                    <span className="block text-slate-300">Class: {tgt.polar_class}</span>
                    <span className="block text-slate-300">SOG: {tgt.speed_kts.toFixed(1)} kn @ {tgt.heading_deg.toFixed(0)}°</span>
                    <span className="block text-slate-300">Distance: {tgt.distance_nm?.toFixed(1)} NM • DCPA: {tgt.dcpa_nm?.toFixed(1)} NM</span>
                    <span className="block text-emerald-400 font-bold">{tgt.status}</span>
                    <span className="block text-sky-300 font-semibold">{tgt.avoidance_action}</span>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 9. Drifting Icebergs */}
        {showIcebergs && icebergs && icebergs.map((berg) => {
          const isMega = berg.length_km > 30;

          return (
            <React.Fragment key={berg.id}>
              {showTrajectoryCones && berg.trajectory_72h && berg.trajectory_72h.length > 0 && (
                <>
                  <Polyline
                    positions={berg.trajectory_72h.map((t) => [t.lat, t.lon])}
                    pathOptions={{
                      color: berg.threat_level === 'EXTREME' ? '#f43f5e' : '#f59e0b',
                      weight: 2,
                      dashArray: '4, 4',
                      opacity: 0.8
                    }}
                  />

                  {berg.uncertainty_radii_nm?.['72h_nm'] && (
                    <Circle
                      center={[
                        berg.trajectory_72h[berg.trajectory_72h.length - 1].lat,
                        berg.trajectory_72h[berg.trajectory_72h.length - 1].lon
                      ]}
                      radius={berg.uncertainty_radii_nm['72h_nm'] * 1852}
                      pathOptions={{
                        color: '#f59e0b',
                        fillColor: '#f59e0b',
                        fillOpacity: 0.15,
                        weight: 1,
                        dashArray: '2, 4'
                      }}
                    >
                      <Tooltip>
                        <span className="text-xs font-mono">
                          {berg.name} 72h Envelope: ±{berg.uncertainty_radii_nm['72h_nm']} NM
                        </span>
                      </Tooltip>
                    </Circle>
                  )}
                </>
              )}

              <Marker
                position={[berg.lat, berg.lon]}
                icon={createIcebergIcon(berg.threat_level, isMega)}
                eventHandlers={{
                  click: () => onSelectIceberg(berg)
                }}
              >
                <Popup>
                  <div className="text-xs font-mono space-y-1 p-1">
                    <span className="font-bold text-amber-400 block">{berg.name}</span>
                    <span className="block text-slate-300">Dimensions: {berg.length_km}km x {berg.width_km}km</span>
                    <span className="block text-slate-300">Draft: {berg.draft_m}m</span>
                    <span className="block text-slate-300">Drift: {berg.drift_speed_kts} kts @ {berg.drift_heading_deg}°</span>
                    <span className="block text-red-400 font-semibold">Threat: {berg.threat_level}</span>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 10. Research Stations */}
        {showStations && stations && stations.map((st) => (
          <Marker
            key={st.id}
            position={[st.lat, st.lon]}
            icon={createStationIcon(st.safe_anchorage)}
            eventHandlers={{
              click: () => onSelectStation(st)
            }}
          >
            <Popup>
              <div className="text-xs font-mono space-y-1 p-1">
                <span className="font-bold text-emerald-400 block">{st.name}</span>
                <span className="block text-slate-300">Operator: {st.operator}</span>
                <span className="block text-slate-300">Shelter: {st.safe_anchorage ? 'YES' : 'LIMITED'}</span>
                <span className="block text-slate-300">VHF: {st.vhf_channel}</span>
                <span className="block text-slate-300">Medical: {st.medical_level}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};