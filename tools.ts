import { PlayerStats, MatchCondition, SecretRecipeWeights, OptimizedPlayerEvaluation, StrategyConstraints } from "./schemas.js";

// ==========================================
// 1. COMPREHENSIVE MOCK DATABASE OF PLAYERS
// ==========================================
export const MOCK_PLAYERS: PlayerStats[] = [
  // Goalkeepers (GK)
  { id: "p1", name: "Thibaut Courtois", team: "Real Madrid", position: "GK", cost: 6.0, base_rating: 89, form: 8.2, goals: 0, assists: 0, clean_sheets: 5, injury_status: "Healthy" },
  { id: "p2", name: "Ederson Moraes", team: "Manchester City", position: "GK", cost: 5.5, base_rating: 86, form: 7.5, goals: 0, assists: 1, clean_sheets: 4, injury_status: "Healthy" },
  { id: "p3", name: "David Raya", team: "Arsenal", position: "GK", cost: 5.5, base_rating: 85, form: 8.8, goals: 0, assists: 0, clean_sheets: 6, injury_status: "Healthy" },
  { id: "p4", name: "Alisson Becker", team: "Liverpool", position: "GK", cost: 5.8, base_rating: 87, form: 6.2, goals: 0, assists: 0, clean_sheets: 3, injury_status: "Doubtful" },

  // Defenders (DEF)
  { id: "p5", name: "William Saliba", team: "Arsenal", position: "DEF", cost: 6.0, base_rating: 88, form: 8.9, goals: 1, assists: 0, clean_sheets: 6, injury_status: "Healthy" },
  { id: "p6", name: "Virgil van Dijk", team: "Liverpool", position: "DEF", cost: 6.5, base_rating: 89, form: 8.5, goals: 2, assists: 1, clean_sheets: 5, injury_status: "Healthy" },
  { id: "p7", name: "Ruben Dias", team: "Manchester City", position: "DEF", cost: 6.0, base_rating: 87, form: 7.2, goals: 0, assists: 0, clean_sheets: 4, injury_status: "Healthy" },
  { id: "p8", name: "Trent Alexander-Arnold", team: "Liverpool", position: "DEF", cost: 7.0, base_rating: 86, form: 8.1, goals: 1, assists: 4, clean_sheets: 3, injury_status: "Healthy" },
  { id: "p9", name: "Josko Gvardiol", team: "Manchester City", position: "DEF", cost: 6.0, base_rating: 84, form: 7.8, goals: 2, assists: 1, clean_sheets: 4, injury_status: "Healthy" },
  { id: "p10", name: "Gabriel Magalhaes", team: "Arsenal", position: "DEF", cost: 6.0, base_rating: 85, form: 8.4, goals: 3, assists: 0, clean_sheets: 6, injury_status: "Healthy" },
  { id: "p11", name: "Achraf Hakimi", team: "PSG", position: "DEF", cost: 6.2, base_rating: 85, form: 7.4, goals: 1, assists: 3, clean_sheets: 4, injury_status: "Healthy" },
  { id: "p12", name: "Kieran Trippier", team: "Newcastle", position: "DEF", cost: 5.0, base_rating: 81, form: 5.8, goals: 0, assists: 2, clean_sheets: 2, injury_status: "Injured" },

  // Midfielders (MID)
  { id: "p13", name: "Kevin De Bruyne", team: "Manchester City", position: "MID", cost: 10.5, base_rating: 91, form: 8.0, goals: 3, assists: 8, clean_sheets: 4, injury_status: "Healthy" },
  { id: "p14", name: "Jude Bellingham", team: "Real Madrid", position: "MID", cost: 11.0, base_rating: 90, form: 8.7, goals: 5, assists: 5, clean_sheets: 5, injury_status: "Healthy" },
  { id: "p15", name: "Bukayo Saka", team: "Arsenal", position: "MID", cost: 10.0, base_rating: 89, form: 9.2, goals: 6, assists: 7, clean_sheets: 6, injury_status: "Healthy" },
  { id: "p16", name: "Cole Palmer", team: "Chelsea", position: "MID", cost: 9.5, base_rating: 87, form: 9.5, goals: 8, assists: 6, clean_sheets: 2, injury_status: "Healthy" },
  { id: "p17", name: "Martin Odegaard", team: "Arsenal", position: "MID", cost: 8.5, base_rating: 87, form: 8.3, goals: 3, assists: 4, clean_sheets: 6, injury_status: "Healthy" },
  { id: "p18", name: "Mohamed Salah", team: "Liverpool", position: "MID", cost: 12.5, base_rating: 90, form: 9.0, goals: 10, assists: 6, clean_sheets: 5, injury_status: "Healthy" },
  { id: "p19", name: "Rodri Hernandez", team: "Manchester City", position: "MID", cost: 6.5, base_rating: 90, form: 8.6, goals: 2, assists: 3, clean_sheets: 4, injury_status: "Healthy" },
  { id: "p20", name: "Son Heung-min", team: "Tottenham", position: "MID", cost: 9.0, base_rating: 86, form: 7.8, goals: 5, assists: 3, clean_sheets: 2, injury_status: "Healthy" },
  { id: "p21", name: "Florian Wirtz", team: "Bayer Leverkusen", position: "MID", cost: 8.0, base_rating: 86, form: 8.8, goals: 4, assists: 5, clean_sheets: 3, injury_status: "Healthy" },

  // Forwards (FWD)
  { id: "p22", name: "Erling Haaland", team: "Manchester City", position: "FWD", cost: 14.0, base_rating: 92, form: 9.4, goals: 14, assists: 1, clean_sheets: 4, injury_status: "Healthy" },
  { id: "p23", name: "Kylian Mbappe", team: "Real Madrid", position: "FWD", cost: 13.5, base_rating: 91, form: 8.6, goals: 9, assists: 3, clean_sheets: 5, injury_status: "Healthy" },
  { id: "p24", name: "Harry Kane", team: "Bayern Munich", position: "FWD", cost: 12.5, base_rating: 90, form: 9.1, goals: 12, assists: 4, clean_sheets: 3, injury_status: "Healthy" },
  { id: "p25", name: "Ollie Watkins", team: "Aston Villa", position: "FWD", cost: 8.5, base_rating: 84, form: 7.9, goals: 6, assists: 3, clean_sheets: 2, injury_status: "Healthy" },
  { id: "p26", name: "Alexander Isak", team: "Newcastle", position: "FWD", cost: 8.0, base_rating: 83, form: 8.0, goals: 5, assists: 2, clean_sheets: 2, injury_status: "Healthy" },
  { id: "p27", name: "Vinicius Junior", team: "Real Madrid", position: "FWD", cost: 12.0, base_rating: 89, form: 9.3, goals: 8, assists: 5, clean_sheets: 5, injury_status: "Healthy" },
  { id: "p28", name: "Lautaro Martinez", team: "Inter Milan", position: "FWD", cost: 9.0, base_rating: 85, form: 7.4, goals: 5, assists: 1, clean_sheets: 3, injury_status: "Doubtful" }
];

