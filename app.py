import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from .schemas import PlayerStats, MatchCondition, StrategyConstraints, SecretRecipeWeights, OptimizedPlayerEvaluation, RosterResponse
from .tools import fetch_players, retrieve_rag_context, optimize_roster
from .agent import run_agent_orchestrator

app = FastAPI(
    title="Statify 2.0 Backend",
    description="FastAPI Backend for the Dynamic Fantasy Sports Strategist Engine",
    version="2.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default States
DEFAULT_MATCH_CONDITION = MatchCondition(
    stadium="St. James' Park",
    weather_outlook="Rain",
    temperature_c=7.5,
    wind_speed_kmh=22.0,
    humidity_percent=88,
    opponent_team="Newcastle United",
    opponent_difficulty=4,
    is_home=False
)

DEFAULT_CONSTRAINTS = StrategyConstraints(
    total_budget=100.0,
    max_players_per_team=3,
    formation="4-4-2"
)

DEFAULT_WEIGHTS = SecretRecipeWeights(
    form_weight=0.4,
    difficulty_weight=0.3,
    weather_suitability_weight=0.15,
    home_advantage_weight=0.15
)

# Input Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., description="Raw text message from the user")
    history: List[Dict[str, str]] = Field(default_factory=list, description="Message history list of roles and text")
    matchCondition: Optional[MatchCondition] = None
    constraints: Optional[StrategyConstraints] = None
    weights: Optional[SecretRecipeWeights] = None

class ChatResponse(BaseModel):
    reply: str
    active_squad: List[OptimizedPlayerEvaluation]
    total_cost: float
    expected_points_total: float
    rag_insights: List[str]
    updated_match_condition: Optional[MatchCondition] = None
    updated_constraints: Optional[StrategyConstraints] = None
    updated_weights: Optional[SecretRecipeWeights] = None

class OptimizeRequest(BaseModel):
    matchCondition: MatchCondition
    constraints: StrategyConstraints
    weights: SecretRecipeWeights
    ragInsights: Optional[List[str]] = Field(default_factory=list)

@app.get("/api/config/defaults")
def get_defaults():
    """Retrieve default manager setups and parameters on app boot."""
    return {
        "matchCondition": DEFAULT_MATCH_CONDITION,
        "constraints": DEFAULT_CONSTRAINTS,
        "weights": DEFAULT_WEIGHTS
    }

@app.get("/api/players", response_model=List[PlayerStats])
def get_players():
    """Retrieve the entire database of available players with metadata."""
    return fetch_players()

@app.post("/api/optimize")
def optimize_lineup(req: OptimizeRequest):
    """
    Compute mathematical roster optimization using active weather constraints
    and custom weights. Returns the selected 11-player squad.
    """
    roster, total_cost, expected_points = optimize_roster(
        match_cond=req.matchCondition,
        constraints=req.constraints,
        weights=req.weights,
        rag_insights=req.ragInsights
    )
    return {
        "roster": roster,
        "totalCost": total_cost,
        "expectedPointsTotal": expected_points
    }

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_strategist(req: ChatRequest):
    """
    Conversational Endpoint. Coordinates user message, fetches weather RAG context,
    computes LLM updates, recalculates roster live, and returns the response.
    """
    # Fallback to defaults if missing
    match_cond = req.matchCondition or DEFAULT_MATCH_CONDITION
    constraints = req.constraints or DEFAULT_CONSTRAINTS
    weights = req.weights or DEFAULT_WEIGHTS

    # Run agent orchestrator to get text reply and recommended manual tweaks
    agent_output = run_agent_orchestrator(
        message=req.message,
        history=req.history,
        match_cond=match_cond,
        constraints=constraints,
        weights=weights
    )

    # Process recommended changes from the LLM
    updated_cond = match_cond
    updated_cons = constraints
    updated_wgts = weights

    if agent_output.get("updatedMatchCondition"):
        try:
            updated_cond = MatchCondition(**{**match_cond.dict(), **agent_output["updatedMatchCondition"]})
        except Exception:
            pass

    if agent_output.get("updatedConstraints"):
        try:
            updated_cons = StrategyConstraints(**{**constraints.dict(), **agent_output["updatedConstraints"]})
        except Exception:
            pass

    if agent_output.get("updatedWeights"):
        try:
            updated_wgts = SecretRecipeWeights(**{**weights.dict(), **agent_output["updatedWeights"]})
        except Exception:
            pass

    # Solve optimization with the (potentially updated) parameters and RAG facts
    rag_insights = agent_output.get("rag_insights", [])
    roster, total_cost, expected_points = optimize_roster(
        match_cond=updated_cond,
        constraints=updated_cons,
        weights=updated_wgts,
        rag_insights=rag_insights
    )

    return ChatResponse(
        reply=agent_output.get("reply", "Strategy updated successfully."),
        active_squad=roster,
        total_cost=total_cost,
        expected_points_total=expected_points,
        rag_insights=rag_insights,
        updated_match_condition=updated_cond,
        updated_constraints=updated_cons,
        updated_weights=updated_wgts
    )
