import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  BellOff, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  Clock, 
  Info, 
  Radio 
} from 'lucide-react';
import { BridgeAlarm } from '../types';
import { bridgeAudio } from '../services/audioAlerts';

interface AlarmManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: BridgeAlarm[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onAcknowledgeAlarm: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export const AlarmManagementDrawer: React.FC<AlarmManagementDrawerProps> = ({
  isOpen,
  onClose,
  alarms,
  soundEnabled,
  onToggleSound,
  onAcknowledgeAlarm,
  onAcknowledgeAll
}) => {
  if (!isOpen) return null;

  const unacknowledgedCount = alarms.filter(a => !a.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md h-full bg-polar-900 border-l border-polar-700 shadow-2xl flex flex-col justify-between animate-slide-left">
        {/* Header */}
        <div className="p-4 bg-polar-850 border-b border-polar-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white tracking-wide flex items-center space-x-2">
                <span>BRIDGE ALARMS (IAMS)</span>
                {unacknowledgedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[10px] animate-bounce">
                    {unacknowledgedCount} UNACK
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                IMO MSC.302(87) Marine Alert Management System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-polar-800 text-xs border border-polar-700"
          >
            ?
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-4 py-2.5 bg-polar-850/60 border-b border-polar-800 flex items-center justify-between text-xs font-mono">
          <button
            onClick={onToggleSound}
            className={
              'flex items-center space-x-1.5 px-2.5 py-1 rounded border transition ' +
              (soundEnabled
                ? 'bg-sky-950 text-sky-300 border-sky-600'
                : 'bg-polar-800 text-slate-400 border-polar-700')
            }
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => {
              onAcknowledgeAll();
              bridgeAudio.playTacticalClick();
            }}
            disabled={unacknowledgedCount === 0}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ACKNOWLEDGE ALL</span>
          </button>
        </div>

        {/* Alarms List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {alarms.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs py-12">
              <CheckCheck className="w-10 h-10 text-emerald-500 mb-2 opacity-60" />
              <span>ALL POLAR BRIDGE SYSTEMS CLEAR</span>
              <span className="text-[10px] text-slate-600 mt-1">No active nautical or metocean alarms</span>
            </div>
          ) : (
            alarms.map((alarm) => {
              const isCrit = alarm.severity === 'CRITICAL';
              const isWarn = alarm.severity === 'WARNING';

              const boxClass = !alarm.acknowledged
                ? isCrit
                  ? 'bg-red-950/70 border-red-500 shadow-md shadow-red-950/50 animate-pulse'
                  : isWarn
                  ? 'bg-amber-950/60 border-amber-500'
                  : 'bg-sky-950/60 border-sky-500'
                : 'bg-polar-850/70 border-polar-700 opacity-75';

              const dotClass = isCrit ? 'bg-red-500' : isWarn ? 'bg-amber-400' : 'bg-sky-400';

              return (
                <div
                  key={alarm.id}
                  className={'p-3 rounded-lg border transition-all text-xs font-mono ' + boxClass}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={'w-2 h-2 rounded-full ' + dotClass} />
                      <span className="font-bold text-white text-xs">{alarm.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{alarm.timestamp}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-2">{alarm.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-polar-800">
                    <span className="text-[10px] text-slate-400">SRC: {alarm.source}</span>
                    {!alarm.acknowledged ? (
                      <button
                        onClick={() => {
                          onAcknowledgeAlarm(alarm.id);
                          bridgeAudio.playTacticalClick();
                        }}
                        className="bg-polar-800 hover:bg-slate-700 text-sky-300 hover:text-white px-2 py-0.5 rounded text-[10px] border border-polar-600"
                      >
                        ACKNOWLEDGE
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                        <CheckCheck className="w-3 h-3" />
                        <span>ACKNOWLEDGED</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-polar-850 border-t border-polar-700 text-center text-[10px] text-slate-500 font-mono">
          IAMS v2.4 • Integrated with AIS, RADAR ARPA & POLARIS RIO Engine
        </div>
      </div>
    </div>
  );
};
