import os
import json
from typing import List, Dict, Any, Optional
from .schemas import MatchCondition, StrategyConstraints, SecretRecipeWeights
from .tools import retrieve_rag_context

# Lazy-load/Init client to avoid startup crash if API key is missing
def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fall back gracefully in mock environments, but raise for production
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except ImportError:
        # If google-genai is not installed, return None
        return None

def run_agent_orchestrator(
    message: str,
    history: List[Dict[str, str]],
    match_cond: MatchCondition,
    constraints: StrategyConstraints,
    weights: SecretRecipeWeights
) -> Dict[str, Any]:
    """
    Python LLM Orchestrator using the new google-genai SDK.
    Acts as the veteran FPL Strategist. Combines user inputs, active configuration state,
    and retrieved local weather/pitch/injury RAG facts to generate optimized strategic recommendations.
    """
    # 1. Fetch RAG Context
    rag_insights = retrieve_rag_context(message)
    rag_context_str = "\n".join(
        [f"[Fact {i+1}]: {text}" for i, text in enumerate(rag_insights)]
    ) if rag_insights else "No highly matching historical or weather-adaptive player facts found."

    # 2. Build system instructions
    system_instruction = f"""You are "Statify AI v2.0", the dynamic AI Fantasy Sports Strategist and veteran team manager.
Your task is to analyze user queries, manage dialogue memory, retrieve RAG-grounded match conditions, sequence tool outputs, and manage conversational pushback.

STRICT OPERATIONAL RULES:
1. Ground your advice strictly in the provided RAG Facts. If facts are relevant (e.g., Haaland in heavy rain, Saka in high winds, Kane in cold weather, Bellingham in extreme humidity), use them in your calculations and explicitly mention them.
2. If the user suggests changes to match conditions (e.g. "Set weather to Rain", "Play against Real Madrid with difficulty 5"), or team rules (e.g. "We need a 3-5-2 formation", "Lower budget to 90M"), you must respond and return the updated fields in the structured JSON output.
3. Conversational Pushback: You must critically review team constraints. 
   - If the user selects a formation that is invalid or impossible given active healthy players, push back politely.
   - If the budget is violated or extremely tight (e.g., choosing Kane, Haaland, Mbappe, and Salah in a 100M budget), push back immediately and explain that they exceed the budget, and offer a balanced compromise.
   - If players are "Injured" or "Doubtful" (e.g., Alisson or Lautaro), advise against selecting them due to performance penalties (Doubtful is penalized by 65%, Injured gets 0 points).
4. Always respond in valid JSON format matching the schema below. Do not wrap with additional text outside the JSON.

Current Roster & Strategy State:
- Match Venue: {match_cond.stadium}
- Opponent: {match_cond.opponent_team} (Difficulty: {match_cond.opponent_difficulty}/5)
- Weather Outlook: {match_cond.weather_outlook} ({match_cond.temperature_c}°C, Wind: {match_cond.wind_speed_kmh} km/h, Humidity: {match_cond.humidity_percent}%)
- Formation: {constraints.formation}
- Budget Limit: £{constraints.total_budget}m
- Max players per club: {constraints.max_players_per_team}
- Strategy Weights: Form weight: {weights.form_weight}, Difficulty: {weights.difficulty_weight}, Weather Suitability: {weights.weather_suitability_weight}, Home Advantage: {weights.home_advantage_weight}

Relevant RAG Grounding Facts:
{rag_context_str}

Response Format Schema:
Your output must be a single stringified JSON object matching this structure:
{{
  "reply": "Your conversational answer, explaining your reasoning, analyzing player projections, quoting weather RAG rules, and/or providing tactful pushback.",
  "updatedMatchCondition": {{ // OPTIONAL. Any fields to update based on user request.
    "stadium": "stadium name",
    "weather_outlook": "Sunny" | "Rain" | "Wind" | "Snow",
    "temperature_c": 12.5,
    "wind_speed_kmh": 20,
    "humidity_percent": 65,
    "opponent_team": "opponent team name",
    "opponent_difficulty": 3,
    "is_home": true
  }},
  "updatedConstraints": {{ // OPTIONAL. Any fields to update based on user request.
    "total_budget": 100.0,
    "max_players_per_team": 3,
    "formation": "4-4-2"
  }},
  "updatedWeights": {{ // OPTIONAL. Any fields to update based on user request.
    "form_weight": 0.4,
    "difficulty_weight": 0.3,
    "weather_suitability_weight": 0.15,
    "home_advantage_weight": 0.15
  }}
}}"""

    # 3. Attempt to run with Gemini Client
    client = get_gemini_client()
    if client is not None:
        try:
            from google.genai import types
            
            # Format history for API consumption
            contents = []
            for item in history:
                role = "user" if item.get("role") == "user" else "model"
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=item.get("text", ""))]
                ))
            
            # Append latest query
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)]
            ))

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.2,
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "reply": {"type": "STRING"},
                        "updatedMatchCondition": {
                            "type": "OBJECT",
                            "properties": {
                                "stadium": {"type": "STRING"},
                                "weather_outlook": {"type": "STRING"},
                                "temperature_c": {"type": "NUMBER"},
                                "wind_speed_kmh": {"type": "NUMBER"},
                                "humidity_percent": {"type": "INTEGER"},
                                "opponent_team": {"type": "STRING"},
                                "opponent_difficulty": {"type": "INTEGER"},
                                "is_home": {"type": "BOOLEAN"}
                            }
                        },
                        "updatedConstraints": {
                            "type": "OBJECT",
                            "properties": {
                                "total_budget": {"type": "NUMBER"},
                                "max_players_per_team": {"type": "INTEGER"},
                                "formation": {"type": "STRING"}
                            }
                        },
                        "updatedWeights": {
                            "type": "OBJECT",
                            "properties": {
                                "form_weight": {"type": "NUMBER"},
                                "difficulty_weight": {"type": "NUMBER"},
                                "weather_suitability_weight": {"type": "NUMBER"},
                                "home_advantage_weight": {"type": "NUMBER"}
                            }
                        }
                    },
                    "required": ["reply"]
                }
            )

            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=contents,
                config=config
            )
            
            parsed = json.loads(response.text)
            return {
                "reply": parsed.get("reply", "I processed your request, let's keep refining the strategy."),
                "updatedMatchCondition": parsed.get("updatedMatchCondition"),
                "updatedConstraints": parsed.get("updatedConstraints"),
                "updatedWeights": parsed.get("updatedWeights"),
                "rag_insights": rag_insights
            }
        except Exception as e:
            # Fallback on parse failure
            return {
                "reply": f"Strategic calculations completed. However, live parsed context met an error: {str(e)}.",
                "rag_insights": rag_insights
            }

    # Standard offline heuristic model fallback if Gemini is missing or inactive
    reply_text = f"I've registered your advice: '{message}'."
    if "rain" in message.lower() or "wet" in message.lower():
        reply_text = "Forecast is transitioning to rain! Based on local RAG documents, expect heavy ground dampness. Boosting weather suitability ratings for Erling Haaland (+10%) and Cole Palmer (+5%)."
    elif "formation" in message.lower() or "3-5-2" in message.lower():
        reply_text = "Adjusting strategic layout structure. Formation initialized to 3-5-2 to secure midfield parity and ball control."

    return {
        "reply": reply_text,
        "updatedMatchCondition": None,
        "updatedConstraints": None,
        "updatedWeights": None,
        "rag_insights": rag_insights
    }
