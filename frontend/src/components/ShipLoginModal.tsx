import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Compass, 
  Anchor, 
  KeyRound, 
  UserCheck, 
  Ship, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Lock,
  ChevronRight,
  Globe2,
  Cpu
} from 'lucide-react';
import { ShipUser, VesselFleetProfile, UserRole } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

export const FLEET_DATABASE: VesselFleetProfile[] = [
  {
    imo: '9814117',
    name: 'R/V POLARSTERN II',
    flag: 'DE (Germany)',
    call_sign: 'DBFI',
    ice_class: 'PC3',
    displacement_tons: 17300,
    length_m: 118.0,
    beam_m: 25.0,
    draft_m: 11.2,
    engine_power_kw: 14700,
    bow_ice_angle_deg: 24,
    max_speed_knots: 15.5,
    home_port: 'Bremerhaven',
    description: 'Alfred Wegener Institute research icebreaker with continuous 1.5m level icebreaking capability.'
  },
  {
    imo: '9798686',
    name: 'R/V SIR DAVID ATTENBOROUGH',
    flag: 'GB (United Kingdom)',
    call_sign: 'ZDLS1',
    ice_class: 'PC4',
    displacement_tons: 15000,
    length_m: 128.0,
    beam_m: 24.0,
    draft_m: 9.0,
    engine_power_kw: 14000,
    bow_ice_angle_deg: 26,
    max_speed_knots: 17.0,
    home_port: 'Stanley, Falkland Islands',
    description: 'British Antarctic Survey multidisciplinary polar research vessel with PC4 ice strengthening.'
  },
  {
    imo: '9845231',
    name: 'R/V BHARATI EXPLORER',
    flag: 'IN (India)',
    call_sign: 'AUVB',
    ice_class: 'PC4',
    displacement_tons: 14200,
    length_m: 122.5,
    beam_m: 23.0,
    draft_m: 8.8,
    engine_power_kw: 13500,
    bow_ice_angle_deg: 25,
    max_speed_knots: 16.2,
    home_port: 'Mormugao / Goa',
    description: 'National Centre for Polar and Ocean Research (NCPOR) dedicated logistics and science vessel.'
  },
  {
    imo: '7414999',
    name: 'FESCO ICEBREAKER KRASIN',
    flag: 'RU / Int. Charter',
    call_sign: 'UDBK',
    ice_class: 'PC1',
    displacement_tons: 20240,
    length_m: 135.0,
    beam_m: 26.0,
    draft_m: 11.0,
    engine_power_kw: 26500,
    bow_ice_angle_deg: 21,
    max_speed_knots: 19.5,
    home_port: 'Vladivostok',
    description: 'Heavy polar icebreaker for escorting supply convoys through consolidated 2.5m multi-year fast ice.'
  },
  {
    imo: '9318852',
    name: 'MV USHUAIA VOYAGER',
    flag: 'PA (Panama / Arg)',
    call_sign: 'HP6420',
    ice_class: '1A Super',
    displacement_tons: 6800,
    length_m: 84.7,
    beam_m: 15.5,
    draft_m: 5.5,
    engine_power_kw: 4800,
    bow_ice_angle_deg: 32,
    max_speed_knots: 14.0,
    home_port: 'Ushuaia',
    description: 'High-maneuverability expedition vessel navigating the Antarctic Peninsula and Drake Passage.'
  },
  {
    imo: '9864289',
    name: 'LE COMMANDANT CHARCOT',
    flag: 'FR (France)',
    call_sign: 'FMCG',
    ice_class: 'PC2',
    displacement_tons: 31283,
    length_m: 150.0,
    beam_m: 28.0,
    draft_m: 10.0,
    engine_power_kw: 34000,
    bow_ice_angle_deg: 23,
    max_speed_knots: 18.0,
    home_port: 'Marseille',
    description: 'Hybrid LNG electric polar exploration vessel capable of high-latitude winter sea-ice transits.'
  }
];

interface ShipLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: ShipUser, vesselProfile: VesselFleetProfile) => void;
  currentUser: ShipUser | null;
  onClose?: () => void;
}

