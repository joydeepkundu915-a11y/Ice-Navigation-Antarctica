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
  Bot
} from 'lucide-react';
import { VesselState } from '../types';
import { polarApi } from '../services/api';

interface AICopilotDrawerProps {
  vessel: VesselState;
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

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ vessel }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `**POLAR NAVIGATION DECISION COPILOT ACTIVE**\n\nStanding by to assist with IMO Polar Code compliance, tactical conning in ice leads, Lindqvist resistance modeling, and emergency safe haven routing.\n\nPosition: **${Math.abs(vessel.lat).toFixed(2)}°S, ${Math.abs(vessel.lon).toFixed(2)}°W** | Vessel: **${vessel.name} (${vessel.polar_class})**`,
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

    setMessages(prev => [...prev, userMsg]);
    if (!customMsg) setInputText('');
    setLoading(true);

    const res = await polarApi.chatCopilot({
      message: textToSend,
      vessel_lat: vessel.lat,
      vessel_lon: vessel.lon,
      polar_class: vessel.polar_class,
      vessel_speed_kts: vessel.speed_kts,
      ice_concentration_pct: 55.0,
      ice_thickness_m: 1.1
    });

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: res?.response || 'Tactical polar advice generated.',
      category: res?.category,
      severity: res?.severity,
      action_items: res?.action_items || [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  return (
    <div className="w-full h-full bg-polar-900 p-4 flex flex-col font-mono select-none">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-polar-850 border border-polar-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Chat Top Header */}
        <div className="p-4 border-b border-polar-700/80 bg-polar-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <span>POLAR DECISION SUPPORT COPILOT</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700">
                  ONLINE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Ice Pilot & IMO Polar Code Advisory Engine
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-polar-950 px-2.5 py-1 rounded border border-polar-800">
            Telemetry Context: <strong className="text-sky-300">{vessel.polar_class}</strong> @ <strong className="text-slate-200">{vessel.speed_kts} kts</strong>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-polar-900/60 border-b border-polar-800 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-bold text-[9px] uppercase whitespace-nowrap">QUICK DIRECTIVES:</span>
          {[
            'Evaluate current route POLARIS RIO',
            'Nearest safe haven with medical care',
            'Emergency besetment in ice breakout SOP',
            'Iceberg A-23a collision & drift advisory',
            'Conning tactics for multi-year leads'
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-polar-800 hover:bg-sky-950 hover:border-sky-600 text-slate-300 hover:text-sky-200 border border-polar-700 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-3.5 text-xs font-sans leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-mono'
                      : 'bg-polar-900 border border-polar-700/80 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line font-mono text-[11px]">
                    {m.text}
                  </div>

                  {/* Action Items Box if present */}
                  {m.action_items && m.action_items.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-polar-800 font-mono text-[11px]">
                      <span className="text-amber-400 font-bold block mb-1">
                        RECOMMENDED ACTION ITEMS:
                      </span>
                      <ul className="space-y-1">
                        {m.action_items.map((action, aIdx) => (
                          <li key={aIdx} className="flex items-center space-x-1.5 text-slate-300">
                            <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 text-[9px] text-slate-400 text-right font-mono">
                    {m.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-polar-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-sky-400 animate-pulse font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Analyzing polar hydrodynamic and POLARIS matrices...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-polar-700 bg-polar-900/90 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Polar Ice Pilot (e.g. 'Recommend safe speed in 80% pack ice' or 'Safe haven near Adelaide Island')..."
            className="flex-1 bg-polar-800 border border-polar-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
