import json
import os

def merge_geogebra_data():
    base_dir = '/Users/zhoulin/Desktop/github/ai-playground'
    js_path = os.path.join(base_dir, 'assets/js/experiments.js')
    
    json_files = [
        'geo_mechanics.json',
        'geo_optics.json',
        'geo_limits.json',
        'geo_geometry.json',
        'geo_probability.json'
    ]
    
    new_items = []
    
    for jf in json_files:
        path = os.path.join(base_dir, jf)
        if not os.path.exists(path):
            print(f"Warning: {path} not found.")
            continue
            
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"Loaded {len(data)} items from {jf}")
            
            for item in data:
                # Transform to experiments.js schema
                new_item = {
                    "title": item.get('title', ''),
                    "title_zh": item.get('title', ''), # Use same title for now
                    "category": item.get('category', 'Physics'),
                    "level": "Middle/High",
                    "description": f"Interactive GeoGebra simulation by {item.get('author', 'Unknown')}.",
                    "description_zh": f"由 {item.get('author', 'Unknown')} 创建的 GeoGebra 交互式模拟。",
                    "url": item.get('url', ''),
                    "thumbnail": item.get('thumbnail', '')
                }
                new_items.append(new_item)

    print(f"Total new items to add: {len(new_items)}")
    
    # Read existing JS file
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the end of the array
    # We assume the file ends with a closing bracket and semicolon, possibly with whitespace
    # We'll look for the last ']'
    rindex = content.rfind(']')
    if rindex == -1:
        print("Error: Could not find closing bracket ']' in experiments.js")
        return

    # Split content
    pre_content = content[:rindex]
    post_content = content[rindex:]
    
    # Prepare new content string (comma separated objects)
    # We need to ensure there is a comma after the last existing item if not present
    # But usually simpler to just add ", " + new_json_items trimmed of outer brackets
    
    new_json_str = json.dumps(new_items, indent=4, ensure_ascii=False)
    # Remove outer '[' and ']'
    new_json_inner = new_json_str.strip()[1:-1]
    
    # Check if pre_content ends with a comma (ignoring whitespace)
    if pre_content.strip().endswith(','):
        separator = "\n"
    else:
        separator = ",\n"
        
    final_content = pre_content.rstrip() + separator + new_json_inner + post_content
    
    # Write back
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print("Successfully merged data into experiments.js")

if __name__ == "__main__":
    merge_geogebra_data()
