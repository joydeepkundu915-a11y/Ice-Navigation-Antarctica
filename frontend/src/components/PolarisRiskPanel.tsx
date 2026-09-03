import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Info, 
  Sliders, 
  Activity, 
  Ship, 
  CheckCircle, 
  X,
  Gauge,
  Sparkles
} from 'lucide-react';
import { VesselState } from '../types';
import { polarApi } from '../services/api';
import { bridgeAudio } from '../services/audioAlerts';

export interface PolarisEvaluation {
  polar_class: string;
  rio: number;
  status: string;
  speed_limit_kts: number;
  escort_required: boolean;
  operational_advisory: string;
}

interface PolarisRiskPanelProps {
  vessel?: VesselState;
  onClose?: () => void;
}

const POLAR_CLASSES = [
  { id: 'PC1', name: 'PC1 - Year-round icebreaker (All polar waters)', cap: 'Year-round multi-year ice' },
  { id: 'PC2', name: 'PC2 - Year-round operations (Moderate multi-year ice)', cap: 'Moderate multi-year ice' },
  { id: 'PC3', name: 'PC3 - Year-round second-year ice', cap: 'Second-year ice with multi-year inclusions' },
  { id: 'PC4', name: 'PC4 - Year-round thick first-year ice', cap: 'Thick first-year ice with old ice' },
  { id: 'PC5', name: 'PC5 - Year-round medium first-year ice', cap: 'Medium first-year ice' },
  { id: 'PC6', name: 'PC6 - Summer/autumn medium first-year ice', cap: 'Summer medium first-year' },
  { id: 'PC7', name: 'PC7 - Summer/autumn thin first-year ice', cap: 'Summer thin first-year ice' },
  { id: '1AS', name: '1A Super - Baltic ice class (Thin ice leads)', cap: 'Open pack / brash ice' },
  { id: 'NON_ICE', name: 'Non-Ice Classed Vessel', cap: 'Open water only (<10% ice)' }
];

const ICE_TYPES = [
  { id: 'MYI', name: 'Old / Multi-Year Ice (> 3.0m)', rivPC4: -4, rivPC1: 2 },
  { id: 'SYI', name: 'Second-Year Ice (2.0 - 3.0m)', rivPC4: -3, rivPC1: 2 },
  { id: 'TFY', name: 'Thick First-Year Ice (1.2 - 2.0m)', rivPC4: 1, rivPC1: 3 },
  { id: 'MFY', name: 'Medium First-Year Ice (0.7 - 1.2m)', rivPC4: 2, rivPC1: 3 },
  { id: 'THFY', name: 'Thin First-Year Ice (0.3 - 0.7m)', rivPC4: 2, rivPC1: 3 },
  { id: 'GREY_WHITE', name: 'Grey-White Ice (0.15 - 0.3m)', rivPC4: 3, rivPC1: 3 },
  { id: 'GREY', name: 'Grey Ice (0.10 - 0.15m)', rivPC4: 3, rivPC1: 3 },
  { id: 'NEW_ICE', name: 'New Ice / Frazil / Grease (< 0.1m)', rivPC4: 3, rivPC1: 3 },
  { id: 'OPEN_WATER', name: 'Open Water / Leads (< 10% SIC)', rivPC4: 3, rivPC1: 3 }
];

