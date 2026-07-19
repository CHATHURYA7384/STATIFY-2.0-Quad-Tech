import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types.js";
import { Send, Sparkles, AlertCircle, Loader2 } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

const PRESET_SUGGESTIONS = [
  "Optimize for Rain & Wind",
  "Switch to 3-5-2 formation",
  "Target tough difficulty (Real Madrid, Diff: 5)",
  "Prioritize recent player form (form weight: 0.7)",
  "Explain Saka's wind penalty",
];

export default function ChatPanel({ messages, isLoading, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <aside id="chat-panel" className="w-80 flex-shrink-0 bg-slate-900/80 border-r border-slate-800 flex flex-col h-full text-slate-100">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center font-extrabold text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            S2
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase text-white">Statify AI</h1>
            <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest animate-pulse">
              Active Agent • v2.0
            </p>
          </div>
        </div>
      </div>

      {/* Messages Display */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, index) => {
          const isAI = msg.sender === "ai";
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border text-sm leading-relaxed transition-all ${
                isAI
                  ? "bg-slate-800/40 border-slate-700/50 text-slate-200 self-start"
                  : "bg-emerald-500/10 border-emerald-500/20 text-slate-100 self-end ml-4"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-tighter ${
                    isAI ? "text-slate-400" : "text-emerald-400"
                  }`}
                >
                  {isAI ? "Statify Strategist" : "You (Manager)"}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
          );
        })}

        {isLoading && (
          <div className="bg-slate-800/20 border border-slate-800 p-3 rounded-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-xs text-slate-400">Strategist is recalculating live projections...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions Slider */}
      <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-900/50">
        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Suggested Tactics
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {PRESET_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => !isLoading && onSendMessage(sug)}
              disabled={isLoading}
              className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-2 py-1 rounded border border-slate-700/50 transition cursor-pointer disabled:opacity-50"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Instruct your strategist..."
            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 text-slate-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