// ==========================================
// 2. MOCK RAG TEXTUAL DATABASE & VECTOR LOOKUP
// ==========================================
export const MOCK_RAG_CORPUS = [
  {
    tags: ["haaland", "city", "rain", "wet", "pitch"],
    text: "Erling Haaland excels in heavy rain and wet conditions. His immense physical build and powerful stride allow him to dominate defenders on water-logged turf. Expected output increases by 10% in heavy rain."
  },
  {
    tags: ["arsenal", "saliba", "gabriel", "wind", "defenders"],
    text: "Arsenal's defensive duo William Saliba and Gabriel Magalhaes are exceptionally stable in high-wind conditions due to highly organized aerial drill structures. Wind speed does not penalize their clean sheet probability."
  },
  {
    tags: ["bellingham", "humidity", "fatigue"],
    text: "Jude Bellingham shows minor physical sensitivity in extreme humidity (>85%), causing slightly earlier substitution and slight drop in expected assist multipliers."
  },
  {
    tags: ["salah", "liverpool", "dry", "sunny", "pitch"],
    text: "Mohamed Salah thrives on dry, high-speed grass pitches at Anfield or under sunny skies. Clean ball rolls elevate his close-control dribbling, increasing expected goal ratings by 8%."
  },
  {
    tags: ["courtois", "madrid", "home", "goalkeeper"],
    text: "Thibaut Courtois maintains an outstanding 82% clean-sheet ratio during home fixtures under moderate weather. High defense organization benefits from home crowd support."
  },
  {
    tags: ["palmer", "chelsea", "rain", "slippery", "pitch"],
    text: "Cole Palmer's signature penalty taking and long-range shooting are highly effective on wet, slippery pitches. Goalkeepers struggle with his wet-ball trajectory, raising expected goals by 5%."
  },
  {
    tags: ["saka", "wind", "weather"],
    text: "Bukayo Saka's winger dynamics are slightly hampered by heavy winds (>30 kmh) due to air resistance on looping crosses. Midfield control values scale down moderately."
  },
  {
    tags: ["kane", "temperature", "cold", "weather"],
    text: "Harry Kane is a cold-weather specialist. His mechanical finishing and target-man drops are unaffected by temperature drops down to freezing. Performance metrics scale up by 5% in temperatures below 8°C."
  },
  {
    tags: ["alisson", "injury", "out"],
    text: "Injury update: Alisson Becker remains doubtful with a hamstring strain. Medical logs suggest a substantial 65% reduction in dynamic agility, limiting his expected clean sheet ratio."
  },
  {
    tags: ["trippier", "injury", "out"],
    text: "Injury update: Kieran Trippier is completely OUT with a calf fracture. He will record 0 expected performance points for this round."
  }
];

