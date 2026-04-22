import re
import glob
from bs4 import BeautifulSoup
import emoji
import random
import os

def parse_module(i):
    hub_file = f"hub-auto-{i}.html"
    try:
        with open(hub_file, "r", encoding='utf-8') as f:
            html = f.read()
    except Exception as e:
        return None
        
    soup = BeautifulSoup(html, "html.parser")
    
    h1 = soup.find("h1")
    topic = " ".join(h1.stripped_strings) if h1 else f"Module {i}"
    topic = topic.replace("\n", "").strip()

    icon = "⚙️"
    for div in soup.find_all("div"):
        text = div.get_text(strip=True)
        if len(text) <= 5 and any(char in emoji.EMOJI_DATA for char in text):
            icon = "".join(c for c in text if c in emoji.EMOJI_DATA)
            if icon: break
            
    desc = "No description available. System recovering data..."
    if h1:
        p = h1.find_next("p")
        if p:
            desc = " ".join(p.stripped_strings)

    subs = []
    h3s = soup.find_all("h3")
    for j, h3 in enumerate(h3s[:3]):
        sub_title = " ".join(h3.stripped_strings)
        p = h3.find_next("p")
        sub_desc = " ".join(p.stripped_strings) if p else f"Detailed simulation parameters for {sub_title}."
        if not sub_desc.strip(): sub_desc = f"Detailed simulation parameters for {sub_title}."
        
        # Determine the sub file name from previous links if possible
        href = f"auto-{i}-sub{j+1}.html"
        a = h3.find_parent("a")
        if a and a.has_attr("href"):
            href = a["href"]
            
        subs.append({
            "title": sub_title, 
            "desc": sub_desc,
            "filename": href
        })
        
    while len(subs) < 3:
        subs.append({"title": f"Subsystem {len(subs)+1}", "desc": "Offline or classified.", "filename": f"auto-{i}-sub{len(subs)+1}.html"})
        
    return {
        "id": i,
        "topic": topic,
        "icon": icon,
        "desc": desc,
        "subs": subs
    }

def get_theme(i):
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
    # deterministic seed
    random.seed(i * 123)
    return random.choice(themes)

def english_title_approx(txt):
    # Just generating a fake english looking header from index
    prefixes = ["NEURAL", "QUANTUM", "CYBER", "AERO", "SYNTHETIC", "VIRTUAL", "COGNITIVE", "FUSION"]
    suffixes = ["SYSTEMS", "DYNAMICS", "ENGINEERING", "INFORMATICS", "MECHANICS", "PROTOCOL"]
    random.seed(hash(txt))
    return f"{random.choice(prefixes)} {random.choice(suffixes)}"

