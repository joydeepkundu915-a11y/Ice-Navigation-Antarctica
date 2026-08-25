import React, { useRef, useEffect, useState } from 'react';
import { Radio, AlertTriangle, ShieldCheck, Crosshair, ZoomIn, ZoomOut, Compass, Volume2, ShieldAlert } from 'lucide-react';
import { VesselState, Iceberg, CPAAlert } from '../types';

interface TacticalRadarHUDProps {
  vessel: VesselState;
  icebergs: Iceberg[];
  onSelectIceberg: (iceberg: Iceberg) => void;
}

export const TacticalRadarHUD: React.FC<TacticalRadarHUDProps> = ({
  vessel,
  icebergs,
  onSelectIceberg
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [radarRangeNm, setRadarRangeNm] = useState<number>(24);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [sweepAngleDeg, setSweepAngleDeg] = useState<number>(0);
  const [motionMode, setMotionMode] = useState<'HEAD_UP' | 'NORTH_UP'>('NORTH_UP');

  // Animation Loop for Radar PPI Sweep
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

      // 1. Clear background with dark radar CRT phosphor glow
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

      // 2. Concentric Range Rings (4 rings: 1/4, 1/2, 3/4, 1)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        const ringRadius = (radius / 4) * r;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Ring distance labels
        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${(radarRangeNm / 4) * r} NM`, centerX + 5, centerY - ringRadius + 12);
      }

      // 3. Azimuth Crosshairs & Compass Ticks
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Outer Compass Ring & Angle Marks
      for (let deg = 0; deg < 360; deg += 10) {
        const rad = (deg - 90) * (Math.PI / 180);
        const tickLength = deg % 30 === 0 ? 10 : 5;
        const x1 = centerX + (radius - tickLength) * Math.cos(rad);
        const y1 = centerY + (radius - tickLength) * Math.sin(rad);
        const x2 = centerX + radius * Math.cos(rad);
        const y2 = centerY + radius * Math.sin(rad);

        ctx.strokeStyle = deg % 30 === 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(34, 197, 94, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (deg % 30 === 0) {
          const textX = centerX + (radius + 14) * Math.cos(rad);
          const textY = centerY + (radius + 14) * Math.sin(rad);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${deg}°`, textX, textY);
        }
      }

      // 4. Guard Zone Circle (3 NM buffer in amber)
      const guardRadius = (3.0 / radarRangeNm) * radius;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, guardRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Radar Phosphor Sweep Beam
      const sweepRad = (angle - 90) * (Math.PI / 180);
      const sweepGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      sweepGradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
      sweepGradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sweepRad - 0.25, sweepRad);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Sharp Leading Edge
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(sweepRad), centerY + radius * Math.sin(sweepRad));
      ctx.stroke();
      ctx.restore();

      // 6. Draw Vessel at Center (Own Ship)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Heading Vector Line (10 minutes prediction)
      const hdgRad = ((motionMode === 'NORTH_UP' ? vessel.heading_deg : 0) - 90) * (Math.PI / 180);
      const vectorLen = (vessel.speed_kts / radarRangeNm) * radius * (10 / 60);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + vectorLen * Math.cos(hdgRad), centerY + vectorLen * Math.sin(hdgRad));
      ctx.stroke();

      // 7. Draw Radar Contacts (Icebergs & Growlers)
      icebergs.forEach((berg) => {
        // Calculate relative distance and bearing from ship
        const distNm = getApproxDistanceNm(vessel.lat, vessel.lon, berg.lat, berg.lon);
        const brgDeg = getApproxBearingDeg(vessel.lat, vessel.lon, berg.lat, berg.lon);

        if (distNm <= radarRangeNm) {
          const displayBrg = motionMode === 'NORTH_UP' ? brgDeg : (brgDeg - vessel.heading_deg + 360) % 360;
          const contactRad = (displayBrg - 90) * (Math.PI / 180);
          const contactDistancePx = (distNm / radarRangeNm) * radius;

          const cx = centerX + contactDistancePx * Math.cos(contactRad);
          const cy = centerY + contactDistancePx * Math.sin(contactRad);

          const isCritical = distNm < 3.0;
          const targetColor = isCritical ? '#ef4444' : berg.threat_level === 'EXTREME' ? '#f59e0b' : '#22c55e';

          // Target Echo Dot
          ctx.fillStyle = targetColor;
          ctx.beginPath();
          ctx.arc(cx, cy, berg.length_km > 20 ? 6 : 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Target Velocity Vector
          const bergDriftRad = ((motionMode === 'NORTH_UP' ? berg.drift_heading_deg : (berg.drift_heading_deg - vessel.heading_deg + 360) % 360) - 90) * (Math.PI / 180);
          const bergVecLen = Math.max(8, (berg.drift_speed_kts / radarRangeNm) * radius * 0.5);
          ctx.strokeStyle = targetColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + bergVecLen * Math.cos(bergDriftRad), cy + bergVecLen * Math.sin(bergDriftRad));
          ctx.stroke();

          // Target Label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`${berg.id} (${distNm.toFixed(1)}NM)`, cx + 8, cy - 4);

          if (isCritical) {
            // Flashing CPA alert ring
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, 12 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [vessel, icebergs, radarRangeNm, motionMode]);

  function getApproxDistanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3440.065;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function getApproxBearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
    const x = Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
      Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  }

  // Calculate nearby targets for data table
  const contacts = icebergs.map(berg => {
    const dist = getApproxDistanceNm(vessel.lat, vessel.lon, berg.lat, berg.lon);
    const brg = getApproxBearingDeg(vessel.lat, vessel.lon, berg.lat, berg.lon);
    const cpa = Math.max(0.5, dist * 0.85); // approximate
    const tcpa = (dist / (vessel.speed_kts + berg.drift_speed_kts)) * 60;
    return {
      ...berg,
      distance_nm: Number(dist.toFixed(1)),
      bearing_deg: Number(brg.toFixed(1)),
      cpa_nm: Number(cpa.toFixed(1)),
      tcpa_min: Number(tcpa.toFixed(0)),
      in_range: dist <= radarRangeNm
    };
  }).sort((a, b) => a.distance_nm - b.distance_nm);

  return (
    <div className="w-full h-full bg-polar-900 flex flex-col lg:flex-row p-4 gap-4 overflow-y-auto select-none">
      {/* Left Canvas PPI Display */}
      <div className="flex-1 bg-polar-850 border border-polar-700 rounded-xl p-4 flex flex-col items-center justify-between shadow-2xl relative">
        {/* Radar Controls Top Bar */}
        <div className="w-full flex items-center justify-between border-b border-polar-700/80 pb-3 mb-2 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">TACTICAL POLAR RADAR PPI (X/S-BAND)</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Motion Mode Toggle */}
            <div className="flex items-center bg-polar-900 rounded border border-polar-700 p-0.5">
              <button
                onClick={() => setMotionMode('NORTH_UP')}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  motionMode === 'NORTH_UP' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                NORTH UP
              </button>
              <button
                onClick={() => setMotionMode('HEAD_UP')}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  motionMode === 'HEAD_UP' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                HEAD UP
              </button>
            </div>

            {/* Range Selector */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setRadarRangeNm(Math.max(6, radarRangeNm / 2))}
                className="p-1 bg-polar-900 hover:bg-polar-700 border border-polar-700 rounded text-slate-300"
                title="Range In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-0.5 bg-polar-900 border border-polar-700 rounded text-emerald-400 font-bold text-xs">
                {radarRangeNm} NM
              </span>
              <button
                onClick={() => setRadarRangeNm(Math.min(96, radarRangeNm * 2))}
                className="p-1 bg-polar-900 hover:bg-polar-700 border border-polar-700 rounded text-slate-300"
                title="Range Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Radar PPI Canvas */}
        <div className="relative flex items-center justify-center my-auto">
          <canvas
            ref={canvasRef}
            width={520}
            height={520}
            className="rounded-full shadow-2xl border border-emerald-950/80 cursor-crosshair max-w-full h-auto"
          />
        </div>

        {/* Radar Telemetry Footer */}
        <div className="w-full grid grid-cols-4 gap-2 pt-3 border-t border-polar-700/80 text-[11px] font-mono text-center">
          <div className="bg-polar-900/80 p-1.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[9px] block">GAIN / RAIN CLUTTER</span>
            <span className="text-emerald-400 font-bold">MANUAL 85% / 20%</span>
          </div>
          <div className="bg-polar-900/80 p-1.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[9px] block">SEA CLUTTER (STC)</span>
            <span className="text-emerald-400 font-bold">ICE ANTI-CLUTTER 60%</span>
          </div>
          <div className="bg-polar-900/80 p-1.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[9px] block">GUARD ZONE ALARM</span>
            <span className="text-amber-400 font-bold">ACTIVE (3.0 NM)</span>
          </div>
          <div className="bg-polar-900/80 p-1.5 rounded border border-polar-700">
            <span className="text-slate-400 text-[9px] block">TARGET TRACKING</span>
            <span className="text-sky-400 font-bold">ARPA AUTOMATIC (6 Bergs)</span>
          </div>
        </div>
      </div>

      {/* Right Target Acquisition & ARPA Collision Table */}
      <div className="w-full lg:w-96 flex flex-col space-y-4 font-mono">
        {/* ARPA Target List Card */}
        <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-2xl flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-polar-700 pb-2 mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Crosshair className="w-4 h-4 text-sky-400" />
              <span>ARPA RADAR TARGETS ({contacts.length})</span>
            </div>
            <span className="text-[10px] text-slate-400">SORT: DISTANCE</span>
          </div>

          <div className="overflow-y-auto max-h-80 space-y-2 flex-1 pr-1">
            {contacts.map((c) => {
              const isSelected = selectedTarget?.id === c.id;
              const isHazard = c.distance_nm < 15.0;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedTarget(c);
                    onSelectIceberg(c);
                  }}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-950/80 border-sky-500 shadow-md'
                      : isHazard
                        ? 'bg-amber-950/30 border-amber-800/60 hover:bg-amber-900/40'
                        : 'bg-polar-900 border-polar-700/80 hover:bg-polar-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100">{c.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      c.threat_level === 'EXTREME' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {c.threat_level}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate mb-1.5">{c.name}</div>

                  <div className="grid grid-cols-4 gap-1 text-[10px] bg-polar-950/80 p-1.5 rounded border border-polar-800">
                    <div>
                      <span className="text-slate-500 block text-[8px]">RNG</span>
                      <span className="text-sky-300 font-bold">{c.distance_nm} NM</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px]">BRG</span>
                      <span className="text-slate-200">{c.bearing_deg}°</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px]">CPA</span>
                      <span className={c.cpa_nm < 2.0 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {c.cpa_nm} NM
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px]">TCPA</span>
                      <span className="text-slate-200">{c.tcpa_min} m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Target Deep Physics Card */}
        {selectedTarget ? (
          <div className="bg-polar-850 border border-sky-600/50 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-polar-700 pb-2 mb-2 text-xs">
              <span className="font-bold text-sky-300">TARGET ACOUSTIC & PHYSICAL PROFILE</span>
              <span className="text-[10px] text-slate-400">{selectedTarget.id}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Dimensions:</span>
                <span className="text-slate-200 font-semibold">{selectedTarget.length_km} x {selectedTarget.width_km} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submerged Keel Draft:</span>
                <span className="text-slate-200 font-semibold">{selectedTarget.draft_m} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Mass:</span>
                <span className="text-slate-200 font-semibold">{selectedTarget.estimated_mass_gigatons} Giga-Tonnes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Drift Dynamics:</span>
                <span className="text-emerald-400 font-semibold">{selectedTarget.drift_speed_kts} kts @ {selectedTarget.drift_heading_deg}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hazard Corridor:</span>
                <span className="text-amber-300 font-semibold text-[10px] truncate max-w-[180px]">{selectedTarget.hazard_corridor}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectIceberg(selectedTarget)}
              className="w-full mt-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded text-white text-xs font-semibold shadow-md transition-all"
            >
              Open 72h Monte Carlo Simulation
            </button>
          </div>
        ) : (
          <div className="bg-polar-850 border border-polar-700/80 rounded-xl p-4 text-center text-xs text-slate-400">
            Click any radar contact to inspect ARPA vector and drift dynamics.
          </div>
        )}
      </div>
    </div>
  );
};
