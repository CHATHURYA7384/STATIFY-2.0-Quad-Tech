import re
from typing import List, Dict, Tuple, Optional
from .schemas import PlayerStats, MatchCondition, SecretRecipeWeights, OptimizedPlayerEvaluation

# ==========================================
# 1. COMPREHENSIVE MOCK DATABASE OF PLAYERS
# ==========================================
MOCK_PLAYERS = [
    # Goalkeepers (GK)
    PlayerStats(id="p1", name="Thibaut Courtois", team="Real Madrid", position="GK", cost=6.0, base_rating=89, form=8.2, goals=0, assists=0, clean_sheets=5, injury_status="Healthy"),
    PlayerStats(id="p2", name="Ederson Moraes", team="Manchester City", position="GK", cost=5.5, base_rating=86, form=7.5, goals=0, assists=1, clean_sheets=4, injury_status="Healthy"),
    PlayerStats(id="p3", name="David Raya", team="Arsenal", position="GK", cost=5.5, base_rating=85, form=8.8, goals=0, assists=0, clean_sheets=6, injury_status="Healthy"),
    PlayerStats(id="p4", name="Alisson Becker", team="Liverpool", position="GK", cost=5.8, base_rating=87, form=6.2, goals=0, assists=0, clean_sheets=3, injury_status="Doubtful"),

    # Defenders (DEF)
    PlayerStats(id="p5", name="William Saliba", team="Arsenal", position="DEF", cost=6.0, base_rating=88, form=8.9, goals=1, assists=0, clean_sheets=6, injury_status="Healthy"),
    PlayerStats(id="p6", name="Virgil van Dijk", team="Liverpool", position="DEF", cost=6.5, base_rating=89, form=8.5, goals=2, assists=1, clean_sheets=5, injury_status="Healthy"),
    PlayerStats(id="p7", name="Ruben Dias", team="Manchester City", position="DEF", cost=6.0, base_rating=87, form=7.2, goals=0, assists=0, clean_sheets=4, injury_status="Healthy"),
    PlayerStats(id="p8", name="Trent Alexander-Arnold", team="Liverpool", position="DEF", cost=7.0, base_rating=86, form=8.1, goals=1, assists=4, clean_sheets=3, injury_status="Healthy"),
    PlayerStats(id="p9", name="Josko Gvardiol", team="Manchester City", position="DEF", cost=6.0, base_rating=84, form=7.8, goals=2, assists=1, clean_sheets=4, injury_status="Healthy"),
    PlayerStats(id="p10", name="Gabriel Magalhaes", team="Arsenal", position="DEF", cost=6.0, base_rating=85, form=8.4, goals=3, assists=0, clean_sheets=6, injury_status="Healthy"),
    PlayerStats(id="p11", name="Achraf Hakimi", team="PSG", position="DEF", cost=6.2, base_rating=85, form=7.4, goals=1, assists=3, clean_sheets=4, injury_status="Healthy"),
    PlayerStats(id="p12", name="Kieran Trippier", team="Newcastle", position="DEF", cost=5.0, base_rating=81, form=5.8, goals=0, assists=2, clean_sheets=2, injury_status="Injured"),

    # Midfielders (MID)
    PlayerStats(id="p13", name="Kevin De Bruyne", team="Manchester City", position="MID", cost=10.5, base_rating=91, form=8.0, goals=3, assists=8, clean_sheets=4, injury_status="Healthy"),
    PlayerStats(id="p14", name="Jude Bellingham", team="Real Madrid", position="MID", cost=11.0, base_rating=90, form=8.7, goals=5, assists=5, clean_sheets=5, injury_status="Healthy"),
    PlayerStats(id="p15", name="Bukayo Saka", team="Arsenal", position="MID", cost=10.0, base_rating=89, form=9.2, goals=6, assists=7, clean_sheets=6, injury_status="Healthy"),
    PlayerStats(id="p16", name="Cole Palmer", team="Chelsea", position="MID", cost=9.5, base_rating=87, form=9.5, goals=8, assists=6, clean_sheets=2, injury_status="Healthy"),
    PlayerStats(id="p17", name="Martin Odegaard", team="Arsenal", position="MID", cost=8.5, base_rating=87, form=8.3, goals=3, assists=4, clean_sheets=6, injury_status="Healthy"),
    PlayerStats(id="p18", name="Mohamed Salah", team="Liverpool", position="MID", cost=12.5, base_rating=90, form=9.0, goals=10, assists=6, clean_sheets=5, injury_status="Healthy"),
    PlayerStats(id="p19", name="Rodri Hernandez", team="Manchester City", position="MID", cost=6.5, base_rating=90, form=8.6, goals=2, assists=3, clean_sheets=4, injury_status="Healthy"),
    PlayerStats(id="p20", name="Son Heung-min", team="Tottenham", position="MID", cost=9.0, base_rating=86, form=7.8, goals=5, assists=3, clean_sheets=2, injury_status="Healthy"),
    PlayerStats(id="p21", name="Florian Wirtz", team="Bayer Leverkusen", position="MID", cost=8.0, base_rating=86, form=8.8, goals=4, assists=5, clean_sheets=3, injury_status="Healthy"),

    # Forwards (FWD)
    PlayerStats(id="p22", name="Erling Haaland", team="Manchester City", position="FWD", cost=14.0, base_rating=92, form=9.4, goals=14, assists=1, clean_sheets=4, injury_status="Healthy"),
    PlayerStats(id="p23", name="Kylian Mbappe", team="Real Madrid", position="FWD", cost=13.5, base_rating=91, form=8.6, goals=9, assists=3, clean_sheets=5, injury_status="Healthy"),
    PlayerStats(id="p24", name="Harry Kane", team="Bayern Munich", position="FWD", cost=12.5, base_rating=90, form=9.1, goals=12, assists=4, clean_sheets=3, injury_status="Healthy"),
    PlayerStats(id="p25", name="Ollie Watkins", team="Aston Villa", position="FWD", cost=8.5, base_rating=84, form=7.9, goals=6, assists=3, clean_sheets=2, injury_status="Healthy"),
    PlayerStats(id="p26", name="Alexander Isak", team="Newcastle", position="FWD", cost=8.0, base_rating=83, form=8.0, goals=5, assists=2, clean_sheets=2, injury_status="Healthy"),
    PlayerStats(id="p27", name="Vinicius Junior", team="Real Madrid", position="FWD", cost=12.0, base_rating=89, form=9.3, goals=8, assists=5, clean_sheets=5, injury_status="Healthy"),
    PlayerStats(id="p28", name="Lautaro Martinez", team="Inter Milan", position="FWD", cost=9.0, base_rating=85, form=7.4, goals=5, assists=1, clean_sheets=3, injury_status="Doubtful")
]

