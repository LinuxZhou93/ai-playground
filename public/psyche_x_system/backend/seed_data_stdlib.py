import urllib.request
import json

API_BASE = "http://127.0.0.1:8000"

def post_json(url, data):
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    jsondata = json.dumps(data).encode('utf-8')
    req.add_header('Content-Length', len(jsondata))
    response = urllib.request.urlopen(req, jsondata)
    return response

def init_data():
    print("⏳ Initializing Psyche-X Data (Standard Lib Version)...")
    
    # 1. Initialize Achievements
    try:
        req = urllib.request.Request(f"{API_BASE}/admin/achievements/init", method="POST")
        with urllib.request.urlopen(req) as response:
             if response.status == 200:
                data = json.loads(response.read().decode())
                print(f"✅ Achievements Initialized: {data['created']}")
    except Exception as e:
        print(f"❌ Error initializing achievements: {e}")

    # 2. Initialize Articles
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
            post_json(f"{API_BASE}/articles", art)
            print(f"   + Created: {art['title']}")
        except Exception as e:
            print(f"   - Error creating {art['title']}: {e}")

    print("✨ Initialization Complete!")

if __name__ == "__main__":
    init_data()
