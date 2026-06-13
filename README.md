# neuramatch

A mood-based discovery engine that matches users to people, jobs, articles and products based on their current emotional state. The UI adapts its visual theme (warm, cool, vibrant, neutral) to match the user's energy.

---

## Project Structure

```
neuramatch/
├── .env                  # API keys (never commit this)
├── venv/                 # Python virtual environment
├── create_index.py       # Creates Pinecone index (run once)
├── seed_users.py         # Seeds 500 fake users into Supabase (run once)
├── etl.py                # ETL: embeds Supabase users into Pinecone (run once, or on new data)
├── server/
│   ├── index.js          # Express API server (port 8080)
│   ├── matchService.js   # Calls match.py via child_process
│   ├── match.py          # Python matching pipeline (embedding + Pinecone + Supabase)
│   └── package.json
└── client-app/
    └── src/
        ├── App.jsx           # Root React component + results dashboard
        ├── Onboarding.jsx    # Fade-in sequence + mood input bubble
        └── onboarding.css    # Styles
```

---

## Tech Stack

- **Pinecone** — vector database for semantic similarity search (384 dimensions, cosine, AWS us-east-1)
- **Supabase** — PostgreSQL database for user profiles, psychology, matches
- **sentence-transformers** — free local embedding model (`all-MiniLM-L6-v2`)
- **Express.js** — API server
- **React + Vite** — frontend

---

## Setup

### 1. Python environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install pinecone supabase sentence-transformers faker python-dotenv flask
```

### 2. Environment variables

Create a `.env` file in the root:

```
PINECONE_API_KEY=your_pinecone_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

### 3. One-time setup (already done if you followed the build steps)

```bash
python3 create_index.py     # creates Pinecone index
python3 seed_users.py       # seeds 500 fake users into Supabase
python3 etl.py              # embeds users into Pinecone
```

### 4. Run the server

```bash
cd server
npm install
node index.js
# Server runs on http://localhost:8080
```

### 5. Run the client

```bash
cd client-app
npm run dev
# Client runs on http://localhost:5173
```

---

## How It Works

1. User opens the app — sees a slow fade-in onboarding: "hello." → "who are you, really?" → "are you ready?"
2. User types their mood into the bubble input (e.g. "I feel calm and creative")
3. React sends `POST /api/match` to Express with the mood text
4. Express calls `match.py` via child_process:
   - Encodes mood text into a 384-dim vector using `all-MiniLM-L6-v2`
   - Queries Pinecone for top 5 closest user vectors
   - Fetches full profiles from Supabase `user_profiles`
   - Writes match results to Supabase `matches` table
   - Returns matches + visual theme (warm/cool/vibrant/neutral)
5. React renders the results with a mood-appropriate background color

---

## Supabase Tables Used

- `user_criteria` — auth/email/status (root table, others FK to this)
- `user_profiles` — display_name, age, location
- `user_psychology` — archetype, dominant_values, cognitive_style, motivation_type
- `user_visual_data` — energy_score, psyc_to_image, archetype_tag
- `matches` — match results written after each query

---

## Next Steps

- Add real user authentication (Supabase Auth)
- Add face/expression analysis via webcam + vision model
- Build full dashboard with jobs, articles, products alongside user matches
- Add `user_sessions` and `behavioral_signals` tracking
- Deploy: Express to Railway/Render, React to Vercel/Netlify
<img width="2414" height="1250" alt="supabase-schema-oguuownnrmxdcfjxgdll" src="https://github.com/user-attachments/assets/3d914c90-bf78-4130-82f2-2962761206f2" />
