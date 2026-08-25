import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Navigation, 
  Wind, 
  Thermometer, 
  Waves, 
  Eye, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Radio,
  Clock
} from 'lucide-react';
import { VesselState, CPAAlert } from '../types';

interface BridgeHeaderProps {
  vessel: VesselState;
  cpaAlert: CPAAlert | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSafeHaven: () => void;
  onOpenRoutePlanner: () => void;
}

export const BridgeHeader: React.FC<BridgeHeaderProps> = ({
  vessel,
  cpaAlert,
  activeTab,
  setActiveTab,
  onOpenSafeHaven,
  onOpenRoutePlanner
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAlertCritical = cpaAlert && (cpaAlert.collision_risk === 'CRITICAL_COLLISION_ALERT' || cpaAlert.cpa_nm < 2.0);

  return (
    <header className="bg-polar-850 border-b border-polar-700/80 px-4 py-2.5 flex items-center justify-between shadow-2xl z-30 relative select-none">
      {/* Brand & Vessel Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-400 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-300/30">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-sm text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-white">
                POLARIS ECDIS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-700/60">
                v2.0 PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
              <span>{vessel.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400 font-semibold">{vessel.polar_class}</span>
            </p>
          </div>
        </div>

        <div className="h-7 w-[1px] bg-polar-700 hidden lg:block" />

        {/* Tactical Nav Telemetry */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono">
          <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-2">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <div>
              <span className="text-slate-400 text-[10px] block">POS</span>
              <span className="text-slate-200 font-semibold">
                {Math.abs(vessel.lat).toFixed(2)}°S, {Math.abs(vessel.lon).toFixed(2)}°W
              </span>
            </div>
          </div>

          <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-slate-400 text-[10px] block">HDG / STW</span>
              <span className="text-slate-200 font-semibold">
                {vessel.heading_deg.toFixed(0)}° / {vessel.speed_kts.toFixed(1)} kts
              </span>
            </div>
          </div>

          <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-2">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <div>
              <span className="text-slate-400 text-[10px] block">WIND (T)</span>
              <span className="text-slate-200 font-semibold">28 kts (260°)</span>
            </div>
          </div>

          <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-2">
            <Thermometer className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <span className="text-slate-400 text-[10px] block">SST</span>
              <span className="text-slate-200 font-semibold">-1.4°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Navigation Tab Bar */}
      <nav className="flex items-center space-x-1 bg-polar-900/90 p-1 rounded-lg border border-polar-700/80">
        {[
          { id: 'map', label: 'Tactical ECDIS', icon: Navigation },
          { id: 'radar', label: 'Radar PPI & CPA', icon: Radio },
          { id: 'polaris', label: 'POLARIS RIO', icon: ShieldCheck },
          { id: 'icebergs', label: 'Iceberg Physics', icon: Waves },
          { id: 'sar', label: 'SAR Vision AI', icon: Eye },
          { id: 'copilot', label: 'AI Ice Pilot', icon: Compass }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-polar-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls & Alerts */}
      <div className="flex items-center space-x-3">
        {/* CPA Threat Banner if active */}
        {isAlertCritical ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-red-950/80 border border-red-500 text-red-300 text-xs font-mono animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>CPA ALERT: {cpaAlert.iceberg_id} ({cpaAlert.cpa_nm} NM)</span>
          </div>
        ) : (
          <div className="hidden xl:flex items-center space-x-1.5 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RIO +18 • CLEAR</span>
          </div>
        )}

        {/* Route Planner Launch Button */}
        <button
          onClick={onOpenRoutePlanner}
          className="px-3 py-1.5 rounded bg-polar-700 hover:bg-polar-600 text-sky-300 hover:text-white text-xs font-medium border border-sky-600/40 transition-colors flex items-center space-x-1.5"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Route Plan</span>
        </button>

        {/* Safe Haven Emergency Modal Button */}
        <button
          onClick={onOpenSafeHaven}
          className="px-3 py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-amber-100 text-xs font-medium border border-amber-600/60 transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safe Havens</span>
        </button>

        {/* UTC Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded bg-polar-900 border border-polar-700 text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{utcTime}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded border transition-colors ${
            soundEnabled
              ? 'bg-sky-950 border-sky-600 text-sky-300'
              : 'bg-polar-900 border-polar-700 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute Bridge Audio Alarms' : 'Enable Bridge Audio Alarms'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
