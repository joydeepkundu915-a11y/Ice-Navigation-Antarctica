import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Sliders, 
  Info, 
  FileText, 
  Gauge, 
  Compass, 
  Anchor, 
  X 
} from 'lucide-react';
import { polarApi } from '../services/api';
import { bridgeAudio } from '../services/audioAlerts';

const ICE_TYPES = [
  { id: 'open_water', name: 'Open Water / Ice Free', desc: '0% ice cover or slush' },
  { id: 'bergy_water', name: 'Bergy Water', desc: 'Water with isolated bergs/growlers' },
  { id: 'grey_white_ice', name: 'Grey-White Ice (15-30 cm)', desc: 'Young ice forming sheet' },
  { id: 'thin_first_year_stage2', name: 'Thin First-Year Ice (50-70 cm)', desc: 'First season freeze' },
  { id: 'medium_first_year', name: 'Medium First-Year Ice (70-120 cm)', desc: 'Standard winter pack' },
  { id: 'thick_first_year', name: 'Thick First-Year Ice (> 120 cm)', desc: 'Heavy first-year ice' },
  { id: 'multi_year_ice', name: 'Multi-Year Ice (> 2.5m)', desc: 'Old survival ice with heavy pressure ridges' },
  { id: 'glacial_ice_growler', name: 'Glacial Ice Growlers', desc: 'Dense calved glacial chunks' }
];

const POLAR_CLASSES = [
  { id: 'PC1', name: 'PC1 - Heavy Polar Research Icebreaker', cap: '3.0m all polar waters' },
  { id: 'PC2', name: 'PC2 - Medium Polar Icebreaker (Sir David Attenborough)', cap: '2.2m multi-year ice' },
  { id: 'PC4', name: 'PC4 - Heavy Antarctic Expedition Vessel (Bharati Explorer)', cap: '1.5m thick first-year' },
  { id: 'PC6', name: 'PC6 - Light Antarctic Research Vessel', cap: '0.8m medium first-year' },
  { id: 'PC7', name: 'PC7 - Expedition Cruise / Cargo Vessel', cap: '0.5m thin first-year' },
  { id: '1AS', name: '1A Super - Baltic Heavy Ice Strengthened', cap: '0.6m Baltic ice' },
  { id: 'NON_ICE', name: 'Non-Ice Strengthened Vessel (Category C)', cap: 'Open Water Only' }
];

interface PolarisRiskPanelProps {
  onClose?: () => void;
}

