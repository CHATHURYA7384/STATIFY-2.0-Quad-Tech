import React, { useState, useEffect } from "react";
import ChatPanel from "./components/ChatPanel.tsx";
import BentoDashboard from "./components/BentoDashboard.tsx";
import { MatchCondition, StrategyConstraints, SecretRecipeWeights, OptimizedPlayerEvaluation, ChatMessage } from "./types.js";
import { Loader2, Sparkles, HelpCircle } from "lucide-react";

export default function App() {
  // Config & State
  const [matchCondition, setMatchCondition] = useState<MatchCondition | null>(null);
  const [constraints, setConstraints] = useState<StrategyConstraints | null>(null);
  const [weights, setWeights] = useState<SecretRecipeWeights | null>(null);
  const [roster, setRoster] = useState<OptimizedPlayerEvaluation[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [expectedPointsTotal, setExpectedPointsTotal] = useState(0);
  const [ragInsights, setRagInsights] = useState<string[]>([]);
  
  // Conversational state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Initialize data on boot
  useEffect(() => {
    async function initApp() {
      try {
        const res = await fetch("/api/config/defaults");
        const defaults = await res.json();
        
        setMatchCondition(defaults.matchCondition);
        setConstraints(defaults.constraints);
        setWeights(defaults.weights);

        // Fetch optimized roster with defaults
        const optRes = await fetch("/api/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchCondition: defaults.matchCondition,
            constraints: defaults.constraints,
            weights: defaults.weights
          })
        });
        const optResult = await optRes.json();
        setRoster(optResult.roster);
        setTotalCost(optResult.totalCost);
        setExpectedPointsTotal(optResult.expectedPointsTotal);

        // Warm welcome message
        setMessages([
          {
            sender: "ai",
            text: `Welcome, Manager. I am your Statify AI Strategist v2.0.
            
I've initialized our strategy parameters for GW24:
• Venue: St. James' Park (Rain forecast, temperature 7.5°C)
• Opposition: Newcastle United (Difficulty 4/5)
• Squad Formation: 4-4-2

I've selected the optimal roster. Note that Erling Haaland and Cole Palmer receive performance multiplier boosts in the rain!
How would you like to optimize our line-up? Tell me to tweak weights, change formation, or query match conditions!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

      } catch (error) {
        console.error("Failed to initialize App config:", error);
      } finally {
        setIsPageLoading(false);
      }
    }

    initApp();
  }, []);

  // Sync optimization live if any manual parameter changes
  const handleUpdateConfig = async (updates: {
    matchCondition?: Partial<MatchCondition>;
    constraints?: Partial<StrategyConstraints>;
    weights?: Partial<SecretRecipeWeights>;
  }) => {
    if (!matchCondition || !constraints || !weights) return;

    const newMatchCondition = updates.matchCondition 
      ? { ...matchCondition, ...updates.matchCondition } 
      : matchCondition;
    
    const newConstraints = updates.constraints 
      ? { ...constraints, ...updates.constraints } 
      : constraints;
    
    const newWeights = updates.weights 
      ? { ...weights, ...updates.weights } 
      : weights;

    setMatchCondition(newMatchCondition);
    setConstraints(newConstraints);
    setWeights(newWeights);

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchCondition: newMatchCondition,
          constraints: newConstraints,
          weights: newWeights,
          ragInsights: ragInsights
        })
      });
      const data = await res.json();
      setRoster(data.roster);
      setTotalCost(data.totalCost);
      setExpectedPointsTotal(data.expectedPointsTotal);
    } catch (err) {
      console.error("Manual optimization update failed:", err);
    }
  };

  // Conversational interaction
  const handleSendMessage = async (text: string) => {
    if (!matchCondition || !constraints || !weights || isChatLoading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: "user", text, timestamp: userTime };
    
    // Add user message to log
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    // Build standard conversation history for Gemini context
    const chatHistory = messages.map(m => ({
      role: (m.sender === "ai" ? "model" : "user") as "user" | "model",
      text: m.text
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          matchCondition,
          constraints,
          weights
        })
      });

      const data = await response.json();
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Add AI reply
      setMessages(prev => [
        ...prev, 
        { sender: "ai", text: data.reply, timestamp: aiTime }
      ]);

      if (data.ragInsights) {
        setRagInsights(data.ragInsights);
      }

      // Check if model recommended updating parameters
      let updatedCond = matchCondition;
      let updatedCons = constraints;
      let updatedWgts = weights;
      let hasUpdates = false;

      if (data.updatedMatchCondition) {
        updatedCond = { ...matchCondition, ...data.updatedMatchCondition };
        setMatchCondition(updatedCond);
        hasUpdates = true;
      }
      if (data.updatedConstraints) {
        updatedCons = { ...constraints, ...data.updatedConstraints };
        setConstraints(updatedCons);
        hasUpdates = true;
      }
      if (data.updatedWeights) {
        updatedWgts = { ...weights, ...data.updatedWeights };
        setWeights(updatedWgts);
        hasUpdates = true;
      }

      const nextRagInsights = data.ragInsights || [];
      const ragChanged = JSON.stringify(nextRagInsights) !== JSON.stringify(ragInsights);

      // Re-trigger optimization solver if state was modified by Gemini or new RAG found
      if (hasUpdates || ragChanged) {
        const res = await fetch("/api/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchCondition: updatedCond,
            constraints: updatedCons,
            weights: updatedWgts,
            ragInsights: nextRagInsights
          })
        });
        const optimizedData = await res.json();
        setRoster(optimizedData.roster);
        setTotalCost(optimizedData.totalCost);
        setExpectedPointsTotal(optimizedData.expectedPointsTotal);
      }

    } catch (err) {
      console.error("Failed to query AI Strategist:", err);
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "I was unable to synchronize live calculations. Let's try adjusting our roster manually or restating our goal.",
          timestamp: aiTime
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isPageLoading || !matchCondition || !constraints || !weights) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight uppercase">Statify 2.0 Loading...</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Bootstrapping Secret Recipe Engines & RAG Corpora</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      {/* LEFT: Chat Panel */}
      <ChatPanel 
        messages={messages} 
        isLoading={isChatLoading} 
        onSendMessage={handleSendMessage} 
      />

      {/* RIGHT: Dashboard (Bento Grid) */}
      <BentoDashboard
        matchCondition={matchCondition}
        constraints={constraints}
        weights={weights}
        roster={roster}
        totalCost={totalCost}
        expectedPointsTotal={expectedPointsTotal}
        ragInsights={ragInsights}
        onUpdateConfig={handleUpdateConfig}
      />
    </div>
  );
}
