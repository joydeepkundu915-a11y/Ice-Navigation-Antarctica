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
  Sparkles
} from 'lucide-react';
import { SARScene, SARDetection } from '../types';
import { polarApi } from '../services/api';

export const SARVisionWorkbench: React.FC = () => {
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
    <div className="w-full h-full bg-polar-900 p-4 overflow-y-auto font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Title */}
        <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>SAR SATELLITE ICE VISION & LEAD DETECTOR</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-700">
                  SENTINEL-1 C-BAND SAR
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated Open Water Lead Segmentation, Iceberg Radar Targets & Pressure Ridge Detection
              </p>
            </div>
          </div>
        </div>

        {/* Scene Selection Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {presets.map((scene) => {
            const isSelected = scene.id === selectedSceneId;
            return (
              <button
                key={scene.id}
                onClick={() => setSelectedSceneId(scene.id)}
                className={`px-3 py-2 rounded-lg border text-xs whitespace-nowrap transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-sky-950 border-sky-400 text-white shadow-lg'
                    : 'bg-polar-850 border-polar-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold">{scene.title.split(':')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main SAR Imagery & AI Feature Grid */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Satellite Imagery Viewer with Overlays (7 cols) */}
            <div className="lg:col-span-7 bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl space-y-3 flex flex-col">
              <div className="flex items-center justify-between border-b border-polar-700 pb-2 text-xs">
                <span className="font-bold text-slate-200 truncate max-w-md">{analysis.title}</span>
                <label className="flex items-center space-x-2 text-sky-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOverlays}
                    onChange={(e) => setShowOverlays(e.target.checked)}
                    className="rounded bg-polar-900 border-polar-600 text-sky-500"
                  />
                  <span>AI Detections Overlay</span>
                </label>
              </div>

              {/* Simulated SAR Image Canvas View */}
              <div className="relative w-full h-80 rounded-lg overflow-hidden border border-polar-700 bg-black flex items-center justify-center">
                <img
                  src={analysis.image_url}
                  alt={analysis.title}
                  className="w-full h-full object-cover filter contrast-125 grayscale brightness-90"
                />

                {/* AI Feature Bounding Boxes */}
                {showOverlays && analysis.detections?.map((det: SARDetection, idx: number) => {
                  const isSelected = selectedDetection?.label === det.label;
                  const isLead = det.type.includes('LEAD') || det.type.includes('POLYNYA') || det.type.includes('CHANNEL');
                  const boxColor = isLead ? '#10b981' : det.danger_level === 'EXTREME' ? '#ef4444' : '#f59e0b';

                  // Map 1000x650 coordinate space to percentage
                  const leftPct = (det.bbox.x / 1000) * 100;
                  const topPct = (det.bbox.y / 650) * 100;
                  const widthPct = (det.bbox.width / 1000) * 100;
                  const heightPct = (det.bbox.height / 650) * 100;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDetection(det)}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        borderColor: boxColor,
                        backgroundColor: isLead ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                      }}
                      className={`absolute border-2 rounded cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-white scale-105 z-20' : 'hover:opacity-100 z-10'
                      }`}
                    >
                      <span 
                        style={{ backgroundColor: boxColor }}
                        className="absolute -top-5 left-0 px-1 py-0.5 rounded text-[9px] font-bold text-black whitespace-nowrap shadow"
                      >
                        {det.label} ({(det.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Scene Metadata Bar */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 bg-polar-900 p-2 rounded border border-polar-700">
                <div>Satellite: <strong className="text-slate-200">{analysis.satellite}</strong></div>
                <div>Acquisition: <strong className="text-slate-200">{analysis.acquisition_date.slice(0, 10)}</strong></div>
                <div>Resolution: <strong className="text-sky-300">{analysis.resolution_m} m/pixel</strong></div>
              </div>
            </div>

            {/* Right Column: AI Detection Breakdown & Conning Advice (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Navigability Score Card */}
              <div className="bg-polar-850 border border-polar-700 rounded-xl p-4 shadow-xl text-center space-y-2">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                  ICE FIELD NAVIGABILITY RATING
                </span>

                <div className="text-3xl font-extrabold text-sky-400">
                  {analysis.navigability_score} / 100
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-sky-950 text-sky-300 border border-sky-600">
                  {analysis.navigability_rating} PASSAGE
                </div>

                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-polar-700 text-xs">
                  <div className="bg-polar-900 p-2 rounded border border-polar-700">
                    <span className="text-slate-500 text-[9px] block">DETECTED LEADS</span>
                    <span className="text-emerald-400 font-bold">{analysis.feature_counts?.leads_polynyas || 0} Open Polynyas</span>
                  </div>
                  <div className="bg-polar-900 p-2 rounded border border-polar-700">
                    <span className="text-slate-500 text-[9px] block">HAZARDS / BERGS</span>
                    <span className="text-amber-400 font-bold">{analysis.feature_counts?.icebergs + analysis.feature_counts?.growlers || 0} Targets</span>
                  </div>
                </div>
              </div>

              {/* Selected Feature Deep Inspection Card */}
              {selectedDetection ? (
                <div className="bg-polar-850 border border-sky-600/60 rounded-xl p-4 shadow-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-polar-700 pb-2">
                    <span className="font-bold text-sky-300">{selectedDetection.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      selectedDetection.danger_level === 'EXTREME' ? 'bg-red-950 text-red-300 border border-red-700' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    }`}>
                      {selectedDetection.danger_level}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Classification Type:</span>
                      <span className="font-semibold text-slate-200">{selectedDetection.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Confidence:</span>
                      <span className="font-semibold text-emerald-400">{(selectedDetection.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {selectedDetection.width_m && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Channel Width:</span>
                        <span className="font-semibold text-sky-300">{selectedDetection.width_m} m</span>
                      </div>
                    )}
                    {selectedDetection.ice_concentration_pct !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Channel Ice Concentration:</span>
                        <span className="font-semibold text-sky-300">{selectedDetection.ice_concentration_pct}%</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-polar-950 p-2.5 rounded border border-polar-800 space-y-1">
                    <span className="text-amber-400 font-bold text-[10px] block">TACTICAL CONNING ADVICE:</span>
                    <p className="text-slate-200 text-xs font-sans leading-relaxed">
                      {selectedDetection.conning_advice}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-polar-850 rounded-xl text-center text-xs text-slate-400 border border-polar-700">
                  Select any bounding box to inspect AI ice classification.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
