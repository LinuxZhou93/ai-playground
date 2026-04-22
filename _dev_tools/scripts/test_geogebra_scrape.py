import requests
import urllib.parse
import json
import re

def test_scrape():
    url = "https://www.geogebra.org/search/physics"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }
    print(f"Fetching {url}...")
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
    except Exception as e:
        print(f"Failed: {e}")
        return

    # Look for the preloaded data script
    # <script id="__PRELOADED_DATA__" type="application/json">...
    match = re.search(r'id="__PRELOADED_DATA__"[^>]*>([^<]+)</script>', r.text)
    if not match:
        # Try without quotes or different formatting
        match = re.search(r'id=__PRELOADED_DATA__[^>]*>([^<]+)</script>', r.text)
    
    if match:
        raw_data = match.group(1)
        # Decode URL encoded data
        try:
            decoded_data = urllib.parse.unquote(raw_data)
            data = json.loads(decoded_data)
            
            # Save to inspect structure
            with open("geogebra_debug.json", "w") as f:
                json.dump(data, f, indent=2)
            
            print("Successfully extracted data. Keys:", list(data.keys()))
            
            # Try to find materials
            # Usually deeply nested in store state
            # Inspecting keys might help finding where results are
            
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            print("Raw snippet:", raw_data[:100])
    else:
        print("Could not find __PRELOADED_DATA__")

if __name__ == "__main__":
    test_scrape()