# ==========================================
# 2. MOCK RAG TEXTUAL DATABASE & VECTOR LOOKUP
# ==========================================
MOCK_RAG_CORPUS = [
    {
        "tags": ["haaland", "city", "rain", "wet", "pitch"], 
        "text": "Erling Haaland excels in heavy rain and wet conditions. His immense physical build and powerful stride allow him to dominate defenders on water-logged turf. Expected output increases by 10% in heavy rain."
    },
    {
        "tags": ["arsenal", "saliba", "gabriel", "wind", "defenders"], 
        "text": "Arsenal's defensive duo William Saliba and Gabriel Magalhaes are exceptionally stable in high-wind conditions due to highly organized aerial drill structures. Wind speed does not penalize their clean sheet probability."
    },
    {
        "tags": ["bellingham", "humidity", "fatigue"], 
        "text": "Jude Bellingham shows minor physical sensitivity in extreme humidity (>85%), causing slightly earlier substitution and slight drop in expected assist multipliers."
    },
    {
        "tags": ["salah", "liverpool", "dry", "sunny", "pitch"], 
        "text": "Mohamed Salah thrives on dry, high-speed grass pitches at Anfield or under sunny skies. Clean ball rolls elevate his close-control dribbling, increasing expected goal ratings by 8%."
    },
    {
        "tags": ["courtois", "madrid", "home", "goalkeeper"], 
        "text": "Thibaut Courtois maintains an outstanding 82% clean-sheet ratio during home fixtures under moderate weather. High defense organization benefits from home crowd support."
    },
    {
        "tags": ["palmer", "chelsea", "rain", "slippery", "pitch"], 
        "text": "Cole Palmer's signature penalty taking and long-range shooting are highly effective on wet, slippery pitches. Goalkeepers struggle with his wet-ball trajectory, raising expected goals by 5%."
    },
    {
        "tags": ["saka", "wind", "weather"], 
        "text": "Bukayo Saka's winger dynamics are slightly hampered by heavy winds (>30 kmh) due to air resistance on looping crosses. Midfield control values scale down moderately."
    },
    {
        "tags": ["kane", "temperature", "cold", "weather"], 
        "text": "Harry Kane is a cold-weather specialist. His mechanical finishing and target-man drops are unaffected by temperature drops down to freezing. Performance metrics scale up by 5% in temperatures below 8°C."
    },
    {
        "tags": ["alisson", "injury", "out"],
        "text": "Injury update: Alisson Becker remains doubtful with a hamstring strain. Medical logs suggest a substantial 65% reduction in dynamic agility, limiting his expected clean sheet ratio."
    },
    {
        "tags": ["trippier", "injury", "out"],
        "text": "Injury update: Kieran Trippier is completely OUT with a calf fracture. He will record 0 expected performance points for this round."
    }
]

