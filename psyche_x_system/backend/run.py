import uvicorn
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

if __name__ == "__main__":
    print("STARTING PSYCHE-X NEURO ENGINE (V2 MODULAR)...")
    print(" > SYSTEM ACCESS: http://127.0.0.1:8000/")
    print(" > API DOCS: http://127.0.0.1:8000/docs")
    # Using 127.0.0.1 to avoid localhost resolution issues
    uvicorn.run(app, host="127.0.0.1", port=8000)
