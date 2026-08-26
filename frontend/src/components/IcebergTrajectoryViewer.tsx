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
  Eye,
  X
} from 'lucide-react';
import { Iceberg } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface IcebergTrajectoryViewerProps {
  icebergs: Iceberg[];
  selectedIceberg: Iceberg | null;
  onSelectIceberg: (iceberg: Iceberg) => void;
  onClose?: () => void;
}

export const IcebergTrajectoryViewer: React.FC<IcebergTrajectoryViewerProps> = ({
  icebergs,
  selectedIceberg,
  onSelectIceberg,
  onClose
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
    <div className="w-full h-full bg-polar-900 p-3 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header with Close */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>ANTARCTIC ICEBERG HYDRODYNAMIC DRIFT ENGINE</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-950 text-red-300 border border-red-700">
                  MONTE CARLO DRIFT MODEL
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Atmospheric Sail Drag, Deep Keel Ekman Advection & Coriolis Dynamics
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                onClose();
                bridgeAudio.playTacticalClick();
              }}
              className="bg-polar-800 hover:bg-polar-700 text-slate-300 hover:text-white px-2.5 py-1 rounded border border-polar-600 text-xs flex items-center space-x-1"
              title="Return to ECDIS Map (ESC)"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>CLOSE [ESC]</span>
            </button>
          )}
        </div>

        {/* Iceberg Selector Strip */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {icebergs.map((b) => {
            const isSel = b.id === currentBerg.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  onSelectIceberg(b);
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ' + (
                  isSel
                    ? 'bg-sky-950 border-sky-400 text-white shadow-md'
                    : 'bg-polar-850 border-polar-700 text-slate-400 hover:bg-polar-800 hover:text-slate-200'
                )}
              >
                <span>{b.name}</span>
                <span className={'px-1.5 py-0.2 rounded text-[9px] ' + (
                  b.threat_level === 'EXTREME' ? 'bg-red-900 text-red-200' :
                  b.threat_level === 'HIGH' ? 'bg-amber-900 text-amber-200' : 'bg-sky-900 text-sky-200'
                )}>
                  {b.threat_level}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Berg Overview */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-polar-900 p-2.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[10px] block">ORIGIN SHELF</span>
            <span className="text-white font-bold">{currentBerg.origin_shelf}</span>
          </div>
          <div className="bg-polar-900 p-2.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[10px] block">DIMENSIONS / AREA</span>
            <span className="text-white font-bold">{currentBerg.length_km} x {currentBerg.width_km} km ({currentBerg.area_sq_km} km²)</span>
          </div>
          <div className="bg-polar-900 p-2.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[10px] block">FREEBOARD / DRAFT</span>
            <span className="text-white font-bold">{currentBerg.freeboard_m}m / {currentBerg.draft_m}m</span>
          </div>
          <div className="bg-polar-900 p-2.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[10px] block">ESTIMATED MASS</span>
            <span className="text-white font-bold">{currentBerg.estimated_mass_gigatons} Gt</span>
          </div>
        </div>

        {/* Hydrodynamic Force Vectors */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-4 space-y-3">
          <span className="font-bold text-xs text-sky-400 block border-b border-polar-700 pb-1">
            HYDRODYNAMIC FORCE BALANCE & CORIOLIS EQUATIONS
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-polar-900 p-3 rounded border border-polar-700 space-y-1">
              <span className="font-bold text-slate-200 block">1. ATMOSPHERIC FORM DRAG (Fa)</span>
              <p className="text-[11px] text-slate-400">
                Wind force acting on freeboard sail area: Fa = 0.5 * rho_a * Ca * Aa * |Va - Vi|(Va - Vi)
              </p>
              <span className="text-teal-400 font-bold text-xs">Influence: {drift.wind_influence_pct}%</span>
            </div>

            <div className="bg-polar-900 p-3 rounded border border-polar-700 space-y-1">
              <span className="font-bold text-slate-200 block">2. OCEAN CURRENT KEEL DRAG (Fw)</span>
              <p className="text-[11px] text-slate-400">
                Antarctic Circumpolar Current & Ekman shear drag acting on submerged keel (250m draft).
              </p>
              <span className="text-sky-400 font-bold text-xs">Influence: {drift.current_influence_pct}%</span>
            </div>

            <div className="bg-polar-900 p-3 rounded border border-polar-700 space-y-1">
              <span className="font-bold text-slate-200 block">3. CORIOLIS DEFLECTION (Fc)</span>
              <p className="text-[11px] text-slate-400">
                Southern Hemisphere deflection to left of motion vector: Fc = -m * 2 * Omega * sin(phi) * k x Vi
              </p>
              <span className="text-amber-400 font-bold text-xs">Coriolis Deflection: -1.32e-4 s?¹</span>
            </div>
          </div>
        </div>

        {/* 72-Hour Monte Carlo Dispersion Cone */}
        {currentBerg.uncertainty_radii_nm && (
          <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 space-y-2">
            <span className="font-bold text-xs text-amber-400 block border-b border-polar-700 pb-1">
              72-HOUR STOCHASTIC ENSEMBLE UNCERTAINTY RADII
            </span>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-polar-900 p-2 rounded border border-polar-700">
                <span className="text-slate-400 text-[10px] block">+24 HOURS UNCERTAINTY</span>
                <span className="text-white font-bold">±{currentBerg.uncertainty_radii_nm['24h_nm']} NM</span>
              </div>
              <div className="bg-polar-900 p-2 rounded border border-polar-700">
                <span className="text-slate-400 text-[10px] block">+48 HOURS UNCERTAINTY</span>
                <span className="text-white font-bold">±{currentBerg.uncertainty_radii_nm['48h_nm']} NM</span>
              </div>
              <div className="bg-polar-900 p-2 rounded border border-polar-700">
                <span className="text-slate-400 text-[10px] block">+72 HOURS UNCERTAINTY</span>
                <span className="text-white font-bold">±{currentBerg.uncertainty_radii_nm['72h_nm']} NM</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
