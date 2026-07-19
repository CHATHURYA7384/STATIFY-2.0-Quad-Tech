import { GoogleGenAI, Type } from "@google/genai";
import { MatchCondition, StrategyConstraints, SecretRecipeWeights } from "./schemas.js";
import { retrieve_rag_context } from "./tools.js";

// Lazy-load Gemini instance to prevent startup crash if API key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in user secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export interface AgentRequest {
  message: string;
  history: Array<{ role: "user" | "model"; text: string }>;
  matchCondition: MatchCondition;
  constraints: StrategyConstraints;
  weights: SecretRecipeWeights;
}

export interface AgentResponse {
  reply: string;
  updatedMatchCondition?: Partial<MatchCondition>;
  updatedConstraints?: Partial<StrategyConstraints>;
  updatedWeights?: Partial<SecretRecipeWeights>;
  ragInsights: string[];
}

export async function runAgentOrchestrator(req: AgentRequest): Promise<AgentResponse> {
  const ai = getGeminiClient();

  // 1. Fetch RAG context based on current user query
  const ragInsights = retrieve_rag_context(req.message);
  const ragContextString = ragInsights.length > 0 
    ? ragInsights.map((text, idx) => `[Fact ${idx + 1}]: ${text}`).join("\n")
    : "No highly matching historical or weather-adaptive player facts found.";

  // 2. Build system instructions
  const systemInstruction = `You are "Statify AI v2.0", the dynamic AI Fantasy Sports Strategist and veteran team manager.
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
- Match Venue: ${req.matchCondition.stadium}
- Opponent: ${req.matchCondition.opponent_team} (Difficulty: ${req.matchCondition.opponent_difficulty}/5)
- Weather Outlook: ${req.matchCondition.weather_outlook} (${req.matchCondition.temperature_c}°C, Wind: ${req.matchCondition.wind_speed_kmh} km/h, Humidity: ${req.matchCondition.humidity_percent}%)
- Formation: ${req.constraints.formation}
- Budget Limit: £${req.constraints.total_budget}m
- Max players per club: ${req.constraints.max_players_per_team}
- Strategy Weights: Form weight: ${req.weights.form_weight}, Difficulty: ${req.weights.difficulty_weight}, Weather Suitability: ${req.weights.weather_suitability_weight}, Home Advantage: ${req.weights.home_advantage_weight}

Relevant RAG Grounding Facts:
${ragContextString}

Response Format Schema:
Your output must be a single stringified JSON object matching this structure:
{
  "reply": "Your conversational answer, explaining your reasoning, analyzing player projections, quoting weather RAG rules, and/or providing tactful pushback.",
  "updatedMatchCondition": { // OPTIONAL. Any fields to update based on user request.
    "stadium": "stadium name",
    "weather_outlook": "Sunny" | "Rain" | "Wind" | "Snow",
    "temperature_c": 12.5,
    "wind_speed_kmh": 20,
    "humidity_percent": 65,
    "opponent_team": "opponent team name",
    "opponent_difficulty": 3,
    "is_home": true
  },
  "updatedConstraints": { // OPTIONAL. Any fields to update based on user request.
    "total_budget": 100.0,
    "max_players_per_team": 3,
    "formation": "4-4-2"
  },
  "updatedWeights": { // OPTIONAL. Any fields to update based on user request.
    "form_weight": 0.4,
    "difficulty_weight": 0.3,
    "weather_suitability_weight": 0.15,
    "home_advantage_weight": 0.15
  }
}`;

  // 3. Prepare Chat content with history
  const contents = req.history.map(item => ({
    role: item.role,
    parts: [{ text: item.text }]
  }));

  // Append latest user message
  contents.push({
    role: "user",
    parts: [{ text: req.message }]
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { 
              type: Type.STRING, 
              description: "The dialogue reply to the user, incorporating strategic insights and RAG facts." 
            },
            updatedMatchCondition: {
              type: Type.OBJECT,
              properties: {
                stadium: { type: Type.STRING },
                weather_outlook: { type: Type.STRING, enum: ["Sunny", "Rain", "Wind", "Snow"] },
                temperature_c: { type: Type.NUMBER },
                wind_speed_kmh: { type: Type.NUMBER },
                humidity_percent: { type: Type.INTEGER },
                opponent_team: { type: Type.STRING },
                opponent_difficulty: { type: Type.INTEGER },
                is_home: { type: Type.BOOLEAN }
              }
            },
            updatedConstraints: {
              type: Type.OBJECT,
              properties: {
                total_budget: { type: Type.NUMBER },
                max_players_per_team: { type: Type.INTEGER },
                formation: { type: Type.STRING }
              }
            },
            updatedWeights: {
              type: Type.OBJECT,
              properties: {
                form_weight: { type: Type.NUMBER },
                difficulty_weight: { type: Type.NUMBER },
                weather_suitability_weight: { type: Type.NUMBER },
                home_advantage_weight: { type: Type.NUMBER }
              }
            }
          },
          required: ["reply"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    return {
      reply: parsedResponse.reply || "I encountered an error organizing the strategy details. Let's try again.",
      updatedMatchCondition: parsedResponse.updatedMatchCondition,
      updatedConstraints: parsedResponse.updatedConstraints,
      updatedWeights: parsedResponse.updatedWeights,
      ragInsights
    };

  } catch (error: any) {
    console.error("Gemini Agent Execution Failed:", error);
    return {
      reply: `Connection error or key missing: ${error.message || error}. I will use local defaults to guide your strategy.`,
      ragInsights
    };
  }
}