export function fetch_players(): PlayerStats[] {
  return MOCK_PLAYERS;
}

export function retrieve_rag_context(query: string): string[] {
  const words: string[] = query.toLowerCase().match(/\w+/g) || [];
  const matched: { score: number; text: string }[] = [];

  for (const doc of MOCK_RAG_CORPUS) {
    let score = 0;
    // Check tag matches (high weight match)
    for (const tag of doc.tags) {
      if (words.includes(tag)) {
        score += 3;
      }
    }
    // Check text content matches (lower weight match)
    for (const word of words) {
      if (doc.text.toLowerCase().includes(word)) {
        score += 1;
      }
    }

    if (score > 0) {
      matched.push({ score, text: doc.text });
    }
  }

  // Sort by relevance score descending
  matched.sort((a, b) => b.score - a.score);
  return matched.slice(0, 3).map(x => x.text);
}

// ==========================================
// 3. SECRET RECIPE ALGORITHM (WEIGHTED MATHS)
// ==========================================
export function compute_player_evaluation(
  player: PlayerStats,
  match_cond: MatchCondition,
  weights: SecretRecipeWeights = {
    form_weight: 0.4,
    difficulty_weight: 0.3,
    weather_suitability_weight: 0.15,
    home_advantage_weight: 0.15
  },
  rag_insights?: string[]
): OptimizedPlayerEvaluation {
  let weather_multiplier = 1.0;
  let difficulty_multiplier = 1.0;
  let home_multiplier = 1.0;
  let dynamic_rag_multiplier = 1.0;

  // 1. Weather Suitability Multipliers
  if (match_cond.weather_outlook === "Rain") {
    if (player.position === "FWD" && player.id === "p22") { // Haaland wet pitch boost
      weather_multiplier = 1.10;
    } else if (player.position === "MID" && player.id === "p16") { // Cole Palmer wet ball boost
      weather_multiplier = 1.05;
    } else if (player.position === "GK") {
      weather_multiplier = 0.92; // Slippery gloves penalty for GKs
    }
  } else if (match_cond.weather_outlook === "Wind") {
    if (player.position === "DEF" && player.team === "Arsenal") { // Saliba/Gabriel aerodynamic boost
      weather_multiplier = 1.05;
    } else if (player.position === "MID" && player.id === "p15") { // Saka wind resistance penalty
      weather_multiplier = 0.95;
    } else if (player.position === "GK") {
      weather_multiplier = 0.95; // Aerodynamic variance penalty for GKs
    }
  }

  // Temperature constraints
  if (match_cond.temperature_c <= 8.0 && player.id === "p24") { // Harry Kane cold-weather specialist
    weather_multiplier *= 1.05;
  }

  // Humidity constraints
  if (match_cond.humidity_percent >= 85 && player.id === "p14") { // Bellingham humidity fatigue
    weather_multiplier *= 0.95;
  }

  // 2. Opponent Difficulty Multiplier
  // Maps difficulty 1 (very easy) to 1.30 down to 5 (very hard) to 0.70
  difficulty_multiplier = 1.30 - (match_cond.opponent_difficulty - 1) * 0.15;

  // 3. Home Advantage Multiplier
  if (match_cond.is_home) {
    home_multiplier = 1.15;
    if (player.position === "GK" && player.id === "p1") { // Thibaut Courtois home organization
      home_multiplier = 1.20;
    }
  } else {
    home_multiplier = 0.90;
  }

  // 4. Dynamic RAG-Grounded Alterations
  let rag_injured_override = false;
  let rag_doubtful_override = false;

  if (rag_insights && rag_insights.length > 0) {
    const names = player.name.split(" ");
    const player_last_name = names[names.length - 1].toLowerCase();
    const player_full_name = player.name.toLowerCase();

    for (const insight of rag_insights) {
      const insight_lower = insight.toLowerCase();
      // If this insight mentions this player
      if (insight_lower.includes(player_last_name) || insight_lower.includes(player_full_name)) {
        // 1. Injury Status
        if (insight_lower.includes("injury") || insight_lower.includes("out") || insight_lower.includes("fracture") || insight_lower.includes("strain")) {
          if (insight_lower.includes("doubtful")) {
            rag_doubtful_override = true;
          } else {
            rag_injured_override = true;
          }
        }

        // 2. Specific Weather/Performance boosts
        if (insight_lower.includes("excel") || insight_lower.includes("boost") || insight_lower.includes("thrive")) {
          dynamic_rag_multiplier *= 1.08;
        }
        if (insight_lower.includes("hamper") || insight_lower.includes("penalty") || insight_lower.includes("sensitivity")) {
          dynamic_rag_multiplier *= 0.92;
        }
      }
    }
  }

  // 5. Math Core Scoring Model
  const norm_base = player.base_rating / 10.0;
  const form_factor = player.form;

  // Blended performance capability
  const ability_score = (norm_base * (1.0 - weights.form_weight)) + (form_factor * weights.form_weight);

  // Combined multiplier blend based on recipe parameters
  const multiplier_blend = (
    (difficulty_multiplier * weights.difficulty_weight) +
    (weather_multiplier * weights.weather_suitability_weight) +
    (home_multiplier * weights.home_advantage_weight)
  );

  const calculated_value_score = ability_score * multiplier_blend * dynamic_rag_multiplier * 10.0;

  // Expected fantasy points baseline
  let expected_points = calculated_value_score * 0.75;

  // Apply strict health penalty rules (grounded in RAG + active metadata)
  if (player.injury_status === "Injured" || rag_injured_override) {
    expected_points = 0.0;
  } else if (player.injury_status === "Doubtful" || rag_doubtful_override) {
    expected_points *= 0.35; // Severe penalty for doubted fitness
  }

  return {
    player,
    calculated_value_score: Number(calculated_value_score.toFixed(2)),
    weather_multiplier: Number((weather_multiplier * dynamic_rag_multiplier).toFixed(2)),
    difficulty_multiplier: Number(difficulty_multiplier.toFixed(2)),
    home_multiplier: Number(home_multiplier.toFixed(2)),
    expected_points: Number(expected_points.toFixed(1))
  };
}

