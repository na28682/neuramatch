"""
match.py
Takes a mood string as a command-line argument, returns JSON with matches + theme.
Called from Node via child_process. Also writes results into Supabase matches table.
"""

import sys
import json
import os
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("neuramatch")
model = SentenceTransformer("all-MiniLM-L6-v2")
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


def mood_to_theme(mood_text):
    mood_lower = mood_text.lower()

    warm_words = ["happy", "calm", "creative", "relaxed", "warm", "content", "peaceful"]
    cool_words = ["sad", "anxious", "stressed", "cold", "tired", "down"]
    vibrant_words = ["excited", "energetic", "motivated", "pumped", "thrilled"]

    if any(w in mood_lower for w in vibrant_words):
        return "vibrant"
    if any(w in mood_lower for w in warm_words):
        return "warm"
    if any(w in mood_lower for w in cool_words):
        return "cool"
    return "neutral"


def main():
    mood_text = sys.argv[1] if len(sys.argv) > 1 else ""

    if not mood_text:
        print(json.dumps({"error": "mood text is required"}))
        sys.exit(1)

    vector = model.encode(mood_text).tolist()

    results = index.query(vector=vector, top_k=5, include_metadata=True)

    match_ids = [m.id for m in results.matches]
    scores = {m.id: m.score for m in results.matches}

    profiles = []
    if match_ids:
        response = supabase.table("user_profiles").select("*").in_("user_id", match_ids).execute()
        profiles = response.data

    for p in profiles:
        p["match_score"] = scores.get(p["user_id"], 0)

    profiles.sort(key=lambda x: x["match_score"], reverse=True)

    output = {
        "mood": mood_text,
        "theme": mood_to_theme(mood_text),
        "matches": profiles
    }

    for p in profiles:
        supabase.table("matches").insert({
            "user_id": p["user_id"],
            "matched_entity_type": "user_profile",
            "matched_entity_id": p["user_id"],
            "score": p["match_score"],
            "reason_text": f"Matched based on mood: {mood_text}",
        }).execute()

    print(json.dumps(output))


if __name__ == "__main__":
    main()
