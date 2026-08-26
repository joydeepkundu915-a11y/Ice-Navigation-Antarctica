import React, { useEffect, useRef, useState } from 'react';
import { Waves, AlertTriangle, ArrowDown, Activity, Info, Anchor, RefreshCw } from 'lucide-react';
import { VesselState } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface DepthSounderHUDProps {
  vessel: VesselState;
  onClose?: () => void;
}

export const DepthSounderHUD: React.FC<DepthSounderHUDProps> = ({ vessel, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentDepth, setCurrentDepth] = useState<number>(450);
  const [ukc, setUkc] = useState<number>(440);
  const depthHistoryRef = useRef<number[]>([]);

  // Simulate bathymetry based on latitude
  useEffect(() => {
    let baseDepth = 400;
    if (vessel.lat > -60) {
      baseDepth = 3200 + Math.sin(vessel.lat * 10) * 400;
    } else if (vessel.lat > -65) {
      baseDepth = 850 + Math.cos(vessel.lon * 5) * 200;
    } else {
      baseDepth = 280 + Math.sin(vessel.lat * 20) * 120;
    }

    const calculatedDepth = Math.max(25, Number((baseDepth + (Math.random() * 8 - 4)).toFixed(1)));
    const vesselDraft = 9.0;
    const calculatedUkc = Number((calculatedDepth - vesselDraft).toFixed(1));

    setCurrentDepth(calculatedDepth);
    setUkc(calculatedUkc);

    depthHistoryRef.current.push(calculatedDepth);
    if (depthHistoryRef.current.length > 100) {
      depthHistoryRef.current.shift();
    }
  }, [vessel.lat, vessel.lon]);

  // Render Echogram Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark Sonar Background
      ctx.fillStyle = '#030a16';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;

      for (let y = 30; y < h; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Draw Vessel Waterline
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(0, 0, w, 20);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText('SURFACE WATERLINE (0m)', 10, 14);

      // Draw Ice Keel Draft
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 20, w, 15);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ICE KEEL DRAFT (~2.5m)', w - 160, 31);

      // Draw Seabed Profile from history
      const history = depthHistoryRef.current;
      if (history.length > 1) {
        const maxDisplayDepth = Math.max(500, Math.max(...history) * 1.15);

        ctx.beginPath();
        ctx.moveTo(0, h);

        history.forEach((d, i) => {
          const x = (i / (history.length - 1)) * w;
          const y = Math.min(h - 5, (d / maxDisplayDepth) * (h - 40) + 40);
          if (i === 0) ctx.lineTo(0, y);
          else ctx.lineTo(x, y);
        });

        ctx.lineTo(w, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(0.4, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        history.forEach((d, i) => {
          const x = (i / (history.length - 1)) * w;
          const y = Math.min(h - 5, (d / maxDisplayDepth) * (h - 40) + 40);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const lastX = w;
        const lastY = Math.min(h - 5, (currentDepth / maxDisplayDepth) * (h - 40) + 40);
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(lastX - 4, lastY, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentDepth]);

  return (
    <div className="bg-polar-850/95 border border-polar-700/90 rounded-xl p-4 text-xs font-mono shadow-2xl backdrop-blur-md select-none">
      <div className="flex items-center justify-between border-b border-polar-700 pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wider text-sm flex items-center space-x-2">
              <span>DUAL-FREQUENCY DEPTH SOUNDER</span>
              <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-700 text-[10px]">
                50 kHz / 200 kHz
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              International Bathymetric Chart of the Southern Ocean (IBCSO v2)
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded border border-polar-700 hover:bg-polar-800"
          >
            ?
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-polar-900/90 p-3 rounded-lg border border-polar-700">
          <span className="text-slate-400 text-[10px] block">WATER DEPTH (SURFACE)</span>
          <span className="text-2xl font-bold text-sky-300 font-mono tracking-tight">
            {currentDepth.toFixed(1)} <span className="text-xs text-slate-400">m</span>
          </span>
        </div>

        <div className="bg-polar-900/90 p-3 rounded-lg border border-polar-700">
          <span className="text-slate-400 text-[10px] block">UNDER-KEEL CLEARANCE (UKC)</span>
          <span className={`text-2xl font-bold font-mono tracking-tight ${
            ukc < 20 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
          }`}>
            {ukc.toFixed(1)} <span className="text-xs text-slate-400">m</span>
          </span>
        </div>

        <div className="bg-polar-900/90 p-3 rounded-lg border border-polar-700">
          <span className="text-slate-400 text-[10px] block">SEABED SUBSTRATE</span>
          <span className="text-sm font-bold text-slate-200 block mt-1">
            Glacial Till / Basalt Rock
          </span>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-polar-700 shadow-inner bg-black">
        <canvas
          ref={canvasRef}
          width={540}
          height={180}
          className="w-full h-44 block"
        />
        <div className="absolute top-2 left-2 bg-polar-950/80 px-2 py-1 rounded text-[10px] text-sky-400 border border-sky-800/60 font-mono">
          ECHOGRAM LIVE TRACE
        </div>
      </div>
    </div>
  );
};