// ==========================================
// 4. ROSTER KNAPSACK OPTIMIZATION SOLVER
// ==========================================
export function optimize_roster(
  match_cond: MatchCondition,
  constraints: StrategyConstraints,
  weights: SecretRecipeWeights = {
    form_weight: 0.4,
    difficulty_weight: 0.3,
    weather_suitability_weight: 0.15,
    home_advantage_weight: 0.15
  },
  rag_insights?: string[]
): { roster: OptimizedPlayerEvaluation[]; totalCost: number; expectedPointsTotal: number } {
  let num_def = 4;
  let num_mid = 4;
  let num_fwd = 2;

  try {
    const parts = constraints.formation.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      num_def = parts[0];
      num_mid = parts[1];
      num_fwd = parts[2];
    }
  } catch (err) {
    // Keep default 4-4-2
  }

  const required_counts: Record<string, number> = {
    GK: 1,
    DEF: num_def,
    MID: num_mid,
    FWD: num_fwd
  };

  const all_players = fetch_players();
  const evaluated = all_players.map(p => compute_player_evaluation(p, match_cond, weights, rag_insights));

  // Sort strictly by projected points descending to run greedy knapsack allocation
  evaluated.sort((a, b) => b.expected_points - a.expected_points);

  const positional_selections: Record<string, OptimizedPlayerEvaluation[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: []
  };

  const team_counts: Record<string, number> = {};
  let current_cost = 0;

  for (const ev of evaluated) {
    const pos = ev.player.position;
    const team = ev.player.team;
    const cost = ev.player.cost;

    // Guard rules
    if (ev.player.injury_status === "Injured" || ev.expected_points === 0.0) {
      continue;
    }

    // Positional limit check
    if (positional_selections[pos].length >= required_counts[pos]) {
      continue;
    }

    // Per-club roster concentration limit check
    const tentative_count = (team_counts[team] || 0) + 1;
    if (tentative_count > constraints.max_players_per_team) {
      continue;
    }

    // Budget cap limit check
    if (current_cost + cost > constraints.total_budget) {
      continue;
    }

    // Lock selection
    positional_selections[pos].push(ev);
    team_counts[team] = tentative_count;
    current_cost += cost;
  }

  // BACKFILL PHASE: If the budget cap was breached and slots remain unfulfilled
  const roster_list: OptimizedPlayerEvaluation[] = [];
  for (const pos of ["GK", "DEF", "MID", "FWD"]) {
    const diff = required_counts[pos] - positional_selections[pos].length;
    if (diff > 0) {
      // Find cheapest healthy candidates to prevent budget breach
      const candidates = evaluated.filter(ev => 
        ev.player.position === pos && 
        ev.player.injury_status !== "Injured" && 
        ev.expected_points > 0.0 &&
        !positional_selections[pos].includes(ev)
      );
      candidates.sort((a, b) => a.player.cost - b.player.cost);
      for (const cand of candidates) {
        if (positional_selections[pos].length < required_counts[pos]) {
          positional_selections[pos].push(cand);
          current_cost += cand.player.cost;
        }
      }
    }
    roster_list.push(...positional_selections[pos]);
  }

  const totalCost = Number(roster_list.reduce((sum, x) => sum + x.player.cost, 0).toFixed(2));
  const expectedPointsTotal = Number(roster_list.reduce((sum, x) => sum + x.expected_points, 0).toFixed(1));

  return {
    roster: roster_list,
    totalCost,
    expectedPointsTotal
  };
}
