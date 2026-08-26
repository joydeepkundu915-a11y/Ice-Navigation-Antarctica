import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Gauge, 
  Wind, 
  Sliders, 
  Activity, 
  Zap,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { VesselState } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface SimulationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSetPlaybackSpeed: (speed: number) => void;
  vessel: VesselState;
  onTriggerStorm: () => void;
  onTriggerIceRidge: () => void;
  onResetSimulation: () => void;
  isHelmOpen: boolean;
  onToggleHelm: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSetPlaybackSpeed,
  vessel,
  onTriggerStorm,
  onTriggerIceRidge,
  onResetSimulation,
  isHelmOpen,
  onToggleHelm
}) => {
  return (
    <div className="bg-polar-850 border-t border-polar-700/80 px-4 py-2.5 flex flex-wrap items-center justify-between shadow-2xl z-30 select-none text-xs font-mono">
      {/* Left: Playback & Speed */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            onTogglePlay();
            bridgeAudio.playTacticalClick();
          }}
          className={
            'flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold border transition ' +
            (isPlaying
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 hover:bg-emerald-900'
              : 'bg-amber-950/80 text-amber-300 border-amber-500 hover:bg-amber-900')
          }
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'VOYAGE SIM ACTIVE' : 'SIMULATION PAUSED'}</span>
        </button>

        {/* Speed Multipliers */}
        <div className="flex items-center space-x-1 bg-polar-900 p-1 rounded-lg border border-polar-700">
          {[1, 2, 5, 10, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                onSetPlaybackSpeed(spd);
                bridgeAudio.playTacticalClick();
              }}
              className={
                'px-2 py-0.5 rounded text-[10px] font-bold transition ' +
                (playbackSpeed === spd
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200')
              }
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            onResetSimulation();
            bridgeAudio.playTacticalClick();
          }}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg border border-polar-700 hover:bg-polar-800 transition"
          title="Reset Voyage to Starting Waypoint"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Vessel Status Strip */}
      <div className="hidden lg:flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold">{vessel.status}</span>
        </div>

        <div className="flex items-center space-x-2 bg-polar-900 px-2.5 py-1 rounded border border-polar-700 text-[11px]">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">FUEL:</span>
          <span className="text-white font-bold">{vessel.fuel_flow_m3_h.toFixed(2)} m³/h</span>
        </div>

        <div className="flex items-center space-x-2 bg-polar-900 px-2.5 py-1 rounded border border-polar-700 text-[11px]">
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">THRUST LOAD:</span>
          <span className="text-sky-300 font-bold">{vessel.engine_load_pct}%</span>
        </div>
      </div>

      {/* Right: Helm Drawer Toggle & Metocean Injects */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            onTriggerStorm();
            bridgeAudio.playWarningChime();
          }}
          className="bg-red-950/70 hover:bg-red-900 border border-red-600/80 text-red-200 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition text-[11px]"
          title="Inject Katabatic Force 10 Blizzard"
        >
          <Wind className="w-3.5 h-3.5 text-red-400" />
          <span>KATABATIC GALE</span>
        </button>

        <button
          onClick={() => {
            onTriggerIceRidge();
            bridgeAudio.playWarningChime();
          }}
          className="bg-purple-950/70 hover:bg-purple-900 border border-purple-600/80 text-purple-200 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition text-[11px]"
          title="Inject Consolidated Multi-Year Pressure Ridge"
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>PRESSURE RIDGE</span>
        </button>

        <button
          onClick={() => {
            onToggleHelm();
            bridgeAudio.playTacticalClick();
          }}
          className={
            'px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1.5 transition ' +
            (isHelmOpen
              ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/40'
              : 'bg-polar-800 text-slate-300 border-polar-600 hover:bg-polar-700')
          }
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>CONNING HELM</span>
        </button>
      </div>
    </div>
  );
};
