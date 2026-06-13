from supabase import create_client
from faker import Faker
from dotenv import load_dotenv
import os
import uuid
import random

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
fake = Faker()

archetypes = ["creator", "explorer", "caregiver", "achiever", "rebel", "sage", "innocent", "lover"]
cognitive_styles = ["analytical", "intuitive", "creative", "practical"]
motivation_types = ["intrinsic", "extrinsic", "social", "achievement"]
dominant_values = ["freedom", "security", "connection", "growth", "success", "creativity", "balance", "adventure"]

for i in range(500):
    user_id = str(uuid.uuid4())

    supabase.table("user_criteria").insert({
        "id": user_id,
        "email": fake.email(),
        "status": "active",
        "auth token": "",
    }).execute()

    supabase.table("user_profiles").insert({
        "user_id": user_id,
        "display_name": fake.name(),
        "age": random.randint(18, 45),
        "location": fake.city(),
        "onboarding_complete": True,
    }).execute()

    supabase.table("user_psychology").insert({
        "user_id": user_id,
        "archetype": random.choice(archetypes),
        "dominant_values": random.choice(dominant_values),
        "cognitive_style": random.choice(cognitive_styles),
        "motivation_type": random.choice(motivation_types),
    }).execute()

    supabase.table("user_visual_data").insert({
        "user_id": user_id,
        "archetype_tag": random.choice(archetypes),
        "energy_score": round(random.uniform(0.1, 1.0), 2),
        "psyc_to_image": random.choice(["warm", "cool", "neutral", "vibrant", "muted"]),
    }).execute()

    if i % 50 == 0:
        print(f"Inserted {i} users...")

print("All 500 users inserted!")
