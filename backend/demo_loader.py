import json
import os
import random

DEMO_FOLDER = os.path.join(os.path.dirname(__file__), "demo_data")


def load_demo_invoice():
    files = [
        f for f in os.listdir(DEMO_FOLDER)
        if f.endswith(".json")
    ]

    if not files:
        raise RuntimeError("No demo JSON files found.")

    chosen = random.choice(files)

    with open(os.path.join(DEMO_FOLDER, chosen), "r", encoding="utf-8") as f:
        data = json.load(f)

    data["demo_mode"] = True

    return data