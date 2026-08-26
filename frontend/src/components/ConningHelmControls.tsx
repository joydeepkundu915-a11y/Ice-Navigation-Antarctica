import React from 'react';
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
  Sliders
} from 'lucide-react';
import { VesselState, HelmState, RoutePlan } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface ConningHelmControlsProps {
  vessel: VesselState;
  helm: HelmState;
  activeRoute: RoutePlan | null;
  onUpdateHelm: (newHelm: Partial<HelmState>) => void;
  onEmergencyStop: () => void;
}

export const ConningHelmControls: React.FC<ConningHelmControlsProps> = ({
  vessel,
  helm,
  activeRoute,
  onUpdateHelm,
  onEmergencyStop
}) => {
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
    helm.rudder_deg === 0 ? 'MIDSHIPS 0°' :
    helm.rudder_deg < 0 ? ('PORT ' + Math.abs(helm.rudder_deg) + '°') : ('STBD ' + helm.rudder_deg + '°');

  const throttleDisplay = 
    helm.throttle_pct > 0 ? (helm.throttle_pct + '% AHEAD') :
    helm.throttle_pct < 0 ? (Math.abs(helm.throttle_pct) + '% ASTERN') : 'STOP';

  return (
    <div className="bg-polar-850/95 border border-polar-700/90 rounded-xl p-4 text-xs font-mono shadow-2xl backdrop-blur-md select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-polar-700 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wider text-sm flex items-center space-x-2">
              <span>BRIDGE CONNING & AUTO-HELM</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              {helm.mode === 'AUTO_WAYPOINT' ? '??? Waypoint Track Autopilot' : '??? Manual Bridge Conning Helm'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMode}
            className={
              'px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center space-x-1.5 border ' +
              (helm.mode === 'AUTO_WAYPOINT'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/20')
            }
          >
            <Navigation2 className="w-3.5 h-3.5" />
            <span>{helm.mode === 'AUTO_WAYPOINT' ? 'AUTO-PILOT ACTIVE' : 'MANUAL HELM'}</span>
          </button>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rudder */}
        <div className="bg-polar-900/80 p-3 rounded-lg border border-polar-700 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-polar-800 pb-1.5 mb-2">
            <span className="text-slate-400 font-bold flex items-center space-x-1">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>RUDDER ANGLE</span>
            </span>
            <span className={
              'font-bold text-sm ' +
              (helm.rudder_deg === 0 ? 'text-slate-200' :
               helm.rudder_deg < 0 ? 'text-red-400' : 'text-emerald-400')
            }>
              {rudderDisplay}
            </span>
          </div>

          <div className="space-y-2 py-2">
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={helm.rudder_deg}
              onChange={(e) => handleRudderChange(Number(e.target.value))}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="w-full h-2 bg-polar-700 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>PORT 35°</span>
              <span>0°</span>
              <span>STBD 35°</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => handleRudderChange(-15)}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="bg-polar-800 hover:bg-polar-700 py-1 rounded text-[10px] text-red-300 disabled:opacity-40 border border-polar-700"
            >
              Port 15°
            </button>
            <button
              onClick={() => handleRudderChange(0)}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="bg-polar-800 hover:bg-polar-700 py-1 rounded text-[10px] text-slate-200 disabled:opacity-40 border border-polar-700"
            >
              Midships
            </button>
            <button
              onClick={() => handleRudderChange(15)}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="bg-polar-800 hover:bg-polar-700 py-1 rounded text-[10px] text-emerald-300 disabled:opacity-40 border border-polar-700"
            >
              Stbd 15°
            </button>
          </div>
        </div>

        {/* Engine Throttle */}
        <div className="bg-polar-900/80 p-3 rounded-lg border border-polar-700 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-polar-800 pb-1.5 mb-2">
            <span className="text-slate-400 font-bold flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>MAIN ENGINE TELEGRAPH</span>
            </span>
            <span className="font-bold text-sm text-sky-300">
              {throttleDisplay}
            </span>
          </div>

          <div className="space-y-2 py-2">
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={helm.throttle_pct}
              onChange={(e) => handleThrottleChange(Number(e.target.value))}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="w-full h-2 bg-polar-700 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>ASTERN -50%</span>
              <span>STOP</span>
              <span>FULL 100%</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 pt-1">
            <button
              onClick={() => handleThrottleChange(0)}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="bg-polar-800 hover:bg-polar-700 py-1 rounded text-[10px] text-slate-300 disabled:opacity-40 border border-polar-700"
            >
              STOP
            </button>
            <button
              onClick={() => handleThrottleChange(30)}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="bg-polar-800 hover:bg-polar-700 py-1 rounded text-[10px] text-sky-300 disabled:opacity-40 border border-polar-700"
            >
              SLOW
            </button>
            <button
              onClick={() => handleThrottleChange(65)}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="bg-polar-800 hover:bg-polar-700 py-1 rounded text-[10px] text-amber-300 disabled:opacity-40 border border-polar-700"
            >
              HALF
            </button>
            <button
              onClick={() => handleThrottleChange(100)}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="bg-polar-800 hover:bg-polar-700 py-1 rounded text-[10px] text-red-300 disabled:opacity-40 border border-polar-700"
            >
              FULL
            </button>
          </div>
        </div>

        {/* Telemetry */}
        <div className="bg-polar-900/80 p-3 rounded-lg border border-polar-700 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-polar-800 pb-1.5">
            <span className="text-slate-400 font-bold flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>ICE LOAD TELEMETRY</span>
            </span>
            <span className="text-[10px] text-sky-400 font-mono">SENSORS ON</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-polar-800 p-2 rounded border border-polar-700">
              <span className="text-slate-400 block text-[10px]">ICE RESISTANCE</span>
              <span className="text-amber-300 font-bold">{vessel.ice_resistance_kn.toFixed(0)} kN</span>
            </div>
            <div className="bg-polar-800 p-2 rounded border border-polar-700">
              <span className="text-slate-400 block text-[10px]">HULL STRAIN</span>
              <span className="text-emerald-300 font-bold">{helm.hull_strain_mpa.toFixed(1)} MPa</span>
            </div>
            <div className="bg-polar-800 p-2 rounded border border-polar-700">
              <span className="text-slate-400 block text-[10px]">ENGINE TORQUE</span>
              <span className="text-sky-300 font-bold">{vessel.engine_load_pct}%</span>
            </div>
            <div className="bg-polar-800 p-2 rounded border border-polar-700">
              <span className="text-slate-400 block text-[10px]">PROP SPEED</span>
              <span className="text-white font-bold">{helm.propeller_rpm.toFixed(0)} RPM</span>
            </div>
          </div>

          <button
            onClick={() => {
              onEmergencyStop();
              bridgeAudio.playCriticalAlarm();
            }}
            className="w-full bg-red-950 hover:bg-red-900 border border-red-600 text-red-200 font-bold py-1.5 rounded flex items-center justify-center space-x-2 text-[11px] transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>CRASH STOP / EMERGENCY REVERSE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
