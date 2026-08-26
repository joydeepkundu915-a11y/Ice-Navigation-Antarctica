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
  Eye
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
    <div className="min-h-screen w-screen bg-polar-950 text-slate-100 flex flex-col justify-between font-sans select-none relative overflow-y-auto">
      {/* Background Polar Elements & Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-polar-900/60 to-polar-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Header Strip */}
      <header className="relative z-10 border-b border-polar-800/80 bg-polar-900/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IcebergLogo size={38} glow={true} />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                POLARIS ECDIS
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-950 text-sky-300 border border-sky-600">
                IMO POLAR CODE v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              AI-Enabled Antarctic Sea-Ice & Iceberg Trajectory Decision Support System
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1.5 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM ONLINE (2026)</span>
          </span>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="bg-gradient-to-b from-polar-850 via-polar-900 to-polar-950 border border-sky-500/40 rounded-2xl shadow-2xl shadow-sky-950/80 max-w-4xl w-full p-6 sm:p-8 space-y-6">
          
          {/* Hero Emblem & System Description */}
          <div className="text-center space-y-2 border-b border-polar-700/80 pb-5">
            <div className="flex justify-center mb-1">
              <IcebergLogo size={68} glow={true} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              ANTARCTIC POLAR BRIDGE PORTAL
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-mono">
              Authenticate authorized Polar Watchkeepers, Ice Pilots & Research Expedition Commanders.
            </p>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 rounded-lg bg-polar-950 border border-polar-700 font-mono text-xs mt-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('OFFICER');
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-4 py-1.5 rounded-md font-bold transition ' + (
                  loginMode === 'OFFICER'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                ⚓ Bridge Officer Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('OBSERVER');
                  setOfficerName('Guest Polar Scientist');
                  setPasscode('GUEST-MODE');
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-4 py-1.5 rounded-md font-bold transition ' + (
                  loginMode === 'OBSERVER'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                🔬 Observer / Guest Access
              </button>
            </div>
          </div>

          {/* Form & Fleet Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Polar Vessel Fleet Database */}
            <div className="lg:col-span-7 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Ship className="w-4 h-4 text-sky-400" />
                  <span>Select Active Polar Vessel</span>
                </label>
                <span className="text-[10px] text-slate-400">6 Vessels Commissioned</span>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                {FLEET_DATABASE.map((v) => {
                  const isSelected = v.imo === selectedVesselImo;
                  const iceBadge = 
                    v.ice_class === 'PC1' ? 'bg-purple-900 text-purple-200 border-purple-500' :
                    v.ice_class === 'PC2' ? 'bg-blue-900 text-blue-200 border-blue-500' :
                    v.ice_class === 'PC3' ? 'bg-teal-900 text-teal-200 border-teal-500' :
                    'bg-sky-900 text-sky-200 border-sky-500';

                  return (
                    <button
                      key={v.imo}
                      type="button"
                      onClick={() => {
                        setSelectedVesselImo(v.imo);
                        bridgeAudio.playTacticalClick();
                      }}
                      className={
                        'p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ' +
                        (isSelected
                          ? 'bg-sky-950/70 border-sky-400 shadow-md shadow-sky-900/50 text-white'
                          : 'bg-polar-900/70 border-polar-700 text-slate-300 hover:bg-polar-800 hover:border-slate-500')
                      }
                    >
                      <div className="flex-1 mr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs">{v.name}</span>
                          <span className={'px-1.5 py-0.2 rounded text-[9px] font-bold border ' + iceBadge}>
                            {v.ice_class}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          IMO: {v.imo} • Flag: {v.flag} • Power: {(v.engine_power_kw / 1000).toFixed(1)} MW
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Vessel Hydrodynamic Details */}
              <div className="bg-polar-900/80 p-3 rounded-lg border border-polar-700 text-xs space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>CALL SIGN: <strong className="text-white">{currentVessel.call_sign}</strong></span>
                  <span>DISPLACEMENT: <strong className="text-white">{currentVessel.displacement_tons.toLocaleString()} MT</strong></span>
                  <span>BOW ANGLE: <strong className="text-sky-300">{currentVessel.bow_ice_angle_deg}°</strong></span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  "{currentVessel.description}"
                </p>
              </div>

              {/* Quick 1-Click Crew Profiles */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  ⚡ Instant 1-Click Conning Profiles:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSelectPreset('9814117', 'ICE_PILOT', 'Capt. Markus Weber', 'AWI-POLAR-2024')}
                    className="bg-polar-900/60 hover:bg-sky-900/30 p-1.5 rounded border border-polar-700 text-left text-[10px] text-slate-300 hover:text-white"
                  >
                    <span className="font-bold text-sky-400 block">Ice Pilot</span>
                    <span>Polarstern</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectPreset('9798686', 'MASTER_CAPTAIN', 'Capt. Will Davies', 'BAS-POLAR-9812')}
                    className="bg-polar-900/60 hover:bg-sky-900/30 p-1.5 rounded border border-polar-700 text-left text-[10px] text-slate-300 hover:text-white"
                  >
                    <span className="font-bold text-teal-400 block">Master</span>
                    <span>Attenborough</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectPreset('9845231', 'POLAR_SCIENTIST', 'Dr. Rajesh Sharma', 'NCPOR-SCI-044')}
                    className="bg-polar-900/60 hover:bg-sky-900/30 p-1.5 rounded border border-polar-700 text-left text-[10px] text-slate-300 hover:text-white"
                  >
                    <span className="font-bold text-amber-400 block">Scientist</span>
                    <span>Bharati Exp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: User Credentials Form */}
            <div className="lg:col-span-5 bg-polar-900/90 p-5 rounded-xl border border-polar-700 flex flex-col justify-between space-y-4 font-mono">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="border-b border-polar-700 pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span>Watchkeeper Authentication</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>STCW A-V/4</span>
                  </span>
                </div>

                {/* Duty Role */}
                {loginMode === 'OFFICER' && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      DUTY RANK / SPECIALIZATION
                    </label>
                    <select
                      value={officerRole}
                      onChange={(e) => setOfficerRole(e.target.value as UserRole)}
                      className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
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
                    className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* STCW Polar Certificate */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    IMO POLAR CERTIFICATE / LICENSE ID
                  </label>
                  <input
                    type="text"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    placeholder="IMO-POLAR-988421"
                    className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Password / Passcode */}
                {loginMode === 'OFFICER' && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 flex items-center justify-between">
                      <span>BRIDGE SECURITY PASSCODE</span>
                      <span className="text-[9px] text-sky-400">Demo: POLARIS-2026</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 pr-8"
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
                  <div className="bg-red-950/80 border border-red-600 rounded p-2 text-[10px] text-red-200 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Submit / Launch Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full mt-2 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition transform active:scale-95 disabled:opacity-50 text-xs"
                >
                  {isAuthenticating ? (
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AUTHENTICATING POLAR CREW...</span>
                    </div>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>LOGIN & CON THE BRIDGE</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-polar-800 text-[9px] text-slate-500 text-center flex items-center justify-center space-x-1.5">
                <Award className="w-3 h-3 text-sky-400" />
                <span>Compliant with IMO Resolution MSC.385(94) & POLARIS MSC.1/Circ.1519</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-polar-800/80 bg-polar-900/60 px-6 py-2.5 text-center text-[10px] text-slate-500 font-mono flex flex-wrap items-center justify-between">
        <span>POLARIS ECDIS v2.4 PRO • Antarctic Treaty System (Madrid Protocol) Compliant</span>
        <span className="flex items-center space-x-2">
          <span>ENC: INT 9054</span>
          <span>•</span>
          <span>WGS-84 Polar Stereographic EPSG:3031</span>
        </span>
      </footer>
    </div>
  );
};