def gen_hub(m):
    theme = get_theme(m["id"])
    c_base = theme["base"]
    c_acc = theme["accent"]
    topic = m["topic"]
    desc = m["desc"]
    en_title = english_title_approx(topic)
    icon = m["icon"]
    i = m["id"]
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{topic} | TITAN OS</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{ colors: {{ dark: '#030712' }} }},
                fontFamily: {{
                    orbitron: ['Orbitron', 'sans-serif'],
                    noto: ['"Noto Sans SC"', 'sans-serif'],
                    mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
                }}
            }}
        }}
    </script>
    <style>
        .cyber-grid {{ position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.15;
            background-image: linear-gradient(rgba({c_base},0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba({c_base},0.4) 1px, transparent 1px);
            background-size: 40px 40px; transform: perspective(600px) rotateX(60deg) translateY(-100px) translateZ(-200px);
            animation: grid-move 20s linear infinite; }}
        @keyframes grid-move {{ 0% {{ background-position: 0 0; }} 100% {{ background-position: 0 40px; }} }}
        .glass-panel {{ background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border: 1px solid rgba({c_base},0.2); border-radius: 16px; }}
        .holo-card {{ transition: transform 0.3s ease, border-color 0.3s; }}
        .holo-card:hover {{ border-color: rgba({c_base},0.8); box-shadow: 0 0 20px rgba({c_base},0.3); }}
        #preloader {{ position: fixed; inset: 0; background: #030712; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
        .loader-bar {{ width: 300px; height: 2px; background: rgba(255,255,255,0.1); margin-top: 20px; position: relative; overflow: hidden; }}
        .loader-progress {{ position: absolute; top: 0; left: 0; height: 100%; width: 0%; background: {c_acc}; box-shadow: 0 0 10px {c_acc}; }}
        .core-visual {{ width: 100%; height: 100%; position: absolute; display: flex; align-items: center; justify-content: center; transform-style: preserve-3d; }}
        .core-ring {{ position: absolute; border-radius: 50%; opacity: 0.8; }}
        .core-ring-1 {{ border: 2px dashed rgba({c_base}, 0.5); width: 400px; height: 400px; animation: spin 20s linear infinite; }}
        .core-ring-2 {{ border: 1px solid {c_acc}; width: 350px; height: 350px; animation: spin-rev 15s linear infinite; }}
        .core-ring-3 {{ border: 4px dotted rgba({c_base}, 0.3); width: 480px; height: 480px; animation: spin 30s linear infinite; }}
        @keyframes spin {{ 100% {{ transform: rotate(360deg); }} }}
        @keyframes spin-rev {{ 100% {{ transform: rotate(-360deg); }} }}
    </style>
</head>
<body class="selection:bg-[{c_acc}] selection:text-white bg-dark text-white font-noto overflow-x-hidden">
    <div id="preloader">
        <div class="text-[{c_acc}] text-sm tracking-[0.3em] font-bold font-orbitron" id="load-text">INITIALIZING TITAN PROTOCOL...</div>
        <div class="loader-bar"><div class="loader-progress" id="load-progress"></div></div>
    </div>
    <div class="cyber-grid"></div>
    <div class="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[rgba({c_base},0.08)] rounded-full blur-[150px] pointer-events-none"></div>

    <nav class="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none py-4 px-6 flex justify-between items-center transition-transform duration-300" id="navbar">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full border border-[rgba({c_base},0.5)] flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba({c_base},0.3)] text-xl">{icon}</div>
            <div class="font-orbitron font-black text-xl tracking-[0.2em]">{en_title.split()[0]}<span class="text-[{c_acc}]">SYS</span></div>
        </div>
        <a href="index.html" class="flex items-center gap-2 group cursor-pointer text-gray-400 hover:text-white font-orbitron text-xs tracking-widest transition-colors duration-300">
            [ RETURN_TO_HUB ]
        </a>
    </nav>

    <header class="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div class="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div class="lg:w-7/12 space-y-8 gs-reveal mt-20 lg:mt-0">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[rgba({c_base},0.3)] bg-[rgba({c_base},0.1)]">
                    <span class="w-2 h-2 rounded-full bg-[{c_acc}] animate-ping"></span>
                    <span class="font-mono text-[{c_acc}] text-xs font-bold tracking-widest">NEURAL UPLINK COLLIMATED</span>
                </div>
                <h1 class="font-orbitron text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight uppercase">
                    {en_title.split()[0]}<br>
                    <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(to right, {c_acc}, rgba({c_base},1)); filter: drop-shadow(0 0 20px rgba({c_base},0.4));">{' '.join(en_title.split()[1:])}</span><br>
                    <span class="text-3xl lg:text-5xl font-noto tracking-widest text-white mt-4 block">{topic}</span>
                </h1>
                <p class="text-gray-400 font-light text-lg leading-relaxed max-w-2xl border-l-2 pl-6 py-2" style="border-color: rgba({c_base},0.5)">
                    {desc}
                </p>
                <div class="glass-panel p-4 mt-8 w-full max-w-md font-mono text-xs text-green-400 h-32 overflow-hidden relative border border-[rgba({c_base},0.2)]">
                     <div class="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] pointer-events-none z-10"></div>
                     <div id="typewriter" class="opacity-80 break-all whitespace-pre-wrap"></div>
                </div>
            </div>

            <div class="lg:w-5/12 flex justify-center items-center gs-reveal relative h-[500px]">
                <div class="core-visual">
                    <div class="core-ring core-ring-1"></div>
                    <div class="core-ring core-ring-2"></div>
                    <div class="core-ring core-ring-3"></div>
                    <div class="absolute w-[80%] h-[80%] flex items-center justify-center text-[120px] animate-[pulse_3s_ease-in-out_infinite]" style="filter: drop-shadow(0 0 30px {c_acc});">{icon}</div>
                </div>
                <div class="absolute top-10 right-0 glass-panel px-3 py-2 font-mono text-[10px] text-[{c_acc}] animate-bounce border border-[rgba({c_base},0.3)]">SYNC_RATE: 99.98%</div>
                <div class="absolute bottom-20 -left-10 glass-panel px-3 py-2 font-mono text-[10px] text-white border border-[rgba({c_base},0.3)]">INTEGRITY: OPTIMAL</div>
            </div>
        </div>
    </header>

    <section class="py-32 relative z-10" id="matrix">
        <div class="container mx-auto px-6">
            <div class="flex flex-col items-center text-center mb-24 gs-reveal-up">
                <div class="font-orbitron tracking-[0.5em] text-sm mb-4" style="color: {c_acc}">/// KNOWLEDGE MATRIX</div>
                <h2 class="text-4xl lg:text-5xl font-black font-noto">核心架构阵列</h2>
                <div class="w-24 h-1 mt-6" style="background: linear-gradient(to right, transparent, {c_acc}, transparent)"></div>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                """
    
    for idx, sub in enumerate(m["subs"]):
        html += f"""
                <a href="{sub['filename']}" class="block glass-panel p-8 holo-card group cursor-pointer gs-reveal-up border-l-4" style="border-left-color: {c_acc}">
                    <div class="flex justify-between items-start mb-8">
                        <div class="text-[3rem] opacity-20 font-orbitron font-black leading-none group-hover:opacity-100 transition-opacity" style="color: {c_acc}">0{idx+1}</div>
                        <span class="font-mono text-[10px] px-2 py-1 bg-green-500/10 text-green-400 rounded-sm border border-green-500/20">ONLINE</span>
                    </div>
                    <h3 class="text-2xl font-bold font-noto mb-3">{sub['title']}</h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-6 font-light">{sub['desc']}</p>
                    <div class="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                        <div class="w-0 h-full group-hover:w-full transition-all duration-1000 ease-out" style="background-color: {c_acc}"></div>
                    </div>
                </a>
