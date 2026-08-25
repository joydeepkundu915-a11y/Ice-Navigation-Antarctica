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
  Anchor
} from 'lucide-react';
import { polarApi } from '../services/api';

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
  { id: 'PC4', name: 'PC4 - Heavy Antarctic Expedition Vessel (Agulhas II)', cap: '1.5m thick first-year' },
  { id: 'PC6', name: 'PC6 - Light Antarctic Research Vessel (Laurence M. Gould)', cap: '0.8m medium first-year' },
  { id: 'PC7', name: 'PC7 - Expedition Cruise / Cargo Vessel', cap: '0.5m thin first-year' },
  { id: '1AS', name: '1A Super - Baltic Heavy Ice Strengthened', cap: '0.6m Baltic ice' },
  { id: 'NON_ICE', name: 'Non-Ice Strengthened Vessel (Category C)', cap: 'Open Water Only' }
];

export const PolarisRiskPanel: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('PC4');
  const [primaryIceType, setPrimaryIceType] = useState<string>('medium_first_year');
  const [primaryTenths, setPrimaryTenths] = useState<number>(6);
  const [secondaryIceType, setSecondaryIceType] = useState<string>('open_water');
  const [secondaryTenths, setSecondaryTenths] = useState<number>(4);

  // Evaluation Result State
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
    } else {
      // Offline fallback calculation
      const isPc4 = selectedClass === 'PC4';
      const mockRio = isPc4 ? (primaryTenths * 1 + secondaryTenths * 3) : (primaryTenths * -5 + secondaryTenths * 3);
      setEvaluation({
        polar_class: selectedClass,
        rio: mockRio,
        status: mockRio >= 0 ? 'AUTHORIZED' : mockRio >= -10 ? 'ELEVATED_RISK' : 'PROHIBITED',
        status_color: mockRio >= 0 ? '#10b981' : mockRio >= -10 ? '#f59e0b' : '#ef4444',
        status_description: mockRio >= 0 ? 'Normal operation permitted under Polar Code.' : 'Operation requires speed restrictions or escort.',
        recommended_speed_limit_kts: mockRio >= 0 ? 12.0 : 6.0,
        escort_required: mockRio < 0,
        hull_stress_risk: mockRio >= 0 ? 'Low (< 35% Yield Strength)' : 'Elevated (65-85% Yield Strength)',
        regime_breakdown: [
          { ice_type: primaryIceType, concentration_tenths: primaryTenths, riv: 1, rio_contribution: primaryTenths * 1 },
          { ice_type: secondaryIceType, concentration_tenths: secondaryTenths, riv: 3, rio_contribution: secondaryTenths * 3 }
        ]
      });
    }

    // Calculate Lindqvist resistance
    const resResult = await polarApi.calculateResistance({
      beam_m: 21.0,
      draft_m: 8.0,
      length_m: 120.0,
      ice_thickness_m: primaryIceType.includes('thick') ? 1.5 : primaryIceType.includes('multi') ? 2.5 : 0.9,
      ice_concentration_pct: primaryTenths * 10,
      ship_speed_kts: 8.0
    });
    if (resResult) {
      setResistance(resResult);
    }

    setLoading(false);
  };

  useEffect(() => {
    calculateEvaluation();
  }, [selectedClass, primaryIceType, primaryTenths, secondaryIceType, secondaryTenths]);

  // Adjust secondary tenths automatically when primary changes
  const handlePrimaryTenthsChange = (val: number) => {
    setPrimaryTenths(val);
    setSecondaryTenths(10 - val);
  };

  return (
    <div className="w-full h-full bg-polar-900 p-4 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Title */}
        <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>IMO POLAR CODE POLARIS DECISION ENGINE</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-900 text-sky-200 border border-sky-700">
                  MSC.1/Circ.1519
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Polar Operational Limit Assessment Risk Indexing System for Antarctic Hull Safety & Speed Advisories
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs bg-polar-900 px-3 py-1.5 rounded-lg border border-polar-700">
            <FileText className="w-4 h-4 text-sky-400" />
            <span className="text-slate-300">PWOM Compliant Output</span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Vessel & Ice Regime Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Polar Class Selection */}
            <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl">
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>1. SELECT VESSEL POLAR CLASS (IACS UR I1 / IMO POLAR CODE)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POLAR_CLASSES.map((pc) => {
                  const isSelected = selectedClass === pc.id;
                  return (
                    <button
                      key={pc.id}
                      onClick={() => setSelectedClass(pc.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-sky-950 border-sky-500 shadow-md ring-1 ring-sky-400'
                          : 'bg-polar-900 border-polar-700 hover:bg-polar-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-100">{pc.id}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>}
                      </div>
                      <div className="text-[11px] text-slate-300 font-sans line-clamp-1">{pc.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{pc.cap}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Ice Regime Builder (Tenths Breakdown) */}
            <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-polar-700 pb-2">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <span>2. DEFINE SEA-ICE REGIME (SUM = 10/10ths)</span>
                </label>
                <span className="text-xs text-sky-400 font-bold">Total: {primaryTenths + secondaryTenths}/10</span>
              </div>

              {/* Primary Ice Component */}
              <div className="bg-polar-900 p-3 rounded-lg border border-polar-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Primary Ice Type ({primaryTenths}/10ths)</span>
                  <span className="text-sky-400 font-bold">{primaryTenths * 10}% Concentration</span>
                </div>

                <select
                  value={primaryIceType}
                  onChange={(e) => setPrimaryIceType(e.target.value)}
                  className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {ICE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <input
                  type="range"
                  min="0"
                  max="10"
                  value={primaryTenths}
                  onChange={(e) => handlePrimaryTenthsChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-polar-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              {/* Secondary Ice Component */}
              <div className="bg-polar-900 p-3 rounded-lg border border-polar-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Secondary Ice / Water ({secondaryTenths}/10ths)</span>
                  <span className="text-teal-400 font-bold">{secondaryTenths * 10}% Concentration</span>
                </div>

                <select
                  value={secondaryIceType}
                  onChange={(e) => setSecondaryIceType(e.target.value)}
                  className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {ICE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <input
                  type="range"
                  min="0"
                  max="10"
                  value={secondaryTenths}
                  disabled
                  className="w-full h-1.5 bg-polar-700 rounded-lg appearance-none opacity-60 accent-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Right Column: RIO Outcome & Advisory Gauges (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {evaluation && (
              <>
                {/* RIO Score Card */}
                <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-4 text-center">
                  <span className="text-xs text-slate-400 font-bold tracking-wider">
                    RISK INDEX OUTCOME (RIO)
                  </span>

                  <div className="flex items-center justify-center space-x-3">
                    <div 
                      className="text-4xl font-extrabold px-6 py-3 rounded-xl border shadow-2xl font-mono"
                      style={{
                        color: evaluation.status_color,
                        borderColor: evaluation.status_color,
                        backgroundColor: `${evaluation.status_color}15`
                      }}
                    >
                      {evaluation.rio > 0 ? `+${evaluation.rio}` : evaluation.rio}
                    </div>
                  </div>

                  <div 
                    className="py-1.5 px-3 rounded-lg text-xs font-bold border inline-block"
                    style={{
                      color: evaluation.status_color,
                      borderColor: evaluation.status_color,
                      backgroundColor: `${evaluation.status_color}20`
                    }}
                  >
                    STATUS: {evaluation.status}
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {evaluation.status_description}
                  </p>

                  {/* Operational Parameters Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-polar-700/80 text-xs">
                    <div className="bg-polar-900 p-2 rounded border border-polar-700">
                      <span className="text-slate-400 text-[10px] block">CONNING SPEED CAP</span>
                      <span className="text-sky-300 font-bold text-sm">
                        {evaluation.recommended_speed_limit_kts} kts
                      </span>
                    </div>

                    <div className="bg-polar-900 p-2 rounded border border-polar-700">
                      <span className="text-slate-400 text-[10px] block">ICEBREAKER ESCORT</span>
                      <span className={evaluation.escort_required ? 'text-amber-400 font-bold text-sm' : 'text-emerald-400 font-bold text-sm'}>
                        {evaluation.escort_required ? 'REQUIRED' : 'INDEPENDENT'}
                      </span>
                    </div>

                    <div className="col-span-2 bg-polar-900 p-2 rounded border border-polar-700">
                      <span className="text-slate-400 text-[10px] block">HULL STRESS / BESETMENT RISK</span>
                      <span className="text-slate-200 text-xs font-semibold">
                        {evaluation.hull_stress_risk}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lindqvist Ice Resistance & Fuel Consumption Model */}
                {resistance && (
                  <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-polar-700 pb-2">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>LINDQVIST (1989) ICE RESISTANCE MODEL</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{resistance.mode}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-polar-900 p-2 rounded border border-polar-700">
                        <span className="text-slate-400 text-[10px] block">TOTAL ICE RESISTANCE</span>
                        <span className="text-slate-100 font-bold">{resistance.r_total_kn} kN</span>
                      </div>
                      <div className="bg-polar-900 p-2 rounded border border-polar-700">
                        <span className="text-slate-400 text-[10px] block">CRUSHING / BREAKING FORCE</span>
                        <span className="text-slate-100 font-bold">{resistance.r_crush_kn} / {resistance.r_break_kn} kN</span>
                      </div>
                      <div className="bg-polar-900 p-2 rounded border border-polar-700">
                        <span className="text-slate-400 text-[10px] block">REQUIRED SHAFT POWER</span>
                        <span className="text-amber-400 font-bold">{resistance.required_power_mw} MW</span>
                      </div>
                      <div className="bg-polar-900 p-2 rounded border border-polar-700">
                        <span className="text-slate-400 text-[10px] block">EST. FUEL CONSUMPTION</span>
                        <span className="text-sky-300 font-bold">{resistance.fuel_rate_mt_per_day} MT/Day</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
