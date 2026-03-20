import os
import glob
from bs4 import BeautifulSoup
import random

def get_theme(txt):
    themes = [
        {"base": "168, 85, 247", "accent": "#c084fc"}, # Purple
        {"base": "244, 63, 94",  "accent": "#fb7185"}, # Rose
        {"base": "56, 189, 248", "accent": "#bae6fd"}, # Sky Blue
        {"base": "16, 185, 129", "accent": "#34d399"}, # Emerald
        {"base": "245, 158, 11", "accent": "#fbbf24"}, # Amber
        {"base": "236, 72, 153", "accent": "#f472b6"}, # Pink
        {"base": "99, 102, 241", "accent": "#818cf8"}, # Indigo
        {"base": "20, 184, 166", "accent": "#2dd4bf"}, # Teal
    ]
    random.seed(hash(txt))
    return random.choice(themes)

def gen_sub(hub_filename, hub_topic, sub_title, sub_desc, sub_filename):
    theme = get_theme(hub_topic + sub_title)
    c_base = theme["base"]
    c_acc = theme["accent"]
    topic = hub_topic
    title = sub_title
    desc = sub_desc
    filename = sub_filename
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | TITAN OS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Noto+Sans+SC:wght@300;500;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{ colors: {{ dark: '#030712' }} }},
                fontFamily: {{
                    cyber: ['Orbitron', 'Noto Sans SC', 'sans-serif'],
                    mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
                }}
            }}
        }}
    </script>
    <style>
        body {{ background-color: #030712; color: #ffffff; overflow-x: hidden; }}
        .glass-panel {{ background: rgba(0,0,0,0.5); backdrop-filter: blur(16px); border: 1px solid rgba({c_base}, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
        .bg-grid {{ position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.1;
            background-image: linear-gradient(rgba({c_base},1) 1px, transparent 1px), linear-gradient(90deg, rgba({c_base},1) 1px, transparent 1px);
            background-size: 50px 50px; transform: perspective(1000px) rotateX(45deg) scale(2);
            animation: grid-scroll 20s linear infinite; }}
        @keyframes grid-scroll {{ 0% {{ transform: perspective(1000px) rotateX(45deg) scale(2) translateY(0); }} 100% {{ transform: perspective(1000px) rotateX(45deg) scale(2) translateY(50px); }} }}
        
        .matrix-fall {{ font-family: monospace; position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; opacity: 0.15; color: {c_acc}; line-height: 1; font-size: 14px; white-space: pre; z-index: 0; }}
        
        .hexa-cube {{ width: 100px; height: 100px; transform-style: preserve-3d; animation: spin-cube 15s infinite linear; }}
        .hexa-face {{ position: absolute; width: 100%; height: 100%; border: 2px solid {c_acc}; opacity: 0.6; background: rgba({c_base}, 0.1); }}
        .f-front {{ transform: translateZ(50px); }} .f-back {{ transform: rotateY(180deg) translateZ(50px); }}
        .f-right {{ transform: rotateY(90deg) translateZ(50px); }} .f-left {{ transform: rotateY(-90deg) translateZ(50px); }}
        .f-top {{ transform: rotateX(90deg) translateZ(50px); }} .f-bottom {{ transform: rotateX(-90deg) translateZ(50px); }}
        @keyframes spin-cube {{ 0% {{ transform: rotateX(0deg) rotateY(0deg); }} 100% {{ transform: rotateX(360deg) rotateY(360deg); }} }}
    </style>
</head>
<body class="font-cyber selection:bg-[{c_acc}] selection:text-white">
    <div class="bg-grid"></div>
    <div class="matrix-fall" id="matrix-canvas"></div>
    
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <a href="{hub_filename}" class="fixed top-8 left-8 text-[{c_acc}] hover:text-white transition-colors tracking-widest text-xs border border-[rgba({c_base},0.3)] bg-black/50 px-4 py-2 rounded uppercase backdrop-blur-md gs-rev z-50">
            ← [ RETURN TO {topic} ]
        </a>
        
        <div class="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center gs-rev mt-10">
            <div class="space-y-8">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded border border-[rgba({c_base},0.3)] bg-[rgba({c_base},0.1)] w-fit">
                    <span class="w-2 h-2 rounded bg-[{c_acc}] animate-ping"></span>
                    <span class="font-mono text-[{c_acc}] text-xs font-bold tracking-widest">SUB-NODE: SECURE</span>
                </div>
                
                <h1 class="text-5xl md:text-6xl font-black leading-tight bg-clip-text text-transparent" style="background-image: linear-gradient(to right, white, {c_acc})">
                    {title}
                </h1>
                
                <div class="glass-panel p-6 border-l-4" style="border-left-color: {c_acc}">
                    <p class="text-lg text-gray-300 font-light leading-relaxed">
                        {desc}
                    </p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 font-mono text-xs">
                    <div class="glass-panel p-4 flex flex-col">
                        <span class="text-gray-500 mb-1">LOCAL_ID</span>
                        <span class="text-[{c_acc}]">N-{hash(title) % 10000}</span>
                    </div>
                    <div class="glass-panel p-4 flex flex-col">
                        <span class="text-gray-500 mb-1">DATA_LAKE</span>
                        <span class="text-green-400">SYNC_OK</span>
                    </div>
                </div>
            </div>
            
            <div class="relative h-[400px] flex justify-center items-center">
                <!-- 3D CUBE ANIMATION -->
                <div style="perspective: 800px;">
                    <div class="hexa-cube">
                        <div class="hexa-face f-front"></div>
                        <div class="hexa-face f-back"></div>
                        <div class="hexa-face f-right"></div>
                        <div class="hexa-face f-left"></div>
                        <div class="hexa-face f-top"></div>
                        <div class="hexa-face f-bottom"></div>
                    </div>
                </div>
                <!-- Circular rings behind cube -->
                <div class="absolute w-[300px] h-[300px] rounded-full border border-[rgba({c_base},0.2)] animate-[spin_10s_linear_infinite]"></div>
                <div class="absolute w-[200px] h-[200px] rounded-full border border-dashed border-[rgba({c_base},0.4)] animate-[spin_8s_linear_infinite_reverse]"></div>
            </div>
        </div>
    </div>
    
    <script>
        gsap.from(".gs-rev", {{ y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.5 }});
        
        const canvas = document.getElementById('matrix-canvas');
        let txt = "";
        for(let i=0; i<40; i++) {{
            for(let j=0; j<80; j++) {{
                txt += Math.random() > 0.5 ? "1" : "0";
                txt += Math.random() > 0.8 ? " " : "";
            }}
            txt += "\\n";
        }}
        canvas.textContent = txt;
        setInterval(() => {{
            const arr = canvas.textContent.split("\\n");
            arr.unshift(arr.pop());
            canvas.textContent = arr.join("\\n");
        }}, 50);
    </script>
</body>
</html>"""
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html)
        print(f"Refactored: {filename}")

def refactor_early():
    all_hubs = glob.glob("hub-*.html")
    early_hubs = [f for f in all_hubs if not f.startswith("hub-auto-")]
    
    for hub_filename in early_hubs:
        with open(hub_filename, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")
            
        # extract hub topic from h1
        h1 = soup.find("h1")
        if not h1: continue
        hub_topic = " ".join(h1.stripped_strings)
        hub_topic = hub_topic.replace("\n", "").strip()
        
        # find all links that look like subpages
        links = soup.find_all("a", href=True)
        seen_links = set()
        for a in links:
            href = a['href']
            # valid subpage looks like word-word.html and not a hub
            if href.endswith(".html") and not href.startswith("hub-") and href not in seen_links:
                exclude = ["index.html", "admin.html", "login.html", "dashboard.html", "api.html", "news.html"]
                if href in exclude or "curriculum" in href or "learning" in href:
                    continue
                    
                seen_links.add(href)
                
                # attempt to find its title and desc from the hub page
                h3 = a.find("h3")
                if h3:
                    sub_title = " ".join(h3.stripped_strings)
                    p = h3.find_next("p")
                    sub_desc = " ".join(p.stripped_strings) if p else f"Detailed visualization for {sub_title}."
                else:
                    sub_title = href.replace(".html", "").replace("-", " ").title()
                    sub_desc = f"Advanced visualization and deep-dive for {sub_title}."
                
                # Check if subpage exists
                if os.path.exists(href):
                    # We could read its own H1 in case it's better, but the Hub page's cards are usually best.
                    pass
                else:
                    # just generate it anyway
                    pass
                    
                gen_sub(hub_filename, hub_topic, sub_title, sub_desc, href)

if __name__ == "__main__":
    refactor_early()
