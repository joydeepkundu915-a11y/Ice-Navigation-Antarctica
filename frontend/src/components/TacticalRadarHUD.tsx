import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  ShieldCheck, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Volume2, 
  ShieldAlert, 
  X, 
  Ship, 
  Eye, 
  Filter, 
  Activity, 
  Layers, 
  Anchor 
} from 'lucide-react';
import { VesselState, Iceberg, AISVessel, Station } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface RadarTarget {
  id: string;
  name: string;
  type: 'SHIP' | 'ICEBERG' | 'STATION' | 'LEAD';
  lat: number;
  lon: number;
  distance_nm: number;
  bearing_deg: number;
  speed_kts: number;
  heading_deg: number;
  dcpa_nm: number;
  tcpa_min: number;
  threat_level: 'DANGER' | 'CAUTION' | 'SAFE';
  details: string;
}

interface TacticalRadarHUDProps {
  vessel: VesselState;
  icebergs: Iceberg[];
  aisVessels?: AISVessel[];
  stations?: Station[];
  onSelectIceberg?: (iceberg: Iceberg) => void;
  onClose?: () => void;
}

export const TacticalRadarHUD: React.FC<TacticalRadarHUDProps> = ({
  vessel,
  icebergs,
  aisVessels = [],
  stations = [],
  onSelectIceberg,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [radarRangeNm, setRadarRangeNm] = useState<number>(24);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [sweepAngleDeg, setSweepAngleDeg] = useState<number>(0);
  const [motionMode, setMotionMode] = useState<'NORTH_UP' | 'HEAD_UP'>('NORTH_UP');
  const [bandMode, setBandMode] = useState<'X_BAND' | 'S_BAND'>('X_BAND');
  const [filterType, setFilterType] = useState<'ALL' | 'DANGER' | 'SAFE' | 'SHIPS' | 'ICEBERGS'>('ALL');
  const [guardRingNm, setGuardRingNm] = useState<number>(3.0);

  // Compute unified tactical radar targets list
  const allTargets: RadarTarget[] = useMemo(() => {
    const list: RadarTarget[] = [];

    // 1. Process AIS Ships
    aisVessels.forEach((s) => {
      const dY = (s.lat - vessel.lat) * 60;
      const dX = (s.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
      const dist = Math.hypot(dY, dX);
      let brg = (Math.atan2(dX, dY) * 180) / Math.PI;
      if (brg < 0) brg += 360;

      const dcpa = s.dcpa_nm ?? dist;
      const tcpa = s.tcpa_min ?? 99;
      const isDanger = dcpa < 2.0 && tcpa < 20;
      const isSafe = dcpa > 4.5;

      list.push({
        id: s.id,
        name: s.name,
        type: 'SHIP',
        lat: s.lat,
        lon: s.lon,
        distance_nm: dist,
        bearing_deg: brg,
        speed_kts: s.speed_kts,
        heading_deg: s.heading_deg,
        dcpa_nm: dcpa,
        tcpa_min: tcpa,
        threat_level: isDanger ? 'DANGER' : isSafe ? 'SAFE' : 'CAUTION',
        details: `IMO: ${s.imo} • Class: ${s.polar_class} • Flag: ${s.flag} • ${s.status}`
      });
    });

    // 2. Process Icebergs
    icebergs.forEach((berg) => {
      const dY = (berg.lat - vessel.lat) * 60;
      const dX = (berg.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
      const dist = Math.hypot(dY, dX);
      let brg = (Math.atan2(dX, dY) * 180) / Math.PI;
      if (brg < 0) brg += 360;

      const isDanger = dist < 12.0 || berg.threat_level === 'EXTREME' || berg.length_km > 30;
      const isSafe = dist > 35.0 && berg.threat_level !== 'EXTREME';

      list.push({
        id: berg.id,
        name: berg.name,
        type: 'ICEBERG',
        lat: berg.lat,
        lon: berg.lon,
        distance_nm: dist,
        bearing_deg: brg,
        speed_kts: berg.drift_speed_kts,
        heading_deg: berg.drift_heading_deg,
        dcpa_nm: dist * 0.85,
        tcpa_min: Math.max(5, (dist / Math.max(5, vessel.speed_kts)) * 60),
        threat_level: isDanger ? 'DANGER' : isSafe ? 'SAFE' : 'CAUTION',
        details: `Dimensions: ${berg.length_km}x${berg.width_km}km • Draft: ${berg.draft_m}m • Threat: ${berg.threat_level}`
      });
    });

    // 3. Process Safe Shelter Stations / Anchorages
    stations.slice(0, 4).forEach((st) => {
      const dY = (st.lat - vessel.lat) * 60;
      const dX = (st.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
      const dist = Math.hypot(dY, dX);
      let brg = (Math.atan2(dX, dY) * 180) / Math.PI;
      if (brg < 0) brg += 360;

      list.push({
        id: st.id,
        name: st.name,
        type: 'STATION',
        lat: st.lat,
        lon: st.lon,
        distance_nm: dist,
        bearing_deg: brg,
        speed_kts: 0,
        heading_deg: 0,
        dcpa_nm: dist,
        tcpa_min: 999,
        threat_level: 'SAFE',
        details: `Safe Anchorage: ${st.safe_anchorage ? 'YES' : 'LIMITED'} • VHF: ${st.vhf_channel} • Operator: ${st.operator}`
      });
    });

    return list;
  }, [vessel, aisVessels, icebergs, stations]);

  // Filtered targets
  const filteredTargets = useMemo(() => {
    return allTargets.filter((t) => {
      if (filterType === 'DANGER') return t.threat_level === 'DANGER';
      if (filterType === 'SAFE') return t.threat_level === 'SAFE';
      if (filterType === 'SHIPS') return t.type === 'SHIP';
      if (filterType === 'ICEBERGS') return t.type === 'ICEBERG';
      return true;
    });
  }, [allTargets, filterType]);

  const selectedTarget = allTargets.find(t => t.id === selectedTargetId) || allTargets[0];

  // Canvas PPI Radar Rendering Loop
  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;
    let lastSweepPass = 0;

    const render = () => {
      angle = (angle + 1.4) % 360;
      setSweepAngleDeg(angle);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 26;

      // 1. Radar Scope Base Gradient
      ctx.fillStyle = '#050a10';
      ctx.fillRect(0, 0, width, height);

      const scopeGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      if (bandMode === 'X_BAND') {
        scopeGrad.addColorStop(0, '#021f14');
        scopeGrad.addColorStop(0.7, '#01140c');
        scopeGrad.addColorStop(1, '#000a06');
      } else {
        scopeGrad.addColorStop(0, '#02182b');
        scopeGrad.addColorStop(0.7, '#01101e');
        scopeGrad.addColorStop(1, '#00080f');
      }
      ctx.fillStyle = scopeGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer Bezel
      ctx.strokeStyle = bandMode === 'X_BAND' ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 2. Azimuth Bearing Scale (Degree Ticks on Rim)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let d = 0; d < 360; d += 10) {
        const rad = (d * Math.PI) / 180;
        const tickLen = d % 30 === 0 ? 8 : 4;
        const x1 = centerX + radius * Math.cos(rad);
        const y1 = centerY + radius * Math.sin(rad);
        const x2 = centerX + (radius - tickLen) * Math.cos(rad);
        const y2 = centerY + (radius - tickLen) * Math.sin(rad);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (d % 30 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textRad = (radius - 14);
          ctx.fillText(`${d}°`, centerX + textRad * Math.cos(rad), centerY + textRad * Math.sin(rad));
        }
      }

      // 3. Concentric Range Rings
      const ringCount = 4;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= ringCount; r++) {
        const ringRadius = (radius / ringCount) * r;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Range Label
        ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${((radarRangeNm / ringCount) * r).toFixed(0)} NM`, centerX + 4, centerY - ringRadius + 11);
      }

      // 4. Azimuth Crosshairs
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // 5. Guard Zone Ring (Safety Perimeter)
      if (guardRingNm <= radarRangeNm) {
        const guardPx = (guardRingNm / radarRangeNm) * radius;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, guardPx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.font = '8px monospace';
        ctx.fillText(`GUARD: ${guardRingNm} NM`, centerX + 4, centerY - guardPx - 3);
      }

      // 6. Rotating Phosphor Sweep Beam
      const sweepRad = (angle * Math.PI) / 180;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sweepRad - 0.35, sweepRad);
      ctx.closePath();

      const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      sweepGrad.addColorStop(0, bandMode === 'X_BAND' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(56, 189, 248, 0.4)');
      sweepGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sweep Beam Line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(sweepRad), centerY + radius * Math.sin(sweepRad));
      ctx.strokeStyle = bandMode === 'X_BAND' ? '#4ade80' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 7. Own Ship Center Dot & Heading Vector
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Heading Vector Line (6 min speed lookahead)
      let shipHdgOffset = (vessel.heading_deg - 90);
      if (motionMode === 'HEAD_UP') {
        shipHdgOffset = -90; // Ship always points UP in Head-Up mode
      }
      const hdgRad = (shipHdgOffset * Math.PI) / 180;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + 40 * Math.cos(hdgRad), centerY + 40 * Math.sin(hdgRad));
      ctx.stroke();

      // 8. Draw Radar Targets (Red = Danger, Deep Green = Safe, Amber = Caution)
      allTargets.forEach((target) => {
        if (target.distance_nm > radarRangeNm) return;

        let targetBearing = target.bearing_deg;
        if (motionMode === 'HEAD_UP') {
          targetBearing = (target.bearing_deg - vessel.heading_deg + 360) % 360;
        }

        const targetRad = ((targetBearing - 90) * Math.PI) / 180;
        const targetDistPx = (target.distance_nm / radarRangeNm) * radius;
        const targetX = centerX + targetDistPx * Math.cos(targetRad);
        const targetY = centerY + targetDistPx * Math.sin(targetRad);

        // Color coding: Red = Danger, Deep Green = Safe, Amber = Caution
        let echoColor = '#10b981'; // Deep Safe Green
        let echoGlow = 'rgba(16, 185, 129, 0.4)';
        if (target.threat_level === 'DANGER') {
          echoColor = '#ef4444'; // Red Danger
          echoGlow = 'rgba(239, 68, 68, 0.6)';
        } else if (target.threat_level === 'CAUTION') {
          echoColor = '#f59e0b'; // Amber Caution
          echoGlow = 'rgba(245, 158, 11, 0.5)';
        }

        // Draw Target Echo Glow & Core
        ctx.fillStyle = echoGlow;
        ctx.beginPath();
        ctx.arc(targetX, targetY, target.type === 'SHIP' ? 7 : 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = echoColor;
        ctx.beginPath();
        if (target.type === 'SHIP') {
          // Vessel Triangle Marker
          ctx.arc(targetX, targetY, 4.5, 0, Math.PI * 2);
        } else if (target.type === 'ICEBERG') {
          // Iceberg Diamond
          ctx.rect(targetX - 3.5, targetY - 3.5, 7, 7);
        } else {
          // Station Square
          ctx.rect(targetX - 4, targetY - 4, 8, 8);
        }
        ctx.fill();

        // Speed / Drift Vector (6-minute lookahead line)
        if (target.speed_kts > 0.5) {
          let vecHdg = target.heading_deg;
          if (motionMode === 'HEAD_UP') {
            vecHdg = (target.heading_deg - vessel.heading_deg + 360) % 360;
          }
          const vecRad = ((vecHdg - 90) * Math.PI) / 180;
          ctx.strokeStyle = echoColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(targetX, targetY);
          ctx.lineTo(targetX + 18 * Math.cos(vecRad), targetY + 18 * Math.sin(vecRad));
          ctx.stroke();
        }

        // Target Tag Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(target.name, targetX + 9, targetY - 3);

        ctx.fillStyle = echoColor;
        ctx.font = '8px monospace';
        ctx.fillText(`${target.distance_nm.toFixed(1)} NM`, targetX + 9, targetY + 7);

        // Highlight Selected Target with ARPA Tracking Gate `[ + ]`
        if (target.id === selectedTargetId) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(targetX, targetY, 12, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeRect(targetX - 8, targetY - 8, 16, 16);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [vessel, allTargets, radarRangeNm, motionMode, bandMode, selectedTargetId, guardRingNm]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 26;

    // Find nearest target within click radius
    let nearest: RadarTarget | null = null;
    let minDist = 30; // 30px click threshold

    allTargets.forEach((t) => {
      if (t.distance_nm > radarRangeNm) return;
      let targetBearing = t.bearing_deg;
      if (motionMode === 'HEAD_UP') {
        targetBearing = (t.bearing_deg - vessel.heading_deg + 360) % 360;
      }
      const targetRad = ((targetBearing - 90) * Math.PI) / 180;
      const targetDistPx = (t.distance_nm / radarRangeNm) * radius;
      const tX = centerX + targetDistPx * Math.cos(targetRad);
      const tY = centerY + targetDistPx * Math.sin(targetRad);

      const d = Math.hypot(clickX - tX, clickY - tY);
      if (d < minDist) {
        minDist = d;
        nearest = t;
      }
    });

    if (nearest) {
      setSelectedTargetId(nearest.id);
      bridgeAudio.playTacticalClick();
    }
  };

  const dangerCount = allTargets.filter(t => t.threat_level === 'DANGER').length;
  const safeCount = allTargets.filter(t => t.threat_level === 'SAFE').length;
  const shipCount = allTargets.filter(t => t.type === 'SHIP').length;

  return (
    <div className="w-full h-full bg-polar-900 p-3 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-3">
        
        {/* Header with Scanner Status & Close */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>TACTICAL MULTI-BAND RADAR & ARPA SCANNER</span>
                <span className={'px-1.5 py-0.2 rounded text-[10px] font-bold border ' + (
                  bandMode === 'X_BAND' ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-sky-950 text-sky-300 border-sky-600'
                )}>
                  {bandMode === 'X_BAND' ? 'X-BAND 9.4 GHz (ICE RECOGNITION)' : 'S-BAND 3.0 GHz (LONG-RANGE SEA)'}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <strong className="text-red-400">RED: DANGER HAZARDS ({dangerCount})</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong className="text-emerald-400">DEEP GREEN: SAFE CONTACTS ({safeCount})</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1">
                  <Ship className="w-3 h-3 text-purple-400" />
                  <strong className="text-purple-300">SHIPS SCANNED ({shipCount})</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center space-x-2">
            {/* Band Switcher */}
            <div className="flex items-center space-x-1 bg-polar-900 p-1 rounded border border-polar-700 text-xs">
              <button
                onClick={() => {
                  setBandMode('X_BAND');
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-2 py-0.5 rounded transition text-[10px] ' + (bandMode === 'X_BAND' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400')}
              >
                X-BAND
              </button>
              <button
                onClick={() => {
                  setBandMode('S_BAND');
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-2 py-0.5 rounded transition text-[10px] ' + (bandMode === 'S_BAND' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400')}
              >
                S-BAND
              </button>
            </div>

            {/* Motion Mode */}
            <div className="flex items-center space-x-1 bg-polar-900 p-1 rounded border border-polar-700 text-xs">
              <button
                onClick={() => setMotionMode('NORTH_UP')}
                className={'px-2 py-0.5 rounded transition text-[10px] ' + (motionMode === 'NORTH_UP' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400')}
              >
                NORTH-UP
              </button>
              <button
                onClick={() => setMotionMode('HEAD_UP')}
                className={'px-2 py-0.5 rounded transition text-[10px] ' + (motionMode === 'HEAD_UP' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400')}
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

        {/* Tactical Filter Chips Strip */}
        <div className="flex items-center justify-between bg-polar-850 p-2 rounded-lg border border-polar-700 text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-[10px] text-slate-400 uppercase font-bold mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>RADAR SCAN FILTERS:</span>
            </span>
            {[
              { id: 'ALL', label: 'All Contacts (' + allTargets.length + ')' },
              { id: 'DANGER', label: '🔴 Danger Red (' + dangerCount + ')' },
              { id: 'SAFE', label: '🟢 Safe Green (' + safeCount + ')' },
              { id: 'SHIPS', label: '🚢 Vessels & Ships (' + shipCount + ')' },
              { id: 'ICEBERGS', label: '🧊 Ice Hazards (' + icebergs.length + ')' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilterType(f.id as any);
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-2.5 py-1 rounded text-[10px] font-bold transition ' + (
                  filterType === f.id
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-polar-900 text-slate-400 hover:text-white border border-polar-700'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-[10px]">
            <span className="text-slate-400">GUARD RING:</span>
            {[1.5, 3.0, 6.0].map((rng) => (
              <button
                key={rng}
                onClick={() => setGuardRingNm(rng)}
                className={'px-1.5 py-0.5 rounded ' + (guardRingNm === rng ? 'bg-red-900 text-red-100 font-bold' : 'bg-polar-900 text-slate-400 border border-polar-700')}
              >
                {rng} NM
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Radar Canvas + Target Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Radar PPI Canvas Viewport */}
          <div className="lg:col-span-8 bg-polar-850 border border-polar-700 rounded-lg p-3 flex flex-col items-center justify-between shadow-2xl relative">
            <div className="w-full flex items-center justify-between text-xs text-slate-300 mb-2 border-b border-polar-700/60 pb-1.5">
              <div className="flex items-center space-x-3 text-[11px]">
                <span>RANGE: <strong className="text-emerald-400">{radarRangeNm} NM</strong></span>
                <span>RINGS: <strong className="text-emerald-400">{(radarRangeNm / 4).toFixed(1)} NM</strong></span>
                <span>BEAM SWEEP: <strong className="text-emerald-400">{sweepAngleDeg.toFixed(0)}°</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                {[6, 12, 24, 48, 96].map((rng) => (
                  <button
                    key={rng}
                    onClick={() => {
                      setRadarRangeNm(rng);
                      bridgeAudio.playTacticalClick();
                    }}
                    className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (radarRangeNm === rng ? 'bg-emerald-600 text-white' : 'bg-polar-900 text-slate-400 border border-polar-700')}
                  >
                    {rng} NM
                  </button>
                ))}
              </div>
            </div>

            {/* Radar Scope */}
            <div className="relative w-full flex items-center justify-center cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={530}
                height={490}
                onClick={handleCanvasClick}
                className="rounded-full border-2 border-emerald-600/60 shadow-2xl shadow-emerald-950/80 max-w-full"
              />
            </div>

            <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t border-polar-700/60 pt-1.5">
              <span>SEA CLUTTER (STC): AUTO OPTIMIZED</span>
              <span>RAIN CLUTTER (FTC): 18%</span>
              <span>TARGET ACQUISITION: AUTOMATIC ARPA (30 TRACKS)</span>
            </div>
          </div>

          {/* Right Column: Selected Target Data Card & ARPA Matrix */}
          <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
            
            {/* Selected Target Deep Inspector Box */}
            {selectedTarget && (
              <div className={'p-3 rounded-lg border shadow-lg space-y-2 ' + (
                selectedTarget.threat_level === 'DANGER'
                  ? 'bg-red-950/80 border-red-500 text-red-200'
                  : selectedTarget.threat_level === 'SAFE'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-amber-950/80 border-amber-500 text-amber-200'
              )}>
                <div className="flex items-center justify-between border-b border-polar-700/60 pb-1.5">
                  <div className="flex items-center space-x-1.5">
                    {selectedTarget.type === 'SHIP' ? <Ship className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="font-bold text-xs text-white truncate max-w-[170px]">{selectedTarget.name}</span>
                  </div>
                  <span className={'px-1.5 py-0.2 rounded text-[9px] font-bold border ' + (
                    selectedTarget.threat_level === 'DANGER' ? 'bg-red-900 border-red-400 text-red-100' :
                    selectedTarget.threat_level === 'SAFE' ? 'bg-emerald-900 border-emerald-400 text-emerald-100' :
                    'bg-amber-900 border-amber-400 text-amber-100'
                  )}>
                    {selectedTarget.threat_level === 'DANGER' ? '🔴 DANGER HAZARD' : selectedTarget.threat_level === 'SAFE' ? '🟢 DEEP SAFE' : '🟡 CAUTION'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-black/30 p-1.5 rounded">
                    <span className="text-slate-400 block text-[9px]">RANGE / BEARING</span>
                    <span className="font-bold text-white">{selectedTarget.distance_nm.toFixed(1)} NM @ {selectedTarget.bearing_deg.toFixed(0)}°</span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded">
                    <span className="text-slate-400 block text-[9px]">SOG / COG</span>
                    <span className="font-bold text-white">{selectedTarget.speed_kts.toFixed(1)} kn @ {selectedTarget.heading_deg.toFixed(0)}°</span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded">
                    <span className="text-slate-400 block text-[9px]">DISTANCE TO CPA (DCPA)</span>
                    <span className={'font-bold ' + (selectedTarget.dcpa_nm < 2.0 ? 'text-red-400' : 'text-emerald-400')}>
                      {selectedTarget.dcpa_nm.toFixed(1)} NM
                    </span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded">
                    <span className="text-slate-400 block text-[9px]">TIME TO CPA (TCPA)</span>
                    <span className="font-bold text-white">{selectedTarget.tcpa_min.toFixed(0)} min</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-300 italic pt-0.5">
                  {selectedTarget.details}
                </p>
              </div>
            )}

            {/* ARPA Scanned Contacts List */}
            <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-polar-700 pb-1.5 mb-2">
                <span className="font-bold text-xs text-slate-200">SCANNED CONTACTS MATRIX ({filteredTargets.length})</span>
                <span className="text-[10px] text-emerald-400 font-mono">TRACKING ACTIVE</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredTargets.map((t) => {
                  const isSel = t.id === selectedTargetId;
                  const isCrit = t.threat_level === 'DANGER';
                  const isSafe = t.threat_level === 'SAFE';

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTargetId(t.id);
                        bridgeAudio.playTacticalClick();
                      }}
                      className={'p-2 rounded border cursor-pointer transition text-xs ' + (
                        isSel ? 'bg-sky-950 border-sky-400 text-white shadow' :
                        isCrit ? 'bg-red-950/50 border-red-600/70 text-red-200 hover:bg-red-900/60' :
                        isSafe ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200 hover:bg-emerald-900/50' :
                        'bg-polar-900 border-polar-700 text-slate-300 hover:bg-polar-800'
                      )}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center space-x-1.5">
                          <span className={'w-2 h-2 rounded-full ' + (isCrit ? 'bg-red-500 animate-pulse' : isSafe ? 'bg-emerald-400' : 'bg-amber-400')} />
                          <span className="text-white truncate max-w-[140px]">{t.name}</span>
                        </span>
                        <span className={isCrit ? 'text-red-400 font-bold' : isSafe ? 'text-emerald-400' : 'text-amber-400'}>
                          {t.distance_nm.toFixed(1)} NM
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 mt-1">
                        <span>TYPE: {t.type}</span>
                        <span>DCPA: {t.dcpa_nm.toFixed(1)} NM</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-polar-900 p-2 rounded border border-polar-700 text-[10px] text-slate-400 mt-2">
                <span className="font-bold text-slate-200 block mb-0.5">IMO RADAR PROTOCOL:</span>
                <span>Guard ring set at {guardRingNm} NM radius. Red echoes represent collision or extreme drift hazards.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};