import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, Polygon } from 'react-leaflet';
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
  Info
} from 'lucide-react';
import { Station, Iceberg, RoutePlan, VesselState } from '../types';

// Custom Leaflet DivIcons
const createVesselIcon = (heading: number) => L.divIcon({
  className: 'vessel-marker',
  html: `
    <div style="transform: rotate(${heading}deg); transition: transform 0.5s ease;">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 26,28 16,22 6,28" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
        <circle cx="16" cy="16" r="3" fill="#00f2fe" />
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const createIcebergIcon = (threatLevel: string, isMega: boolean) => {
  const color = threatLevel === 'EXTREME' ? '#ef4444' : threatLevel === 'HIGH' ? '#f59e0b' : '#38bdf8';
  return L.divIcon({
    className: 'iceberg-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style="background-color: ${color};"></span>
        <div style="width: ${isMega ? '24px' : '16px'}; height: ${isMega ? '24px' : '16px'}; background-color: ${color}; border: 2px solid white; transform: rotate(45deg);" class="shadow-lg"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createStationIcon = (isShelter: boolean) => L.divIcon({
  className: 'station-marker',
  html: `
    <div style="background-color: ${isShelter ? '#0284c7' : '#059669'}; border: 2px solid #ffffff; width: 18px; height: 18px; border-radius: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(0,0,0,0.6);">
      <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 1px;"></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

interface AntarcticMapProps {
  vessel: VesselState;
  stations: Station[];
  icebergs: Iceberg[];
  iceGrid: any[];
  activeRoute: RoutePlan | null;
  onSelectIceberg: (iceberg: Iceberg) => void;
  onSelectStation: (station: Station) => void;
}

export const AntarcticMap: React.FC<AntarcticMapProps> = ({
  vessel,
  stations,
  icebergs,
  iceGrid,
  activeRoute,
  onSelectIceberg,
  onSelectStation
}) => {
  // Layer Toggles
  const [showSIC, setShowSIC] = useState<boolean>(true);
  const [showIcebergs, setShowIcebergs] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [showTrajectoryCones, setShowTrajectoryCones] = useState<boolean>(true);
  const [showRoute, setShowRoute] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-65.0, -60.0]); // Antarctic Peninsula default

  return (
    <div className="relative w-full h-full bg-polar-900 overflow-hidden flex flex-col select-none">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-polar-850/90 backdrop-blur-md p-3 rounded-lg border border-polar-700 shadow-2xl flex flex-col space-y-2 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold border-b border-polar-700 pb-1.5">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>POLAR OVERLAYS</span>
        </div>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showSIC}
            onChange={(e) => setShowSIC(e.target.checked)}
            className="rounded bg-polar-900 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>Sea-Ice Concentration (SIC)</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showIcebergs}
            onChange={(e) => setShowIcebergs(e.target.checked)}
            className="rounded bg-polar-900 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>Icebergs & Drift Vectors</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showTrajectoryCones}
            onChange={(e) => setShowTrajectoryCones(e.target.checked)}
            className="rounded bg-polar-900 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>72h Monte Carlo Cones</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
            className="rounded bg-polar-900 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>Bases & Safe Havens</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showRoute}
            onChange={(e) => setShowRoute(e.target.checked)}
            className="rounded bg-polar-900 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>POLARIS Route Track</span>
        </label>

        {/* Quick View Anchors */}
        <div className="pt-2 border-t border-polar-700/80 flex flex-col space-y-1">
          <span className="text-[10px] text-slate-400">SECTOR JUMP:</span>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setMapCenter([-65.0, -64.0])}
              className="px-2 py-1 bg-polar-700/70 hover:bg-polar-600 rounded text-[10px] text-sky-300 text-left transition-colors"
            >
              Peninsula / Weddell
            </button>
            <button
              onClick={() => setMapCenter([-75.0, 175.0])}
              className="px-2 py-1 bg-polar-700/70 hover:bg-polar-600 rounded text-[10px] text-sky-300 text-left transition-colors"
            >
              Ross Sea / McMurdo
            </button>
            <button
              onClick={() => setMapCenter([-68.0, 75.0])}
              className="px-2 py-1 bg-polar-700/70 hover:bg-polar-600 rounded text-[10px] text-sky-300 text-left transition-colors"
            >
              Prydz Bay / Bharati
            </button>
            <button
              onClick={() => setMapCenter([-70.0, 10.0])}
              className="px-2 py-1 bg-polar-700/70 hover:bg-polar-600 rounded text-[10px] text-sky-300 text-left transition-colors"
            >
              Maitri / Q. Maud
            </button>
          </div>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-polar-850/90 backdrop-blur-md p-3 rounded-lg border border-polar-700 shadow-2xl text-[11px] font-mono flex items-center space-x-4">
        <div className="flex flex-col space-y-1">
          <span className="text-slate-400 font-semibold text-[10px]">SEA ICE CONCENTRATION (SIC)</span>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-sm bg-sky-900 opacity-60"></span>
            <span className="text-slate-300">10-30%</span>
            <span className="w-3 h-3 rounded-sm bg-sky-600 opacity-70 ml-2"></span>
            <span className="text-slate-300">30-70%</span>
            <span className="w-3 h-3 rounded-sm bg-cyan-300 opacity-80 ml-2"></span>
            <span className="text-slate-300">70-95%</span>
            <span className="w-3 h-3 rounded-sm bg-white opacity-90 ml-2"></span>
            <span className="text-slate-300">Fast Ice</span>
          </div>
        </div>

        <div className="h-7 w-[1px] bg-polar-700" />

        <div className="flex flex-col space-y-1">
          <span className="text-slate-400 font-semibold text-[10px]">POLARIS RIO ROUTE</span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">RIO &ge; 0 (Normal)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">RIO &lt; 0 (Elevated)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-300">RIO &lt; -10 (Prohibited)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={4}
        minZoom={2}
        maxZoom={10}
        style={{ width: '100%', height: '100%' }}
        className="z-10"
      >
        {/* Dark Nautical Map Base Layer (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 1. Sea Ice Concentration Spatial Grid Samples */}
        {showSIC && iceGrid.map((pt, idx) => {
          if (pt.sea_ice_concentration_pct < 10) return null;
          const color = pt.sea_ice_concentration_pct > 80 
            ? '#e0f2fe' 
            : pt.sea_ice_concentration_pct > 50 
              ? '#38bdf8' 
              : '#0284c7';
          const radiusMeters = 80000;

          return (
            <Circle
              key={`sic-${idx}`}
              center={[pt.lat, pt.lon]}
              radius={radiusMeters}
              pathOptions={{
                color: 'transparent',
                fillColor: color,
                fillOpacity: (pt.sea_ice_concentration_pct / 100.0) * 0.45
              }}
            >
              <Tooltip>
                <div className="font-mono text-xs">
                  <div className="font-bold text-sky-400">{pt.ice_stage}</div>
                  <div>SIC: {pt.sea_ice_concentration_pct}%</div>
                  <div>Thickness: {pt.sea_ice_thickness_m} m</div>
                  <div>Drift: {pt.ice_drift_speed_kts} kts @ {pt.ice_drift_heading_deg}°</div>
                  <div>Pressure Index: {pt.ice_pressure_index}/100</div>
                </div>
              </Tooltip>
            </Circle>
          );
        })}

        {/* 2. Research Stations & Safe Havens */}
        {showStations && stations.map((st) => (
          <Marker
            key={st.id}
            position={[st.lat, st.lon]}
            icon={createStationIcon(st.safe_anchorage)}
            eventHandlers={{
              click: () => onSelectStation(st)
            }}
          >
            <Popup>
              <div className="font-mono text-xs p-1 max-w-xs">
                <div className="font-bold text-emerald-400 text-sm">{st.name}</div>
                <div className="text-slate-300 text-[11px] mb-1">{st.operator}</div>
                <div className="text-[10px] text-slate-400 mb-2">{st.sector}</div>
                <div className="grid grid-cols-2 gap-1 text-[10px] bg-polar-900 p-1.5 rounded border border-polar-700 mb-2">
                  <div>Anchorage: <span className={st.safe_anchorage ? 'text-emerald-400' : 'text-amber-400'}>{st.safe_anchorage ? `${st.anchorage_depth_m}m Safe` : 'Unsheltered'}</span></div>
                  <div>VHF: <span className="text-sky-300">{st.vhf_channel}</span></div>
                  <div>Medical: <span className="text-sky-300">{st.medical_level}</span></div>
                  <div>Fuel: <span className="text-sky-300">{st.fuel_support}</span></div>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mb-2">{st.description}</p>
                <button
                  onClick={() => onSelectStation(st)}
                  className="w-full py-1 bg-polar-700 hover:bg-polar-600 rounded text-sky-300 text-center font-semibold text-[10px] transition-colors"
                >
                  Inspect Haven Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Icebergs & Trajectories */}
        {showIcebergs && icebergs.map((berg) => {
          const isMega = berg.length_km > 20;
          const trajPositions: [number, number][] = berg.trajectory_72h 
            ? berg.trajectory_72h.map(p => [p.lat, p.lon]) 
            : [];

          return (
            <React.Fragment key={berg.id}>
              {/* Central 72h Track Polyline */}
              {showTrajectoryCones && trajPositions.length > 0 && (
                <Polyline
                  positions={trajPositions}
                  pathOptions={{
                    color: berg.threat_level === 'EXTREME' ? '#ef4444' : '#f59e0b',
                    dashArray: '5, 8',
                    weight: 2,
                    opacity: 0.8
                  }}
                />
              )}

              {/* Monte Carlo Ensemble Dispersion Cones */}
              {showTrajectoryCones && berg.monte_carlo_ensembles && berg.monte_carlo_ensembles.map((ens, eIdx) => (
                <Polyline
                  key={`ens-${berg.id}-${eIdx}`}
                  positions={ens.map(p => [p.lat, p.lon])}
                  pathOptions={{
                    color: berg.threat_level === 'EXTREME' ? '#ef4444' : '#f59e0b',
                    weight: 1,
                    opacity: 0.15
                  }}
                />
              ))}

              {/* Iceberg Marker */}
              <Marker
                position={[berg.lat, berg.lon]}
                icon={createIcebergIcon(berg.threat_level, isMega)}
                eventHandlers={{
                  click: () => onSelectIceberg(berg)
                }}
              >
                <Popup>
                  <div className="font-mono text-xs p-1 max-w-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400">{berg.name}</span>
                      <span className={`px-1 rounded text-[9px] font-bold ${
                        berg.threat_level === 'EXTREME' ? 'bg-red-950 text-red-300 border border-red-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {berg.threat_level}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 my-1">{berg.origin_shelf}</div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] bg-polar-900 p-1.5 rounded border border-polar-700 mb-2">
                      <div>Dimensions: <span className="text-slate-200">{berg.length_km}x{berg.width_km} km</span></div>
                      <div>Mass: <span className="text-slate-200">{berg.estimated_mass_gigatons} Gt</span></div>
                      <div>Drift: <span className="text-slate-200">{berg.drift_speed_kts} kts @ {berg.drift_heading_deg}°</span></div>
                      <div>Draft: <span className="text-slate-200">{berg.draft_m} m</span></div>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight mb-2">{berg.notes}</p>
                    <button
                      onClick={() => onSelectIceberg(berg)}
                      className="w-full py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-600 rounded font-semibold text-[10px] transition-colors"
                    >
                      Inspect Hydrodynamic Model
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 4. Active Planned Route with Segment RIO Colors */}
        {showRoute && activeRoute && activeRoute.waypoints.length > 1 && (
          <>
            {activeRoute.waypoints.map((wp, idx) => {
              if (idx === 0) return null;
              const prevWp = activeRoute.waypoints[idx - 1];
              const segColor = wp.polaris_status === 'AUTHORIZED' 
                ? '#10b981' 
                : wp.polaris_status === 'ELEVATED_RISK' 
                  ? '#f59e0b' 
                  : '#ef4444';

              return (
                <Polyline
                  key={`route-seg-${idx}`}
                  positions={[[prevWp.lat, prevWp.lon], [wp.lat, wp.lon]]}
                  pathOptions={{
                    color: segColor,
                    weight: 4,
                    opacity: 0.9
                  }}
                />
              );
            })}

            {/* Waypoint Markers */}
            {activeRoute.waypoints.map((wp, idx) => (
              <Circle
                key={`wp-marker-${idx}`}
                center={[wp.lat, wp.lon]}
                radius={25000}
                pathOptions={{
                  color: wp.status_color,
                  fillColor: '#0a1424',
                  fillOpacity: 0.9,
                  weight: 2
                }}
              >
                <Tooltip>
                  <div className="font-mono text-xs">
                    <div className="font-bold text-sky-400">{wp.name}</div>
                    <div>Leg Dist: {wp.leg_distance_nm} NM | Spd: {wp.speed_kts} kts</div>
                    <div>SIC: {wp.ice_concentration_pct}% ({wp.ice_thickness_m}m)</div>
                    <div className="font-bold" style={{ color: wp.status_color }}>
                      RIO: {wp.rio} ({wp.polaris_status})
                    </div>
                  </div>
                </Tooltip>
              </Circle>
            ))}
          </>
        )}

        {/* 5. Live Vessel Marker */}
        <Marker
          position={[vessel.lat, vessel.lon]}
          icon={createVesselIcon(vessel.heading_deg)}
        >
          <Popup>
            <div className="font-mono text-xs p-1">
              <div className="font-bold text-sky-400">{vessel.name}</div>
              <div className="text-slate-300">Polar Class: <span className="text-cyan-300 font-bold">{vessel.polar_class}</span></div>
              <div className="text-slate-300">Speed: <span className="text-white font-bold">{vessel.speed_kts} kts</span></div>
              <div className="text-slate-300">Heading: <span className="text-white font-bold">{vessel.heading_deg}° Gyro</span></div>
              <div className="text-slate-400 text-[10px] mt-1">{vessel.status}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
