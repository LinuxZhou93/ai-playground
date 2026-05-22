import os
import json
import re
import requests
import random
from datetime import datetime

API_KEY = os.getenv("AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
BASE_URL = "https://backgrace.com/v1/chat/completions"
MODEL = "gemini-3-flash"
LAUNCHPAD_PATH = "/Users/zhoulin/Desktop/github/ai-playground/assets/js/launchpad.js"

def call_gemini(messages, temperature=0.7):
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {"model": MODEL, "messages": messages, "temperature": temperature}
    try:
        resp = requests.post(BASE_URL, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return None

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
    random.seed(i * 123)
    return random.choice(themes)

def english_title_approx(txt):
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
    <link rel="stylesheet" href="assets/css/titan-core.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
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
<body class="bg-[#030712] text-white overflow-x-hidden font-noto">
    <!-- Inline tailwind arbitrary values are replaced by native CSS mostly or fallback to standard TW classes -->
    <div id="preloader">
        <div style="color: {c_acc}" class="text-sm tracking-[0.3em] font-bold font-orbitron" id="load-text">INITIALIZING TITAN PROTOCOL...</div>
        <div class="loader-bar"><div class="loader-progress" id="load-progress"></div></div>
    </div>
    <div class="cyber-grid"></div>
    <div class="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none" style="background: rgba({c_base},0.08)"></div>

    <nav class="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 p-4 px-6 flex justify-between items-center transition-transform duration-300" id="navbar">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full border flex items-center justify-center animate-pulse shadow-lg text-xl" style="border-color: rgba({c_base},0.5); box-shadow: 0 0 15px rgba({c_base},0.3)">{icon}</div>
            <div class="font-bold text-xl tracking-[0.2em] font-orbitron">{en_title.split()[0]}<span style="color: {c_acc}">SYS</span></div>
        </div>
        <a href="index.html" class="flex items-center gap-2 group cursor-pointer text-gray-400 hover:text-white text-xs tracking-widest transition-colors duration-300 font-orbitron">
            [ RETURN_TO_HUB ]
        </a>
    </nav>

    <header class="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div class="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div class="lg:w-7/12 space-y-8 gs-reveal mt-20 lg:mt-0">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border" style="border-color: rgba({c_base},0.3); background: rgba({c_base},0.1)">
                    <span class="w-2 h-2 rounded-full animate-ping" style="background: {c_acc}"></span>
                    <span class="text-xs font-bold tracking-widest font-mono" style="color: {c_acc}">NEURAL UPLINK COLLIMATED</span>
                </div>
                <h1 class="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight uppercase font-orbitron">
                    {en_title.split()[0]}<br>
                    <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(to right, {c_acc}, rgba({c_base},1)); filter: drop-shadow(0 0 20px rgba({c_base},0.4));">{' '.join(en_title.split()[1:])}</span><br>
                    <span class="text-3xl lg:text-5xl tracking-widest text-white mt-4 block font-noto">{topic}</span>
                </h1>
                <p class="text-gray-400 font-light text-lg leading-relaxed max-w-2xl border-l-2 pl-6 py-2 content-desc" style="border-color: rgba({c_base},0.5)">
                    {desc}
                </p>
                <div class="glass-panel p-4 mt-8 w-full max-w-md text-xs text-green-400 h-32 overflow-hidden relative border font-mono" style="border-color: rgba({c_base},0.2)">
                     <div class="absolute inset-0 pointer-events-none z-10" style="background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.3) 2px,rgba(0,0,0,0.3) 4px)"></div>
                     <div id="typewriter" class="opacity-80 break-all whitespace-pre-wrap"></div>
                </div>
            </div>

            <div class="lg:w-5/12 flex justify-center items-center gs-reveal relative h-[500px]">
                <div class="core-visual">
                    <div class="core-ring core-ring-1"></div>
                    <div class="core-ring core-ring-2"></div>
                    <div class="core-ring core-ring-3"></div>
                    <div class="absolute w-[80%] h-[80%] flex items-center justify-center text-[120px] animate-pulse" style="filter: drop-shadow(0 0 30px {c_acc});">{icon}</div>
                </div>
                <div class="absolute top-10 right-0 glass-panel px-3 py-2 text-[10px] font-mono animate-bounce border" style="color: {c_acc}; border-color: rgba({c_base},0.3)">SYNC_RATE: 99.98%</div>
                <div class="absolute bottom-20 -left-10 glass-panel px-3 py-2 text-[10px] font-mono text-white border" style="border-color: rgba({c_base},0.3)">INTEGRITY: OPTIMAL</div>
            </div>
        </div>
    </header>

    <section class="py-32 relative z-10" id="matrix">
        <div class="container mx-auto px-6">
            <div class="flex flex-col items-center text-center mb-24 gs-reveal-up">
                <div class="tracking-[0.5em] text-sm mb-4 font-orbitron" style="color: {c_acc}">/// KNOWLEDGE MATRIX</div>
                <h2 class="text-4xl lg:text-5xl font-black font-noto">核心架构阵列</h2>
                <div class="w-24 h-1 mt-6" style="background: linear-gradient(to right, transparent, {c_acc}, transparent)"></div>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                """
    
    for idx, sub in enumerate(m["subs"]):
        html += f"""
                <a href="{sub['filename']}" class="block glass-panel p-8 holo-card group cursor-pointer gs-reveal-up border-l-4 border-l-white" style="border-left-color: {c_acc}">
                    <div class="flex justify-between items-start mb-8">
                        <div class="text-[3rem] opacity-20 font-black font-orbitron leading-none group-hover:opacity-100 transition-opacity" style="color: {c_acc}">0{idx+1}</div>
                        <span class="text-[10px] font-mono px-2 py-1 bg-green-500 bg-opacity-10 text-green-400 rounded-sm border border-green-500 border-opacity-20">ONLINE</span>
                    </div>
                    <h3 class="text-2xl font-bold font-noto mb-3">{sub['title']}</h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-6 font-light">{sub['desc']}</p>
                    <div class="w-full bg-black bg-opacity-50 h-1.5 rounded-full overflow-hidden">
                        <div class="w-0 h-full group-hover:w-full transition-all duration-1000 ease-out" style="background-color: {c_acc}"></div>
                    </div>
                </a>
"""

    html += f"""
            </div>
        </div>
    </section>

    <!-- TITAN AI ASSISTANT -->
    <script src="assets/js/titan-ai-assistant.js"></script>

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
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/titan-core.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        body {{ background-color: #030712; color: #ffffff; overflow-x: hidden; font-family: 'Noto Sans SC', sans-serif; }}
        .glass-panel {{ background: rgba(0,0,0,0.5); backdrop-filter: blur(16px); border: 1px solid rgba({c_base}, 0.2); }}
        .bg-grid {{ position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.1;
            background-image: linear-gradient(rgba({c_base},1) 1px, transparent 1px), linear-gradient(90deg, rgba({c_base},1) 1px, transparent 1px);
            background-size: 50px 50px; transform: perspective(1000px) rotateX(45deg) scale(2);
            animation: grid-scroll 20s linear infinite; }}
        @keyframes grid-scroll {{ 0% {{ transform: perspective(1000px) rotateX(45deg) scale(2) translateY(0); }} 100% {{ transform: perspective(1000px) rotateX(45deg) scale(2) translateY(50px); }} }}
        
        .matrix-fall {{ position: absolute; inset: 0; overflow: hidden; pointer-events: none; opacity: 0.15; color: {c_acc}; line-height: 1; font-size: 14px; white-space: pre; z-index: 0; font-family: monospace; }}
        
        .hexa-cube {{ width: 100px; height: 100px; transform-style: preserve-3d; animation: spin-cube 15s infinite linear; }}
        .hexa-face {{ position: absolute; width: 100%; height: 100%; border: 2px solid {c_acc}; opacity: 0.6; background: rgba({c_base}, 0.1); }}
        .f-front {{ transform: translateZ(50px); }} .f-back {{ transform: rotateY(180deg) translateZ(50px); }}
        .f-right {{ transform: rotateY(90deg) translateZ(50px); }} .f-left {{ transform: rotateY(-90deg) translateZ(50px); }}
        .f-top {{ transform: rotateX(90deg) translateZ(50px); }} .f-bottom {{ transform: rotateX(-90deg) translateZ(50px); }}
        @keyframes spin-cube {{ 0% {{ transform: rotateX(0deg) rotateY(0deg); }} 100% {{ transform: rotateX(360deg) rotateY(360deg); }} }}
    </style>
</head>
<body class="bg-[#030712] text-white">
    <div class="bg-grid"></div>
    <div class="matrix-fall" id="matrix-canvas"></div>
    
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <a href="hub-auto-{m['id']}.html" class="font-orbitron fixed top-8 left-8 text-xs px-4 py-2 rounded uppercase border bg-black bg-opacity-50 gs-rev transition-colors" style="color: {c_acc}; border-color: rgba({c_base},0.3);">
            ← [ ABORT NODE & RETURN TO {topic} ]
        </a>
        
        <div class="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center gs-rev">
            <div class="space-y-8">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded border w-fit font-mono" style="border-color: rgba({c_base},0.3); background: rgba({c_base},0.1)">
                    <span class="w-2 h-2 rounded bg-white animate-ping" style="background-color: {c_acc}"></span>
                    <span class="text-xs font-bold tracking-widest" style="color: {c_acc}">SUB-SYSTEM 0{sub_idx+1}: SECURE</span>
                </div>
                
                <h1 class="text-5xl md:text-6xl font-black leading-tight bg-clip-text text-transparent font-orbitron" style="background-image: linear-gradient(to right, white, {c_acc})">
                    {title}
                </h1>
                
                <div class="glass-panel p-6 border-l-4" style="border-left-color: {c_acc}">
                    <p class="text-lg text-gray-300 font-light leading-relaxed">
                        {desc}
                    </p>
                </div>
            </div>
            
            <div class="relative h-[400px] flex justify-center items-center gs-rev">
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
                <div class="absolute w-[300px] h-[300px] rounded-full border border-opacity-20 animate-[spin_10s_linear_infinite]" style="border-color: rgba({c_base},0.2);"></div>
                <div class="absolute w-[200px] h-[200px] rounded-full border border-dashed border-opacity-40 animate-[spin_8s_linear_infinite_reverse]" style="border-color: rgba({c_base},0.4);"></div>
            </div>
        </div>
    </div>
    
    <!-- TITAN AI ASSISTANT -->
    <script src="assets/js/titan-ai-assistant.js"></script>

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

def update_launchpad(item, idx):
    with open(LAUNCHPAD_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    loc = f"hub-auto-{idx}.html"
    if loc in content: return
    theme = get_theme(idx)
    new_entry = f"\n        {{ name: '{item['topic']}', icon: '{item['icon']}', link: '{loc}', color: '{theme['accent']}', category: 'discovery' }},"
    new_content = content.replace("const apps = [", "const apps = [" + new_entry)
    with open(LAUNCHPAD_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

def mass_generate():
    idx_from = 81
    idx_to = 100
    count = idx_to - idx_from + 1
    
    print(f"[{datetime.now()}] 🚀 启动超级增殖引擎 TITAN MODULE GENERATOR ({idx_from}-{idx_to})...")
    
    prompt = f"""请列出 {count} 个正式备案在册的新工科、前沿基础理科或交叉学科专业大类（必须是中国教育部正规备案的本科专业或高精尖交叉学科设定的专业，用于第{idx_from}到第{idx_to}个模块）。
要求：
1. 绝对不写科幻或虚构建模，必须是各高校当前重点发展的真实教育部备案高精尖专业，例如：智能科学与技术、飞行器控制与信息工程、智能医学工程、量子信息科学、海洋机器人、新能源科学与工程、碳储科学与工程、脑神经科学与工程、软物质物理等等。
2. 不准和计算机、医学、法学等太过宽泛的大名词重复，必须是精细的高精尖专业方向（建议长度4到8个汉字）。
3. 请为每个学科分配一个相关Emoji（作为icon）。
4. 每项提供3个包含具体前沿技术方向的子主题（subs），含 title 和硬核的 desc。
以纯 JSON 数组形式返回，除了JSON数组之外不要说任何废话！绝对不要放在 markdown 代码块里，必须以 `[` 开头 `]` 结尾：
[
    {{
        "topic": "智能医学工程",
        "icon": "🧬",
        "desc": "将人工智能理论机理与现代脑认知科学相融合的交叉学科体系。",
        "subs": [
            {{"title": "脑机接口与神经工程", "desc": "无创神经信息解码、外骨骼直接意念控制技术及相关范式转移..."}},
            {{"title": "医学影像智能识别", "desc": "..."}},
            {{"title": "精准手术机器人系统", "desc": "..."}}
        ]
    }}
]
"""
    json_str = call_gemini([{"role": "user", "content": prompt}], temperature=0.7)
    if not json_str:
        print("Failed to get JSON from API.")
        return
        
    clean_json = re.sub(r"^```(?:json)?\n?|^```\n|```$", "", json_str.strip(), flags=re.MULTILINE)
    try:
        data = json.loads(clean_json)
    except Exception as e:
        print(f"JSON parse failed! {e}")
        print("Received strings:", clean_json[:100], "...")
        return
        
    start_idx = idx_from
    for item in data:
        if start_idx > idx_to:
            break
            
        print(f"[{datetime.now()}] 构建节点 {start_idx}: {item['topic']}")
        
        new_subs = []
        for s_idx, sub in enumerate(item['subs']):
            new_subs.append({
                "title": sub["title"],
                "desc": sub["desc"],
                "filename": f"auto-{start_idx}-sub{s_idx+1}.html"
            })
            
        m = {
            "id": start_idx,
            "topic": item["topic"],
            "icon": item["icon"],
            "desc": item["desc"],
            "subs": new_subs
        }
        
        gen_hub(m)
        for s_idx in range(len(new_subs)):
            gen_sub(m, s_idx)
            
        update_launchpad(item, start_idx)
        start_idx += 1

    print(f"[{datetime.now()}] ⚡️ TITAN GENERATION COMPLETE! {idx_from}-{start_idx-1} BUILT.")

if __name__ == "__main__":
    mass_generate()
