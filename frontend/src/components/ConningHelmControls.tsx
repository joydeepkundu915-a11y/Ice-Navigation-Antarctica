import React, { useState } from 'react';
import { 
  Compass, 
  Gauge, 
  Activity, 
  Power, 
  Flame, 
  ShieldAlert, 
  Navigation2, 
  RotateCw, 
  RotateCcw, 
  Anchor, 
  Radio, 
  Sliders, 
  X, 
  Minimize2, 
  Maximize2,
  Sparkles
} from 'lucide-react';
import { VesselState, HelmState, RoutePlan } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface ConningHelmControlsProps {
  vessel: VesselState;
  helm: HelmState;
  activeRoute: RoutePlan | null;
  onUpdateHelm: (newHelm: Partial<HelmState>) => void;
  onEmergencyStop: () => void;
  onClose?: () => void;
}

export const ConningHelmControls: React.FC<ConningHelmControlsProps> = ({
  vessel,
  helm,
  activeRoute,
  onUpdateHelm,
  onEmergencyStop,
  onClose
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const handleRudderChange = (deg: number) => {
    onUpdateHelm({ rudder_deg: deg });
    bridgeAudio.playTacticalClick();
  };

  const handleThrottleChange = (pct: number) => {
    onUpdateHelm({ throttle_pct: pct });
    bridgeAudio.playTacticalClick();
  };

  const toggleMode = () => {
    const nextMode = helm.mode === 'AUTO_WAYPOINT' ? 'MANUAL_CONNING' : 'AUTO_WAYPOINT';
    onUpdateHelm({ mode: nextMode });
    bridgeAudio.playWarningChime();
  };

  const rudderDisplay = 
    helm.rudder_deg === 0 ? '0° MIDSHIPS' :
    helm.rudder_deg < 0 ? ('PORT ' + Math.abs(helm.rudder_deg) + '°') : ('STBD ' + helm.rudder_deg + '°');

  const throttleDisplay = 
    helm.throttle_pct > 0 ? (helm.throttle_pct + '% AHEAD') :
    helm.throttle_pct < 0 ? (Math.abs(helm.throttle_pct) + '% ASTERN') : 'STOP';

  return (
    <div className="glass-panel border border-white/15 rounded-2xl p-4 text-xs font-mono shadow-2xl backdrop-blur-2xl select-none relative overflow-hidden">
      {/* Subtle Corner Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-500/50 flex items-center justify-center text-sky-400 shadow-sm">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-white tracking-wider text-xs block">
              CONNING HELM & PROPULSION
            </span>
            <span className="text-[10px] text-slate-400">
              STCW Polar Conning Console • {helm.mode === 'AUTO_WAYPOINT' ? 'Autopilot Track' : 'Manual Steering'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMode}
            className={
              'px-2.5 py-1 rounded-lg font-bold text-[10px] transition flex items-center space-x-1.5 border shadow-sm active:scale-95 ' +
              (helm.mode === 'AUTO_WAYPOINT'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-emerald-950/40'
                : 'bg-amber-950/90 text-amber-300 border-amber-500/80 shadow-amber-950/40')
            }
          >
            <Navigation2 className="w-3 h-3" />
            <span>{helm.mode === 'AUTO_WAYPOINT' ? 'AUTO-TRACK' : 'MANUAL'}</span>
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg glass-card hover:bg-polar-800 text-slate-400 hover:text-white"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg glass-card hover:bg-red-950/60 text-slate-400 hover:text-red-300"
              title="Close Helm (ESC)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Rudder Console */}
          <div className="bg-polar-950/70 p-3 rounded-xl border border-white/5 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold flex items-center space-x-1">
                <span>RUDDER ANGLE</span>
              </span>
              <span className={
                'font-bold text-xs ' +
                (helm.rudder_deg === 0 ? 'text-slate-200' :
                 helm.rudder_deg < 0 ? 'text-red-400' : 'text-emerald-400')
              }>
                {rudderDisplay}
              </span>
            </div>

            {/* Visual Arc / Slider */}
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={helm.rudder_deg}
              onChange={(e) => handleRudderChange(Number(e.target.value))}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="w-full h-2 bg-polar-800 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40"
            />

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => handleRudderChange(-15)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="glass-card hover:bg-red-950/60 py-1 rounded-lg text-[10px] font-bold text-red-300 disabled:opacity-40"
              >
                P 15°
              </button>
              <button
                onClick={() => handleRudderChange(0)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="glass-card hover:bg-polar-800 py-1 rounded-lg text-[10px] font-bold text-slate-200 disabled:opacity-40"
              >
                MIDSHIPS
              </button>
              <button
                onClick={() => handleRudderChange(15)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="glass-card hover:bg-emerald-950/60 py-1 rounded-lg text-[10px] font-bold text-emerald-300 disabled:opacity-40"
              >
                S 15°
              </button>
            </div>
          </div>

          {/* Engine Telegraph Console */}
          <div className="bg-polar-950/70 p-3 rounded-xl border border-white/5 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold">ENGINE TELEGRAPH</span>
              <span className="font-bold text-xs text-sky-300">{throttleDisplay}</span>
            </div>

            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={helm.throttle_pct}
              onChange={(e) => handleThrottleChange(Number(e.target.value))}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="w-full h-2 bg-polar-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
            />

            <div className="grid grid-cols-4 gap-1 pt-1">
              <button
                onClick={() => handleThrottleChange(0)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="glass-card py-1 rounded-lg text-[9px] font-bold text-slate-300 disabled:opacity-40"
              >
                STOP
              </button>
              <button
                onClick={() => handleThrottleChange(30)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="glass-card py-1 rounded-lg text-[9px] font-bold text-sky-300 disabled:opacity-40"
              >
                SLOW
              </button>
              <button
                onClick={() => handleThrottleChange(65)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="glass-card py-1 rounded-lg text-[9px] font-bold text-amber-300 disabled:opacity-40"
              >
                HALF
              </button>
              <button
                onClick={() => handleThrottleChange(100)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="glass-card py-1 rounded-lg text-[9px] font-bold text-red-300 disabled:opacity-40"
              >
                FULL
              </button>
            </div>
          </div>

          {/* Hydrodynamic Telemetry & Crash Stop */}
          <div className="bg-polar-950/70 p-3 rounded-xl border border-white/5 flex flex-col justify-between space-y-2 shadow-inner">
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="bg-polar-900/60 p-1 rounded">
                <span className="text-slate-400 block text-[9px]">ICE CRUSH</span>
                <strong className="text-amber-300">{vessel.ice_resistance_kn.toFixed(0)} kN</strong>
              </div>
              <div className="bg-polar-900/60 p-1 rounded">
                <span className="text-slate-400 block text-[9px]">HULL STRAIN</span>
                <strong className="text-emerald-300">{helm.hull_strain_mpa.toFixed(0)} MPa</strong>
              </div>
              <div className="bg-polar-900/60 p-1 rounded">
                <span className="text-slate-400 block text-[9px]">ENGINE LOAD</span>
                <strong className="text-sky-300">{vessel.engine_load_pct}%</strong>
              </div>
              <div className="bg-polar-900/60 p-1 rounded">
                <span className="text-slate-400 block text-[9px]">PROP RPM</span>
                <strong className="text-white">{helm.propeller_rpm.toFixed(0)}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                onEmergencyStop();
                bridgeAudio.playCriticalAlarm();
              }}
              className="w-full bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 border border-red-500 text-white font-extrabold py-2 rounded-xl text-[10px] flex items-center justify-center space-x-1.5 shadow-lg shadow-red-950/50 active:scale-95 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>EMERGENCY CRASH STOP (ASTERN)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};