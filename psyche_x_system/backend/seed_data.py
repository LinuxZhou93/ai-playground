import requests
import json

API_BASE = "http://127.0.0.1:8000"

def init_data():
    print("⏳ Initializing Psyche-X Data...")
    
    # 1. Initialize Achievements
    try:
        res = requests.post(f"{API_BASE}/admin/achievements/init")
        if res.status_code == 200:
            print(f"✅ Achievements Initialized: {res.json()['created']}")
        else:
            print(f"❌ Failed to init achievements: {res.text}")
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")

    # 2. Initialize Articles (Tech-Talent Content)
    articles = [
        {
            "title": "Pathway to Tech-Talent: How Cognitive Training Helps",
            "category": "Neuroscience",
            "author": "Dr. Sarah Chen",
            "content": "# Pathway to Tech-Talent\n\nBecoming a 'Science & Technology Gifted Student' (科技特长生) requires more than just coding skills. It demands **Fluid Intelligence (Gf)**.\n\n## The Core Competency\nAlgorithms competitions (like NOIP/CSP) test your ability to hold multiple variables in working memory while processing complex logic. This is exactly what N-Back training enhances."
        },
        {
            "title": "Programming & The Brain: The N-Back Connection",
            "category": "Training Tips",
            "author": "Coach Mike",
            "content": "# Programming & The Brain\n\nWhen debugging complex code, your brain acts like a compile-time holding buffer.\n\n* **Variable Tracking**: Keeping track of `i`, `j`, and `temp` is a Working Memory task.\n* **Recursion**: Visualizing stack depth is spatial visualization.\n\nDual N-Back trains these specific circuits."
        },
        {
            "title": "Stroop Effect in Competitive Gaming",
            "category": "Research",
            "author": "Research Team",
            "content": "# Stroop & E-Sports\n\nHigh-level competitive gamers (and coders!) need exceptional **Inhibitory Control**.\n\nThe ability to ignore a flashing notification while focusing on a critical syntax error is the definition of the Stroop test in real life."
        }
    ]

    print("⏳ seeding articles...")
    for art in articles:
        try:
            # First check if exists (simplified checks)
            # Actually we'll just try to create and ignore if duplicate logic isn't perfect, 
            # but our backend doesn't dedup articles yet. 
            # For this script we will just fire away for the demo.
            res = requests.post(f"{API_BASE}/articles", json=art)
            if res.status_code == 200:
                 print(f"   + Created: {art['title']}")
        except Exception as e:
            print(f"   - Error: {e}")

    print("✨ Initialization Complete!")

if __name__ == "__main__":
    init_data()
