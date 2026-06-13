from supabase import create_client
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("neuramatch")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Pull all users with their psychology data
profiles = supabase.table("user_profiles").select("*").execute().data
psychology = supabase.table("user_psychology").select("*").execute().data

# Map psychology by user_id for easy lookup
psych_map = {p["user_id"]: p for p in psychology}

vectors = []
for profile in profiles:
    user_id = profile["user_id"]
    psych = psych_map.get(user_id)
    if not psych:
        continue

    # Build a text description of the user
    text = f"{psych['archetype']} person who values {psych['dominant_values']}, {psych['cognitive_style']} thinker, motivated by {psych['motivation_type']}"

    vector = model.encode(text).tolist()
    vectors.append({
        "id": user_id,
        "values": vector,
        "metadata": {
            "display_name": profile["display_name"],
            "archetype": psych["archetype"],
            "dominant_values": psych["dominant_values"],
            "cognitive_style": psych["cognitive_style"],
            "motivation_type": psych["motivation_type"],
        }
    })

# Upsert in batches of 100
batch_size = 100
for i in range(0, len(vectors), batch_size):
    batch = vectors[i:i+batch_size]
    index.upsert(vectors=batch)
    print(f"Upserted {i + len(batch)} users into Pinecone...")

print("ETL processed!")
