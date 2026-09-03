import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  Ship, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ChevronRight, 
  Globe2, 
  Compass, 
  Radio, 
  Layers, 
  Sparkles,
  Eye,
  Wind,
  Waves,
  Thermometer,
  Activity,
  Zap
} from 'lucide-react';
import { IcebergLogo } from './IcebergLogo';
import { ShipUser, VesselFleetProfile, UserRole } from '../types';
import { FLEET_DATABASE } from './ShipLoginModal';
import { bridgeAudio } from '../services/audioAlerts';

interface UserLoginPageProps {
  onLoginSuccess: (user: ShipUser, vesselProfile: VesselFleetProfile) => void;
  onContinueAsGuest?: () => void;
}

export const UserLoginPage: React.FC<UserLoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [selectedVesselImo, setSelectedVesselImo] = useState<string>('9798686'); // Sir David Attenborough
  const [officerRole, setOfficerRole] = useState<UserRole>('MASTER_CAPTAIN');
  const [officerName, setOfficerName] = useState<string>('Capt. Erik Lindqvist');
  const [licenseId, setLicenseId] = useState<string>('IMO-POLAR-988421');
  const [passcode, setPasscode] = useState<string>('POLARIS-2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'OFFICER' | 'OBSERVER'>('OFFICER');

  const currentVessel = FLEET_DATABASE.find(v => v.imo === selectedVesselImo) || FLEET_DATABASE[0];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);
    bridgeAudio.playTacticalClick();

    setTimeout(() => {
      if (loginMode === 'OFFICER' && (!passcode || passcode.length < 4)) {
        setAuthError('Security passcode must be at least 4 characters.');
        setIsAuthenticating(false);
        bridgeAudio.playWarningChime();
        return;
      }

      const user: ShipUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        call_sign: currentVessel.call_sign,
        vessel_imo: currentVessel.imo,
        vessel_name: currentVessel.name,
        polar_class: currentVessel.ice_class,
        role: loginMode === 'OBSERVER' ? 'POLAR_SCIENTIST' : officerRole,
        full_name: officerName || (loginMode === 'OBSERVER' ? 'Guest Polar Observer' : 'Polar Watch Officer'),
        license_number: licenseId || 'STCW-POLAR-A-V/4',
        certificate_valid_until: '2028-12-31',
        login_time: new Date().toISOString()
      };

      bridgeAudio.playSonarPing();
      setIsAuthenticating(false);
      onLoginSuccess(user, currentVessel);
    }, 450);
  };

  const handleQuickSelectPreset = (vesselImo: string, role: UserRole, name: string, lic: string) => {
    setSelectedVesselImo(vesselImo);
    setOfficerRole(role);
    setOfficerName(name);
    setLicenseId(lic);
    setPasscode('POLARIS-2026');
    bridgeAudio.playTacticalClick();
  };

  return (
    <div className="min-h-screen w-screen bg-polar-900 text-slate-100 flex flex-col justify-between font-sans select-none relative overflow-x-hidden overflow-y-auto polar-grid-bg">
      {/* Dynamic Polar Aurora Ambient Glow Orbs */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none aurora-orb-1" />
      <div className="fixed top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none aurora-orb-2" />
      <div className="fixed -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />

      {/* Top Polar Bridge Nav Header */}
      <header className="relative z-20 border-b border-white/10 glass-panel px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <IcebergLogo size={42} glow={true} />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-amber-300">
                POLARIS ECDIS
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-sky-950/90 text-sky-300 border border-sky-500/40 shadow-sm">
                IMO POLAR CODE v2.4 PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">
              AI Antarctic Sea-Ice, Iceberg Hydrodynamic Trajectory & Conning Decision System
            </p>
          </div>
        </div>

        {/* Live Systems Telemetry Badges */}
        <div className="hidden md:flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-2 bg-polar-800/80 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-[10px]">ENC INT 9054:</span>
            <span className="text-emerald-400 font-bold text-[10px]">VALIDATED WGS-84</span>
          </div>

          <div className="flex items-center space-x-2 bg-polar-800/80 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 text-[10px]">COSPAS-SARSAT:</span>
            <span className="text-sky-300 font-bold text-[10px]">406 MHz STANDBY</span>
          </div>
        </div>
      </header>

      {/* Live Antarctic Metocean & Hazard Marquee Ticker */}
      <div className="relative z-20 bg-polar-950/90 border-b border-sky-500/20 px-6 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300 overflow-hidden shadow-inner">
        <div className="flex items-center space-x-2 flex-shrink-0 text-amber-400 font-bold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>ANTARCTIC METOCEAN SITREP:</span>
        </div>
        <div className="flex items-center space-x-6 overflow-x-auto text-[10px] text-slate-300 font-mono scrollbar-none whitespace-nowrap px-4">
          <span className="flex items-center space-x-1.5">
            <Waves className="w-3 h-3 text-sky-400" />
            <span>DRAKE PASSAGE: <strong>4.8m Swell (Force 8 Gale)</strong></span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1.5">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>WEDDELL PACK ICE: <strong>74% SIC (Medium First-Year)</strong></span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1.5">
            <Wind className="w-3 h-3 text-amber-400" />
            <span>KATABATIC GALE: <strong>SSW 38 kts @ Marguerite Bay</strong></span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1.5">
            <Thermometer className="w-3 h-3 text-blue-400" />
            <span>TEMPERATURE: <strong>-18.4°C Air / -1.8°C Seawater</strong></span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1.5 text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>MEGA-BERG A-23a: <strong>Drift 52° @ 0.95 kts</strong></span>
          </span>
        </div>
      </div>

      {/* Main Authentication Terminal Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="glass-panel border border-sky-500/30 rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
          
          {/* Subtle Corner Ambient Glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 blur-3xl pointer-events-none" />

          {/* Hero Emblem & System Header */}
          <div className="text-center space-y-2.5 border-b border-white/10 pb-5 relative z-10">
            <div className="flex justify-center mb-1 transform hover:scale-105 transition-transform">
              <IcebergLogo size={76} glow={true} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center justify-center space-x-2">
              <span>POLAR COMMAND & BRIDGE ACCESS</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-mono">
              IMO Polar Code Watchkeeper Authentication & Real-Time Hydrodynamic Conning
            </p>

            {/* Mode Switcher Pills */}
            <div className="inline-flex p-1 rounded-xl bg-polar-950/80 border border-white/10 font-mono text-xs mt-2 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('OFFICER');
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-5 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ' + (
                  loginMode === 'OFFICER'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-sky-900/50'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <span>⚓ Bridge Officer Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('OBSERVER');
                  setOfficerName('Guest Polar Observer');
                  setPasscode('GUEST-MODE');
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-5 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ' + (
                  loginMode === 'OBSERVER'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/50'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <span>🔬 Observer / Guest Access</span>
              </button>
            </div>
          </div>

          {/* Form & Fleet Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* Left Column: Polar Vessel Fleet Selection */}
            <div className="lg:col-span-7 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Ship className="w-4 h-4 text-sky-400" />
                  <span>Select Active Polar Vessel</span>
                </label>
                <span className="text-[10px] text-slate-400 bg-polar-950 px-2 py-0.5 rounded border border-white/5">
                  6 Vessels Commissioned
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                {FLEET_DATABASE.map((v) => {
                  const isSelected = v.imo === selectedVesselImo;
                  const iceBadge = 
                    v.ice_class === 'PC1' ? 'bg-purple-950 text-purple-200 border-purple-500' :
                    v.ice_class === 'PC2' ? 'bg-blue-950 text-blue-200 border-blue-500' :
                    v.ice_class === 'PC3' ? 'bg-teal-950 text-teal-200 border-teal-500' :
                    'bg-sky-950 text-sky-200 border-sky-500';

                  return (
                    <button
                      key={v.imo}
                      type="button"
                      onClick={() => {
                        setSelectedVesselImo(v.imo);
                        bridgeAudio.playTacticalClick();
                      }}
                      className={
                        'p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group ' +
                        (isSelected
                          ? 'bg-sky-950/80 border-sky-400 shadow-lg shadow-sky-900/40 text-white ring-1 ring-sky-400/40'
                          : 'glass-card text-slate-300 hover:text-white')
                      }
                    >
                      <div className="flex-1 mr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs group-hover:text-sky-300 transition-colors">{v.name}</span>
                          <span className={'px-1.5 py-0.2 rounded text-[9px] font-bold border ' + iceBadge}>
                            {v.ice_class}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          IMO: {v.imo} • Flag: {v.flag} • Power: {(v.engine_power_kw / 1000).toFixed(1)} MW • Max {v.max_speed_knots} kts
                        </p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-600 group-hover:border-sky-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Vessel Hydrodynamic Details Box */}
              <div className="bg-polar-950/70 p-3 rounded-xl border border-white/10 text-xs space-y-1.5 shadow-sm">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>CALL SIGN: <strong className="text-white">{currentVessel.call_sign}</strong></span>
                  <span>DISPLACEMENT: <strong className="text-white">{currentVessel.displacement_tons.toLocaleString()} MT</strong></span>
                  <span>BOW ICE ANGLE: <strong className="text-amber-300">{currentVessel.bow_ice_angle_deg}°</strong></span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  "{currentVessel.description}"
                </p>
              </div>

              {/* Quick 1-Click Conning Profiles */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Instant 1-Click Conning Profiles:</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSelectPreset('9814117', 'ICE_PILOT', 'Capt. Markus Weber', 'AWI-POLAR-2024')}
                    className="glass-card p-2 rounded-lg text-left text-[10px] text-slate-300 hover:text-white"
                  >
                    <span className="font-bold text-sky-400 block">Ice Pilot</span>
                    <span className="text-slate-400">R/V Polarstern</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectPreset('9798686', 'MASTER_CAPTAIN', 'Capt. Will Davies', 'BAS-POLAR-9812')}
                    className="glass-card p-2 rounded-lg text-left text-[10px] text-slate-300 hover:text-white"
                  >
                    <span className="font-bold text-teal-400 block">Master</span>
                    <span className="text-slate-400">Attenborough</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectPreset('9845231', 'POLAR_SCIENTIST', 'Dr. Rajesh Sharma', 'NCPOR-SCI-044')}
                    className="glass-card p-2 rounded-lg text-left text-[10px] text-slate-300 hover:text-white"
                  >
                    <span className="font-bold text-amber-400 block">Scientist</span>
                    <span className="text-slate-400">Bharati Exp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: User Credentials Form */}
            <div className="lg:col-span-5 bg-polar-950/80 p-5 rounded-xl border border-white/10 flex flex-col justify-between space-y-4 font-mono shadow-inner">
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span>Watchkeeper Authentication</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>STCW A-V/4</span>
                  </span>
                </div>

                {/* Duty Rank */}
                {loginMode === 'OFFICER' && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      DUTY RANK / SPECIALIZATION
                    </label>
                    <select
                      value={officerRole}
                      onChange={(e) => setOfficerRole(e.target.value as UserRole)}
                      className="w-full bg-polar-900 border border-polar-600 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
                    >
                      <option value="MASTER_CAPTAIN">Master / Captain</option>
                      <option value="ICE_PILOT">Certified Polar Ice Pilot</option>
                      <option value="CHIEF_MATE">Chief Officer / Watchkeeper</option>
                      <option value="POLAR_SCIENTIST">Chief Polar Scientist</option>
                      <option value="FLEET_OPERATIONS">Fleet HQ Operations</option>
                    </select>
                  </div>
                )}

                {/* Officer Name */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    OFFICER USERNAME / FULL NAME
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Capt. Erik Lindqvist"
                    className="w-full bg-polar-900 border border-polar-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
                  />
                </div>

                {/* STCW License */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    IMO POLAR CERTIFICATE / LICENSE ID
                  </label>
                  <input
                    type="text"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    placeholder="IMO-POLAR-988421"
                    className="w-full bg-polar-900 border border-polar-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
                  />
                </div>

                {/* Password / Passcode */}
                {loginMode === 'OFFICER' && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 flex items-center justify-between">
                      <span>BRIDGE SECURITY PASSCODE</span>
                      <span className="text-[9px] text-amber-300">Demo: POLARIS-2026</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-polar-900 border border-polar-600 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {authError && (
                  <div className="bg-red-950/80 border border-red-600 rounded-lg p-2 text-[10px] text-red-200 flex items-center space-x-1.5 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Submit Launch Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full mt-2 bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition transform active:scale-95 disabled:opacity-50 text-xs tracking-wider"
                >
                  {isAuthenticating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AUTHENTICATING POLAR CREW...</span>
                    </div>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>LOGIN & CON THE BRIDGE</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-white/10 text-[9px] text-slate-400 text-center flex items-center justify-center space-x-1.5">
                <Award className="w-3 h-3 text-sky-400" />
                <span>Compliant with IMO Resolution MSC.385(94) & POLARIS MSC.1/Circ.1519</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 glass-panel px-6 py-2.5 text-[10px] text-slate-400 font-mono flex flex-wrap items-center justify-between">
        <span>POLARIS ECDIS v2.4 PRO • Antarctic Treaty System (Madrid Protocol Annex IV) Compliant</span>
        <span className="flex items-center space-x-2">
          <span>CHART INT 9054</span>
          <span>•</span>
          <span>POLAR STEREOGRAPHIC EPSG:3031</span>
        </span>
      </footer>
    </div>
  );
};