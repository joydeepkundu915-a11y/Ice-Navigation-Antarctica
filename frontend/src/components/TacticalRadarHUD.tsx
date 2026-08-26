import React, { useRef, useEffect, useState } from 'react';
import { Radio, AlertTriangle, ShieldCheck, Crosshair, ZoomIn, ZoomOut, Compass, Volume2, ShieldAlert, X } from 'lucide-react';
import { VesselState, Iceberg, CPAAlert } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface TacticalRadarHUDProps {
  vessel: VesselState;
  icebergs: Iceberg[];
  onSelectIceberg: (iceberg: Iceberg) => void;
  onClose?: () => void;
}

export const TacticalRadarHUD: React.FC<TacticalRadarHUDProps> = ({
  vessel,
  icebergs,
  onSelectIceberg,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [radarRangeNm, setRadarRangeNm] = useState<number>(24);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [sweepAngleDeg, setSweepAngleDeg] = useState<number>(0);
  const [motionMode, setMotionMode] = useState<'HEAD_UP' | 'NORTH_UP'>('NORTH_UP');

  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      angle = (angle + 1.2) % 360;
      setSweepAngleDeg(angle);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 25;

      // 1. Clear background
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, width, height);

      // Radar Scope Background Gradient
      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      grad.addColorStop(0, '#031a0e');
      grad.addColorStop(0.8, '#02120a');
      grad.addColorStop(1, '#010905');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Range Rings
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        const ringRadius = (radius / 4) * r;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.font = '9px monospace';
        ctx.fillText((radarRangeNm / 4 * r).toFixed(0) + ' NM', centerX + 4, centerY - ringRadius + 12);
      }

      // 3. Azimuth Crosshairs
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // 4. Rotating Sweep Beam
      const rad = (angle * Math.PI) / 180;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, rad - 0.25, rad);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      sweepGrad.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
      sweepGrad.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(rad), centerY + radius * Math.sin(rad));
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 5. Own Ship Center Indicator
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Ship Heading Vector
      const hdgRad = ((vessel.heading_deg - 90) * Math.PI) / 180;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + 35 * Math.cos(hdgRad), centerY + 35 * Math.sin(hdgRad));
      ctx.stroke();

      // 6. Draw Tracked Radar Targets (Icebergs)
      icebergs.forEach((berg) => {
        const dLatNm = (berg.lat - vessel.lat) * 60;
        const dLonNm = (berg.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
        const distNm = Math.hypot(dLatNm, dLonNm);

        if (distNm <= radarRangeNm) {
          const bearingRad = Math.atan2(dLonNm, dLatNm);
          let targetAngle = bearingRad - Math.PI / 2;
          if (motionMode === 'HEAD_UP') {
            targetAngle -= ((vessel.heading_deg) * Math.PI) / 180;
          }

          const targetDistPx = (distNm / radarRangeNm) * radius;
          const targetX = centerX + targetDistPx * Math.cos(targetAngle);
          const targetY = centerY + targetDistPx * Math.sin(targetAngle);

          const isCritical = distNm < 6.0;
          const isMega = berg.length_km > 30;

          // Target Echo
          ctx.fillStyle = isCritical ? '#ef4444' : isMega ? '#f59e0b' : '#22c55e';
          ctx.beginPath();
          ctx.arc(targetX, targetY, isMega ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();

          // Target Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.fillText(berg.name, targetX + 8, targetY - 4);
          ctx.fillStyle = isCritical ? '#f87171' : '#94a3b8';
          ctx.font = '9px monospace';
          ctx.fillText(distNm.toFixed(1) + ' NM', targetX + 8, targetY + 8);

          // Vector Line
          const driftRad = ((berg.drift_heading_deg - 90) * Math.PI) / 180;
          ctx.strokeStyle = isCritical ? '#ef4444' : '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(targetX, targetY);
          ctx.lineTo(targetX + 18 * Math.cos(driftRad), targetY + 18 * Math.sin(driftRad));
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [vessel, icebergs, radarRangeNm, motionMode]);

  return (
    <div className="w-full h-full bg-polar-900 p-3 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header with Close Button */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>TACTICAL MARINE RADAR PPI & ARPA TARGET TRACKER</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700">
                  X-BAND 9.4 GHz
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Automated Radar Plotting Aid (ARPA) with Closest Point of Approach (CPA/TCPA) Alarms
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-polar-900 p-1 rounded border border-polar-700 text-xs">
              <button
                onClick={() => setMotionMode('NORTH_UP')}
                className={'px-2 py-0.5 rounded transition ' + (motionMode === 'NORTH_UP' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400')}
              >
                NORTH-UP
              </button>
              <button
                onClick={() => setMotionMode('HEAD_UP')}
                className={'px-2 py-0.5 rounded transition ' + (motionMode === 'HEAD_UP' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400')}
              >
                HEAD-UP
              </button>
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
        </div>

        {/* Main Grid: Radar Screen + ARPA Target Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Radar PPI Canvas */}
          <div className="lg:col-span-8 bg-polar-850 border border-polar-700 rounded-lg p-3 flex flex-col items-center justify-between shadow-2xl relative">
            <div className="w-full flex items-center justify-between text-xs text-slate-300 mb-2 border-b border-polar-700/60 pb-1.5">
              <div className="flex items-center space-x-3">
                <span>RANGE: <strong className="text-emerald-400">{radarRangeNm} NM</strong></span>
                <span>RINGS: <strong className="text-emerald-400">{(radarRangeNm / 4).toFixed(1)} NM</strong></span>
                <span>SWEEP: <strong className="text-emerald-400">{sweepAngleDeg.toFixed(0)}°</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                {[6, 12, 24, 48].map((rng) => (
                  <button
                    key={rng}
                    onClick={() => {
                      setRadarRangeNm(rng);
                      bridgeAudio.playTacticalClick();
                    }}
                    className={'px-2 py-0.5 rounded text-[10px] ' + (radarRangeNm === rng ? 'bg-emerald-600 text-white font-bold' : 'bg-polar-900 text-slate-400 border border-polar-700')}
                  >
                    {rng} NM
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={520}
                height={480}
                className="rounded-full border-2 border-emerald-600/60 shadow-2xl shadow-emerald-950/60 max-w-full"
              />
            </div>

            <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t border-polar-700/60 pt-1.5">
              <span>SEA CLUTTER: OPTIMIZED (STC AUTO)</span>
              <span>RAIN CLUTTER: FTC 15%</span>
              <span>PULSE LENGTH: 0.8 µs (LONG)</span>
            </div>
          </div>

          {/* ARPA Target Table */}
          <div className="lg:col-span-4 bg-polar-850 border border-polar-700 rounded-lg p-3 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-polar-700 pb-1.5 mb-2">
                <span className="font-bold text-xs text-slate-200">ARPA TARGET MATRIX ({icebergs.length})</span>
                <span className="text-[10px] text-emerald-400 font-mono">TRACKING ACTIVE</span>
              </div>

              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {icebergs.map((berg) => {
                  const dLat = (berg.lat - vessel.lat) * 60;
                  const dLon = (berg.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
                  const dist = Math.hypot(dLat, dLon);
                  const isCrit = dist < 12.0;

                  return (
                    <div
                      key={berg.id}
                      onClick={() => onSelectIceberg(berg)}
                      className={'p-2 rounded border cursor-pointer transition text-xs ' + (isCrit ? 'bg-red-950/60 border-red-500 text-red-200' : 'bg-polar-900/70 border-polar-700 text-slate-300 hover:bg-polar-800')}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-white">{berg.name}</span>
                        <span className={isCrit ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {dist.toFixed(1)} NM
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 mt-1">
                        <span>DRIFT: {berg.drift_speed_kts} kts @ {berg.drift_heading_deg}°</span>
                        <span>DRAFT: {berg.draft_m}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-polar-900 p-2 rounded border border-polar-700 text-[10px] text-slate-400">
              <span className="font-bold text-slate-200 block mb-0.5">IMO GUARD ZONE PROTOCOL:</span>
              <span>Guard ring set at 3.0 NM radius. Automatic sound alert triggers upon perimeter penetration.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
