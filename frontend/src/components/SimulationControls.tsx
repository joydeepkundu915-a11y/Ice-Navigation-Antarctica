import React from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  CloudLightning, 
  Sun, 
  Compass, 
  Gauge,
  Sliders
} from 'lucide-react';
import { VesselState } from '../types';

interface SimulationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSetPlaybackSpeed: (speed: number) => void;
  vessel: VesselState;
  onTriggerStorm: () => void;
  onResetSimulation: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSetPlaybackSpeed,
  vessel,
  onTriggerStorm,
  onResetSimulation
}) => {
  return (
    <div className="bg-polar-850 border-t border-polar-700/80 px-4 py-2 flex items-center justify-between shadow-2xl z-30 font-mono select-none text-xs">
      {/* Left: Simulation Playback Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onTogglePlay}
          className={`p-2 rounded-lg font-bold text-white transition-all shadow-md flex items-center space-x-1.5 ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'PAUSE VOYAGE' : 'RUN SIMULATION'}</span>
        </button>

        {/* Playback Multipliers */}
        <div className="flex items-center bg-polar-900 rounded-lg border border-polar-700 p-0.5">
          {[1, 5, 20, 60].map((spd) => (
            <button
              key={spd}
              onClick={() => onSetPlaybackSpeed(spd)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                playbackSpeed === spd
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        <button
          onClick={onResetSimulation}
          className="p-1.5 rounded-lg bg-polar-900 hover:bg-polar-800 border border-polar-700 text-slate-400 hover:text-slate-200"
          title="Reset Voyage to Ushuaia"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Vessel Conning & Engine Stats */}
      <div className="hidden md:flex items-center space-x-4 text-[11px]">
        <div className="flex items-center space-x-2">
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">ENGINE SHAFT LOAD:</span>
          <span className="text-emerald-400 font-bold">64% (11.5 MW)</span>
        </div>

        <div className="h-4 w-[1px] bg-polar-700" />

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">ICE RESISTANCE:</span>
          <span className="text-sky-300 font-bold">420 kN (Continuous Lead)</span>
        </div>
      </div>

      {/* Right: Weather & Scenario Triggers */}
      <div className="flex items-center space-x-2">
        <span className="text-slate-500 text-[10px] hidden sm:inline">SCENARIOS:</span>
        <button
          onClick={onTriggerStorm}
          className="px-2.5 py-1 bg-polar-900 hover:bg-red-950 border border-polar-700 hover:border-red-600 rounded text-slate-300 hover:text-red-200 text-xs transition-colors flex items-center space-x-1"
        >
          <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
          <span>Trigger Blizzard Gale</span>
        </button>
      </div>
    </div>
  );
};