export const PolarisRiskPanel: React.FC<PolarisRiskPanelProps> = ({ onClose }) => {
  const [selectedClass, setSelectedClass] = useState<string>('PC4');
  const [primaryIceType, setPrimaryIceType] = useState<string>('medium_first_year');
  const [primaryTenths, setPrimaryTenths] = useState<number>(6);
  const [secondaryIceType, setSecondaryIceType] = useState<string>('open_water');
  const [secondaryTenths, setSecondaryTenths] = useState<number>(4);

  const [evaluation, setEvaluation] = useState<any>(null);
  const [resistance, setResistance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculateEvaluation = async () => {
    setLoading(true);
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
      draft_m: 9.0,
      length_m: 128.0,
      ice_thickness_m: 1.2,
      ice_concentration_pct: primaryTenths * 10,
      ship_speed_kts: 10.0
    });
    if (resEst) {
      setResistance(resEst);
    }
    setLoading(false);
  };

  useEffect(() => {
    calculateEvaluation();
  }, [selectedClass, primaryIceType, primaryTenths, secondaryIceType, secondaryTenths]);

  const isAuth = evaluation?.status === 'AUTHORIZED';
  const isElevated = evaluation?.status === 'ELEVATED_RISK';

  return (
    <div className="w-full h-full bg-polar-900 p-3 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header with Close */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>IMO POLARIS RISK INDEX OUTCOME (RIO) EVALUATION ENGINE</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-700">
                  MSC.1/Circ.1519
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Operational Limit Assessment Risk Indexing System for Antarctic Navigation
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                onClose();
                bridgeAudio.playTacticalClick();
              }}
              className="bg-polar-800 hover:bg-polar-700 text-slate-300 hover:text-white px-2.5 py-1 rounded border border-polar-600 text-xs flex items-center space-x-1"
              title="Return to ECDIS Map (ESC)"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>CLOSE [ESC]</span>
            </button>
          )}
        </div>

        {/* Evaluation Summary Card */}
        {evaluation && (
          <div className={'p-4 rounded-lg border shadow-xl flex items-center justify-between ' + (
            isAuth ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' :
            isElevated ? 'bg-amber-950/60 border-amber-500 text-amber-200' :
            'bg-red-950/70 border-red-500 text-red-200 animate-pulse'
          )}>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold font-mono">
                  RIO: {evaluation.rio > 0 ? '+' + evaluation.rio : evaluation.rio}
                </span>
                <span className={'px-2 py-0.5 rounded text-xs font-bold border ' + (
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
              <div>ESCORT MANDATORY: <strong className="text-white">{evaluation.escort_required ? 'YES' : 'NO'}</strong></div>
            </div>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Vessel Ice Class Selector */}
          <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 space-y-2">
            <span className="font-bold text-xs text-sky-400 block border-b border-polar-700 pb-1">
              1. VESSEL POLAR ICE CLASS
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {POLAR_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => {
                    setSelectedClass(cls.id);
                    bridgeAudio.playTacticalClick();
                  }}
                  className={'w-full text-left p-2 rounded border transition text-xs flex justify-between items-center ' + (
                    selectedClass === cls.id
                      ? 'bg-sky-950 border-sky-400 text-white font-bold'
                      : 'bg-polar-900 border-polar-700 text-slate-400 hover:bg-polar-800'
                  )}
                >
                  <span>{cls.name}</span>
                  <span className="text-[10px] text-slate-400">{cls.cap}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ice Regime Mixer */}
          <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 space-y-3">
            <span className="font-bold text-xs text-sky-400 block border-b border-polar-700 pb-1">
              2. ICE REGIME CONCENTRATIONS (Tenths /10)
            </span>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 flex justify-between">
                <span>Primary Ice Type:</span>
                <span className="text-sky-400 font-bold">{primaryTenths}/10 ({primaryTenths * 10}%)</span>
              </label>
              <select
                value={primaryIceType}
                onChange={(e) => setPrimaryIceType(e.target.value)}
                className="w-full bg-polar-900 border border-polar-600 rounded px-2 py-1 text-xs text-white"
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
                className="w-full h-1.5 bg-polar-700 rounded appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 flex justify-between">
                <span>Secondary Ice Type:</span>
                <span className="text-sky-400 font-bold">{secondaryTenths}/10 ({secondaryTenths * 10}%)</span>
              </label>
              <select
                value={secondaryIceType}
                onChange={(e) => setSecondaryIceType(e.target.value)}
                className="w-full bg-polar-900 border border-polar-600 rounded px-2 py-1 text-xs text-white"
              >
                {ICE_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Lindqvist Resistance Model */}
        {resistance && (
          <div className="bg-polar-850 border border-polar-700 rounded-lg p-3">
            <span className="font-bold text-xs text-amber-400 block border-b border-polar-700 pb-1 mb-2">
              3. LINDQVIST (1989) ICE RESISTANCE HYDRODYNAMICS
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-polar-900 p-2 rounded border border-polar-700">
                <span className="text-slate-400 text-[10px] block">CRUSHING FORCE</span>
                <span className="text-white font-bold">{resistance.crushing_resistance_kn || 85} kN</span>
              </div>
              <div className="bg-polar-900 p-2 rounded border border-polar-700">
                <span className="text-slate-400 text-[10px] block">BREAKING FORCE</span>
                <span className="text-white font-bold">{resistance.breaking_resistance_kn || 120} kN</span>
              </div>
              <div className="bg-polar-900 p-2 rounded border border-polar-700">
                <span className="text-slate-400 text-[10px] block">SUBMERSION DRAG</span>
                <span className="text-white font-bold">{resistance.submersion_resistance_kn || 135} kN</span>
              </div>
              <div className="bg-polar-900 p-2 rounded border border-polar-700">
                <span className="text-slate-400 text-[10px] block">TOTAL ICE RESISTANCE</span>
                <span className="text-amber-400 font-bold">{resistance.total_resistance_kn || 340} kN</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};