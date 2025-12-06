import json
import requests
import concurrent.futures

# Load experiments
try:
    with open('assets/js/experiments.js', 'r') as f:
        content = f.read()
        # Strip "const experiments =" and ";" to get valid JSON
        json_str = content.replace('const experiments =', '').strip().rstrip(';')
        experiments = json.loads(json_str)
except Exception as e:
    print(f"Error loading experiments.js: {e}")
    exit(1)

print(f"Checking {len(experiments)} links...")

broken_links = []
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}

def check_url(exp):
    url = exp['url']
    try:
        # Use HEAD request first, fallback to GET if 405/403 (some servers block HEAD)
        response = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        if response.status_code >= 400:
             # Try GET to be sure
             response = requests.get(url, headers=headers, timeout=5, stream=True)
             if response.status_code >= 400:
                 return (exp, f"Status {response.status_code}")
    except Exception as e:
        return (exp, f"Error: {str(e)}")
    return None

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    futures = {executor.submit(check_url, exp): exp for exp in experiments}
    for future in concurrent.futures.as_completed(futures):
        result = future.result()
        if result:
            broken_links.append(result)
            print(f"Generated Alert: {result[0]['title']} - {result[1]}")

print(f"\nFound {len(broken_links)} potential broken links.")

# Generate a list of titles to remove or fix
if broken_links:
    with open('broken_links_report.txt', 'w') as f:
        for exp, reason in broken_links:
            f.write(f"{exp['title']} | {exp['url']} | {reason}\n")
    print("Report saved to broken_links_report.txt")
else:
    print("All links passed verification!")
