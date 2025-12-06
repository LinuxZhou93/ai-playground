
import requests
import json
from concurrent.futures import ThreadPoolExecutor

# Load experiments manually or via simple regex from the python file since we can't import easily
# For simplicity, let's just parse the experiments.js file content which is JSON-like
# Actually, better to read experiments.js directly if it is valid json (it is valid JS variable assignment)

def check_url(experiment):
    url = experiment.get('url')
    if not url or url.startswith('http') == False:
        return experiment, True # Local files assume true
        
    try:
        # User-Agent to avoid blocking
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}
        r = requests.head(url, headers=headers, timeout=5)
        
        # If HEAD fails (405 etc), try GET
        if r.status_code >= 400:
            r = requests.get(url, headers=headers, stream=True, timeout=5)
            r.close()
            
        x_frame = r.headers.get('X-Frame-Options', '').upper()
        csp = r.headers.get('Content-Security-Policy', '').upper()
        
        if 'DENY' in x_frame or 'SAMEORIGIN' in x_frame:
            return experiment, False
            
        if 'FRAME-ANCESTORS' in csp:
            # Simple check: if frame-ancestors is present, it likely restricts us unless we are explicitly listed (unlikely)
            # Exception: 'frame-ancestors *' or 'frame-ancestors https:'
            if "FRAME-ANCESTORS 'SELF'" in csp or "FRAME-ANCESTORS 'NONE'" in csp:
                 return experiment, False
                 
        # Toptal specifically often blocks, check heuristics
        if 'toptal.com' in url or 'github.com' in url or 'stackoverflow.com' in url:
             return experiment, False

        return experiment, True
        
    except Exception as e:
        print(f"Error checking {url}: {e}")
        # If we can't connect, better to mark as safe? No, better safe than sorry, mark as non-embeddable if risky.
        # Check standard known embeddable sites
        if 'phet.colorado.edu' in url or 'falstad.com' in url or 'scratch.mit.edu' in url or 'shadertoy.com' in url:
            return experiment, True
        return experiment, False

def run_checks():
    # Read experiments.js
    with open('assets/js/experiments.js', 'r') as f:
        content = f.read()
        # Strip "const experiments = " and ";"
        json_str = content.replace('const experiments = ', '').strip().rstrip(';')
        experiments = json.loads(json_str)

    print(f"Checking {len(experiments)} experiments for iframe compatibility...")
    
    non_embeddable_count = 0
    updated_experiments = []
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = executor.map(check_url, experiments)
        
        for exp, is_embeddable in results:
            if not is_embeddable:
                exp['embeddable'] = False
                non_embeddable_count += 1
                print(f"Blocked: {exp['title']}")
            else:
                exp['embeddable'] = True
            updated_experiments.append(exp)
            
    print(f"Total non-embeddable experiments: {non_embeddable_count}")
    
    # Write back
    js_content = "const experiments = " + json.dumps(updated_experiments, indent=4, ensure_ascii=False) + ";"
    with open('assets/js/experiments_checked.js', 'w') as f:
        f.write(js_content)

if __name__ == "__main__":
    run_checks()
