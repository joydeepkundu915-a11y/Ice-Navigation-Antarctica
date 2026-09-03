import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Radio, 
  MapPin, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Clock, 
  Send, 
  CheckCircle2, 
  X, 
  Anchor, 
  PhoneCall, 
  LifeBuoy, 
  Zap,
  Users,
  Compass
} from 'lucide-react';
import { VesselState, Station, DistressSOSState, ShipUser } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: VesselState;
  user?: ShipUser | null;
  sosState: DistressSOSState;
  onTriggerSOS: (distressType: any, souls: number) => void;
  onCancelSOS: () => void;
  stations?: Station[];
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  vessel,
  user,
  sosState,
  onTriggerSOS,
  onCancelSOS,
  stations = []
}) => {
  if (!isOpen) return null;

  const [selectedDistress, setSelectedDistress] = useState<string>(sosState.distress_type || 'BESETMENT_SEVERE');
  const [soulsOnBoard, setSoulsOnBoard] = useState<number>(sosState.souls_on_board || 48);

  const nearestSARStation = stations.find(s => s.id === 'rothera') || stations[0] || {
    id: 'rothera',
    name: 'Rothera Research Station SAR Hub',
    lat: -67.57,
    lon: -68.13
  };

  const handleTransmitDistress = () => {
    bridgeAudio.playMaydayDistressAlert();
    onTriggerSOS(selectedDistress, soulsOnBoard);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="glass-panel border-2 border-red-500/80 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl shadow-red-950/80 relative overflow-hidden">
        
        {/* Luminous Red Danger Background Halo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/90 border border-red-500 flex items-center justify-center text-red-400 animate-pulse shadow-lg">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider text-red-100 flex items-center space-x-2">
                <span>GMDSS POLAR DISTRESS MAYDAY TRANSCEIVER</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-950 text-red-300 border border-red-500 animate-pulse">
                  COSPAS-SARSAT 406 MHz
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                IMO Polar Code Chapter 12 Emergency SAR Radio Broadcast
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              bridgeAudio.playTacticalClick();
            }}
            className="p-1.5 rounded-lg glass-card hover:bg-red-950/60 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Distress Banner if broadcasting */}
        {sosState.active && (
          <div className="bg-red-950/90 border-2 border-red-500 rounded-xl p-4 flex items-center justify-between animate-pulse">
            <div className="space-y-1">
              <span className="text-xs font-black text-red-100 tracking-wider flex items-center space-x-2">
                <Radio className="w-4 h-4 text-red-400 animate-spin-slow" />
                <span>🚨 MAYDAY BROADCAST TRANSMITTING (VHF CH 16 / DSC 2187.5 kHz)</span>
              </span>
              <p className="text-[11px] text-red-200">
                SAR Station: <strong className="text-white">{sosState.sar_station_notified}</strong> ({sosState.sar_distance_nm} NM away • ETA {sosState.estimated_sar_eta_hrs} hrs)
              </p>
            </div>

            <button
              onClick={() => {
                onCancelSOS();
                bridgeAudio.playTacticalClick();
              }}
              className="bg-polar-900 hover:bg-polar-800 border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              CANCEL DISTRESS
            </button>
          </div>
        )}

        {/* Position & Identity Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-polar-950/80 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 text-[9px] block">VESSEL NAME / IMO</span>
            <strong className="text-white text-[11px]">{vessel.name}</strong>
          </div>
          <div className="bg-polar-950/80 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 text-[9px] block">LAT / LON (WGS-84)</span>
            <strong className="text-amber-300 text-[11px]">{Math.abs(vessel.lat).toFixed(3)}°S, {Math.abs(vessel.lon).toFixed(3)}°W</strong>
          </div>
          <div className="bg-polar-950/80 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 text-[9px] block">SOG / GYRO HDG</span>
            <strong className="text-sky-300 text-[11px]">{vessel.speed_kts.toFixed(1)} kn @ {vessel.heading_deg.toFixed(0)}°</strong>
          </div>
          <div className="bg-polar-950/80 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 text-[9px] block">NEAREST SAR HUB</span>
            <strong className="text-emerald-400 text-[11px]">{nearestSARStation.name.split(' ')[0]} Base</strong>
          </div>
        </div>

        {/* Nature of Distress Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>NATURE OF POLAR DISTRESS (IMO RES A.1051)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { id: 'BESETMENT_SEVERE', label: 'Severe Ice Besetment & Converging Pack', desc: 'Vessel trapped in high ice pressure, drift towards shallow ridges' },
              { id: 'ICEBERG_COLLISION', label: 'Iceberg / Growler Hull Impact', desc: 'Impact with submerged glacial ice, hull integrity compromised' },
              { id: 'HULL_BREACH', label: 'Hull Ingress & Flooding', desc: 'Water ingress in forward hold/void spaces' },
              { id: 'ENGINE_FAILURE', label: 'Main Propulsion Blackout', desc: 'Total engine breakdown in heavy sea-ice fields' },
              { id: 'MEDICAL_EMERGENCY', label: 'Critical Casualty / Medevac', desc: 'Immediate aeromedical evacuation dispatch' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDistress(d.id)}
                className={'p-2.5 rounded-xl border text-left transition ' + (
                  selectedDistress === d.id
                    ? 'bg-red-950/90 border-red-500 text-white font-bold shadow-md shadow-red-950/60'
                    : 'glass-card text-slate-400 hover:text-slate-200'
                )}
              >
                <span className="block text-xs text-white">{d.label}</span>
                <span className="text-[10px] text-slate-400 font-normal">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Souls on Board Counter */}
        <div className="flex items-center justify-between bg-polar-950/80 p-3 rounded-xl border border-white/5 text-xs">
          <span className="text-slate-300 flex items-center space-x-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>SOULS ON BOARD (POB / PASSENGERS & CREW):</span>
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="500"
              value={soulsOnBoard}
              onChange={(e) => setSoulsOnBoard(Number(e.target.value))}
              className="w-16 bg-polar-900 border border-polar-600 rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
            />
            <span className="text-slate-400 text-[10px]">PERSONS</span>
          </div>
        </div>

        {/* Transmit Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-card hover:bg-polar-800 text-slate-300 text-xs transition"
          >
            STAND DOWN
          </button>

          <button
            type="button"
            onClick={handleTransmitDistress}
            className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-black px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-xl shadow-red-950/80 border border-red-400 transition active:scale-95"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>TRANSMIT MAYDAY DISTRESS BEACON</span>
          </button>
        </div>
      </div>
    </div>
  );
};