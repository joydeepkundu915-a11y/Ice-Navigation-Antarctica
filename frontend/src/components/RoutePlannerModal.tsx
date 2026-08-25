import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  X, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Fuel, 
  CheckCircle, 
  ArrowRight,
  TrendingDown,
  Layers,
  MapPin
} from 'lucide-react';
import { RoutePlan, Station } from '../types';
import { polarApi } from '../services/api';

interface RoutePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRoute: (route: RoutePlan) => void;
  currentRoute: RoutePlan | null;
}

const DEPARTURE_PORTS = [
  { id: 'ushuaia', name: 'Ushuaia, Argentina (Peninsula Gateway)' },
  { id: 'punta_arenas', name: 'Punta Arenas, Chile (Magellan Gateway)' },
  { id: 'cape_town', name: 'Cape Town, South Africa (Queen Maud Gateway)' },
  { id: 'hobart', name: 'Hobart, Australia (East Antarctic Gateway)' },
  { id: 'christchurch', name: 'Christchurch, New Zealand (Ross Sea Gateway)' }
];

const DESTINATIONS = [
  { id: 'rothera', name: 'Rothera Research Station (UK - Adelaide Is.)' },
  { id: 'mcmurdo', name: 'McMurdo Station (USA - Ross Sea)' },
  { id: 'bharati', name: 'Bharati Station (India - Prydz Bay)' },
  { id: 'maitri', name: 'Maitri Station (India - Queen Maud Land)' },
  { id: 'palmer', name: 'Palmer Station (USA - Anvers Is.)' },
  { id: 'esperanza', name: 'Esperanza Base (Argentina - Hope Bay)' },
  { id: 'freifrey', name: 'Frei Base (Chile - King George Is.)' },
  { id: 'casey', name: 'Casey Station (Australia - Wilkes Land)' },
  { id: 'dumont_durville', name: "Dumont d'Urville (France - Terre Adélie)" },
  { id: 'deception_island', name: 'Deception Island Safe Haven (Port Foster)' }
];

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  isOpen,
  onClose,
  onApplyRoute,
  currentRoute
}) => {
  const [originId, setOriginId] = useState<string>('ushuaia');
  const [destinationId, setDestinationId] = useState<string>('rothera');
  const [polarClass, setPolarClass] = useState<string>('PC4');
  const [selectedObjective, setSelectedObjective] = useState<'safest' | 'fastest' | 'fuel_optimal'>('safest');

  const [paretoRoutes, setParetoRoutes] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculateRoutes = async () => {
    setLoading(true);
    const res = await polarApi.calculateParetoRoutes(originId, destinationId, polarClass);
    if (res) {
      setParetoRoutes(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      calculateRoutes();
    }
  }, [isOpen, originId, destinationId, polarClass]);

  if (!isOpen) return null;

  const activeRouteData: RoutePlan | null = paretoRoutes 
    ? (selectedObjective === 'safest' ? paretoRoutes.safest_route : selectedObjective === 'fastest' ? paretoRoutes.fastest_route : paretoRoutes.fuel_optimal_route)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono">
      <div className="bg-polar-850 border border-polar-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-polar-700 flex items-center justify-between bg-polar-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                AI MULTI-OBJECTIVE POLAR ROUTE OPTIMIZER
              </h3>
              <p className="text-xs text-slate-400">
                Pareto-Optimal Tradeoff between POLARIS Safety Margin, Transit Time & Lindqvist Fuel Cost
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-polar-800 hover:bg-polar-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-polar-900 p-3 rounded-xl border border-polar-700">
            {/* Origin Port */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">
                DEPARTURE PORT
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {DEPARTURE_PORTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Destination Station */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">
                ANTARCTIC DESTINATION
              </label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Vessel Polar Class */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">
                VESSEL POLAR CLASS
              </label>
              <select
                value={polarClass}
                onChange={(e) => setPolarClass(e.target.value)}
                className="w-full bg-polar-800 border border-polar-600 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="PC1">PC1 - Heavy Polar Research Icebreaker</option>
                <option value="PC2">PC2 - Medium Polar Icebreaker (Attenborough)</option>
                <option value="PC4">PC4 - Heavy Expedition Ship (Agulhas II)</option>
                <option value="PC6">PC6 - Light Research Ship (Gould)</option>
                <option value="PC7">PC7 - Expedition Cruise Vessel</option>
                <option value="1AS">1A Super - Baltic Ice Strengthened</option>
                <option value="NON_ICE">Non-Ice Strengthened Vessel</option>
              </select>
            </div>
          </div>

          {/* Pareto 3-Option Comparison Cards */}
          {paretoRoutes && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'safest',
                  title: 'SAFEST ROUTE',
                  icon: ShieldCheck,
                  color: 'emerald',
                  data: paretoRoutes.safest_route,
                  summary: 'Skirts heavy multi-year pack & maintains maximum positive RIO clearance.'
                },
                {
                  id: 'fastest',
                  title: 'FASTEST ROUTE',
                  icon: Clock,
                  color: 'blue',
                  data: paretoRoutes.fastest_route,
                  summary: 'Optimal direct rhumb line navigation through navigable thermal leads.'
                },
                {
                  id: 'fuel_optimal',
                  title: 'FUEL-OPTIMAL (ECO)',
                  icon: Fuel,
                  color: 'amber',
                  data: paretoRoutes.fuel_optimal_route,
                  summary: 'Minimizes continuous ice resistance power dissipation and carbon emissions.'
                }
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedObjective === opt.id;
                const d = opt.data;

                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedObjective(opt.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-polar-800 border-sky-400 shadow-lg ring-1 ring-sky-400/50'
                        : 'bg-polar-900/90 border-polar-700 hover:bg-polar-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-xs text-slate-100">{opt.title}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-sky-400 animate-pulse" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans mb-3 line-clamp-2">
                      {opt.summary}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-polar-950 p-2 rounded-lg border border-polar-800">
                      <div>
                        <span className="text-slate-500 text-[9px] block">DISTANCE</span>
                        <span className="text-slate-200 font-bold">{d.total_distance_nm} NM</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">VOYAGE TIME</span>
                        <span className="text-sky-300 font-bold">{d.estimated_voyage_days} Days</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">MGO FUEL</span>
                        <span className="text-amber-300 font-bold">{d.total_fuel_mgo_mt} MT</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">MIN RIO</span>
                        <span className="text-emerald-400 font-bold">+{d.min_rio}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Detailed Waypoint Table for Selected Route */}
          {activeRouteData && (
            <div className="bg-polar-900 border border-polar-700 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-polar-700/80 pb-2">
                <span className="font-bold text-slate-200 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>VOYAGE WAYPOINT TURN TABLE ({activeRouteData.waypoints.length} NODES)</span>
                </span>
                <span className="text-emerald-400 font-semibold">{activeRouteData.overall_safety_rating}</span>
              </div>

              <div className="overflow-x-auto max-h-48 overflow-y-auto pr-1">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-slate-400 border-b border-polar-800 bg-polar-950 sticky top-0">
                    <tr>
                      <th className="py-1.5 px-2">WP</th>
                      <th className="py-1.5 px-2">COORDINATES</th>
                      <th className="py-1.5 px-2">LEG NM</th>
                      <th className="py-1.5 px-2">HDG</th>
                      <th className="py-1.5 px-2">SPD</th>
                      <th className="py-1.5 px-2">SIC %</th>
                      <th className="py-1.5 px-2">THICKNESS</th>
                      <th className="py-1.5 px-2">POLARIS RIO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-polar-800 text-[11px]">
                    {activeRouteData.waypoints.map((wp) => (
                      <tr key={wp.index} className="hover:bg-polar-800/50">
                        <td className="py-1 px-2 font-bold text-slate-300">{wp.name}</td>
                        <td className="py-1 px-2 text-slate-400">
                          {Math.abs(wp.lat).toFixed(2)}°S, {Math.abs(wp.lon).toFixed(2)}°W
                        </td>
                        <td className="py-1 px-2 text-slate-200">{wp.leg_distance_nm}</td>
                        <td className="py-1 px-2 text-slate-300">{wp.bearing_deg}°</td>
                        <td className="py-1 px-2 text-sky-300 font-semibold">{wp.speed_kts} kts</td>
                        <td className="py-1 px-2 text-slate-300">{wp.ice_concentration_pct}%</td>
                        <td className="py-1 px-2 text-slate-300">{wp.ice_thickness_m} m</td>
                        <td className="py-1 px-2 font-bold" style={{ color: wp.status_color }}>
                          {wp.rio > 0 ? `+${wp.rio}` : wp.rio}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-polar-700 bg-polar-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {activeRouteData && (
              <span>
                Selected: <strong className="text-slate-200">{activeRouteData.origin.name}</strong> &rarr; <strong className="text-slate-200">{activeRouteData.destination.name}</strong> ({activeRouteData.total_distance_nm} NM)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-polar-800 hover:bg-polar-700 rounded-lg text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (activeRouteData) {
                  onApplyRoute(activeRouteData);
                  onClose();
                }
              }}
              className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-lg text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all flex items-center space-x-1.5"
            >
              <Navigation className="w-4 h-4" />
              <span>Apply Route to Bridge ECDIS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