def fetch_players() -> List[PlayerStats]:
    """Retrieve all raw player stats from the database."""
    return MOCK_PLAYERS

def retrieve_rag_context(query: str) -> List[str]:
    """
    Mock RAG Vector Database Lookup.
    Normalizes the query text, scans the RAG corpus, calculates matching relevance scores
    based on tag overlaps and textual presence, and returns the top 3 most relevant snippets.
    """
    words = re.findall(r'\w+', query.lower())
    matched_texts = []
    
    for doc in MOCK_RAG_CORPUS:
        score = 0
        # Check tag matches (high weight match)
        for tag in doc["tags"]:
            if tag in words:
                score += 3
        # Check text content matches (lower weight match)
        for word in words:
            if word in doc["text"].lower():
                score += 1
        
        if score > 0:
            matched_texts.append((score, doc["text"]))
            
    # Sort by relevance score descending
    matched_texts.sort(key=lambda x: x[0], reverse=True)
    return [text for _, text in matched_texts[:3]]

# ==========================================
# 3. SECRET RECIPE ALGORITHM (WEIGHTED MATHS)
# ==========================================
def compute_player_evaluation(
    player: PlayerStats,
    match_cond: MatchCondition,
    weights: SecretRecipeWeights = SecretRecipeWeights(),
    rag_insights: Optional[List[str]] = None
) -> OptimizedPlayerEvaluation:
    """
    The 'Secret Recipe' calculation.
    Computes a weighted value score and predicted points based on:
    - Base Ability score (norm_base)
    - Recent Form rating (form_weight)
    - Matchup difficulty multiplier (difficulty_weight)
    - Weather outlook match (weather_suitability_weight)
    - Home ground multiplier (home_advantage_weight)
    - Dynamic RAG-based modifiers (e.g. Injury updates, specific pitch reports)
    """
    weather_multiplier = 1.0
    difficulty_multiplier = 1.0
    home_multiplier = 1.0
    dynamic_rag_multiplier = 1.0

    # 1. Weather Suitability Multipliers
    if match_cond.weather_outlook == "Rain":
        if player.position == "FWD" and player.id == "p22":  # Haaland wet pitch boost
            weather_multiplier = 1.10
        elif player.position == "MID" and player.id == "p16":  # Cole Palmer slippery ball shoot boost
            weather_multiplier = 1.05
        elif player.position == "GK":
            weather_multiplier = 0.92  # Slippery gloves penalty for GKs
            
    elif match_cond.weather_outlook == "Wind":
        if player.position == "DEF" and player.team == "Arsenal":  # Saliba/Gabriel aerial organization boost
            weather_multiplier = 1.05
        elif player.position == "MID" and player.id == "p15":  # Saka wind resistance penalty
            weather_multiplier = 0.95
        elif player.position == "GK":
            weather_multiplier = 0.95  # Aerodynamic variance penalty for GKs

    # Temperature constraints
    if match_cond.temperature_c <= 8.0 and player.id == "p24":  # Harry Kane cold-weather specialist
        weather_multiplier *= 1.05

    # Humidity constraints
    if match_cond.humidity_percent >= 85 and player.id == "p14":  # Bellingham high humidity fatigue
        weather_multiplier *= 0.95

    # 2. Opponent Difficulty Multiplier
    # Maps difficulty 1 (very easy) to 1.30 down to 5 (very hard) to 0.70
    difficulty_multiplier = 1.30 - (match_cond.opponent_difficulty - 1) * 0.15

    # 3. Home Advantage Multiplier
    if match_cond.is_home:
        home_multiplier = 1.15
        if player.position == "GK" and player.id == "p1":  # Thibaut Courtois home organization
            home_multiplier = 1.20
    else:
        home_multiplier = 0.90

    # 4. Dynamic RAG-Grounded Alterations
    # If RAG insights are active, search for player-specific updates
    rag_injured_override = False
    rag_doubtful_override = False
    
    if rag_insights:
        player_last_name = player.name.split()[-1].lower()
        player_full_name = player.name.lower()
        
        for insight in rag_insights:
            insight_lower = insight.lower()
            # If this insight mentions this player
            if player_last_name in insight_lower or player_full_name in insight_lower:
                # 1. Injury Status
                if "injury" in insight_lower or "out" in insight_lower or "fracture" in insight_lower:
                    if "doubtful" in insight_lower:
                        rag_doubtful_override = True
                    else:
                        rag_injured_override = True
                
                # 2. Specific Weather/Performance boosts
                if "excel" in insight_lower or "boost" in insight_lower or "thrive" in insight_lower:
                    dynamic_rag_multiplier *= 1.08
                if "hamper" in insight_lower or "penalty" in insight_lower or "sensitivity" in insight_lower:
                    dynamic_rag_multiplier *= 0.92

    # 5. Math Core Scoring Model
    norm_base = player.base_rating / 10.0
    form_factor = player.form
    
    # Blended performance capability
    ability_score = (norm_base * (1.0 - weights.form_weight)) + (form_factor * weights.form_weight)
    
    # Combined multiplier blend based on recipe parameters
    multiplier_blend = (
        (difficulty_multiplier * weights.difficulty_weight) +
        (weather_multiplier * weights.weather_suitability_weight) +
        (home_multiplier * weights.home_advantage_weight)
    )
    
    calculated_value_score = ability_score * multiplier_blend * dynamic_rag_multiplier * 10.0
    
    # Expected fantasy points baseline
    expected_points = calculated_value_score * 0.75

    # Apply strict health penalty rules (grounded in RAG + active metadata)
    if player.injury_status == "Injured" or rag_injured_override:
        expected_points = 0.0
    elif player.injury_status == "Doubtful" or rag_doubtful_override:
        expected_points *= 0.35  # Severe penalty for doubted fitness

    return OptimizedPlayerEvaluation(
        player=player,
        calculated_value_score=round(calculated_value_score, 2),
        weather_multiplier=round(weather_multiplier * dynamic_rag_multiplier, 2),
        difficulty_multiplier=round(difficulty_multiplier, 2),
        home_multiplier=round(home_multiplier, 2),
        expected_points=round(expected_points, 1)
    )

