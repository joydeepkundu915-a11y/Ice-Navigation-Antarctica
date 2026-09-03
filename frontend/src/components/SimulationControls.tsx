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
  Radio,
  Bot,
  Ship,
  Sparkles,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { VesselState, AutoSailState } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface SimulationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSetPlaybackSpeed: (speed: number) => void;
  vessel: VesselState;
  onTriggerStorm: () => void;
  onTriggerIceRidge: () => void;
  onTriggerCollisionTest?: () => void;
  onResetSimulation: () => void;
  isHelmOpen: boolean;
  onToggleHelm: () => void;
  autoSail: AutoSailState;
  onToggleAutoSail: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSetPlaybackSpeed,
  vessel,
  onTriggerStorm,
  onTriggerIceRidge,
  onTriggerCollisionTest,
  onResetSimulation,
  isHelmOpen,
  onToggleHelm,
  autoSail,
  onToggleAutoSail
}) => {
  return (
    <div className="glass-panel border-t border-white/10 px-4 py-2 flex flex-wrap items-center justify-between shadow-2xl z-30 select-none text-xs font-mono">
      {/* Left: Playback, Speed Multipliers & Auto-Sail */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => {
            onTogglePlay();
            bridgeAudio.playTacticalClick();
          }}
          className={
            'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold border transition shadow-sm active:scale-95 ' +
            (isPlaying
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70 hover:bg-emerald-900/90'
              : 'bg-amber-950/90 text-amber-300 border-amber-500/70 hover:bg-amber-900/90')
          }
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'HYDRO ACTIVE' : 'SIM PAUSED'}</span>
        </button>

        {/* Simulation Speed Multipliers */}
        <div className="flex items-center space-x-1 bg-polar-950/80 px-1 py-0.5 rounded-lg border border-white/10 shadow-inner">
          <span className="text-[9px] text-slate-400 font-bold hidden sm:inline">WARP:</span>
          {[1, 2, 3, 5, 10, 20].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => {
                onSetPlaybackSpeed(spd);
                bridgeAudio.playTacticalClick();
              }}
              className={
                'px-2 py-0.5 rounded-md text-[10px] font-bold transition ' +
                (playbackSpeed === spd
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200')
              }
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Auto-Sail Pilot Pill */}
        <button
          onClick={() => {
            onToggleAutoSail();
            bridgeAudio.playWarningChime();
          }}
          className={'px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 transition shadow-sm active:scale-95 ' + (
            autoSail.enabled
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-emerald-950/50'
              : 'bg-polar-900/80 text-slate-400 border-white/10 hover:text-white'
          )}
        >
          <Bot className={'w-3 h-3 ' + (autoSail.enabled ? 'text-emerald-400 animate-spin-slow' : 'text-slate-500')} />
          <span>{autoSail.enabled ? 'AUTO-PILOT ACTIVE' : 'AUTO-SAIL OFF'}</span>
        </button>

        {/* Reset */}
        <button
          onClick={() => {
            onResetSimulation();
            bridgeAudio.playTacticalClick();
          }}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg border border-white/10 hover:bg-polar-800 transition"
          title="Reset Voyage to Ushuaia Departure"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Vessel Status & Propulsion Telemetry */}
      <div className="hidden lg:flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-polar-900/80 px-3 py-1 rounded-lg border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-200 font-semibold">{vessel.status}</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-polar-900/80 px-2.5 py-1 rounded-lg border border-white/5 text-[10px]">
          <Flame className="w-3 h-3 text-amber-400" />
          <span className="text-slate-400">FUEL:</span>
          <span className="text-white font-bold">{vessel.fuel_flow_m3_h.toFixed(2)} m³/h</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-polar-900/80 px-2.5 py-1 rounded-lg border border-white/5 text-[10px]">
          <Gauge className="w-3 h-3 text-sky-400" />
          <span className="text-slate-400">LOAD:</span>
          <span className="text-sky-300 font-bold">{vessel.engine_load_pct}%</span>
          <div className="w-12 bg-polar-950 rounded-full h-1.5 ml-1 border border-white/10 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 h-full rounded-full transition-all" 
              style={{ width: `${vessel.engine_load_pct}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Right: Metocean Injects, Collision Test & Conning Helm */}
      <div className="flex items-center space-x-1.5">
        {/* Instant Anti-Collision Simulation Test Button */}
        {onTriggerCollisionTest && (
          <button
            onClick={() => {
              onTriggerCollisionTest();
              bridgeAudio.playWarningChime();
            }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border border-amber-400 text-white px-2.5 py-1 rounded-lg flex items-center space-x-1 transition text-[10px] font-bold active:scale-95 shadow-md shadow-amber-950/50"
            title="Spawn Head-On Vessel to Test Automated COLREGs Anti-Collision Avoidance"
          >
            <ShieldAlert className="w-3 h-3 text-yellow-200 animate-pulse" />
            <span>⚡ TEST ANTI-COLLISION</span>
          </button>
        )}

        <button
          onClick={() => {
            onTriggerStorm();
            bridgeAudio.playWarningChime();
          }}
          className="bg-red-950/80 hover:bg-red-900 border border-red-600/70 text-red-200 px-2 py-1 rounded-lg flex items-center space-x-1 transition text-[10px] font-bold active:scale-95 shadow-sm"
          title="Inject Katabatic Force 10 Blizzard"
        >
          <Wind className="w-3 h-3 text-red-400" />
          <span>GALE</span>
        </button>

        <button
          onClick={() => {
            onTriggerIceRidge();
            bridgeAudio.playWarningChime();
          }}
          className="bg-purple-950/80 hover:bg-purple-900 border border-purple-600/70 text-purple-200 px-2 py-1 rounded-lg flex items-center space-x-1 transition text-[10px] font-bold active:scale-95 shadow-sm"
          title="Inject Consolidated Multi-Year Pressure Ridge"
        >
          <Zap className="w-3 h-3 text-purple-400" />
          <span>RIDGE</span>
        </button>

        <button
          onClick={() => {
            onToggleHelm();
            bridgeAudio.playTacticalClick();
          }}
          className={
            'px-3 py-1 rounded-lg border font-bold flex items-center space-x-1.5 transition text-[10px] shadow-md active:scale-95 ' +
            (isHelmOpen
              ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white border-sky-400'
              : 'glass-card text-slate-300 hover:text-white')
          }
        >
          <Sliders className="w-3 h-3 text-sky-400" />
          <span>HELM</span>
        </button>
      </div>
    </div>
  );
};