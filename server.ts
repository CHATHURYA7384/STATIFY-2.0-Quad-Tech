import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { fetch_players, optimize_roster, compute_player_evaluation } from "./server/tools.js";
import { MatchCondition, StrategyConstraints, SecretRecipeWeights } from "./server/schemas.js";
import { runAgentOrchestrator, AgentRequest } from "./server/agent.js";

dotenv.config();

const DEFAULT_MATCH_CONDITION: MatchCondition = {
  stadium: "St. James' Park",
  weather_outlook: "Rain",
  temperature_c: 7.5,
  wind_speed_kmh: 32,
  humidity_percent: 88,
  opponent_team: "Newcastle United",
  opponent_difficulty: 4,
  is_home: false
};

const DEFAULT_CONSTRAINTS: StrategyConstraints = {
  total_budget: 100.0,
  max_players_per_team: 3,
  formation: "4-4-2"
};

const DEFAULT_WEIGHTS: SecretRecipeWeights = {
  form_weight: 0.4,
  difficulty_weight: 0.3,
  weather_suitability_weight: 0.15,
  home_advantage_weight: 0.15
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/config/defaults", (req, res) => {
    res.json({
      matchCondition: DEFAULT_MATCH_CONDITION,
      constraints: DEFAULT_CONSTRAINTS,
      weights: DEFAULT_WEIGHTS
    });
  });

  // Get available players list evaluated with current conditions
  app.post("/api/players/evaluated", (req, res) => {
    try {
      const matchCondition: MatchCondition = req.body.matchCondition || DEFAULT_MATCH_CONDITION;
      const weights: SecretRecipeWeights = req.body.weights || DEFAULT_WEIGHTS;
      
      const players = fetch_players();
      const evaluated = players.map(p => compute_player_evaluation(p, matchCondition, weights));
      
      res.json({ players: evaluated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch evaluated players" });
    }
  });

  // Solve the roster optimization
  app.post("/api/optimize", (req, res) => {
    try {
      const matchCondition: MatchCondition = req.body.matchCondition || DEFAULT_MATCH_CONDITION;
      const constraints: StrategyConstraints = req.body.constraints || DEFAULT_CONSTRAINTS;
      const weights: SecretRecipeWeights = req.body.weights || DEFAULT_WEIGHTS;
      const ragInsights: string[] = req.body.ragInsights || [];

      const result = optimize_roster(matchCondition, constraints, weights, ragInsights);
      
      res.json({
        roster: result.roster,
        totalCost: result.totalCost,
        expectedPointsTotal: result.expectedPointsTotal,
        formationApplied: constraints.formation
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to optimize roster" });
    }
  });

  // Chat with the AI Manager
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, matchCondition, constraints, weights } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const agentRequest: AgentRequest = {
        message,
        history: history || [],
        matchCondition: matchCondition || DEFAULT_MATCH_CONDITION,
        constraints: constraints || DEFAULT_CONSTRAINTS,
        weights: weights || DEFAULT_WEIGHTS
      };

      const result = await runAgentOrchestrator(agentRequest);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to process chat agent" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[STATIFY 2.0] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
