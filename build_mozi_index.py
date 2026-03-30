import os
import re
import json

def get_title(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            # Only read the first 1KB for speed
            head = f.read(1024)
            match = re.search(r'<title>(.*?)<\/title>', head, re.IGNORECASE | re.DOTALL)
            if match:
                title = match.group(1).strip()
                title = title.replace('TITAN Neural Hub', '墨子实验室').replace('成电创客', '墨子实验室')
                return title
    except:
        return None
    return None

def build_index():
    index = []
    # Targeted search in root and key hubs
    for root, dirs, files in os.walk('.'):
        # Strictly exclude meta/heavy dirs
        if any(d in root for d in ['.git', 'node_modules', '.gemini', 'ios', 'assets', 'miniprogram']):
            continue
        
        for file in files:
            if file.endswith('.html') and not file.startswith('mozi_') and not file.startswith('.'):
                path = os.path.relpath(os.path.join(root, file), '.')
                title = get_title(path)
                if title:
                    index.append({
                        "title": title,
                        "path": path,
                        "category": "Science Hub" if "hub-" in path else "Project"
                    })
    
    with open('mozi_index.json', 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=4)
    print(f"Index built with {len(index)} items.")

if __name__ == "__main__":
    build_index()
