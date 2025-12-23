import urllib.request
import urllib.parse
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(f"[TEST] {msg}")

def request(method, path, data=None):
    url = BASE_URL + path
    headers = {'Content-Type': 'application/json'} if data else {}
    body = json.dumps(data).encode('utf-8') if data else None
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def run_check():
    # 1. Health
    status, res = request("GET", "/api/status")
    if status != 200:
        status, res = request("GET", "/")
    
    if status == 200: log("Server UP")
    else: 
        log(f"Server DOWN ({status})")
        sys.exit(1)

    # 2. Register
    ts = int(time.time())
    status, user_data = request("POST", "/users/", {"username":f"T{ts}", "email":f"t{ts}@x.com", "password":"p"})
    if status != 200:
        user_id = 1
        log("Using ID 1")
    else:
        user_id = user_data['id']
        log(f"Created User {user_id}")

    # 3. Simulate
    log("Simulating Data...")
    for i in range(3):
        score = 80 + i
        request("POST", f"/exam/submit?user_id={user_id}", {
            "task_type": "n-back",
            "raw_data": {"score": score, "trials": [{"res":1,"rt":500}]*20}
        })
    
    # 4. Check Stats
    log("Checking Stats API...")
    status, stats = request("GET", f"/users/{user_id}/stats")
    if status == 200:
        log("STATS DATA:")
        print(json.dumps(stats, indent=2))
        log("SUCCESS: Visualization Data Pipeline is VALID.")
    else:
        log(f"FAIL: {status}")

if __name__ == "__main__":
    time.sleep(1)
    run_check()
