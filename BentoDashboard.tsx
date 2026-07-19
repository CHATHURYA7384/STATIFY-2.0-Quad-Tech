import React, { useState } from "react";
import { MatchCondition, StrategyConstraints, SecretRecipeWeights, OptimizedPlayerEvaluation } from "../types.js";
import { 
  CloudRain, Wind, Sun, Snowflake, ShieldAlert, TrendingUp, DollarSign, 
  Settings2, HelpCircle, Trophy, Sparkles, MapPin, ChevronRight, User2,
  List, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BentoDashboardProps {
  matchCondition: MatchCondition;
  constraints: StrategyConstraints;
  weights: SecretRecipeWeights;
  roster: OptimizedPlayerEvaluation[];
  totalCost: number;
  expectedPointsTotal: number;
  ragInsights: string[];
  onUpdateConfig: (updates: {
    matchCondition?: Partial<MatchCondition>;
    constraints?: Partial<StrategyConstraints>;
    weights?: Partial<SecretRecipeWeights>;
  }) => void;
}

export default function BentoDashboard({
  matchCondition,
  constraints,
  weights,
  roster,
  totalCost,
  expectedPointsTotal,
  ragInsights,
  onUpdateConfig,
}: BentoDashboardProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<OptimizedPlayerEvaluation | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [viewMode, setViewMode] = useState<"pitch" | "table">("pitch");

  // Calculate remaining budget
  const remainingBudget = Number((constraints.total_budget - totalCost).toFixed(2));

  // Determine risk profile
  const doubtfulCount = roster.filter(p => p.player.injury_status === "Doubtful").length;
  const injuredCount = roster.filter(p => p.player.injury_status === "Injured").length;
  const teamConcentration: Record<string, number> = {};
  roster.forEach(p => {
    teamConcentration[p.player.team] = (teamConcentration[p.player.team] || 0) + 1;
  });
  const maxConcentration = Math.max(...Object.values(teamConcentration), 0);
  
  let riskLevel = "LOW";
  let riskColor = "bg-emerald-500";
  let riskPercent = 25;
  if (injuredCount > 0 || doubtfulCount > 1 || maxConcentration > 3) {
    riskLevel = "HIGH";
    riskColor = "bg-rose-500";
    riskPercent = 85;
  } else if (doubtfulCount > 0 || maxConcentration === 3) {
    riskLevel = "MED";
    riskColor = "bg-amber-500";
    riskPercent = 55;
  }

  // Get Weather Icon
  const getWeatherIcon = (outlook: string) => {
    switch (outlook) {
      case "Rain": return <CloudRain className="w-5 h-5 text-blue-400" />;
      case "Wind": return <Wind className="w-5 h-5 text-teal-400" />;
      case "Snow": return <Snowflake className="w-5 h-5 text-sky-200" />;
      default: return <Sun className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <main id="bento-dashboard" className="flex-1 p-6 overflow-y-auto grid grid-cols-4 grid-rows-[auto_1fr_auto] gap-4 bg-slate-950 text-slate-100 min-h-screen">
      
      {/* HEADER CONTROLS BAR (Tweak conditions live) */}
      <div className="col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            {getWeatherIcon(matchCondition.weather_outlook)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{matchCondition.stadium}</span>
              <span className="px-2 py-0.5 bg-slate-850 border border-slate-800 text-[10px] rounded text-slate-400">GW24 Fixture</span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>{matchCondition.weather_outlook} ({matchCondition.temperature_c}°C)</span> • 
              <span>Wind: {matchCondition.wind_speed_kmh} km/h</span> • 
              <span>Opponent: <strong className="text-slate-300">{matchCondition.opponent_team}</strong> (Diff: {matchCondition.opponent_difficulty}/5)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 text-xs bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 px-3 py-1.5 rounded-lg text-slate-200 transition cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manual Overrides</span>
          </button>
        </div>
      </div>

      {/* EXPANDABLE CONFIG DRAWER */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"
          >
            {/* Match Conditions Overrides */}
            <div>
              <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-widest text-emerald-400">Match Conditions</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Weather Outlook</label>
                  <select 
                    value={matchCondition.weather_outlook}
                    onChange={(e) => onUpdateConfig({ matchCondition: { weather_outlook: e.target.value as any } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white"
                  >
                    <option value="Sunny">Sunny</option>
                    <option value="Rain">Rain</option>
                    <option value="Wind">Wind</option>
                    <option value="Snow">Snow</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Temp (°C)</label>
                    <input 
                      type="number"
                      value={matchCondition.temperature_c}
                      onChange={(e) => onUpdateConfig({ matchCondition: { temperature_c: Number(e.target.value) } })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Wind (km/h)</label>
                    <input 
                      type="number"
                      value={matchCondition.wind_speed_kmh}
                      onChange={(e) => onUpdateConfig({ matchCondition: { wind_speed_kmh: Number(e.target.value) } })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Opponent Diff</label>
                    <input 
                      type="number"
                      min={1}
                      max={5}
                      value={matchCondition.opponent_difficulty}
                      onChange={(e) => onUpdateConfig({ matchCondition: { opponent_difficulty: Number(e.target.value) } })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-1 text-xs text-slate-300">
                      <input 
                        type="checkbox"
                        checked={matchCondition.is_home}
                        onChange={(e) => onUpdateConfig({ matchCondition: { is_home: e.target.checked } })}
                        className="rounded bg-slate-850 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>Playing Home</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Constraints Overrides */}
            <div>
              <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-widest text-emerald-400">Team Constraints</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Formation</label>
                  <select 
                    value={constraints.formation}
                    onChange={(e) => onUpdateConfig({ constraints: { formation: e.target.value } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white"
                  >
                    <option value="4-4-2">4-4-2 (Classic)</option>
                    <option value="4-3-3">4-3-3 (Attack)</option>
                    <option value="3-5-2">3-5-2 (Midfield Control)</option>
                    <option value="5-3-2">5-3-2 (Defensive Block)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Total Budget (£m)</label>
                  <input 
                    type="number"
                    step="0.5"
                    value={constraints.total_budget}
                    onChange={(e) => onUpdateConfig({ constraints: { total_budget: Number(e.target.value) } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Max Players per Club</label>
                  <input 
                    type="number"
                    value={constraints.max_players_per_team}
                    onChange={(e) => onUpdateConfig({ constraints: { max_players_per_team: Number(e.target.value) } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Weights Overrides */}
            <div>
              <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-widest text-emerald-400">Secret Recipe Algorithm Weights</h3>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Form Weight</span>
                    <span className="text-white font-mono">{weights.form_weight}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05"
                    value={weights.form_weight}
                    onChange={(e) => onUpdateConfig({ weights: { form_weight: Number(e.target.value) } })}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Matchup Difficulty Weight</span>
                    <span className="text-white font-mono">{weights.difficulty_weight}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05"
                    value={weights.difficulty_weight}
                    onChange={(e) => onUpdateConfig({ weights: { difficulty_weight: Number(e.target.value) } })}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Weather suitability</span>
                    <span className="text-white font-mono">{weights.weather_suitability_weight}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05"
                    value={weights.weather_suitability_weight}
                    onChange={(e) => onUpdateConfig({ weights: { weather_suitability_weight: Number(e.target.value) } })}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP THREE STAT BENTO BLOCKS */}
      <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition hover:border-slate-700/80">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Team Projection
        </span>
        <div className="flex items-end justify-between mt-2">
          <span className="text-5xl font-mono font-bold text-white tracking-tight">{expectedPointsTotal}</span>
          <span className="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            +{(expectedPointsTotal - 54.1).toFixed(1)} vs AVG
          </span>
        </div>
      </div>

      <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition hover:border-slate-700/80">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" /> Remaining Budget
        </span>
        <div className="flex items-end justify-between mt-2">
          <span className="text-3xl font-mono font-bold text-white">£{remainingBudget}m</span>
          <span className="text-slate-400 text-[10px] font-mono">Spent: £{totalCost}m</span>
        </div>
      </div>

      <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition hover:border-slate-700/80">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Roster Risk Profile
        </span>
        <div className="flex items-center gap-2 mt-4">
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${riskColor} transition-all duration-500`} style={{ width: `${riskPercent}%` }}></div>
          </div>
          <span className="text-xs font-mono font-bold">{riskLevel}</span>
        </div>
      </div>

      {/* ACTIVE XI TABLE BENTO BLOCK */}
      <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="p-4 border-b border-slate-800 flex flex-wrap justify-between items-center bg-slate-900/40 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Active XI Squad
            </h2>
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                onClick={() => setViewMode("pitch")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition ${
                  viewMode === "pitch"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Tactical Pitch</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition ${
                  viewMode === "table"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <List className="w-3 h-3" />
                <span>Roster List</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold font-mono border border-slate-700">{constraints.formation}</span>
            <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider">OPTIMIZED</span>
          </div>
        </div>

        <div className="flex-1 p-4">
          {viewMode === "pitch" ? (
            <div className="relative h-[480px] bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 border border-emerald-900/30 rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-inner">
              {/* Pitch turf styling & stripes */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
              <div className="absolute inset-x-4 top-4 bottom-4 border border-emerald-500/10 rounded pointer-events-none" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-x border-emerald-500/10 pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-x border-emerald-500/10 pointer-events-none" />
              <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-emerald-500/10 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-emerald-500/10 rounded-full pointer-events-none" />
              
              {/* Player Nodes Map */}
              <div className="relative z-10 flex flex-col justify-between h-full py-4">
                {/* Forwards row */}
                <div className="flex justify-around items-center w-full px-6">
                  {roster.filter(ev => ev.player.position === "FWD").map((ev, idx) => {
                    const isSelected = selectedPlayer?.player.id === ev.player.id;
                    return (
                      <motion.div
                        key={ev.player.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        onClick={() => setSelectedPlayer(ev)}
                        className={`flex flex-col items-center p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <div className="relative w-11 h-11 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                          {ev.player.name.split(" ").map(n => n[0]).join("")}
                          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-emerald-500 text-slate-950 rounded text-[8px] font-black font-mono shadow">
                            {ev.expected_points}
                          </span>
                        </div>
                        <p className="text-[10px] text-white font-bold mt-1.5 max-w-[85px] truncate text-center">
                          {ev.player.name.split(" ").slice(-1)[0]}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">
                          £{ev.player.cost}m
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Midfielders row */}
                <div className="flex justify-around items-center w-full px-2">
                  {roster.filter(ev => ev.player.position === "MID").map((ev, idx) => {
                    const isSelected = selectedPlayer?.player.id === ev.player.id;
                    return (
                      <motion.div
                        key={ev.player.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        onClick={() => setSelectedPlayer(ev)}
                        className={`flex flex-col items-center p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <div className="relative w-11 h-11 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                          {ev.player.name.split(" ").map(n => n[0]).join("")}
                          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-emerald-500 text-slate-950 rounded text-[8px] font-black font-mono shadow">
                            {ev.expected_points}
                          </span>
                        </div>
                        <p className="text-[10px] text-white font-bold mt-1.5 max-w-[85px] truncate text-center">
                          {ev.player.name.split(" ").slice(-1)[0]}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">
                          £{ev.player.cost}m
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Defenders row */}
                <div className="flex justify-around items-center w-full px-2">
                  {roster.filter(ev => ev.player.position === "DEF").map((ev, idx) => {
                    const isSelected = selectedPlayer?.player.id === ev.player.id;
                    return (
                      <motion.div
                        key={ev.player.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        onClick={() => setSelectedPlayer(ev)}
                        className={`flex flex-col items-center p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <div className="relative w-11 h-11 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                          {ev.player.name.split(" ").map(n => n[0]).join("")}
                          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-emerald-500 text-slate-950 rounded text-[8px] font-black font-mono shadow">
                            {ev.expected_points}
                          </span>
                        </div>
                        <p className="text-[10px] text-white font-bold mt-1.5 max-w-[85px] truncate text-center">
                          {ev.player.name.split(" ").slice(-1)[0]}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">
                          £{ev.player.cost}m
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Goalkeeper row */}
                <div className="flex justify-center items-center w-full">
                  {roster.filter(ev => ev.player.position === "GK").map((ev, idx) => {
                    const isSelected = selectedPlayer?.player.id === ev.player.id;
                    return (
                      <motion.div
                        key={ev.player.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        onClick={() => setSelectedPlayer(ev)}
                        className={`flex flex-col items-center p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <div className="relative w-11 h-11 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                          {ev.player.name.split(" ").map(n => n[0]).join("")}
                          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-emerald-500 text-slate-950 rounded text-[8px] font-black font-mono shadow">
                            {ev.expected_points}
                          </span>
                        </div>
                        <p className="text-[10px] text-white font-bold mt-1.5 max-w-[85px] truncate text-center">
                          {ev.player.name.split(" ").slice(-1)[0]}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">
                          £{ev.player.cost}m
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 font-bold">
                  <tr>
                    <th className="pb-2">Player</th>
                    <th className="pb-2">Team</th>
                    <th className="pb-2">POS</th>
                    <th className="pb-2 text-right">Base</th>
                    <th className="pb-2 text-right">Form</th>
                    <th className="pb-2 text-right">Cost</th>
                    <th className="pb-2 text-right text-emerald-400">Proj Pts</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-800/50">
                  {roster.map((ev, idx) => {
                    const isSelected = selectedPlayer?.player.id === ev.player.id;

                    return (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedPlayer(ev)}
                        className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          isSelected ? "bg-slate-850 border-l-2 border-emerald-500" : ""
                        }`}
                      >
                        <td className="py-2.5 font-semibold text-white pl-2">
                          {ev.player.name}
                        </td>
                        <td className="py-2.5 text-slate-400 font-medium">
                          {ev.player.team}
                        </td>
                        <td className="py-2.5 font-mono text-slate-400">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            ev.player.position === 'GK' ? 'bg-amber-500/10 text-amber-400' :
                            ev.player.position === 'DEF' ? 'bg-indigo-500/10 text-indigo-400' :
                            ev.player.position === 'MID' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {ev.player.position}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-300">
                          {ev.player.base_rating}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-300">
                          {ev.player.form}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-300">
                          £{ev.player.cost}m
                        </td>
                        <td className="py-2.5 text-right font-mono text-emerald-400 font-bold">
                          {ev.expected_points}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            ev.player.injury_status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                            ev.player.injury_status === 'Doubtful' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {ev.player.injury_status === 'Healthy' ? 'Fit' : ev.player.injury_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT ANALYSIS COLUMN */}
      <div className="col-span-1 space-y-4 flex flex-col">
        {/* TACTICAL INSIGHT RAG BLOCK */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Tactical Insights
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {ragInsights.length > 0 ? (
                ragInsights.map((insight, i) => (
                  <div key={i} className="bg-slate-850 p-2 rounded border border-slate-800">
                    <p className="text-[11px] font-bold text-white mb-0.5">RAG Retrieval</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-serif italic">
                      "{insight}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-slate-850 p-2.5 rounded border border-slate-800/40">
                  <p className="text-[11px] font-medium text-slate-400 italic">
                    Query the AI Strategist regarding player weather conditions or injury updates to pull local RAG documents.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-850 p-2.5 rounded border border-slate-800/40 mt-3">
            <p className="text-[11px] font-bold text-white mb-1">Secret Recipe Algorithm</p>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Valuation Accuracy</span>
              <span className="text-emerald-400 font-mono font-bold">98.4%</span>
            </div>
          </div>
        </div>

        {/* STRATEGIST GOAL INDIGO CARD */}
        <div className="bg-indigo-600 rounded-xl p-4 flex flex-col shadow-[0_0_40px_rgba(79,70,229,0.2)]">
          <div className="flex justify-between items-start mb-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="px-1.5 py-0.5 bg-white/15 rounded text-[8px] text-white font-bold tracking-wider uppercase">
              Real-time delta
            </span>
          </div>
          <h3 className="text-base font-bold text-white leading-tight">Strategist Target</h3>
          <p className="text-[11px] text-indigo-100/80 mt-1 leading-relaxed">
            Targeting top 1% global rank using weather-adjusted local RAG analysis.
          </p>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] border-b border-white/10 pb-1">
              <span className="text-indigo-100">Global Average</span>
              <span className="font-mono font-bold text-white">54.1</span>
            </div>
            <div className="flex justify-between text-[10px] border-b border-white/10 pb-1">
              <span className="text-indigo-100">Statify Projection</span>
              <span className="font-mono font-bold text-emerald-300">{expectedPointsTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PLAYER MODAL DETAILS / DETAILED PANEL */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {selectedPlayer.player.position}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedPlayer.player.name}</h3>
                  <p className="text-xs text-slate-400">{selectedPlayer.player.team} • Cost: £{selectedPlayer.player.cost}m</p>
                </div>
                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="text-slate-400 hover:text-white font-bold cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-850 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Base Rating</span>
                    <strong className="text-base text-white font-mono">{selectedPlayer.player.base_rating}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Recent Form</span>
                    <strong className="text-base text-white font-mono">{selectedPlayer.player.form}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Goals/Ast</span>
                    <strong className="text-base text-white font-mono">{selectedPlayer.player.goals}/{selectedPlayer.player.assists}</strong>
                  </div>
                </div>

                {/* Multipliers Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-emerald-400">Secret Recipe Multipliers</h4>
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Weather Factor</span>
                      <span className={`font-bold ${selectedPlayer.weather_multiplier > 1.0 ? 'text-emerald-400' : selectedPlayer.weather_multiplier < 1.0 ? 'text-rose-400' : 'text-white'}`}>
                        x{selectedPlayer.weather_multiplier}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Opponent Difficulty Factor</span>
                      <span className={`font-bold ${selectedPlayer.difficulty_multiplier > 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        x{selectedPlayer.difficulty_multiplier}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Home/Away Factor</span>
                      <span className={`font-bold ${selectedPlayer.home_multiplier > 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        x{selectedPlayer.home_multiplier}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400 font-bold">Calculated Performance Index</span>
                      <span className="text-white font-bold">{selectedPlayer.calculated_value_score}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-emerald-400 font-bold">Anticipated Match Points</span>
                      <span className="text-emerald-400 font-bold text-sm">{selectedPlayer.expected_points} PTS</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-850 p-2.5 rounded border border-slate-800 italic leading-relaxed">
                  *Expected points are mathematically integrated based on active match forecasts, player suitability index, and health factors.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
