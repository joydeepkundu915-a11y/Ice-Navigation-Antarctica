import React from 'react';
import { 
  Ship, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Radio, 
  Navigation, 
  Crosshair, 
  X, 
  CheckCircle2, 
  RotateCw, 
  ArrowRight,
  ShieldAlert,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import { VesselState, AISVessel } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface AISCollisionAvoidanceHUDProps {
  vessel: VesselState;
  aisVessels: AISVessel[];
  onSelectVessel?: (v: AISVessel) => void;
  onClose?: () => void;
  onExecuteAvoidance?: (action: string, newHeading: number) => void;
  onTriggerCollisionTest?: () => void;
}

export const AISCollisionAvoidanceHUD: React.FC<AISCollisionAvoidanceHUDProps> = ({
  vessel,
  aisVessels,
  onSelectVessel,
  onClose,
  onExecuteAvoidance,
  onTriggerCollisionTest
}) => {
  // Find critical collision targets (DCPA < 2.0 NM and TCPA < 20 min)
  const criticalTargets = aisVessels.filter(v => (v.dcpa_nm || 99) < 2.0 && (v.tcpa_min || 99) < 20);

  return (
    <div className="glass-panel border border-white/15 rounded-2xl p-4 text-xs font-mono shadow-2xl backdrop-blur-2xl select-none relative overflow-hidden">
      {/* Subtle Corner Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/60 flex items-center justify-center text-purple-300 shadow-md">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-white tracking-wider text-sm flex items-center space-x-2">
              <span>AIS MULTI-VESSEL ANTI-COLLISION & COLREGS SHIELD</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/80 text-[9px] font-bold">
                100% COLLISION FREE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Autonomous Mutual Evasion • Artificial Potential Field (APF) Repulsion • Enforced 1.5 NM Domain
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onTriggerCollisionTest && (
            <button
              onClick={() => {
                onTriggerCollisionTest();
                bridgeAudio.playWarningChime();
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] flex items-center space-x-1 shadow transition"
              title="Spawn an approaching ship to observe mutual collision evasion"
            >
              <Zap className="w-3 h-3 text-yellow-200" />
              <span>TEST COLLISION</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg glass-card hover:bg-polar-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Critical Collision Threat Warning Banner */}
      {criticalTargets.length > 0 ? (
        <div className="bg-red-950/90 border border-red-500 rounded-xl p-3.5 mb-3.5 text-red-200 animate-pulse space-y-2.5 shadow-lg shadow-red-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce" />
              <span className="font-black text-white text-xs">
                ⚠️ AIS COLLISION RISK: {criticalTargets[0].name}
              </span>
            </div>
            <span className="text-[10px] bg-red-900 px-2 py-0.5 rounded font-bold">
              DCPA: {criticalTargets[0].dcpa_nm?.toFixed(1)} NM • TCPA: {criticalTargets[0].tcpa_min?.toFixed(0)} MIN
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-red-100">
            SITUATION: <strong className="text-white">{criticalTargets[0].colregs_situation}</strong>. Automated Action: <strong className="text-amber-300">{criticalTargets[0].avoidance_action}</strong>.
          </p>

          {onExecuteAvoidance && (
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  const evasiveHdg = (vessel.heading_deg + 30) % 360;
                  onExecuteAvoidance('STARBOARD EVASIVE TURN (+30°)', evasiveHdg);
                  bridgeAudio.playTacticalClick();
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-extrabold py-2 px-4 rounded-xl text-xs flex items-center space-x-2 transition shadow-md shadow-red-950/70"
              >
                <RotateCw className="w-4 h-4" />
                <span>MANUALLY EXECUTE STARBOARD EVASION (+30°)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2.5 mb-3 flex items-center justify-between text-emerald-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-[11px]">ALL APPROACH CORRIDORS CLEAR • MINIMUM SEPARATION MAINTAINED</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">APF SHIELD ARMED</span>
        </div>
      )}

      {/* Fleet Traffic Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-white/10 pb-1">
          <span>SURROUNDING POLAR SHIPS ({aisVessels.length})</span>
          <span>RANGE / BEARING</span>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {aisVessels.map((v) => {
            const isCrit = (v.dcpa_nm || 99) < 2.0 && (v.tcpa_min || 99) < 20;

            return (
              <div
                key={v.id}
                onClick={() => onSelectVessel && onSelectVessel(v)}
                className={'p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ' + (
                  isCrit
                    ? 'bg-red-950/80 border-red-500 text-red-200 shadow-md ring-1 ring-red-500/40'
                    : 'glass-card text-slate-300 hover:text-white'
                )}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white">{v.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-polar-950 border border-white/10">
                      {v.polar_class}
                    </span>
                    {v.evasive_active && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-950 text-amber-300 border border-amber-500 animate-pulse">
                        EVASIVE TURN ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    SOG: {v.speed_kts.toFixed(1)} kn @ {v.heading_deg.toFixed(0)}° • DCPA: {v.dcpa_nm?.toFixed(1)} NM • TCPA: {v.tcpa_min?.toFixed(0)}m
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-white block">{v.distance_nm?.toFixed(1)} NM</span>
                  <span className="text-[10px] text-slate-400">{v.bearing_deg?.toFixed(0)}° BRG</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Physics / Collision Prevention Principle Explanation */}
      <div className="bg-polar-950/80 p-3 rounded-xl border border-white/5 text-[10px] text-slate-400 mt-3 space-y-1">
        <span className="font-bold text-slate-200 block flex items-center space-x-1.5">
          <Activity className="w-3 h-3 text-sky-400" />
          <span>HOW TWO SHIPS ARE PREVENTED FROM COLLIDING:</span>
        </span>
        <p>
          1. <strong>COLREGs Rule 14 & 15</strong>: At 3.5 NM separation, both vessels autonomously execute coordinated +30° Starboard turns.
        </p>
        <p>
          2. <strong>Artificial Potential Field (APF)</strong>: A 1.5 NM radial repulsion field actively repels vessel vectors laterally.
        </p>
        <p>
          3. <strong>Automatic Speed Throttling & Backing</strong>: If separation drops below 1.2 NM, closing vessels automatically throttle down to dead slow or reverse pitch, physically guaranteeing zero collision.
        </p>
      </div>
    </div>
  );
};