# ==========================================
# 4. ROSTER KNAPSACK OPTIMIZATION SOLVER
# ==========================================
def optimize_roster(
    match_cond: MatchCondition,
    constraints: StrategyConstraints,
    weights: SecretRecipeWeights = SecretRecipeWeights(),
    rag_insights: Optional[List[str]] = None
) -> Tuple[List[OptimizedPlayerEvaluation], float, float]:
    """
    Roster Optimizer.
    Solves a multi-constrained knapsack optimization problem to build the highest expected point XI:
    - Positional quotas determined strictly by formation (e.g. 4-4-2 -> 1 GK, 4 DEF, 4 MID, 2 FWD)
    - Total budget threshold (total_budget)
    - Maximum allowable players per club (max_players_per_team)
    - Fallback backfilling for budget-dense formations
    """
    # Parse formation (e.g., '4-4-2' -> 4 defenders, 4 midfielders, 2 forwards)
    try:
        parts = [int(x) for x in constraints.formation.split('-')]
        num_def, num_mid, num_fwd = parts[0], parts[1], parts[2]
    except Exception:
        num_def, num_mid, num_fwd = 4, 4, 2  # default 4-4-2
        
    required_counts = {
        "GK": 1,
        "DEF": num_def,
        "MID": num_mid,
        "FWD": num_fwd
    }
    
    # 1. Evaluate all players with dynamic recipe weights & active RAG snippets
    all_players = fetch_players()
    evaluated_players = [
        compute_player_evaluation(p, match_cond, weights, rag_insights)
        for p in all_players
    ]
    
    # Sort strictly by projected points descending to run greedy knapsack allocation
    evaluated_players.sort(key=lambda ev: ev.expected_points, reverse=True)
    
    # Knapsack tracking structures
    selected_players: List[OptimizedPlayerEvaluation] = []
    team_counts: Dict[str, int] = {}
    current_cost = 0.0
    
    positional_selections = {pos: [] for pos in required_counts.keys()}
    
    # Greedy pass allocating slots to highest projection players
    for ev in evaluated_players:
        pos = ev.player.position
        team = ev.player.team
        cost = ev.player.cost
        
        # Guard rules
        if ev.player.injury_status == "Injured" or ev.expected_points == 0.0:
            continue
            
        # Positional limit check
        if len(positional_selections[pos]) >= required_counts[pos]:
            continue
            
        # Per-club roster concentration limit check
        tentative_team_count = team_counts.get(team, 0) + 1
        if tentative_team_count > constraints.max_players_per_team:
            continue
            
        # Budget cap limit check
        if current_cost + cost > constraints.total_budget:
            continue
            
        # Lock selection
        positional_selections[pos].append(ev)
        team_counts[team] = tentative_team_count
        current_cost += cost
        
    # Combine selected players
    roster_list = []
    for pos in ["GK", "DEF", "MID", "FWD"]:
        roster_list.extend(positional_selections[pos])
        
    # BACKFILL PHASE: If the budget cap was breached and slots remain unfulfilled
    unfilled_positions = []
    for pos, count in required_counts.items():
        diff = count - len(positional_selections[pos])
        if diff > 0:
            unfilled_positions.append((pos, diff))
            
    if unfilled_positions:
        for pos, count in unfilled_positions:
            # Gather cheaper fit alternatives to prevent a lock or empty slot
            candidates = [
                ev for ev in evaluated_players
                if ev.player.position == pos 
                and ev.player.injury_status != "Injured"
                and ev.expected_points > 0.0
                and ev not in roster_list
            ]
            candidates.sort(key=lambda x: x.player.cost)  # prioritize cheapest options
            
            for cand in candidates:
                if len(positional_selections[pos]) < required_counts[pos]:
                    roster_list.append(cand)
                    positional_selections[pos].append(cand)
                    current_cost += cand.player.cost
                    
    # Sum results and format precisely
    total_cost = sum(ev.player.cost for ev in roster_list)
    total_expected_points = sum(ev.expected_points for ev in roster_list)
    
    return roster_list, round(total_cost, 2), round(total_expected_points, 1)
