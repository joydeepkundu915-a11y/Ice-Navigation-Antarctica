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
  Info,
  Ship,
  AlertOctagon
} from 'lucide-react';
import { Station, Iceberg, RoutePlan, VesselState, DisplayPalette, AISVessel, DistressSOSState } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

// Custom Leaflet DivIcons
const createVesselIcon = (heading: number, palette: DisplayPalette) => {
  const strokeColor = palette === 'night' ? '#ef4444' : palette === 'day' ? '#0284c7' : '#38bdf8';
  const fillColor = palette === 'night' ? '#991b1b' : palette === 'thermal' ? '#f59e0b' : '#00f2fe';

  return L.divIcon({
    className: 'vessel-marker',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease;">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="17,2 28,30 17,23 6,30" fill="${strokeColor}" stroke="#ffffff" stroke-width="2" />
          <circle cx="17" cy="17" r="3.5" fill="${fillColor}" />
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const createAISVesselIcon = (heading: number, isCritical: boolean) => {
  const color = isCritical ? '#ef4444' : '#a855f7';
  return L.divIcon({
    className: 'ais-vessel-marker',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 20,20 12,16 4,20" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

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
  const [showSIC, setShowSIC] = useState<boolean>(true);
  const [showIcebergs, setShowIcebergs] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [showTrajectoryCones, setShowTrajectoryCones] = useState<boolean>(true);
  const [showRoute, setShowRoute] = useState<boolean>(true);
  const [showWake, setShowWake] = useState<boolean>(true);
  const [showAIS, setShowAIS] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-65.0, -60.0]);

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

  return (
    <div className="relative w-full h-full bg-polar-900 overflow-hidden flex flex-col select-none">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-polar-850/90 backdrop-blur-md p-2.5 rounded-lg border border-polar-700 shadow-2xl flex flex-col space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center space-x-2 text-slate-300 font-bold border-b border-polar-700 pb-1">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>POLAR OVERLAYS</span>
        </div>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showSIC}
            onChange={(e) => setShowSIC(e.target.checked)}
            className="rounded bg-polar-800 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>Sea Ice Concentration</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showAIS}
            onChange={(e) => setShowAIS(e.target.checked)}
            className="rounded bg-polar-800 border-polar-600 text-purple-500 focus:ring-0"
          />
          <span>AIS Vessel Traffic ({aisVessels.length})</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showIcebergs}
            onChange={(e) => setShowIcebergs(e.target.checked)}
            className="rounded bg-polar-800 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>Icebergs & Drift Cones</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showRoute}
            onChange={(e) => setShowRoute(e.target.checked)}
            className="rounded bg-polar-800 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>POLARIS Route & Leads</span>
        </label>

        <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
            className="rounded bg-polar-800 border-polar-600 text-sky-500 focus:ring-0"
          />
          <span>Antarctic Stations / Shelters</span>
        </label>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-3 z-[1000] bg-polar-850/90 backdrop-blur-md p-2 rounded-lg border border-polar-700 shadow-2xl text-[10px] font-mono flex flex-col space-y-1 pointer-events-auto">
        <span className="text-slate-400 font-bold border-b border-polar-700 pb-0.5">ICE CONCENTRATION (SIC)</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#00f2fe]/40 border border-[#00f2fe]" />
          <span className="text-slate-300">Open Water / Leads (&lt;15%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#38bdf8]/40 border border-[#38bdf8]" />
          <span className="text-slate-300">Open Pack (15% - 60%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#818cf8]/40 border border-[#818cf8]" />
          <span className="text-slate-300">Close Pack (60% - 85%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#f43f5e]/40 border border-[#f43f5e]" />
          <span className="text-slate-300">Fast Heavy Ice (&gt;85%)</span>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={5}
        minZoom={3}
        maxZoom={10}
        className="w-full h-full z-10"
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />

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

        {/* 2. Active Route */}
        {showRoute && activeRoute && activeRoute.waypoints && (
          <>
            <Polyline
              positions={activeRoute.waypoints.map((w) => [w.lat, w.lon])}
              pathOptions={{
                color: '#38bdf8',
                weight: 3.5,
                dashArray: '8, 6',
                opacity: 0.9
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
                    color: isAuth ? '#10b981' : '#ef4444',
                    fillColor: isAuth ? '#10b981' : '#ef4444',
                    fillOpacity: 0.7,
                    weight: 2
                  }}
                >
                  <Tooltip>
                    <div className="text-xs font-mono p-1">
                      <span className="font-bold text-white block">WPT {wpt.index}: {wpt.name}</span>
                      <span>RIO: {wpt.rio} ({wpt.polaris_status})</span>
                      <span className="block text-slate-300">Ice: {wpt.ice_concentration_pct}%</span>
                    </div>
                  </Tooltip>
                </Circle>
              );
            })}
          </>
        )}

        {/* 3. Vessel Dynamic Wake */}
        {showWake && wakePoints.length > 1 && (
          <Polyline
            positions={wakePoints}
            pathOptions={{
              color: '#00f2fe',
              weight: 2.5,
              opacity: 0.7,
              dashArray: '3, 4'
            }}
          />
        )}

        {/* 4. Conning Heading Lookahead Vector */}
        <Polyline
          positions={[
            [vessel.lat, vessel.lon],
            [lookaheadLat, lookaheadLon]
          ]}
          pathOptions={{
            color: '#e0f2fe',
            weight: 2,
            dashArray: '2, 3',
            opacity: 0.95
          }}
        />

        {/* 5. Vessel Live Marker */}
        <Marker
          position={[vessel.lat, vessel.lon]}
          icon={createVesselIcon(vessel.heading_deg, palette)}
        >
          <Popup>
            <div className="text-xs font-mono space-y-1 p-1">
              <span className="font-bold text-sky-400 block">{vessel.name}</span>
              <span className="block text-slate-300">Class: {vessel.polar_class}</span>
              <span className="block text-slate-300">Speed: {vessel.speed_kts.toFixed(1)} kts</span>
              <span className="block text-slate-300">Heading: {vessel.heading_deg.toFixed(0)}°</span>
              <span className="block text-slate-300">Status: {vessel.status}</span>
            </div>
          </Popup>
        </Marker>

        {/* 6. SOS Distress Beacon Pulse on Own Ship */}
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
              <div className="bg-red-950 text-white font-bold px-2 py-0.5 rounded border border-red-500 text-xs animate-bounce">
                🚨 MAYDAY DISTRESS ACTIVE (POB: {sosState.souls_on_board})
              </div>
            </Tooltip>
          </Circle>
        )}

        {/* 7. AIS Target Vessels & Heading Vectors */}
        {showAIS && aisVessels.map((tgt) => {
          const isCrit = (tgt.dcpa_nm || 99) < 2.0 && (tgt.tcpa_min || 99) < 20;

          // Target lookahead
          const tgtLookLat = tgt.lat + (3.0 / 60.0) * Math.cos((tgt.heading_deg * Math.PI) / 180);
          const tgtLookLon = tgt.lon + (3.0 / (60.0 * Math.cos((tgt.lat * Math.PI) / 180))) * Math.sin((tgt.heading_deg * Math.PI) / 180);

          return (
            <React.Fragment key={tgt.id}>
              <Polyline
                positions={[
                  [tgt.lat, tgt.lon],
                  [tgtLookLat, tgtLookLon]
                ]}
                pathOptions={{
                  color: isCrit ? '#ef4444' : '#a855f7',
                  weight: 1.5,
                  dashArray: '2, 3'
                }}
              />

              <Marker
                position={[tgt.lat, tgt.lon]}
                icon={createAISVesselIcon(tgt.heading_deg, isCrit)}
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
                    <span className="block text-slate-300">DCPA: {tgt.dcpa_nm?.toFixed(1)} NM • TCPA: {tgt.tcpa_min?.toFixed(0)}m</span>
                    <span className="block text-emerald-400 font-bold">{tgt.status}</span>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 8. Drifting Icebergs */}
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

        {/* 9. Research Stations */}
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