import requests

def check_thumbnail():
    sketch_id = "2792161"
    url = f"https://kyoko.openprocessing.org/thumbnails/visualThumbnail{sketch_id}@2x.jpg"
    print(f"Checking {url}...")
    try:
        r = requests.head(url, timeout=5)
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            print("Success! URL pattern is valid.")
        else:
            print("Failed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_thumbnail()
