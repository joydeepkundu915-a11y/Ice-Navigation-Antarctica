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
  Clock,
  Sun,
  Moon,
  Sunset,
  Flame,
  FileText,
  UserCheck,
  LogOut,
  Bell,
  Activity
} from 'lucide-react';
import { VesselState, CPAAlert, ShipUser, DisplayPalette, BridgeAlarm } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface BridgeHeaderProps {
  vessel: VesselState;
  cpaAlert: CPAAlert | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: ShipUser | null;
  palette: DisplayPalette;
  onSetPalette: (p: DisplayPalette) => void;
  alarms: BridgeAlarm[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSafeHaven: () => void;
  onOpenRoutePlanner: () => void;
  onOpenLogbook: () => void;
  onOpenAlarms: () => void;
  onOpenDepthSounder: () => void;
  onOpenLogin: () => void;
}

export const BridgeHeader: React.FC<BridgeHeaderProps> = ({
  vessel,
  cpaAlert,
  activeTab,
  setActiveTab,
  currentUser,
  palette,
  onSetPalette,
  alarms,
  soundEnabled,
  onToggleSound,
  onOpenSafeHaven,
  onOpenRoutePlanner,
  onOpenLogbook,
  onOpenAlarms,
  onOpenDepthSounder,
  onOpenLogin
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unacknowledgedAlarms = alarms.filter(a => !a.acknowledged);
  const hasCriticalAlarm = unacknowledgedAlarms.some(a => a.severity === 'CRITICAL');

  return (
    <header className="bg-polar-850 border-b border-polar-700/80 px-4 py-2 flex flex-wrap items-center justify-between shadow-2xl z-30 relative select-none">
      {/* Brand & Vessel Profile Button */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={onOpenLogin}
          className="cursor-pointer group flex items-center space-x-2.5 bg-polar-900/90 hover:bg-polar-800 p-1.5 pr-3 rounded-lg border border-polar-700 hover:border-sky-500 transition-all shadow-md"
          title="Click to Switch Vessel or Login Officer"
        >
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-400 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-300/30">
            <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-wider text-xs text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-white">
                POLARIS ECDIS
              </span>
              <span className="px-1 py-0.1 rounded text-[9px] font-mono bg-sky-950 text-sky-300 border border-sky-700">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono flex items-center space-x-1">
              <span className="font-bold text-white truncate max-w-[120px]">{vessel.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-400 font-semibold">{vessel.polar_class}</span>
            </p>
          </div>
        </div>

        {/* Authenticated Officer Pill */}
        {currentUser && (
          <div 
            onClick={onOpenLogin}
            className="hidden md:flex items-center space-x-2 bg-polar-900/80 hover:bg-polar-800 px-2.5 py-1.5 rounded-lg border border-polar-700 text-xs font-mono cursor-pointer transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[9px] text-slate-400 block">{currentUser.role.replace('_', ' ')}</span>
              <span className="text-slate-200 font-bold">{currentUser.full_name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Center Tactical Telemetry Strip */}
      <div className="hidden xl:flex items-center space-x-3 text-xs font-mono">
        <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-1.5">
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          <div>
            <span className="text-slate-400 text-[9px] block">POSITION</span>
            <span className="text-slate-200 font-bold">
              {Math.abs(vessel.lat).toFixed(2)}°S, {Math.abs(vessel.lon).toFixed(2)}°W
            </span>
          </div>
        </div>

        <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <span className="text-slate-400 text-[9px] block">HDG / SOG</span>
            <span className="text-slate-200 font-bold">
              {vessel.heading_deg.toFixed(0)}° / {vessel.speed_kts.toFixed(1)} kts
            </span>
          </div>
        </div>

        <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-slate-400 text-[9px] block">ICE RESISTANCE</span>
            <span className="text-amber-300 font-bold">{vessel.ice_resistance_kn.toFixed(0)} kN</span>
          </div>
        </div>

        <div className="bg-polar-900/80 px-2.5 py-1.5 rounded border border-polar-700 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <span className="text-slate-400 text-[9px] block">BRIDGE CHRONO</span>
            <span className="text-sky-300 font-bold">{utcTime}</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Navigation Tabs & Tools */}
      <div className="flex items-center space-x-2">
        <nav className="flex items-center space-x-1 bg-polar-900/90 p-1 rounded-lg border border-polar-700 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('map');
              bridgeAudio.playTacticalClick();
            }}
            className={'px-2.5 py-1 rounded transition font-bold ' + (activeTab === 'map' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white')}
          >
            ECDIS MAP
          </button>
          <button
            onClick={() => {
              setActiveTab('radar');
              bridgeAudio.playTacticalClick();
            }}
            className={'px-2.5 py-1 rounded transition font-bold ' + (activeTab === 'radar' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white')}
          >
            RADAR PPI
          </button>
          <button
            onClick={() => {
              setActiveTab('polaris');
              bridgeAudio.playTacticalClick();
            }}
            className={'px-2.5 py-1 rounded transition font-bold ' + (activeTab === 'polaris' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white')}
          >
            POLARIS RIO
          </button>
          <button
            onClick={() => {
              setActiveTab('icebergs');
              bridgeAudio.playTacticalClick();
            }}
            className={'px-2.5 py-1 rounded transition font-bold ' + (activeTab === 'icebergs' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white')}
          >
            ICEBERGS
          </button>
          <button
            onClick={() => {
              setActiveTab('sar');
              bridgeAudio.playTacticalClick();
            }}
            className={'px-2.5 py-1 rounded transition font-bold ' + (activeTab === 'sar' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white')}
          >
            SAR VISION
          </button>
          <button
            onClick={() => {
              setActiveTab('copilot');
              bridgeAudio.playTacticalClick();
            }}
            className={'px-2.5 py-1 rounded transition font-bold ' + (activeTab === 'copilot' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white')}
          >
            AI COPILOT
          </button>
        </nav>

        {/* Palette Selector */}
        <div className="flex items-center bg-polar-900/90 p-1 rounded-lg border border-polar-700">
          <button
            onClick={() => {
              onSetPalette('day');
              bridgeAudio.playTacticalClick();
            }}
            className={'p-1 rounded text-xs transition ' + (palette === 'day' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white')}
            title="IEC 62288 Day Palette"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onSetPalette('dusk');
              bridgeAudio.playTacticalClick();
            }}
            className={'p-1 rounded text-xs transition ' + (palette === 'dusk' ? 'bg-sky-500/30 text-sky-300' : 'text-slate-400 hover:text-white')}
            title="IEC 62288 Dusk Palette"
          >
            <Sunset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onSetPalette('night');
              bridgeAudio.playTacticalClick();
            }}
            className={'p-1 rounded text-xs transition ' + (palette === 'night' ? 'bg-red-500/30 text-red-300' : 'text-slate-400 hover:text-white')}
            title="IEC 62288 Night Palette"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bridge Tools */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onOpenDepthSounder}
            className="bg-polar-800 hover:bg-polar-700 p-1.5 rounded-lg border border-polar-600 text-sky-400 hover:text-white transition"
            title="Dual-Frequency Depth Sounder"
          >
            <Waves className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLogbook}
            className="bg-polar-800 hover:bg-polar-700 p-1.5 rounded-lg border border-polar-600 text-emerald-400 hover:text-white transition"
            title="IMO Polar Code Voyage Risk Logbook & PDF Report"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRoutePlanner}
            className="bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 shadow transition"
          >
            <Navigation className="w-3 h-3 text-sky-400" />
            <span>ROUTES</span>
          </button>

          <button
            onClick={onOpenSafeHaven}
            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 shadow transition"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>SAFE HAVEN</span>
          </button>

          <button
            onClick={onToggleSound}
            className={'p-1.5 rounded-lg border transition ' + (soundEnabled ? 'bg-sky-950 border-sky-600 text-sky-400' : 'bg-polar-900 border-polar-700 text-slate-500')}
            title={soundEnabled ? 'Mute Bridge Audio' : 'Enable Bridge Audio Alarms'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenAlarms}
            className={'relative p-1.5 rounded-lg border transition ' + (hasCriticalAlarm ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' : unacknowledgedAlarms.length > 0 ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-polar-900 border-polar-700 text-slate-400')}
            title="IMO IAMS Bridge Alarms"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedAlarms.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono animate-bounce">
                {unacknowledgedAlarms.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
