import React, { useState } from 'react';
import { 
  Waves, 
  Wind, 
  Compass, 
  Activity, 
  Layers, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight, 
  Navigation,
  Thermometer,
  Eye
} from 'lucide-react';
import { Iceberg } from '../types';

interface IcebergTrajectoryViewerProps {
  icebergs: Iceberg[];
  selectedIceberg: Iceberg | null;
  onSelectIceberg: (iceberg: Iceberg) => void;
}

export const IcebergTrajectoryViewer: React.FC<IcebergTrajectoryViewerProps> = ({
  icebergs,
  selectedIceberg,
  onSelectIceberg
}) => {
  const currentBerg = selectedIceberg || icebergs[0];
  const [activeTab, setActiveTab] = useState<'physics' | 'trajectory' | 'monte_carlo'>('physics');

  if (!currentBerg) {
    return <div className="p-4 text-slate-400 font-mono">No icebergs loaded.</div>;
  }

  const drift = currentBerg.current_drift || {
    drift_speed_kts: currentBerg.drift_speed_kts,
    drift_heading_deg: currentBerg.drift_heading_deg,
    wind_influence_pct: 35.0,
    current_influence_pct: 65.0
  };

  return (
    <div className="w-full h-full bg-polar-900 p-4 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Title */}
        <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>ANTARCTIC ICEBERG HYDRODYNAMIC DRIFT ENGINE</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-700">
                  MONTE CARLO DRIFT MODEL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Atmospheric Sail Drag, Deep Keel Ekman Advection & Coriolis Dynamics
              </p>
            </div>
          </div>
        </div>

        {/* Iceberg Selector Pill List */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {icebergs.map((berg) => {
            const isSelected = berg.id === currentBerg.id;
            return (
              <button
                key={berg.id}
                onClick={() => onSelectIceberg(berg)}
                className={`px-3 py-2 rounded-lg border text-xs whitespace-nowrap transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-sky-950 border-sky-400 text-white shadow-lg'
                    : 'bg-polar-850 border-polar-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-bold">{berg.id}</span>
                <span className="text-[10px] text-slate-400">({berg.length_km}km)</span>
              </button>
            );
          })}
        </div>

        {/* Selected Iceberg Deep Inspection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Physical & Morphological Profile (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-polar-700 pb-2">
                <span className="font-bold text-sm text-sky-400">{currentBerg.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentBerg.threat_level === 'EXTREME' ? 'bg-red-950 text-red-300 border border-red-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}>
                  {currentBerg.threat_level}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                <strong>Origin:</strong> {currentBerg.origin_shelf}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-polar-900 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block">DIMENSIONS</span>
                  <span className="text-slate-200 font-bold">{currentBerg.length_km} x {currentBerg.width_km} km</span>
                </div>
                <div className="bg-polar-900 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block">SURFACE AREA</span>
                  <span className="text-slate-200 font-bold">{currentBerg.area_sq_km.toLocaleString()} km²</span>
                </div>
                <div className="bg-polar-900 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block">ESTIMATED MASS</span>
                  <span className="text-sky-300 font-bold">{currentBerg.estimated_mass_gigatons} Gt</span>
                </div>
                <div className="bg-polar-900 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block">SUBMERGED DRAFT</span>
                  <span className="text-slate-200 font-bold">{currentBerg.draft_m} m</span>
                </div>
              </div>

              <div className="bg-polar-900 p-3 rounded-lg border border-polar-700 space-y-1.5 text-xs">
                <span className="text-slate-400 font-bold block text-[10px]">CURRENT DRIFT VECTOR</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Drift Speed:</span>
                  <span className="text-emerald-400 font-bold text-sm">{drift.drift_speed_kts} kts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Heading (COG):</span>
                  <span className="text-slate-200 font-bold">{drift.drift_heading_deg}° True</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Hazard Corridor:</span>
                  <span className="text-amber-300 text-[11px] font-semibold">{currentBerg.hazard_corridor}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-polar-950 p-2.5 rounded border border-polar-800">
                {currentBerg.notes}
              </p>
            </div>
          </div>

          {/* Right Column: Hydrodynamic Physics & Monte Carlo Forecasts (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-polar-850 p-1 rounded-xl border border-polar-700">
              <button
                onClick={() => setActiveTab('physics')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'physics' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Force Balance Model
              </button>
              <button
                onClick={() => setActiveTab('trajectory')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'trajectory' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                72h Trajectory Track
              </button>
              <button
                onClick={() => setActiveTab('monte_carlo')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'monte_carlo' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monte Carlo Dispersion
              </button>
            </div>

            {/* Tab 1: Dynamic Force Balance */}
            {activeTab === 'physics' && (
              <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 border-b border-polar-700 pb-2 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>STEADY-STATE DYNAMICAL FORCE EQUILIBRIUM</span>
                </h4>

                <div className="bg-polar-950 p-3 rounded-lg border border-polar-800 text-xs text-sky-300 font-mono leading-relaxed">
                  m (d u_i / dt + f k x u_i) = F_air (Sail Drag) + F_water (Keel Drag) + F_coriolis
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Deep Oceanic Current Drag (Keel Friction 90% Submerged)</span>
                      <span className="text-teal-400 font-bold">{drift.current_influence_pct}%</span>
                    </div>
                    <div className="w-full bg-polar-900 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full" 
                        style={{ width: `${drift.current_influence_pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Atmospheric Wind Drag (Freeboard Sail Area)</span>
                      <span className="text-sky-400 font-bold">{drift.wind_influence_pct}%</span>
                    </div>
                    <div className="w-full bg-polar-900 rounded-full h-2">
                      <div 
                        className="bg-sky-500 h-2 rounded-full" 
                        style={{ width: `${drift.wind_influence_pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="bg-polar-900 p-2.5 rounded border border-polar-700">
                    <span className="text-slate-400 text-[10px] block">CORIOLIS DEFLECTION</span>
                    <span className="text-slate-100 font-semibold">Left of Wind Flow (SH)</span>
                  </div>
                  <div className="bg-polar-900 p-2.5 rounded border border-polar-700">
                    <span className="text-slate-400 text-[10px] block">AIR DRAG COEFF (C_a)</span>
                    <span className="text-slate-100 font-semibold">1.35 (Tabular Wall)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: 72h Deterministic Trajectory */}
            {activeTab === 'trajectory' && (
              <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 border-b border-polar-700 pb-2">
                  72-HOUR DETERMINISTIC FORECAST WAYPOINTS
                </h4>

                <div className="overflow-x-auto max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] text-slate-400 border-b border-polar-800 bg-polar-900 sticky top-0">
                      <tr>
                        <th className="py-1 px-2">HORIZON</th>
                        <th className="py-1 px-2">LATITUDE</th>
                        <th className="py-1 px-2">LONGITUDE</th>
                        <th className="py-1 px-2">DRIFT SPD</th>
                        <th className="py-1 px-2">HDG (COG)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-polar-800 text-[11px]">
                      {currentBerg.trajectory_72h?.map((pt, idx) => (
                        <tr key={idx} className="hover:bg-polar-800/50">
                          <td className="py-1.5 px-2 font-bold text-sky-400">+{pt.hour} hrs</td>
                          <td className="py-1.5 px-2 text-slate-300">{Math.abs(pt.lat).toFixed(3)}°S</td>
                          <td className="py-1.5 px-2 text-slate-300">{Math.abs(pt.lon).toFixed(3)}°W</td>
                          <td className="py-1.5 px-2 text-emerald-400">{pt.speed_kts || currentBerg.drift_speed_kts} kts</td>
                          <td className="py-1.5 px-2 text-slate-300">{pt.heading_deg || currentBerg.drift_heading_deg}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Monte Carlo Dispersion Ensembles */}
            {activeTab === 'monte_carlo' && (
              <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 border-b border-polar-700 pb-2">
                  STOCHASTIC ENSEMBLE UNCERTAINTY CONE RADII
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-polar-900 p-3 rounded-lg border border-polar-700">
                    <span className="text-slate-400 text-[10px] block">24-HOUR RADIUS</span>
                    <span className="text-sky-300 font-bold text-lg">
                      {currentBerg.uncertainty_radii_nm?.['24h_nm'] || 8.5} NM
                    </span>
                    <span className="text-[9px] text-slate-500 block">95% Conf. Ellipse</span>
                  </div>

                  <div className="bg-polar-900 p-3 rounded-lg border border-polar-700">
                    <span className="text-slate-400 text-[10px] block">48-HOUR RADIUS</span>
                    <span className="text-amber-300 font-bold text-lg">
                      {currentBerg.uncertainty_radii_nm?.['48h_nm'] || 16.2} NM
                    </span>
                    <span className="text-[9px] text-slate-500 block">95% Conf. Ellipse</span>
                  </div>

                  <div className="bg-polar-900 p-3 rounded-lg border border-polar-700">
                    <span className="text-slate-400 text-[10px] block">72-HOUR RADIUS</span>
                    <span className="text-red-400 font-bold text-lg">
                      {currentBerg.uncertainty_radii_nm?.['72h_nm'] || 24.8} NM
                    </span>
                    <span className="text-[9px] text-slate-500 block">95% Conf. Ellipse</span>
                  </div>
                </div>

                <div className="bg-polar-950 p-3 rounded border border-polar-800 text-xs text-slate-300">
                  <strong className="text-amber-400">Navigation Advisory:</strong> Avoid vessel tracks crossing within the 72-hour uncertainty envelope of <strong>{currentBerg.name}</strong> due to turbulent wake shedding of growlers and sudden capsizing waves.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
