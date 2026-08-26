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
  Maximize2 
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
    <div className="bg-polar-850/95 border border-polar-700/90 rounded-lg p-3 text-xs font-mono shadow-2xl backdrop-blur-md select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-polar-700 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white tracking-wider text-xs">
            CONNING HELM & PROPULSION
          </span>
          <span className="text-[10px] text-slate-400">
            ({helm.mode === 'AUTO_WAYPOINT' ? 'AUTOPILOT' : 'MANUAL'})
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={toggleMode}
            className={
              'px-2 py-0.5 rounded font-bold text-[10px] transition flex items-center space-x-1 border ' +
              (helm.mode === 'AUTO_WAYPOINT'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                : 'bg-amber-950 text-amber-300 border-amber-500')
            }
          >
            <Navigation2 className="w-3 h-3" />
            <span>{helm.mode === 'AUTO_WAYPOINT' ? 'AUTO-TRACK' : 'MANUAL'}</span>
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-polar-800 text-slate-400 hover:text-white"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-polar-800 text-slate-400 hover:text-white"
              title="Close Helm (ESC)"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Rudder */}
          <div className="bg-polar-900 p-2 rounded border border-polar-700 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold">RUDDER</span>
              <span className={
                'font-bold ' +
                (helm.rudder_deg === 0 ? 'text-slate-200' :
                 helm.rudder_deg < 0 ? 'text-red-400' : 'text-emerald-400')
              }>
                {rudderDisplay}
              </span>
            </div>

            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={helm.rudder_deg}
              onChange={(e) => handleRudderChange(Number(e.target.value))}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="w-full h-1.5 bg-polar-700 rounded appearance-none cursor-pointer accent-sky-400 disabled:opacity-40"
            />

            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleRudderChange(-15)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="bg-polar-800 hover:bg-polar-700 py-0.5 rounded text-[9px] text-red-300 disabled:opacity-40"
              >
                P15°
              </button>
              <button
                onClick={() => handleRudderChange(0)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="bg-polar-800 hover:bg-polar-700 py-0.5 rounded text-[9px] text-slate-200 disabled:opacity-40"
              >
                MID
              </button>
              <button
                onClick={() => handleRudderChange(15)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="bg-polar-800 hover:bg-polar-700 py-0.5 rounded text-[9px] text-emerald-300 disabled:opacity-40"
              >
                S15°
              </button>
            </div>
          </div>

          {/* Throttle */}
          <div className="bg-polar-900 p-2 rounded border border-polar-700 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold">TELEGRAPH</span>
              <span className="font-bold text-sky-300">{throttleDisplay}</span>
            </div>

            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={helm.throttle_pct}
              onChange={(e) => handleThrottleChange(Number(e.target.value))}
              disabled={helm.mode === 'AUTO_WAYPOINT'}
              className="w-full h-1.5 bg-polar-700 rounded appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
            />

            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => handleThrottleChange(0)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="bg-polar-800 hover:bg-polar-700 py-0.5 rounded text-[9px] text-slate-300 disabled:opacity-40"
              >
                STOP
              </button>
              <button
                onClick={() => handleThrottleChange(30)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="bg-polar-800 hover:bg-polar-700 py-0.5 rounded text-[9px] text-sky-300 disabled:opacity-40"
              >
                SLOW
              </button>
              <button
                onClick={() => handleThrottleChange(65)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="bg-polar-800 hover:bg-polar-700 py-0.5 rounded text-[9px] text-amber-300 disabled:opacity-40"
              >
                HALF
              </button>
              <button
                onClick={() => handleThrottleChange(100)}
                disabled={helm.mode === 'AUTO_WAYPOINT'}
                className="bg-polar-800 hover:bg-polar-700 py-0.5 rounded text-[9px] text-red-300 disabled:opacity-40"
              >
                FULL
              </button>
            </div>
          </div>

          {/* Fast Telemetry & Stop */}
          <div className="bg-polar-900 p-2 rounded border border-polar-700 flex flex-col justify-between space-y-1.5">
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div>RES: <strong className="text-amber-300">{vessel.ice_resistance_kn.toFixed(0)} kN</strong></div>
              <div>STR: <strong className="text-emerald-300">{helm.hull_strain_mpa.toFixed(0)} MPa</strong></div>
              <div>ENG: <strong className="text-sky-300">{vessel.engine_load_pct}%</strong></div>
              <div>RPM: <strong className="text-white">{helm.propeller_rpm.toFixed(0)}</strong></div>
            </div>

            <button
              onClick={() => {
                onEmergencyStop();
                bridgeAudio.playCriticalAlarm();
              }}
              className="w-full bg-red-950 hover:bg-red-900 border border-red-600 text-red-200 font-bold py-1 rounded text-[10px] flex items-center justify-center space-x-1"
            >
              <ShieldAlert className="w-3 h-3 text-red-400 animate-pulse" />
              <span>CRASH STOP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};