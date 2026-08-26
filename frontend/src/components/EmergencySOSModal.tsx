import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Radio, 
  PhoneCall, 
  ShieldAlert, 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  X, 
  Flame, 
  Ship, 
  MapPin, 
  Activity,
  Award
} from 'lucide-react';
import { VesselState, ShipUser, DistressSOSState, Station } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: VesselState;
  user: ShipUser | null;
  sosState: DistressSOSState;
  onTriggerSOS: (distressType: any, souls: number) => void;
  onCancelSOS: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  vessel,
  user,
  sosState,
  onTriggerSOS,
  onCancelSOS
}) => {
  const [selectedDistress, setSelectedDistress] = useState<any>('BESETMENT_SEVERE');
  const [soulsCount, setSoulsCount] = useState<number>(54);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTransmit = () => {
    setIsTransmitting(true);
    bridgeAudio.playMaydayDistressAlert();

    setTimeout(() => {
      onTriggerSOS(selectedDistress, soulsCount);
      setIsTransmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-gradient-to-b from-red-950 via-polar-900 to-polar-950 border-2 border-red-600 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-xs font-mono text-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-700/80 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wider flex items-center space-x-2">
                <span>GMDSS POLAR DISTRESS TRANSCEIVER</span>
                <span className="px-1.5 py-0.2 rounded bg-red-800 text-white text-[10px] font-bold">
                  MAYDAY 406 MHz
                </span>
              </h2>
              <p className="text-[10px] text-red-300">
                COSPAS-SARSAT • Inmarsat-C DSC • VHF Ch 16 / 2187.5 kHz Emergency Network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-900/60 text-red-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SOS Active Alert Banner */}
        {sosState.active ? (
          <div className="bg-red-900/90 border border-red-500 rounded-lg p-4 space-y-3 animate-pulse shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-white animate-spin-slow" />
                <span className="font-extrabold text-white text-sm">
                  MAYDAY MAYDAY MAYDAY — DISTRESS BEACON ACTIVE
                </span>
              </div>
              <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded text-white font-bold">
                EPIRB ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-black/40 p-2.5 rounded border border-red-700">
              <div>
                <span className="text-red-300 text-[9px] block">NATURE</span>
                <span className="font-bold text-white">{sosState.distress_type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-red-300 text-[9px] block">POB (SOULS)</span>
                <span className="font-bold text-white">{sosState.souls_on_board}</span>
              </div>
              <div>
                <span className="text-red-300 text-[9px] block">SAR STATION</span>
                <span className="font-bold text-white">{sosState.sar_station_notified}</span>
              </div>
              <div>
                <span className="text-red-300 text-[9px] block">ESTIMATED ETA</span>
                <span className="font-bold text-yellow-300">~{sosState.estimated_sar_eta_hrs} Hours</span>
              </div>
            </div>

            <p className="text-[11px] text-red-200">
              Distress broadcast coordinates: <strong>{Math.abs(vessel.lat).toFixed(2)}°S, {Math.abs(vessel.lon).toFixed(2)}°W</strong>. Standing by on VHF Ch 16 (156.8 MHz).
            </p>

            <button
              onClick={() => {
                onCancelSOS();
                bridgeAudio.playTacticalClick();
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs border border-slate-600 transition"
            >
              CANCEL DISTRESS / STAND-DOWN RESCUE
            </button>
          </div>
        ) : (
          /* Distress Transmission Form */
          <div className="space-y-3">
            {/* Distress Nature Options */}
            <div>
              <label className="text-xs font-bold text-red-300 uppercase tracking-wider block mb-1.5">
                1. Select Nature of Polar Distress
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'BESETMENT_SEVERE', label: 'Severe Ice Besetment & Converging Pack', desc: 'Vessel trapped in high ice pressure, drift towards shallow ridges' },
                  { id: 'ICEBERG_COLLISION', label: 'Iceberg / Growler Hull Impact', desc: 'Impact with submerged glacial ice, hull integrity compromised' },
                  { id: 'HULL_BREACH', label: 'Hull Ingress & Flooding', desc: 'Water ingress in forward hold/void spaces' },
                  { id: 'ENGINE_FAILURE', label: 'Main Propulsion Blackout', desc: 'Total engine breakdown in heavy sea-ice fields' },
                  { id: 'MEDICAL_EMERGENCY', label: 'Critical Casualty / Medevac', desc: 'Immediate aeromedical rescue required' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDistress(d.id)}
                    className={'p-2.5 rounded border text-left transition ' + (
                      selectedDistress === d.id
                        ? 'bg-red-900/80 border-red-400 text-white font-bold shadow'
                        : 'bg-polar-900/80 border-polar-700 text-slate-400 hover:bg-polar-800 hover:text-slate-200'
                    )}
                  >
                    <span className="block text-xs">{d.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Souls on Board */}
            <div className="bg-polar-900/80 p-3 rounded border border-polar-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-xs">SOULS ON BOARD (POB)</span>
                <span className="text-[10px] text-slate-400">Crew, ice pilots, scientific researchers</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={soulsCount}
                  onChange={(e) => setSoulsCount(Number(e.target.value))}
                  className="w-20 bg-polar-800 border border-polar-600 rounded px-2 py-1 text-center font-bold text-white text-xs"
                />
              </div>
            </div>

            {/* Own Ship Telemetry Snapshot */}
            <div className="bg-polar-900/80 p-3 rounded border border-polar-700 text-[11px] grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block text-[9px]">VESSEL / CLASS</span>
                <span className="font-bold text-white">{vessel.name} ({vessel.polar_class})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">POSITION</span>
                <span className="font-bold text-white">{Math.abs(vessel.lat).toFixed(2)}°S, {Math.abs(vessel.lon).toFixed(2)}°W</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">MASTER IN CHARGE</span>
                <span className="font-bold text-white">{user?.full_name || 'Capt. Erik Lindqvist'}</span>
              </div>
            </div>

            {/* Transmit Button */}
            <button
              onClick={handleTransmit}
              disabled={isTransmitting}
              className="w-full bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold py-3 rounded-lg text-sm shadow-xl shadow-red-950 flex items-center justify-center space-x-2 transition transform active:scale-95 disabled:opacity-50"
            >
              {isTransmitting ? (
                <span>TRANSMITTING 406 MHz COSPAS-SARSAT BEACON...</span>
              ) : (
                <>
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                  <span>TRANSMIT GMDSS MAYDAY DISTRESS BEACON</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};