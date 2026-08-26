import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Layers, 
  Activity, 
  Compass, 
  AlertTriangle, 
  ShieldCheck, 
  Crosshair,
  Maximize2,
  Sparkles,
  X
} from 'lucide-react';
import { SARScene, SARDetection } from '../types';
import { polarApi } from '../services/api';
import { bridgeAudio } from '../services/audioAlerts';

interface SARVisionWorkbenchProps {
  onClose?: () => void;
}

export const SARVisionWorkbench: React.FC<SARVisionWorkbenchProps> = ({ onClose }) => {
  const [presets, setPresets] = useState<SARScene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('SAR-SENTINEL1-WEDDELL-A23A');
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [selectedDetection, setSelectedDetection] = useState<SARDetection | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPresets = async () => {
      const data = await polarApi.getSARPresets();
      if (data && data.length > 0) {
        setPresets(data);
      }
    };
    fetchPresets();
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
      setLoading(true);
      const res = await polarApi.analyzeSAR(selectedSceneId);
      if (res) {
        setAnalysis(res);
        if (res.detections?.length > 0) {
          setSelectedDetection(res.detections[0]);
        }
      }
      setLoading(false);
    };
    runAnalysis();
  }, [selectedSceneId]);

  return (
    <div className="w-full h-full bg-polar-900 p-3 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header with Close */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>SAR SATELLITE ICE VISION & LEAD DETECTOR</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-600">
                  SENTINEL-1 C-BAND
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Synthetic Aperture Radar (SAR) Deep Learning Segmentation for Navigable Ice Leads
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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
        </div>

        {/* Scene Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {presets.map((s) => {
            const isSel = s.id === selectedSceneId;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSceneId(s.id);
                  bridgeAudio.playTacticalClick();
                }}
                className={'px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition ' + (
                  isSel
                    ? 'bg-amber-950 border-amber-400 text-white shadow-md'
                    : 'bg-polar-850 border-polar-700 text-slate-400 hover:bg-polar-800'
                )}
              >
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Analysis Display */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left: Synthetic Radar Image / Canvas */}
            <div className="lg:col-span-8 bg-polar-850 border border-polar-700 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">RADAR SCENE: {analysis.title}</span>
                <button
                  onClick={() => setShowOverlays(!showOverlays)}
                  className={'px-2 py-0.5 rounded text-[10px] border ' + (showOverlays ? 'bg-amber-600 text-white font-bold' : 'bg-polar-900 text-slate-400')}
                >
                  {showOverlays ? 'AI OVERLAYS ON' : 'RAW SAR ONLY'}
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-polar-700 bg-polar-950 aspect-video flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 p-6 flex flex-col justify-between relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                  
                  {/* Attractive Glowing Golden Lead Corridor */}
                  <div className="absolute top-1/4 left-0 right-1/3 h-12 bg-gradient-to-r from-amber-500/25 via-yellow-400/30 to-amber-500/20 border-y-2 border-yellow-400/70 shadow-lg shadow-yellow-500/20 transform -rotate-6 flex items-center px-4">
                    <span className="text-[10px] text-yellow-200 font-extrabold flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
                      <span>DETECTED GOLDEN THERMAL LEAD (OPEN CHANNEL)</span>
                    </span>
                  </div>

                  {/* Mega Iceberg polygon */}
                  <div className="absolute bottom-6 right-8 w-44 h-28 bg-amber-500/25 border-2 border-amber-400 rounded-sm flex items-center justify-center p-2 text-center">
                    <span className="text-[10px] text-amber-300 font-bold">A-23A TABULAR ICEBERG TARGET</span>
                  </div>

                  <div className="relative z-10 flex justify-between text-[10px] text-slate-400">
                    <span>POLARIZATION: HH + HV</span>
                    <span>SWATH: 400 KM</span>
                  </div>

                  <div className="relative z-10 text-[10px] text-slate-400">
                    <span>SENTINEL-1 IW SAR ACQUISITION</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Detections & Conning Advisories */}
            <div className="lg:col-span-4 bg-polar-850 border border-polar-700 rounded-lg p-3 space-y-3">
              <div className="flex justify-between items-center border-b border-polar-700 pb-1.5">
                <span className="font-bold text-xs text-slate-200">TACTICAL CONNING ADVISORY</span>
                <span className="text-[10px] text-emerald-400 font-mono">CONFIDENCE: {analysis.confidence_pct}%</span>
              </div>

              <div className="bg-polar-900 p-3 rounded border border-polar-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">NAVIGABILITY RATING:</span>
                  <span className="text-amber-400 font-bold">{analysis.navigability_score}/100</span>
                </div>
                <div className="w-full bg-polar-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full shadow" style={{ width: `${analysis.navigability_score}%` }} />
                </div>
                <p className="text-[11px] text-slate-300 italic pt-1">
                  "{analysis.conning_recommendation}"
                </p>
              </div>

              {/* Detections List */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Identified Tactical Features:
                </span>
                {analysis.detections?.map((d: any, i: number) => (
                  <div key={i} className="p-2 rounded bg-polar-900 border border-polar-700 text-[11px] space-y-0.5">
                    <div className="flex justify-between text-yellow-300 font-bold">
                      <span>{d.label}</span>
                      <span className="text-[10px] text-slate-400">{(d.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300">{d.conning_advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};