export const PolarisRiskPanel: React.FC<PolarisRiskPanelProps> = ({ vessel, onClose }) => {
  const [selectedClass, setSelectedClass] = useState<string>(vessel?.polar_class || 'PC4');
  const [primaryIceType, setPrimaryIceType] = useState<string>('MFY');
  const [primaryTenths, setPrimaryTenths] = useState<number>(7);
  const [secondaryIceType, setSecondaryIceType] = useState<string>('TFY');
  const [secondaryTenths, setSecondaryTenths] = useState<number>(3);
  
  const [evaluation, setEvaluation] = useState<PolarisEvaluation | null>(null);
  const [resistanceEstimate, setResistanceEstimate] = useState<any | null>(null);

  const evaluateRegime = async () => {
    const regime = [
      { ice_type: primaryIceType, concentration_tenths: primaryTenths },
      { ice_type: secondaryIceType, concentration_tenths: secondaryTenths }
    ];

    const res = await polarApi.evaluatePolaris(selectedClass, regime);
    if (res) {
      setEvaluation(res);
    }

    const resEst = await polarApi.calculateResistance({
      beam_m: 24.0,
      draft_m: 8.5,
      length_m: 128.0,
      ice_thickness_m: primaryIceType === 'MYI' ? 2.5 : primaryIceType === 'MFY' ? 0.9 : 0.4,
      ice_concentration_pct: (primaryTenths + secondaryTenths) * 10,
      ship_speed_kts: res?.speed_limit_kts || 10.0
    });
    if (resEst) {
      setResistanceEstimate(resEst);
    }
  };

  useEffect(() => {
    evaluateRegime();
  }, [selectedClass, primaryIceType, primaryTenths, secondaryIceType, secondaryTenths]);

  const isAuth = evaluation?.status === 'AUTHORIZED';
  const isElevated = evaluation?.status === 'ELEVATED_RISK';

  return (
    <div className="w-full h-full bg-polar-900 p-4 overflow-y-auto font-mono select-none polar-grid-bg">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header with Close */}
        <div className="glass-panel rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/10">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-500/60 text-sky-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center space-x-2.5 tracking-wide">
                <span>IMO POLARIS RISK INDEX SYSTEM (RIO)</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-sm">
                  MSC.1/CIRC.1519 COMPLIANT
                </span>
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Polar Operational Limit Assessment Risk Indexing System for Antarctic Hull Safety
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                onClose();
                bridgeAudio.playTacticalClick();
              }}
              className="glass-card hover:bg-polar-800 text-slate-300 hover:text-white px-3 py-1 rounded-lg text-xs flex items-center space-x-1.5 transition"
              title="Return to ECDIS Map (ESC)"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>CLOSE [ESC]</span>
            </button>
          )}
        </div>

        {/* Evaluation Summary Card */}
        {evaluation && (
          <div className={'p-4 rounded-xl border shadow-2xl flex items-center justify-between ' + (
            isAuth ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/30' :
            isElevated ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 ring-1 ring-amber-500/30' :
            'bg-red-950/80 border-red-500/80 text-red-200 ring-1 ring-red-500/30 animate-pulse'
          )}>
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl font-black font-mono tracking-wider">
                  RIO: {evaluation.rio > 0 ? '+' + evaluation.rio : evaluation.rio}
                </span>
                <span className={'px-2.5 py-0.5 rounded-md text-xs font-bold border ' + (
                  isAuth ? 'bg-emerald-900 border-emerald-400 text-emerald-100' :
                  isElevated ? 'bg-amber-900 border-amber-400 text-amber-100' :
                  'bg-red-900 border-red-400 text-red-100'
                )}>
                  {evaluation.status}
                </span>
              </div>
              <p className="text-xs">{evaluation.operational_advisory}</p>
            </div>

            <div className="text-right text-xs space-y-1">
              <div>MAX SPEED LIMIT: <strong className="text-white text-sm">{evaluation.speed_limit_kts} kts</strong></div>
              <div>ESCORT STATUS: <strong className="text-white">{evaluation.escort_required ? 'MANDATORY' : 'INDEPENDENT PASSAGE'}</strong></div>
            </div>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Vessel Ice Class Selector */}
          <div className="glass-panel rounded-xl p-3.5 space-y-2.5 border border-white/10">
            <span className="font-bold text-xs text-sky-400 block border-b border-white/10 pb-1.5 flex items-center space-x-1.5">
              <Ship className="w-3.5 h-3.5 text-sky-400" />
              <span>1. VESSEL POLAR ICE CLASS</span>
            </span>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {POLAR_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => {
                    setSelectedClass(cls.id);
                    bridgeAudio.playTacticalClick();
                  }}
                  className={'w-full text-left p-2 rounded-lg border transition text-xs flex justify-between items-center ' + (
                    selectedClass === cls.id
                      ? 'bg-sky-950 border-sky-400 text-white font-bold ring-1 ring-sky-400/40'
                      : 'glass-card text-slate-300 hover:text-white'
                  )}
                >
                  <span>{cls.name}</span>
                  <span className="text-[10px] text-slate-400">{cls.cap}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ice Regime Mixer */}
          <div className="glass-panel rounded-xl p-3.5 space-y-3.5 border border-white/10">
            <span className="font-bold text-xs text-sky-400 block border-b border-white/10 pb-1.5 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>2. ICE REGIME CONCENTRATIONS (Tenths /10)</span>
            </span>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 flex justify-between">
                <span>Primary Ice Type:</span>
                <span className="text-sky-400 font-bold">{primaryTenths}/10 ({primaryTenths * 10}%)</span>
              </label>
              <select
                value={primaryIceType}
                onChange={(e) => setPrimaryIceType(e.target.value)}
                className="w-full bg-polar-950 border border-polar-600 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                {ICE_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="range"
                min="0"
                max="10"
                value={primaryTenths}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPrimaryTenths(val);
                  setSecondaryTenths(10 - val);
                }}
                className="w-full h-2 bg-polar-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 flex justify-between">
                <span>Secondary Ice Type:</span>
                <span className="text-sky-400 font-bold">{secondaryTenths}/10 ({secondaryTenths * 10}%)</span>
              </label>
              <select
                value={secondaryIceType}
                onChange={(e) => setSecondaryIceType(e.target.value)}
                className="w-full bg-polar-950 border border-polar-600 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                {ICE_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Lindqvist Resistance Breakdown */}
        {resistanceEstimate && (
          <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-xs text-amber-400 flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>LINDQVIST (1989) ICE RESISTANCE HYDRODYNAMIC FORCES</span>
              </span>
              <span className="text-white font-bold text-sm">
                TOTAL RESISTANCE: {resistanceEstimate.total_resistance_kn} kN
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-polar-950/80 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px]">CRUSHING RESISTANCE (Rc)</span>
                <strong className="text-sky-300 text-sm">{resistanceEstimate.crushing_resistance_kn} kN</strong>
                <p className="text-[10px] text-slate-400">Bow stem ice crushing deformation</p>
              </div>

              <div className="bg-polar-950/80 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px]">BREAKING RESISTANCE (Rb)</span>
                <strong className="text-amber-300 text-sm">{resistanceEstimate.breaking_resistance_kn} kN</strong>
                <p className="text-[10px] text-slate-400">Flexural ice sheet failure force</p>
              </div>

              <div className="bg-polar-950/80 p-2.5 rounded-lg border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px]">SUBMERSION DRAG (Rs)</span>
                <strong className="text-purple-300 text-sm">{resistanceEstimate.submersion_resistance_kn} kN</strong>
                <p className="text-[10px] text-slate-400">Floe clearing under keel & hull friction</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};