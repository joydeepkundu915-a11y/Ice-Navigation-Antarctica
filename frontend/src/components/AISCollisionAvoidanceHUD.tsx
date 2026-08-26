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
  ShieldAlert
} from 'lucide-react';
import { VesselState, AISVessel } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface AISCollisionAvoidanceHUDProps {
  vessel: VesselState;
  aisVessels: AISVessel[];
  onSelectVessel?: (v: AISVessel) => void;
  onClose?: () => void;
  onExecuteAvoidance?: (action: string, newHeading: number) => void;
}

export const AISCollisionAvoidanceHUD: React.FC<AISCollisionAvoidanceHUDProps> = ({
  vessel,
  aisVessels,
  onSelectVessel,
  onClose,
  onExecuteAvoidance
}) => {
  // Find critical collision targets (DCPA < 2.0 NM and TCPA < 20 min)
  const criticalTargets = aisVessels.filter(v => (v.dcpa_nm || 99) < 2.0 && (v.tcpa_min || 99) < 20);

  return (
    <div className="bg-polar-850/95 border border-polar-700 rounded-xl p-4 text-xs font-mono shadow-2xl backdrop-blur-md select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-polar-700 pb-2.5 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wider text-sm flex items-center space-x-2">
              <span>AIS MULTI-VESSEL ANTI-COLLISION & COLREGS ENGINE</span>
              <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-700 text-[10px]">
                VDES CLASS-A
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Automatic Radar Plotting Aid (ARPA) • Dynamic DCPA/TCPA • IMO COLREGs in Ice
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-polar-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Critical Collision Threat Warning Banner */}
      {criticalTargets.length > 0 && (
        <div className="bg-red-950/90 border border-red-500 rounded-lg p-3 mb-3 text-red-200 animate-pulse space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span className="font-extrabold text-white text-xs">
                ⚠️ AIS COLLISION RISK DETECTED: {criticalTargets[0].name}
              </span>
            </div>
            <span className="text-[10px] bg-red-900 px-2 py-0.5 rounded font-bold">
              DCPA: {criticalTargets[0].dcpa_nm?.toFixed(1)} NM • TCPA: {criticalTargets[0].tcpa_min?.toFixed(0)} MIN
            </span>
          </div>

          <p className="text-[11px]">
            SITUATION: <strong>{criticalTargets[0].colregs_situation}</strong>. Recommended evasive action: <strong>{criticalTargets[0].avoidance_action}</strong>.
          </p>

          {onExecuteAvoidance && (
            <button
              onClick={() => {
                const evasiveHdg = (vessel.heading_deg + 25) % 360;
                onExecuteAvoidance('STARBOARD EVASIVE TURN (+25°)', evasiveHdg);
                bridgeAudio.playTacticalClick();
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3 rounded text-xs flex items-center space-x-1.5 transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>EXECUTE COLREGs STARBOARD EVASION (+25°)</span>
            </button>
          )}
        </div>
      )}

      {/* AIS Vessel Table */}
      <div className="overflow-x-auto border border-polar-700 rounded-lg">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-polar-900 border-b border-polar-700 text-slate-400">
              <th className="p-2">VESSEL NAME</th>
              <th className="p-2">IMO / FLAG</th>
              <th className="p-2">CLASS</th>
              <th className="p-2">RANGE / BRG</th>
              <th className="p-2">HDG / SOG</th>
              <th className="p-2 text-center">DCPA</th>
              <th className="p-2 text-center">TCPA</th>
              <th className="p-2">COLREGs STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-polar-800">
            {aisVessels.map((v) => {
              const isCrit = (v.dcpa_nm || 99) < 2.0 && (v.tcpa_min || 99) < 20;
              const isClose = (v.distance_nm || 99) < 15;

              return (
                <tr
                  key={v.id}
                  onClick={() => onSelectVessel && onSelectVessel(v)}
                  className={'hover:bg-polar-800/60 cursor-pointer transition ' + (
                    isCrit ? 'bg-red-950/40 text-red-200 font-bold' : ''
                  )}
                >
                  <td className="p-2 font-bold text-white flex items-center space-x-1.5">
                    <Ship className={'w-3.5 h-3.5 ' + (isCrit ? 'text-red-400' : 'text-sky-400')} />
                    <span>{v.name}</span>
                  </td>
                  <td className="p-2 text-slate-400">{v.imo} • {v.flag}</td>
                  <td className="p-2 text-sky-300 font-bold">{v.polar_class}</td>
                  <td className="p-2 text-slate-300">{v.distance_nm?.toFixed(1)} NM @ {v.bearing_deg?.toFixed(0)}°</td>
                  <td className="p-2 text-slate-300">{v.heading_deg.toFixed(0)}° / {v.speed_kts.toFixed(1)} kn</td>
                  <td className={'p-2 text-center font-bold ' + (isCrit ? 'text-red-400' : 'text-emerald-400')}>
                    {v.dcpa_nm?.toFixed(1)} NM
                  </td>
                  <td className={'p-2 text-center font-bold ' + (isCrit ? 'text-red-400' : 'text-slate-300')}>
                    {v.tcpa_min?.toFixed(0)} min
                  </td>
                  <td className="p-2">
                    <span className={'px-1.5 py-0.5 rounded text-[10px] font-bold ' + (
                      isCrit ? 'bg-red-900 text-red-200 border border-red-500' :
                      isClose ? 'bg-amber-900/60 text-amber-200 border border-amber-600' :
                      'bg-polar-800 text-slate-300'
                    )}>
                      {v.colregs_situation || 'CLEAR'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 pt-2 border-t border-polar-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>AIS Transponder: Active Broadcast (VHF 87B/88B)</span>
        <span>COLREGs Rule 14 (Head-on) & Rule 15 (Crossing) Starboard Safe Protocol</span>
      </div>
    </div>
  );
};