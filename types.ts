export interface PlayerStats {
  id: string;
  name: string;
  team: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  cost: number;
  base_rating: number;
  form: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  injury_status: "Healthy" | "Doubtful" | "Injured";
}

export interface MatchCondition {
  stadium: string;
  weather_outlook: "Sunny" | "Rain" | "Wind" | "Snow";
  temperature_c: number;
  wind_speed_kmh: number;
  humidity_percent: number;
  opponent_team: string;
  opponent_difficulty: number;
  is_home: boolean;
}

export interface StrategyConstraints {
  total_budget: number;
  max_players_per_team: number;
  formation: string;
}

export interface SecretRecipeWeights {
  form_weight: number;
  difficulty_weight: number;
  weather_suitability_weight: number;
  home_advantage_weight: number;
}

export interface OptimizedPlayerEvaluation {
  player: PlayerStats;
  calculated_value_score: number;
  weather_multiplier: number;
  difficulty_multiplier: number;
  home_multiplier: number;
  expected_points: number;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
