import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Anchor, 
  Radio, 
  HeartHandshake, 
  Fuel, 
  Compass, 
  MapPin, 
  ArrowRight,
  AlertTriangle,
  Plane
} from 'lucide-react';
import { Station, VesselState } from '../types';
import { polarApi } from '../services/api';

interface EmergencySafeHavenModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: VesselState;
  onSelectStation: (station: Station) => void;
}

export const EmergencySafeHavenModal: React.FC<EmergencySafeHavenModalProps> = ({
  isOpen,
  onClose,
  vessel,
  onSelectStation
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const fetchNearest = async () => {
        setLoading(true);
        const data = await polarApi.getNearestStations(vessel.lat, vessel.lon, 12);
        if (data && data.length > 0) {
          setStations(data);
        } else {
          // Fetch all stations
          const all = await polarApi.getStations();
          setStations(all);
        }
        setLoading(false);
      };
      fetchNearest();
    }
  }, [isOpen, vessel.lat, vessel.lon]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono">
      <div className="bg-polar-850 border border-polar-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-polar-700 flex items-center justify-between bg-polar-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-600 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <span>ANTARCTIC SAFE HAVEN & EMERGENCY BASES REGISTRY</span>
              </h3>
              <p className="text-xs text-slate-400">
                Sorted by Proximity to Vessel ({Math.abs(vessel.lat).toFixed(2)}°S, {Math.abs(vessel.lon).toFixed(2)}°W)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-polar-800 hover:bg-polar-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Haven List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {stations.map((st) => (
            <div
              key={st.id}
              className="bg-polar-900 border border-polar-700/80 hover:border-sky-500 rounded-xl p-3.5 transition-all shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-polar-800 pb-2.5 mb-2.5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-sm">{st.name}</span>
                    <span className="text-xs text-slate-400">({st.operator})</span>
                  </div>
                  <span className="text-[11px] text-sky-400 font-sans">{st.sector} • {st.type}</span>
                </div>

                {st.distance_nm !== undefined && (
                  <div className="flex items-center space-x-3 text-xs bg-polar-950 px-3 py-1.5 rounded-lg border border-polar-800">
                    <div>
                      <span className="text-slate-500 text-[9px] block">DISTANCE</span>
                      <span className="text-sky-300 font-bold">{st.distance_nm} NM</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] block">BEARING</span>
                      <span className="text-slate-200 font-bold">{st.bearing_deg}°</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] block">ETA @ 10KT</span>
                      <span className="text-emerald-400 font-bold">{st.steaming_time_hrs_10kt} hrs</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2.5">
                <div className="bg-polar-850 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block flex items-center space-x-1">
                    <Anchor className="w-3 h-3 text-slate-400" />
                    <span>ANCHORAGE</span>
                  </span>
                  <span className={st.safe_anchorage ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {st.safe_anchorage ? `${st.anchorage_depth_m}m Safe` : 'Unsheltered'}
                  </span>
                </div>

                <div className="bg-polar-850 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block flex items-center space-x-1">
                    <Radio className="w-3 h-3 text-slate-400" />
                    <span>VHF CHANNELS</span>
                  </span>
                  <span className="text-sky-300 font-semibold">{st.vhf_channel}</span>
                </div>

                <div className="bg-polar-850 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block flex items-center space-x-1">
                    <HeartHandshake className="w-3 h-3 text-slate-400" />
                    <span>MEDICAL CARE</span>
                  </span>
                  <span className="text-slate-200 font-semibold text-[11px] truncate block">{st.medical_level}</span>
                </div>

                <div className="bg-polar-850 p-2 rounded border border-polar-700">
                  <span className="text-slate-500 text-[9px] block flex items-center space-x-1">
                    <Fuel className="w-3 h-3 text-slate-400" />
                    <span>FUEL BUNKERING</span>
                  </span>
                  <span className="text-slate-200 font-semibold text-[11px] truncate block">{st.fuel_support}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-tight mb-2">
                {st.description}
              </p>

              <button
                onClick={() => {
                  onSelectStation(st);
                  onClose();
                }}
                className="w-full py-1.5 bg-polar-800 hover:bg-sky-900/60 border border-polar-700 hover:border-sky-600 rounded text-sky-300 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>View on Map & Plot Tactical Approach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
