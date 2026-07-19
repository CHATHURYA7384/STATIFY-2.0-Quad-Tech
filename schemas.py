from pydantic import BaseModel, Field, conlist
from typing import List, Optional, Dict

class PlayerStats(BaseModel):
    id: str = Field(..., description="Unique player identifier")
    name: str = Field(..., description="Full name of the player")
    team: str = Field(..., description="Club or team name")
    position: str = Field(..., description="Position (GK, DEF, MID, FWD)")
    cost: float = Field(..., description="Fantasy cost in millions (e.g. 8.5)")
    base_rating: float = Field(..., description="Baseline rating out of 100")
    form: float = Field(..., description="Recent form rating from 1 to 10")
    goals: int = Field(0, description="Goals scored in current campaign")
    assists: int = Field(0, description="Assists made in current campaign")
    clean_sheets: int = Field(0, description="Clean sheets recorded")
    injury_status: str = Field("Healthy", description="Status (Healthy, Doubtful, Injured)")

class MatchCondition(BaseModel):
    stadium: str = Field(..., description="Name of the venue")
    weather_outlook: str = Field(..., description="Outlook (Sunny, Rain, Wind, Snow)")
    temperature_c: float = Field(..., description="Temperature in Celsius")
    wind_speed_kmh: float = Field(..., description="Wind speed in km/h")
    humidity_percent: int = Field(..., description="Humidity percentage")
    opponent_team: str = Field(..., description="Name of opposing team")
    opponent_difficulty: int = Field(..., description="Difficulty rating from 1 to 5")
    is_home: bool = Field(True, description="Whether playing at home stadium")

class StrategyConstraints(BaseModel):
    total_budget: float = Field(100.0, description="Maximum total budget in millions")
    max_players_per_team: int = Field(3, description="Maximum players from a single real team")
    formation: str = Field("4-4-2", description="Desired formation (e.g., 4-4-2, 4-3-3, 3-5-2)")

class SecretRecipeWeights(BaseModel):
    form_weight: float = Field(0.4, description="Weight of player's recent form")
    difficulty_weight: float = Field(0.3, description="Weight of matchup difficulty")
    weather_suitability_weight: float = Field(0.15, description="Weight of weather/stadium suitability")
    home_advantage_weight: float = Field(0.15, description="Weight of playing at home")

class OptimizedPlayerEvaluation(BaseModel):
    player: PlayerStats
    calculated_value_score: float = Field(..., description="Custom calculated performance index")
    weather_multiplier: float = Field(1.0, description="Weather multiplier applied")
    difficulty_multiplier: float = Field(1.0, description="Difficulty multiplier applied")
    home_multiplier: float = Field(1.0, description="Home multiplier applied")
    expected_points: float = Field(..., description="Computed expected points for next fixture")

class RosterResponse(BaseModel):
    roster_id: str = Field(..., description="Generated Roster Identifier")
    players: List[OptimizedPlayerEvaluation] = Field(..., description="11 players selected in roster")
    total_cost: float = Field(..., description="Total cost of selected players")
    average_form: float = Field(..., description="Average form rating of the squad")
    expected_points_total: float = Field(..., description="Sum of expected points for the roster")
    formation_applied: str = Field(..., description="Formation used for roster generation")
    strategy_summary: str = Field(..., description="Explanation of why this roster was built")
