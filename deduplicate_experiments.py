import json
import os
import re

def deduplicate():
    path = '/Users/zhoulin/Desktop/github/ai-playground/assets/js/experiments.js'
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the array part. 
    # Usually it starts with "const experiments = [" and ends with "];"
    # We can use regex or just finding the first '['
    
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    
    if start_idx == -1 or end_idx == -1:
        print("Error parsing file structure")
        return

    json_str = content[start_idx:end_idx+1]
    
    # The file might have trailing commas which JSON spec doesn't allow, but Python json might fail.
    # We need to be careful.
    # Let's try loading.
    try:
        data = json.loads(json_str)
    except Exception as e:
        print(f"JSON load error: {e}")
        # Try to fix trailing comma
        json_str = re.sub(r',\s*]', ']', json_str)
        try:
            data = json.loads(json_str)
        except Exception as e2:
            print(f"JSON load error 2: {e2}")
            return

    print(f"Original count: {len(data)}")
    
    seen_urls = set()
    unique_data = []
    
    for item in data:
        url = item.get('url')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_data.append(item)
        elif not url:
            # Keep items without URL?
            unique_data.append(item)
            
    print(f"Unique count: {len(unique_data)}")
    
    # Write back
    new_json_str = json.dumps(unique_data, indent=4, ensure_ascii=False)
    
    prefix = content[:start_idx]
    suffix = content[end_idx+1:]
    
    new_content = prefix + new_json_str + suffix
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Deduplication complete.")

if __name__ == "__main__":
    deduplicate()