export const ShipLoginModal: React.FC<ShipLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  currentUser,
  onClose
}) => {
  const [selectedVesselImo, setSelectedVesselImo] = useState<string>('9798686');
  const [officerRole, setOfficerRole] = useState<UserRole>('MASTER_CAPTAIN');
  const [officerName, setOfficerName] = useState<string>('Capt. Erik Lindqvist');
  const [licenseId, setLicenseId] = useState<string>('IMO-POLAR-988421');
  const [passcode, setPasscode] = useState<string>('POLARIS-2026');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentVessel = FLEET_DATABASE.find(v => v.imo === selectedVesselImo) || FLEET_DATABASE[0];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);
    bridgeAudio.playTacticalClick();

    setTimeout(() => {
      if (!passcode || passcode.length < 4) {
        setAuthError('Invalid Security Passcode. Must be at least 4 characters.');
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
        role: officerRole,
        full_name: officerName || 'Polar Watch Officer',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar-950/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-gradient-to-b from-polar-800 via-polar-850 to-polar-900 border border-sky-500/40 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="bg-polar-850 px-6 py-4 border-b border-polar-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-wide text-white flex items-center space-x-2">
                  <span>POLARIS ECDIS</span>
                  <span className="text-sky-400 text-xs px-2 py-0.5 rounded bg-sky-950/80 border border-sky-600 font-mono">
                    IMO STCW A-V/4 AUTH
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Antarctic Treaty System & Polar Code Bridge Decision Support Terminal
              </p>
            </div>
          </div>

          {currentUser && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded border border-polar-600 hover:bg-polar-700 transition"
            >
              Continue as {currentUser.full_name}
            </button>
          )}
        </div>

        {/* Main Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="text-xs font-bold text-sky-300 font-mono uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
                <Ship className="w-4 h-4 text-sky-400" />
                <span>Select Polar Fleet Vessel</span>
              </label>

              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {FLEET_DATABASE.map((v) => {
                  const isSelected = v.imo === selectedVesselImo;
                  const iceBadge = v.ice_class === 'PC1' ? 'bg-purple-900 text-purple-200 border-purple-500' :
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
                        'p-3 rounded-lg border text-left transition-all flex items-center justify-between ' +
                        (isSelected
                          ? 'bg-sky-950/60 border-sky-400 shadow-md shadow-sky-900/40 text-white'
                          : 'bg-polar-900/70 border-polar-700 text-slate-300 hover:bg-polar-700/50 hover:border-slate-500')
                      }
                    >
                      <div className="flex-1 mr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm">{v.name}</span>
                          <span className={'px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ' + iceBadge}>
                            {v.ice_class}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          IMO: {v.imo} • Flag: {v.flag} • Power: {(v.engine_power_kw / 1000).toFixed(1)} MW
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-polar-900/80 p-3.5 rounded-lg border border-polar-700 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-polar-700 pb-1.5">
                <span className="text-slate-400 font-bold">VESSEL POLAR HYDRODYNAMICS</span>
                <span className="text-sky-400 font-semibold">{currentVessel.call_sign}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="bg-polar-800/80 p-2 rounded border border-polar-700">
                  <span className="text-slate-400 block text-[10px]">DISPLACEMENT</span>
                  <span className="text-white font-bold">{currentVessel.displacement_tons.toLocaleString()} MT</span>
                </div>
                <div className="bg-polar-800/80 p-2 rounded border border-polar-700">
                  <span className="text-slate-400 block text-[10px]">LENGTH / BEAM</span>
                  <span className="text-white font-bold">{currentVessel.length_m}m / {currentVessel.beam_m}m</span>
                </div>
                <div className="bg-polar-800/80 p-2 rounded border border-polar-700">
                  <span className="text-slate-400 block text-[10px]">ICE KNIFE ANGLE</span>
                  <span className="text-white font-bold">{currentVessel.bow_ice_angle_deg}°</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 italic pt-1">
                "{currentVessel.description}"
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                ? Quick Conning Profiles:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset('9814117', 'ICE_PILOT', 'Capt. Markus Weber', 'AWI-POLAR-2024')}
                  className="bg-polar-900/60 hover:bg-sky-900/30 p-2 rounded border border-polar-700 text-left text-[10px] font-mono text-slate-300 hover:text-white"
                >
                  <span className="font-bold text-sky-400 block">Ice Pilot</span>
                  <span>R/V Polarstern</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset('9798686', 'MASTER_CAPTAIN', 'Capt. Will Davies', 'BAS-POLAR-9812')}
                  className="bg-polar-900/60 hover:bg-sky-900/30 p-2 rounded border border-polar-700 text-left text-[10px] font-mono text-slate-300 hover:text-white"
                >
                  <span className="font-bold text-teal-400 block">Master Captain</span>
                  <span>Attenborough</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset('9845231', 'POLAR_SCIENTIST', 'Dr. Rajesh Sharma', 'NCPOR-SCI-044')}
                  className="bg-polar-900/60 hover:bg-sky-900/30 p-2 rounded border border-polar-700 text-left text-[10px] font-mono text-slate-300 hover:text-white"
                >
                  <span className="font-bold text-amber-400 block">Science Chief</span>
                  <span>Bharati Explorer</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-polar-900/90 p-5 rounded-xl border border-polar-700 flex flex-col justify-between space-y-4">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="border-b border-polar-700 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>Bridge Officer Credentials</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Authentication validates Polar Code conning authorization
                </p>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-mono block mb-1">
                  DUTY ROLE
                </label>
                <select
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value as UserRole)}
                  className="w-full bg-polar-800 border border-polar-600 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="MASTER_CAPTAIN">Master / Captain</option>
                  <option value="ICE_PILOT">Certified Ice Pilot (Polaris Lead)</option>
                  <option value="CHIEF_MATE">Chief Officer / Watchkeeper</option>
                  <option value="POLAR_SCIENTIST">Chief Polar Scientist</option>
                  <option value="FLEET_OPERATIONS">Fleet HQ Operations Controller</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-mono block mb-1">
                  OFFICER FULL NAME
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Capt. Erik Lindqvist"
                  className="w-full bg-polar-800 border border-polar-600 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-mono block mb-1 flex items-center justify-between">
                  <span>POLAR CERTIFICATE / STCW ID</span>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VALID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                  placeholder="IMO-POLAR-988421"
                  className="w-full bg-polar-800 border border-polar-600 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-mono block mb-1 flex items-center justify-between">
                  <span>BRIDGE PASSCODE</span>
                  <span className="text-[10px] text-slate-400 font-mono">Demo: POLARIS-2026</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-polar-800 border border-polar-600 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-400 pr-8"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {authError && (
                <div className="bg-red-950/80 border border-red-600/80 rounded p-2 text-[11px] font-mono text-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full mt-2 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono">VERIFYING STCW CREDENTIALS...</span>
                  </div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span className="text-xs font-mono tracking-wider">LOGIN & CON THE BRIDGE</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-polar-800 text-[10px] text-slate-500 font-mono text-center flex items-center justify-center space-x-2">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>Compliant with IMO Polar Code MSC.1/Circ.1519 & IEC 62288</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
