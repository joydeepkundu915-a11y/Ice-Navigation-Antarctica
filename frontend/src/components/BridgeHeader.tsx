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
  Activity, 
  X, 
  Gauge,
  AlertOctagon,
  Bot,
  Ship,
  Sparkles,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { IcebergLogo } from './IcebergLogo';
import { VesselState, CPAAlert, ShipUser, DisplayPalette, BridgeAlarm, AutoSailState, AISVessel } from '../types';
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
  onOpenSOS: () => void;
  onOpenAIS: () => void;
  onLogout: () => void;
  autoSail: AutoSailState;
  onToggleAutoSail: () => void;
  aisVessels: AISVessel[];
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
  onOpenLogin,
  onOpenSOS,
  onOpenAIS,
  onLogout,
  autoSail,
  onToggleAutoSail,
  aisVessels
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
  const criticalAIS = aisVessels.filter(v => (v.dcpa_nm || 99) < 2.0 && (v.tcpa_min || 99) < 20);

  const handleTabClick = (tabKey: string) => {
    bridgeAudio.playTacticalClick();
    if (activeTab === tabKey && tabKey !== 'map') {
      setActiveTab('map');
    } else {
      setActiveTab(tabKey);
    }
  };

  const navTabs = [
    { key: 'map', label: 'ECDIS MAP' },
    { key: 'radar', label: 'RADAR PPI' },
    { key: 'polaris', label: 'POLARIS RIO' },
    { key: 'icebergs', label: 'ICEBERGS' },
    { key: 'sar', label: 'SAR VISION' },
    { key: 'copilot', label: 'AI COPILOT' }
  ];

  return (
    <header className="glass-panel border-b border-white/10 px-3 py-1.5 flex flex-wrap items-center justify-between shadow-2xl z-30 relative select-none text-xs font-mono">
      {/* Left: Brand with Iceberg Logo, Vessel & Officer Status */}
      <div className="flex items-center space-x-2">
        <div 
          onClick={onOpenLogin}
          className="cursor-pointer group flex items-center space-x-2.5 bg-polar-900/90 hover:bg-polar-800/90 p-1.5 pr-3 rounded-xl border border-white/10 hover:border-sky-400/60 transition-all shadow-md shadow-black/40"
          title="Click to Switch Vessel or Login Officer Credentials"
        >
          {/* Custom Glowing Iceberg Logo */}
          <IcebergLogo size={32} glow={true} />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-[12px] text-white tracking-wide">
                POLARIS ECDIS
              </span>
              <span className="px-1.5 py-0.1 rounded text-[8px] font-bold bg-sky-950 text-sky-300 border border-sky-600/50">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-300 flex items-center space-x-1">
              <span className="font-bold text-sky-400 truncate max-w-[95px]">{vessel.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-semibold">{vessel.polar_class}</span>
            </p>
          </div>
        </div>

        {/* ENC Status Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-polar-900/80 px-2.5 py-1 rounded-lg border border-white/5 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">ENC:</span>
          <span className="text-slate-200 font-bold">INT 9054</span>
        </div>

        {/* Officer Profile Badge */}
        <button
          onClick={onOpenLogin}
          className="hidden sm:flex items-center space-x-1.5 bg-sky-950/80 hover:bg-sky-900/90 px-2.5 py-1 rounded-lg border border-sky-500/40 text-[10px] text-sky-200 transition"
          title="Login / Authenticate Bridge Watchkeeper"
        >
          <UserCheck className="w-3 h-3 text-sky-400" />
          <span className="font-bold truncate max-w-[80px]">
            {currentUser ? currentUser.full_name.split(' ')[1] || 'OFFICER' : 'LOGIN'}
          </span>
        </button>
      </div>

      {/* Center Tactical Telemetry Strip (High-Density & Realistic) */}
      <div className="hidden xl:flex items-center space-x-2 text-[10px]">
        <div className="bg-polar-900/80 px-2.5 py-1 rounded-lg border border-white/5 flex items-center space-x-1.5">
          <Navigation className="w-3 h-3 text-sky-400" />
          <span className="text-slate-400">POS:</span>
          <span className="text-slate-200 font-bold">
            {Math.abs(vessel.lat).toFixed(2)}°S, {Math.abs(vessel.lon).toFixed(2)}°W
          </span>
        </div>

        <div className="bg-polar-900/80 px-2.5 py-1 rounded-lg border border-white/5 flex items-center space-x-1.5">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">HDG:</span>
          <span className="text-slate-200 font-bold">{vessel.heading_deg.toFixed(0)}°</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">SOG:</span>
          <span className="text-emerald-400 font-bold">{vessel.speed_kts.toFixed(1)} kn</span>
        </div>

        <div className="bg-polar-900/80 px-2.5 py-1 rounded-lg border border-white/5 flex items-center space-x-1.5">
          <Activity className="w-3 h-3 text-amber-400" />
          <span className="text-slate-400">ICE CRUSH:</span>
          <span className="text-amber-300 font-bold">{vessel.ice_resistance_kn.toFixed(0)} kN</span>
        </div>

        <div className="bg-polar-900/80 px-2.5 py-1 rounded-lg border border-white/5 flex items-center space-x-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-sky-300 font-bold">{utcTime}</span>
        </div>
      </div>

      {/* Center-Right: Mission-Critical Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Glowing Red GMDSS SOS Button */}
        <button
          onClick={() => {
            onOpenSOS();
            bridgeAudio.playTacticalClick();
          }}
          className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-extrabold px-3 py-1 rounded-lg shadow-lg shadow-red-950/60 flex items-center space-x-1.5 text-xs animate-pulse border border-red-400/80 transition active:scale-95"
          title="GMDSS Mayday Polar Distress Transceiver"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-white" />
          <span>🚨 SOS DISTRESS</span>
        </button>

        {/* Autonomous Auto-Sail Mode Toggle */}
        <button
          onClick={() => {
            onToggleAutoSail();
            bridgeAudio.playWarningChime();
          }}
          className={'px-2.5 py-1 rounded-lg font-bold text-xs flex items-center space-x-1.5 border transition shadow active:scale-95 ' + (
            autoSail.enabled
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-emerald-950/50'
              : 'bg-polar-900/80 text-slate-400 border-white/10 hover:text-white'
          )}
          title="Toggle Autonomous Polar Navigation (Auto-Avoidance & Lead Tracking)"
        >
          <Bot className={'w-3.5 h-3.5 ' + (autoSail.enabled ? 'text-emerald-400 animate-spin-slow' : 'text-slate-500')} />
          <span>{autoSail.enabled ? '🤖 AUTO-SAIL ON' : 'AUTO-SAIL OFF'}</span>
        </button>

        {/* AIS Vessel Traffic & Collision Alert */}
        <button
          onClick={() => {
            onOpenAIS();
            bridgeAudio.playTacticalClick();
          }}
          className={'px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center space-x-1.5 border transition active:scale-95 ' + (
            criticalAIS.length > 0
              ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
              : 'bg-purple-950/80 border-purple-600/50 text-purple-200 hover:bg-purple-900/90'
          )}
          title="AIS Multi-Vessel Traffic & COLREGs Anti-Collision Matrix"
        >
          <Ship className="w-3 h-3 text-purple-400" />
          <span>AIS ({aisVessels.length})</span>
          {criticalAIS.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Right: Navigation Tabs, Palette & IAMS Tools */}
      <div className="flex items-center space-x-1.5">
        <nav className="flex items-center space-x-0.5 bg-polar-950/80 p-0.5 rounded-lg border border-white/10 text-[11px] shadow-inner">
          {navTabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTabClick(t.key)}
                className={'px-2 py-0.5 rounded-md transition font-bold flex items-center space-x-1 ' + (
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
                title={isActive && t.key !== 'map' ? 'Click to close and return to Map' : t.label}
              >
                <span>{t.label}</span>
                {isActive && t.key !== 'map' && (
                  <X className="w-3 h-3 text-red-200 hover:text-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Palette Selector */}
        <div className="flex items-center bg-polar-950/80 p-0.5 rounded-lg border border-white/10 shadow-inner">
          <button
            onClick={() => onSetPalette('day')}
            className={'p-1 rounded transition ' + (palette === 'day' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white')}
            title="Day Palette"
          >
            <Sun className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSetPalette('dusk')}
            className={'p-1 rounded transition ' + (palette === 'dusk' ? 'bg-sky-500/30 text-sky-300' : 'text-slate-400 hover:text-white')}
            title="Dusk Palette"
          >
            <Sunset className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSetPalette('night')}
            className={'p-1 rounded transition ' + (palette === 'night' ? 'bg-red-500/30 text-red-300' : 'text-slate-400 hover:text-white')}
            title="Night Palette"
          >
            <Moon className="w-3 h-3" />
          </button>
        </div>

        {/* Bridge Tools Group */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenDepthSounder}
            className="glass-card hover:bg-polar-800 p-1.5 rounded-lg text-sky-400 hover:text-white transition"
            title="Depth Sounder"
          >
            <Waves className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenLogbook}
            className="glass-card hover:bg-polar-800 p-1.5 rounded-lg text-emerald-400 hover:text-white transition"
            title="Polar Code Logbook"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenRoutePlanner}
            className="bg-sky-950/80 hover:bg-sky-900 border border-sky-600/60 text-sky-200 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-sm transition"
          >
            <Navigation className="w-2.5 h-2.5 text-sky-400" />
            <span>ROUTES</span>
          </button>

          <button
            onClick={onOpenSafeHaven}
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-sm transition"
          >
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            <span>HAVEN</span>
          </button>

          <button
            onClick={onToggleSound}
            className={'p-1.5 rounded-lg border transition ' + (soundEnabled ? 'bg-sky-950/80 border-sky-500/50 text-sky-400' : 'bg-polar-900 border-white/5 text-slate-500')}
            title={soundEnabled ? 'Sound On' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenAlarms}
            className={'relative p-1.5 rounded-lg border transition ' + (hasCriticalAlarm ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' : unacknowledgedAlarms.length > 0 ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-polar-900 border-white/5 text-slate-400')}
            title="IAMS Bridge Alarms"
          >
            <Bell className="w-3.5 h-3.5" />
            {unacknowledgedAlarms.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center font-mono">
                {unacknowledgedAlarms.length}
              </span>
            )}
          </button>

          {/* Direct Logout Button */}
          <button
            onClick={() => {
              onLogout();
              bridgeAudio.playTacticalClick();
            }}
            className="bg-red-950/80 hover:bg-red-900 p-1.5 rounded-lg border border-red-700/60 text-red-300 hover:text-white transition"
            title="Log Out to Login Page"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};