import React, { useState } from 'react';
import { 
  Send, 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  LifeBuoy, 
  Zap, 
  BookOpen, 
  CheckCircle, 
  RefreshCw, 
  User, 
  Bot,
  X
} from 'lucide-react';
import { VesselState } from '../types';
import { polarApi } from '../services/api';
import { bridgeAudio } from '../services/audioAlerts';

interface AICopilotDrawerProps {
  vessel: VesselState;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  category?: string;
  severity?: string;
  action_items?: string[];
  timestamp: string;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ vessel, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'POLAR DECISION COPILOT ACTIVE: Standing by to assist with IMO Polar Code compliance, tactical ice conning in leads, Lindqvist resistance modeling, and emergency safe haven routing.\n\nPosition: ' + Math.abs(vessel.lat).toFixed(2) + '°S, ' + Math.abs(vessel.lon).toFixed(2) + '°W | Vessel: ' + vessel.name + ' (' + vessel.polar_class + ')',
      category: 'GENERAL_ADVISORY',
      severity: 'INFO',
      action_items: [
        'Monitor real-time POLARIS RIO score on bridge HUD',
        'Verify radar 3NM collision guard zone'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = customMsg || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    bridgeAudio.playTacticalClick();

    const response = await polarApi.chatCopilot({
      message: textToSend,
      vessel_lat: vessel.lat,
      vessel_lon: vessel.lon,
      polar_class: vessel.polar_class,
      vessel_speed_kts: vessel.speed_kts,
      ice_concentration_pct: 65,
      ice_thickness_m: 1.5
    });

    if (response) {
      bridgeAudio.playSonarPing();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.tactical_advice || response.response || 'Advisory received.',
        category: response.copilot_category || response.category || 'ADVISORY',
        severity: response.severity || 'INFO',
        action_items: response.action_items || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full bg-polar-900 p-3 overflow-y-auto font-mono select-none flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-3">
        {/* Header with Close */}
        <div className="bg-polar-850 border border-polar-700 rounded-lg p-3 shadow-xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>AI POLAR NAVIGATION DECISION COPILOT</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-700">
                  LLM ICE PILOT
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Maritime Assistant for Tactical Conning, Besetment SOPs & Polar Code Compliance
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

        {/* Quick Question Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 flex-shrink-0">
          <button
            onClick={() => handleSendMessage('Our vessel is beset in heavy ice pressure. What are the immediate bridge actions?')}
            className="px-2.5 py-1 rounded bg-red-950/70 border border-red-700 text-red-200 text-[10px] whitespace-nowrap hover:bg-red-900"
          >
            ⚠️ Besetment Recovery SOP
          </button>
          <button
            onClick={() => handleSendMessage('What is our POLARIS RIO threshold and speed advisory in 7/10 medium first-year ice?')}
            className="px-2.5 py-1 rounded bg-sky-950/70 border border-sky-700 text-sky-200 text-[10px] whitespace-nowrap hover:bg-sky-900"
          >
            📊 POLARIS RIO Rule Check
          </button>
          <button
            onClick={() => handleSendMessage('Recommend nearest emergency shelter harbor and VHF distress channel.')}
            className="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-[10px] whitespace-nowrap hover:bg-emerald-900"
          >
            ⚓ Nearest Safe Haven
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 bg-polar-850/60 border border-polar-700 rounded-lg p-4 overflow-y-auto space-y-3 min-h-[300px]">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            return (
              <div key={m.id} className={'flex ' + (isBot ? 'justify-start' : 'justify-end')}>
                <div className={'max-w-[85%] rounded-lg p-3 text-xs space-y-1.5 ' + (
                  isBot ? 'bg-polar-900 border border-polar-700 text-slate-200 shadow-md' : 'bg-sky-700 text-white'
                )}>
                  <div className="flex items-center justify-between border-b border-polar-700/60 pb-1 text-[10px] text-slate-400">
                    <span className="font-bold flex items-center space-x-1 text-sky-400">
                      {isBot ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      <span>{isBot ? 'POLAR AI COPILOT' : 'WATCH OFFICER'}</span>
                    </span>
                    <span>{m.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-line text-[11px] leading-relaxed">{m.text}</p>

                  {m.action_items && m.action_items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-polar-800 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">RECOMMENDED ACTIONS:</span>
                      {m.action_items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-[10px] text-slate-300">
                          <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-polar-900 border border-polar-700 rounded-lg p-3 text-xs text-sky-400 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Computing tactical polar hydrodynamic conning advice...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2 bg-polar-850 p-2 rounded-lg border border-polar-700 flex-shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Copilot for tactical ice conning advice, RIO calculations, or emergency SOPs..."
            className="flex-1 bg-polar-900 border border-polar-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded font-bold text-xs flex items-center space-x-1.5 disabled:opacity-40 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>TRANSMIT</span>
          </button>
        </form>
      </div>
    </div>
  );
};