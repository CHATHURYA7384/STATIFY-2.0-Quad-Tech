# STATIFY 2.0 - Dynamic Fantasy Sports Strategist

STATIFY 2.0 is an advanced, weather-adaptive, RAG-grounded Fantasy Sports Lineup Optimizer and AI Strategist. Designed for elite fantasy league managers, it merges mathematical optimization (multi-constrained knapsack formulation) with real-time semantic context from a local vector Retrieval-Augmented Generation (RAG) database. 

Managers can chat naturally with a supportive yet highly strategic veteran AI Strategist, modify team rules, view real-time RAG grounding snippets (such as injury updates or pitch conditions), and visualize the resulting mathematically perfect 11-player squad on an interactive tactical football pitch or rich tabular database.

---

## 🚀 Live Application URL

You can access the live deployed application here:
* **Production Deployment:** [PASTE_YOUR_LIVE_URL_HERE]
* **Development Playground:** [PASTE_YOUR_DEV_URL_HERE]

---

## 🧠 Architectural Approach

STATIFY 2.0 uses a highly modular full-stack architecture built on a **React (TypeScript) / Vite** frontend and an **Express.js & FastAPI (Python)** backend pipeline.

```
       +--------------------------------------------+
       |             React / Vite UI                |
       |  (Interactive Pitch / Tabular Chat Panel)   |
       +---------------------+----------------------+
                             | 
                             v  [JSON REST API]
       +--------------------------------------------+
       |          Node.js / Express Server          |
       |    (API routing & static asset server)     |
       +---------------------+----------------------+
                             |
                             v  [Dual Engine Integration]
       +--------------------------------------------+
       |             FastAPI Backend                |
       +---------------------+----------------------+
                             |
        +--------------------+---------------------+
        |                                          |
        v [RAG Retrieval Pipeline]                 v [Solver Logic]
+-------+-----------------------+          +-------+-----------------------+
|  Local Vector Database Mimic  |          |    Multi-Constrained Solver   |
| (Weather, Pitch & Injury Logs)|          |  (Greedy Knapsack Algorithm)  |
+-------+-----------------------+          +-------+-----------------------+
        |                                          |
        +--------------------+---------------------+
                             |
                             v
       +--------------------------------------------+
       |             Google Gemini LLM              |
       |  (Veteran strategist persona & reasoning)   |
       +--------------------------------------------+
```

### 1. The RAG Retrieval Pipeline
At the core of the strategist is a mock-vector document store containing historical, stadium-specific, meteorological, and medical facts (e.g., Alisson Becker's hamstring logs, William Saliba's aerodynamic stability in extreme wind, and Erling Haaland's 10% expected performance lift in heavy rain). When a manager sends a message:
* The system tokenizes the query text.
* A scoring function matches keywords against semantic document tags and text contents.
* The top 3 matching snippets are extracted and injected into the Gemini API context window as high-priority grounding facts.

### 2. The 'Secret Recipe' Multiplier Core
Every player starts with a base rating and a recent form score. The "Secret Recipe" combines these with four custom strategic weights adjusted live in the UI:
1. **Form Weight**: Scales importance of recent match points.
2. **Opponent Difficulty Weight**: Adjusts expectations based on opponent team rating (1 to 5).
3. **Weather Suitability Weight**: Matches player profiles (e.g., cold-weather specialists, rain boosters) against live weather outlooks.
4. **Home Advantage Weight**: Integrates stadium home ground factors.

$$\text{Value Score} = \left(\text{Base Rating} \times (1 - W_{\text{form}}) + \text{Form} \times W_{\text{form}}\right) \times \text{Multiplier Blend} \times \text{RAG Overrides}$$

*Dynamic Overrides:* If the retrieved RAG context contains injury alerts ("Kieran Trippier is OUT with a calf fracture"), the player's projection is slashed to `0.0`. If they are flagged as "Doubtful", a 65% performance penalty is applied.

### 3. The Knapsack Roster Optimization Solver
Once player ratings are dynamically calculated, the team-building optimization engine is triggered. It models a complex knapsack solver to choose the mathematically optimal XI:
* **Positional Constraints**: Matches active team formation strictly (e.g., `4-4-2` requires exactly 1 GK, 4 DEF, 4 MID, 2 FWD).
* **Budget Limits**: Prevents total player costs from exceeding the team budget (e.g., £100.0m).
* **Concentration Limits**: Prevents selecting more than 3 players from a single real-world club.
* **Backfill Phase**: If the budget is violated by top-tier selections, a secondary backfill phase scans cheaper fit alternatives, ensuring the lineup is fully populated with 11 fit, maximum-yield players.

---

## 🛠️ Step-by-Step Setup & Local Execution

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+) or **Bun** (for frontend package running)
* **Google Gemini API Key** (obtained from Google AI Studio)

---

### Backend Setup (FastAPI Python Service)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your environment variables:**
   Create a `.env` file in the `backend/` directory (or export variables globally):
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```

5. **Start the FastAPI Dev Server:**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The interactive Swagger documentation will be available at `http://localhost:8000/docs`.*

---

### Frontend Setup (Vite + Express Orchestrator)

1. **Navigate to the root directory:**
   ```bash
   cd ..
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and provide your secret keys:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` into `.env`.

4. **Start the dev server (Vite + Node Server Express pipeline):**
   ```bash
   npm run dev
   ```
   *The application will launch on `http://localhost:3000`.*

---

## 🎨 Technology Stack
* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion (motion/react).
* **Core API Node Server**: Node.js, Express, TypeScript (dynamic bundler proxy).
* **AI Orchestration**: Google Gemini API SDK (`google-genai`), Retrieval-Augmented Generation (RAG).
* **Optimization Service**: Python FastAPI, multi-constrained custom knapsack algorithms.
