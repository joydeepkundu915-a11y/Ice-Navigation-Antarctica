import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Ship, 
  Navigation,
  Calendar,
  Compass
} from 'lucide-react';
import { RoutePlan, VesselState, ShipUser, VesselFleetProfile } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface PolarCodeLogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RoutePlan | null;
  vessel: VesselState;
  user: ShipUser | null;
  fleetProfile: VesselFleetProfile | null;
}

export const PolarCodeLogbookModal: React.FC<PolarCodeLogbookModalProps> = ({
  isOpen,
  onClose,
  route,
  vessel,
  user,
  fleetProfile
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    bridgeAudio.playTacticalClick();
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none print:p-0 print:bg-white">
      <div className="bg-polar-900 border border-sky-500/40 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col print:border-none print:max-h-full print:text-black">
        {/* Modal Header */}
        <div className="bg-polar-850 px-6 py-3.5 border-b border-polar-700 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-sky-950 border border-sky-500 flex items-center justify-center text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
                <span>IMO POLAR CODE POLARIS VOYAGE RISK LOGBOOK</span>
                <span className="px-1.5 py-0.2 rounded bg-sky-900/80 text-sky-300 text-[10px] font-mono border border-sky-600">
                  MSC.1/Circ.1519
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Official Operational Risk Index Outcome (RIO) Compliance Record
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / SAVE PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2 py-1.5 rounded border border-polar-700 text-xs hover:bg-polar-800"
            >
              ?
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 font-mono text-xs text-slate-200 print:text-black bg-polar-900 print:bg-white">
          <div className="border-b-2 border-sky-500 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-extrabold tracking-wider text-sky-400 print:text-blue-900 flex items-center space-x-2">
                <span>INTERNATIONAL MARITIME ORGANIZATION</span>
              </h1>
              <p className="text-sm font-bold text-slate-300 print:text-black mt-0.5">
                POLARIS POLAR OPERATIONAL LIMIT RISK LOG & VOYAGE RECORD
              </p>
              <p className="text-[10px] text-slate-400 print:text-slate-600">
                In accordance with IMO Resolution MSC.385(94) and Circular MSC.1/Circ.1519
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block border border-sky-400/60 print:border-black px-3 py-1 rounded bg-sky-950/40 print:bg-slate-100">
                <span className="text-[10px] text-slate-400 print:text-black block">RECORD REF:</span>
                <span className="font-bold text-sky-300 print:text-blue-900">POLARIS-2026-AQX</span>
              </div>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block mt-1">DATE: {currentDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-polar-850 print:bg-slate-50 p-4 rounded-lg border border-polar-700 print:border-slate-300">
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] block">VESSEL NAME</span>
              <span className="font-bold text-white print:text-black text-sm">{vessel.name}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] block">IMO / CALL SIGN</span>
              <span className="font-bold text-white print:text-black">{fleetProfile?.imo || '9798686'} / {fleetProfile?.call_sign || 'ZDLS1'}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] block">POLAR ICE CLASS</span>
              <span className="font-bold text-sky-400 print:text-blue-800">{vessel.polar_class} (PC Strengthened)</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] block">CONNING MASTER / OFFICER</span>
              <span className="font-bold text-white print:text-black">{user?.full_name || 'Capt. Erik Lindqvist'}</span>
            </div>
          </div>

          {route && (
            <div className="border border-polar-700 print:border-slate-300 rounded-lg p-4 bg-polar-850/50 print:bg-white space-y-3">
              <div className="flex justify-between items-center border-b border-polar-700 print:border-slate-300 pb-2">
                <span className="font-bold text-sky-300 print:text-blue-900">VOYAGE PASSAGE PLAN OVERVIEW</span>
                <span className="text-[10px] bg-emerald-950 print:bg-emerald-100 text-emerald-300 print:text-emerald-900 px-2 py-0.5 rounded border border-emerald-500/50 font-bold">
                  {route.overall_safety_rating}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px]">ORIGIN</span>
                  <span className="font-bold text-white print:text-black">{route.origin.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px]">DESTINATION</span>
                  <span className="font-bold text-white print:text-black">{route.destination.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px]">TOTAL DISTANCE</span>
                  <span className="font-bold text-white print:text-black">{route.total_distance_nm.toFixed(1)} NM</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px]">ESTIMATED FUEL (MGO)</span>
                  <span className="font-bold text-white print:text-black">{route.total_fuel_mgo_mt.toFixed(1)} MT</span>
                </div>
              </div>
            </div>
          )}

          {route && route.waypoints && (
            <div className="space-y-2">
              <span className="font-bold text-slate-300 print:text-black block text-xs">
                POLARIS RISK INDEX OUTCOME (RIO) LOG BY WAYPOINT LEGS:
              </span>
              <div className="overflow-x-auto border border-polar-700 print:border-slate-300 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-polar-800 print:bg-slate-100 border-b border-polar-700 print:border-slate-300 text-slate-400 print:text-slate-700">
                      <th className="p-2">WPT</th>
                      <th className="p-2">LOCATION / NAME</th>
                      <th className="p-2">COORDINATES</th>
                      <th className="p-2">ICE CONC / THICK</th>
                      <th className="p-2">ICE REGIME</th>
                      <th className="p-2 text-center">RIO</th>
                      <th className="p-2 text-center">POLARIS STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-polar-800 print:divide-slate-200">
                    {route.waypoints.map((wpt) => {
                      const isAuth = wpt.rio >= 0;
                      const isElevated = wpt.rio < 0 && wpt.rio >= -10;
                      return (
                        <tr key={wpt.index} className="hover:bg-polar-800/40 print:hover:bg-transparent">
                          <td className="p-2 font-bold text-sky-400 print:text-blue-900">{wpt.index}</td>
                          <td className="p-2 text-white print:text-black font-semibold">{wpt.name}</td>
                          <td className="p-2 text-slate-300 print:text-slate-800">
                            {Math.abs(wpt.lat).toFixed(2)}°S, {Math.abs(wpt.lon).toFixed(2)}°W
                          </td>
                          <td className="p-2 text-slate-300 print:text-slate-800">
                            {wpt.ice_concentration_pct}% / {wpt.ice_thickness_m.toFixed(1)}m
                          </td>
                          <td className="p-2 text-slate-400 print:text-slate-600">{wpt.ice_stage}</td>
                          <td className={`p-2 text-center font-bold ${
                            isAuth ? 'text-emerald-400 print:text-emerald-800' :
                            isElevated ? 'text-amber-400 print:text-amber-800' : 'text-red-400 print:text-red-800'
                          }`}>
                            {wpt.rio > 0 ? `+${wpt.rio}` : wpt.rio}
                          </td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAuth ? 'bg-emerald-950/80 print:bg-emerald-100 text-emerald-300 print:text-emerald-900 border border-emerald-600/40' :
                              isElevated ? 'bg-amber-950/80 print:bg-amber-100 text-amber-300 print:text-amber-900 border border-amber-600/40' :
                              'bg-red-950/80 print:bg-red-100 text-red-300 print:text-red-900 border border-red-600/40'
                            }`}>
                              {wpt.polaris_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="border-t-2 border-polar-700 print:border-black pt-4 grid grid-cols-2 gap-8 text-[10px]">
            <div>
              <span className="font-bold text-slate-300 print:text-black block mb-1">
                ANTARCTIC TREATY ENVIRONMENTAL PROTOCOL (MADRID 1991):
              </span>
              <p className="text-slate-400 print:text-slate-600">
                Zero discharge of heavy fuel oil (HFO), zero plastic/chemical waste dumping, and strict adherence to wildlife buffer zones (500m minimum from penguin and seal colonies).
              </p>
            </div>
            <div className="border border-polar-700 print:border-slate-300 p-3 rounded bg-polar-850/50 print:bg-slate-50 flex flex-col justify-between">
              <span className="text-slate-400 print:text-slate-600 block">MASTER CONNING SIGNATURE:</span>
              <div className="border-b border-dotted border-slate-500 my-2" />
              <div className="flex justify-between text-slate-300 print:text-black font-bold">
                <span>{user?.full_name || 'Capt. Erik Lindqvist'}</span>
                <span>POLAR CODE ENDORSED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