"""

    html += f"""
            </div>
        </div>
    </section>

    <section class="py-20 bg-black/80 border-y relative overflow-hidden" id="telemetry" style="border-color: rgba({c_base}, 0.2)">
        <div class="absolute inset-0 cyber-grid opacity-10"></div>
        <div class="container mx-auto px-6 relative z-10 flex justify-center">
            <div class="w-full max-w-4xl glass-panel p-1 rounded-lg shadow-2xl gs-telemetry" style="border-color: rgba({c_base}, 0.4)">
                <div class="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-t-md border-b border-gray-800">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div><div class="w-3 h-3 rounded-full bg-yellow-500"></div><div class="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div class="ml-4 font-mono text-[10px] text-gray-500">TITAN_{en_title.split()[0].upper()}_TERMINAL</div>
                </div>
                <div class="bg-[#050505] p-6 h-80 rounded-b-md font-mono text-[12px] leading-relaxed overflow-hidden relative" style="color: {c_acc}">
                    <div class="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.4)_2px,rgba(0,0,0,0.4)_4px)] z-10"></div>
                    <div id="telemetry-feed" class="terminal-lines h-full flex flex-col justify-end space-y-1"></div>
                </div>
            </div>
        </div>
    </section>

    <footer class="py-8 text-center text-gray-600 font-mono text-xs border-t border-white/5 relative z-10">
        &copy; 2026 TITAN OS. CLASSIFIED {en_title.upper()} FRONTIERS. [SYSTEM BUILD: STABLE]
    </footer>

    <script>
        window.addEventListener('load', () => {{
            const tl = gsap.timeline();
            tl.to("#load-progress", {{ width: "100%", duration: 1.5, ease: "power3.inOut" }})
              .to("#load-text", {{ opacity: 0, text: "SYSTEM ONLINE", duration: 0.2 }}, "+=0")
              .to("#preloader", {{ yPercent: -100, duration: 0.8, ease: "power4.inOut" }}, "+=0.3")
              .from(".gs-reveal", {{ y: +50, opacity: 0, duration: 1.2, stagger: 0.15, ease: "back.out(1.2)" }}, "-=0.2");
        }});

        const bootText = [
            "CONNECTING TO {topic} SERVERS...",
            "SUCCESS. LATENCY: 8ms",
            "DECRYPTING ARCHIVE_DATA...",
            "LOADING V3.0 QUANTUM PREDICTIONS...",
            "SYSTEM READY. WAITING FOR COMMAND."
        ];
        let bootContainer = document.getElementById('typewriter');
        let bootHTML = '';
        setTimeout(() => {{
            bootText.forEach((txt, i) => {{
                setTimeout(() => {{
                    bootHTML += `<div><span class="text-gray-500">[${{new Date().toISOString().substring(11,23)}}]</span> -> ${{txt}}</div>`;
                    bootContainer.innerHTML = bootHTML;
                }}, i * 600);
            }});
        }}, 2000);

        const feedContainer = document.getElementById('telemetry-feed');
        const snippets = [
            "ANALYZING METRICS: STABILITY [99.8%]",
            "SYNTHESIZING PARADIGMS: {m['subs'][0]['title']} ALIGNED",
            "WARNING: MINOR FLUX IN DATASTREAM.",
            "CALIBRATION: {m['subs'][min(1, len(m['subs'])-1)]['title']} ACTIVE.",
            "NODE SWARM UPDATE: AWAITING INPUT",
            "HEARTBEAT: NORMAL | RESOURCES: OPTIMAL"
        ];
        setInterval(() => {{
            if(feedContainer.children.length > 15) {{ feedContainer.removeChild(feedContainer.firstChild); }}
            const line = document.createElement('div');
            line.innerHTML = `> ${{snippets[Math.floor(Math.random()*snippets.length)]}} <span style="background: {c_acc}; color: black; padding: 0 4px; opacity: 0.7;">OK</span>`;
            feedContainer.appendChild(line);
        }}, 800);

        gsap.registerPlugin(ScrollTrigger);
        let lastScroll = 0;
        window.addEventListener("scroll", () => {{
            let currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll && currentScroll > 100) {{
                document.getElementById("navbar").style.transform = "translateY(-100%)";
            }} else {{
                document.getElementById("navbar").style.transform = "translateY(0)";
            }}
            lastScroll = currentScroll;
        }});

        gsap.utils.toArray('.gs-reveal-up').forEach((elem) => {{
            gsap.from(elem, {{ scrollTrigger: {{ trigger: elem, start: "top 85%" }}, y: 50, opacity: 0, duration: 1, ease: "power3.out" }});
        }});

        gsap.from(".gs-telemetry", {{ scrollTrigger: {{ trigger: "#telemetry", start: "top 80%" }}, scale: 0.95, y: 40, opacity: 0.5, duration: 1.2, ease: "back.out(1)" }});

        document.querySelectorAll('.holo-card').forEach(card => {{
            card.addEventListener('mousemove', e => {{
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                const xc = (x / rect.width) * 100; const yc = (y / rect.height) * 100;
                card.style.transform = `perspective(1000px) rotateX(${{(yc - 50) * -0.15}}deg) rotateY(${{(xc - 50) * 0.15}}deg) translateY(-5px)`;
            }});
            card.addEventListener('mouseleave', () => {{ card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`; }});
        }});
    </script>
</body>
</html>"""
    
    with open(f"hub-auto-{i}.html", "w", encoding="utf-8") as f:
        f.write(html)
        
def gen_sub(m, sub_idx):
    theme = get_theme(m["id"])
    c_base = theme["base"]
    c_acc = theme["accent"]
    sub = m["subs"][sub_idx]
    topic = m["topic"]
    title = sub["title"]
    desc = sub["desc"]
    filename = sub["filename"]
    
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
        .glass-panel {{ background: rgba(0,0,0,0.5); backdrop-filter: blur(16px); border: 1px solid rgba({c_base}, 0.2); }}
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
        <a href="hub-auto-{m['id']}.html" class="fixed top-8 left-8 text-[{c_acc}] hover:text-white transition-colors tracking-widest text-xs border border-[rgba({c_base},0.3)] bg-black/50 px-4 py-2 rounded uppercase backdrop-blur-md gs-rev">
            ← [ ABORT NODE & RETURN TO {topic} ]
        </a>
        
        <div class="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center gs-rev">
            <div class="space-y-8">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded border border-[rgba({c_base},0.3)] bg-[rgba({c_base},0.1)] w-fit">
                    <span class="w-2 h-2 rounded bg-[{c_acc}] animate-ping"></span>
                    <span class="font-mono text-[{c_acc}] text-xs font-bold tracking-widest">SUB-SYSTEM 0{sub_idx+1}: SECURE</span>
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
                        <span class="text-[{c_acc}]">N-{m['id']}-{sub_idx+1}</span>
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
        
        // Matrix Background Effect
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


def mass_refactor():
    for i in range(21, 65):
        m = parse_module(i)
        if not m:
            print(f"Skipping {i}, file not found.")
            continue
            
        print(f"Refactoring Module {i}: {m['topic']}")
        gen_hub(m)
        for sub_idx in range(len(m["subs"])):
            gen_sub(m, sub_idx)

if __name__ == "__main__":
    mass_refactor()
