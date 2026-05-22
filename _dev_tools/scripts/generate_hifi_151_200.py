import os
import json
import re
import requests
import random
import time
import traceback
from datetime import datetime

API_KEY = os.getenv("AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
BASE_URL = "https://backgrace.com/v1/chat/completions"
# Using a slightly higher model or flash for long context
MODEL = "gemini-3-flash"
LAUNCHPAD_PATH = "/Users/zhoulin/Desktop/github/ai-playground/assets/js/launchpad.js"

TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[[topic]] | TITAN OS</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Noto+Sans+SC:wght@300;400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/titan-core.css">
    
    <!-- Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"></script>
    
    <style>
        body { background-color: #020617; color: #f8fafc; overflow-x: hidden; font-family: 'Noto Sans SC', sans-serif; }
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        
        #canvas-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; opacity: 0.7; }
        
        .glass-panel { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba([[base_rgb]], 0.25); border-radius: 8px; box-shadow: inset 0 0 20px rgba([[base_rgb]], 0.05); }
        .glass-card { transition: all 0.5s; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%); }
        .glass-card:hover { transform: translateY(-8px) scale(1.02); border-color: [[accent_color]]; background: rgba([[base_rgb]], 0.1); box-shadow: 0 15px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba([[base_rgb]], 0.3); }
        
        #preloader { position: fixed; inset: 0; background: #020617; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
        .scanner-beam { width: 100%; height: 2px; background: [[accent_color]]; box-shadow: 0 0 20px 5px [[accent_color]]; position: absolute; animation: scan 3s ease-in-out infinite alternate; z-index: 10; }
        @keyframes scan { 0% { top: 10%; } 100% { top: 90%; } }
        
        .crt-flicker { animation: flicker 0.15s infinite; }
        @keyframes flicker { 0% { opacity: 0.95; } 50% { opacity: 1; } 100% { opacity: 0.92; } }
    </style>
</head>
<body class="selection:bg-slate-700 selection:text-white">

    <div id="preloader">
        <div class="scanner-beam"></div>
        <div class="text-[10px] tracking-[0.5em] font-bold font-orbitron crt-flicker" style="color: [[accent_color]]" id="load-text">INITIALIZING CORE_FILES...</div>
        <div class="w-80 h-[2px] bg-slate-800 mt-6 relative"><div class="absolute left-0 top-0 h-full shadow-lg" style="background: [[accent_color]]; width: 0%;" id="load-bar"></div></div>
    </div>

    <!-- Replace Javascript Canvas Logic for unique background -->
    <canvas id="canvas-bg"></canvas>

    <nav class="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 py-3 px-6 flex justify-between items-center transition-transform duration-500 rounded-none bg-slate-900/50" id="navbar">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 border-2 flex items-center justify-center font-bold text-2xl" style="border-color: [[accent_color]]; color: [[accent_color]]; clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);">[[icon]]</div>
            <div>
                <div class="font-bold text-xl tracking-[0.25em] font-orbitron text-transparent bg-clip-text" style="background-image: linear-gradient(to right, #fff, [[accent_color]])">[[en_prefix]]<span class="text-slate-400 ml-2">[[en_suffix]]</span></div>
            </div>
        </div>
        <a href="index.html" class="flex items-center px-4 py-2 border text-xs tracking-widest font-orbitron hover:bg-white/5 transition-all" style="border-color: rgba([[base_rgb]],0.4); color: [[accent_color]]">[ EXIT ]</a>
    </nav>

    <header class="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden z-20">
        <div class="container mx-auto px-6 grid xl:grid-cols-12 gap-12 items-center">
            <div class="xl:col-span-6 space-y-8 gs-reveal">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 border" style="border-color: rgba([[base_rgb]],0.4); background: rgba([[base_rgb]],0.1)">
                    <span class="w-1.5 h-1.5 animate-pulse" style="background: [[accent_color]]"></span>
                    <span class="text-[10px] font-bold tracking-widest font-mono" style="color: [[accent_color]]">SYSTEM AUTHORIZED</span>
                </div>
                <h1 class="text-6xl lg:text-7xl font-black leading-[1] tracking-tighter uppercase font-orbitron text-slate-100">
                    <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(to right, #fff, [[accent_color]]); filter: drop-shadow(0 0 20px rgba([[base_rgb]],0.4));">[[topic]]</span><br>
                </h1>
                <div class="relative pl-6 py-4 border-l-[3px] bg-gradient-to-r to-transparent" style="border-left-color: [[accent_color]]; background-image: linear-gradient(to right, rgba([[base_rgb]],0.2), transparent);">
                    <p class="text-slate-300 font-light text-base leading-relaxed max-w-xl">[[desc]]</p>
                </div>
                <button class="px-8 py-4 font-orbitron tracking-widest text-sm transition-all border" style="background: rgba([[base_rgb]],0.2); color: [[accent_color]]; border-color: [[accent_color]]; clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);" onclick="document.getElementById('matrix').scrollIntoView({behavior:'smooth'})">ENGAGE</button>
            </div>

            <!-- ECharts Telemetry Dashboards -->
            <div class="xl:col-span-6 gs-reveal relative h-[600px] flex flex-col gap-4">
                <div class="glass-panel p-2 h-[300px] relative overflow-hidden flex flex-col">
                    <div class="absolute top-0 right-0 p-2 font-mono text-[9px] z-10 text-right bg-slate-900/80 rounded-bl-lg border-b border-l" style="color: [[accent_color]]; border-color: [[accent_color]]">LIVE_DATA_STREAM</div>
                    <div id="chart-main" class="w-full flex-1"></div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 h-[250px]">
                    <div class="glass-panel p-4 font-mono text-[10px] flex flex-col overflow-hidden relative">
                        <div class="font-bold border-b pb-2 mb-2" style="color: [[accent_color]]; border-color: rgba([[base_rgb]],0.2)">> TERM_LOGS</div>
                        <div id="terminal-logs" class="text-slate-300 flex-1 overflow-y-auto space-y-1"></div>
                    </div>
                    <div class="glass-panel p-2 flex flex-col relative overflow-hidden">
                         <div id="chart-sub" class="w-full flex-1"></div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <section class="py-24 relative z-30 bg-slate-900/80 border-t" style="border-top-color: rgba([[base_rgb]],0.3)" id="matrix">
        <div class="container mx-auto px-6">
            <div class="flex flex-col items-center text-center mb-20 gs-reveal-up">
                <h2 class="text-4xl lg:text-5xl font-black font-noto text-white text-shadow-lg">前沿技术分支</h2>
            </div>
            <div class="grid md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
                [[sub_cards_html]]
            </div>
        </div>
    </section>

    <!-- TITAN AI ASSISTANT -->
    <script src="assets/js/titan-ai-assistant.js"></script>

    <script>
        window.addEventListener('load', () => {
            const tl = gsap.timeline();
            tl.to("#load-bar", { width: "100%", duration: 1.5, ease: "power1.inOut" })
              .to("#load-text", { text: "DONE.", color: "#4ade80", duration: 0.2 }, "+=0")
              .to("#preloader", { opacity: 0, duration: 0.8, ease: "power2.inOut" }, "+=0.5")
              .set("#preloader", { display: "none" })
              .from(".gs-reveal", { y: +40, opacity: 0, duration: 1, stagger: 0.15, ease: "back.out(1.2)" }, "-=0.2");
              
            initECharts();
            initCanvasBg();
        });

        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray('.gs-reveal-up').forEach((elem) => {
            gsap.from(elem, { scrollTrigger: { trigger: elem, start: "top 90%" }, y: 50, opacity: 0, duration: 1, ease: "power3.out" });
        });

        const term = document.getElementById('terminal-logs');
        const logs = ["Connecting to core...", "Synchronizing data layers...", "Bypassing security protocols...", "Analyzing metrics..."];
        setInterval(() => {
            if(Math.random() > 0.6) return;
            const d = document.createElement('div');
            d.innerHTML = `> ${logs[Math.floor(Math.random()*logs.length)]}`;
            term.appendChild(d);
            if(term.children.length > 20) term.removeChild(term.firstChild);
            term.scrollTop = term.scrollHeight;
        }, 800);

        function initECharts() {
            // ECharts initialized with dynamic theme color
            const chart1 = echarts.init(document.getElementById('chart-main'));
            const chart2 = echarts.init(document.getElementById('chart-sub'));
            
            // Generate basic line chart and bar chart mapped to topic
            let data1 = []; let now = new Date();
            for(let i=0; i<50; i++) { data1.push({name:now.toString(), value:[now, Math.random()*100]}); now = new Date(+now + 1000); }
            
            chart1.setOption({
                tooltip: {trigger: 'axis'},
                xAxis: {type: 'time', splitLine:{show:false}, axisLabel:{show:false}},
                yAxis: {type: 'value', splitLine:{lineStyle:{color:'rgba([[base_rgb]],0.1)'}}},
                series: [{ type: 'line', showSymbol: false, data: data1, itemStyle: {color: '[[accent_color]]'}, areaStyle: {color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0, color:'rgba([[base_rgb]],0.5)'},{offset:1, color:'transparent'}])} }]
            });
            
            chart2.setOption({
                xAxis: {type: 'category', data: ['A','B','C','D']},
                yAxis: {type: 'value', show: false},
                series: [{ type: 'bar', data: [40, 70, 50, 90], itemStyle: {color: '[[accent_color]]'} }]
            });

            setInterval(() => {
                let current = new Date();
                data1.shift(); data1.push({name: current.toString(), value: [current, Math.random()*100]});
                chart1.setOption({series: [{data: data1}]});
                chart2.setOption({series: [{data: [Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100]}]});
            }, 1000);
            
            window.addEventListener('resize', () => { chart1.resize(); chart2.resize(); });
        }

        function initCanvasBg() {
            const canvas = document.getElementById('canvas-bg');
            const ctx = canvas.getContext('2d');
            let w = canvas.width = window.innerWidth;
            let h = canvas.height = window.innerHeight;
            
            // A generic highly aesthetic flow field / particle system
            let particles = [];
            for(let i=0; i<150; i++) {
                particles.push({
                    x: Math.random()*w, y: Math.random()*h,
                    vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
                    size: Math.random()*2
                });
            }
            
            function animate() {
                ctx.clearRect(0,0,w,h);
                ctx.fillStyle = '[[accent_color]]';
                particles.forEach(p => {
                    p.x += p.vx; p.y += p.vy;
                    if(p.x<0||p.x>w) p.vx*=-1;
                    if(p.y<0||p.y>h) p.vy*=-1;
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
                });
                requestAnimationFrame(animate);
            }
            animate();
        }
    </script>
</body>
</html>
"""

def call_gemini_json(messages, temperature=0.7):
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {"model": MODEL, "messages": messages, "temperature": temperature}
    try:
        resp = requests.post(BASE_URL, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        content = resp.json()['choices'][0]['message']['content']
        clean = re.sub(r"^```(?:json)?\n?|^```\n|```$", "", content.strip(), flags=re.MULTILINE)
        return json.loads(clean)
    except Exception as e:
        print(f"Error calling Gemini JSON: {e}")
        return None

def call_gemini_code(messages, temperature=0.9): # higher temp for code variation
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {"model": MODEL, "messages": messages, "temperature": temperature}
    try:
        resp = requests.post(BASE_URL, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        content = resp.json()['choices'][0]['message']['content']
        clean = re.sub(r"^```(?:html)?\n?|^```\n|```$", "", content.strip(), flags=re.MULTILINE)
        return clean
    except Exception as e:
        print(f"Error calling Gemini Code: {e}")
        return None

def get_theme(i):
    themes = [
        {"base": "244, 63, 94",  "accent": "#fb7185", "eng_pref": "BIO"},
        {"base": "16, 185, 129", "accent": "#34d399", "eng_pref": "ECO"},
        {"base": "245, 158, 11", "accent": "#fbbf24", "eng_pref": "NANO"},
        {"base": "99, 102, 241", "accent": "#818cf8", "eng_pref": "QUAN"},
        {"base": "236, 72, 153", "accent": "#f472b6", "eng_pref": "NEURO"},
        {"base": "20, 184, 166", "accent": "#2dd4bf", "eng_pref": "CYBER"},
        {"base": "168, 85, 247", "accent": "#c084fc", "eng_pref": "ASTRO"},
        {"base": "239, 68, 68",  "accent": "#f87171", "eng_pref": "MECH"}
    ]
    random.seed(i * 999)
    return random.choice(themes)

def update_launchpad(item, idx, theme):
    try:
        with open(LAUNCHPAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        loc = f"hub-auto-{idx}.html"
        if loc in content: return
        new_entry = f"\n        {{ name: '{item['topic']}', icon: '{item['icon']}', link: '{loc}', color: '{theme['accent']}', category: 'academic' }},"
        new_content = content.replace("const apps = [", "const apps = [" + new_entry)
        with open(LAUNCHPAD_PATH, "w", encoding="utf-8") as f:
            f.write(new_content)
    except Exception as e:
        print("Error updating launchpad:", e)

def build_advanced_module(m_idx, topic, icon, desc, subs):
    print(f"[{datetime.now()}] 🧠 深入构建超高保真模块: {m_idx} - [[topic]]")
    theme = get_theme(m_idx)
    
    # 1. Ask Gemini to ONLY write the Canvas javascript logic and Terminal logs uniquely tailored to this topic!
    # Instead of asking it to write 300 lines of HTML (which leads to timeout), we use a python template 
    # and just ask Gemini to inject the specialized parts!
    
    js_prompt = f"""你是世界级的WebGL与Canvas开发大师。我现在正在为一个暗黑赛博风格的网站生成专业学科页面：【[[topic]]】([[desc]])。
请返回一段纯原生的 Javascript `<script>` 代码（不包含HTML标签），用以替换我的标准粒子系统。
要求：
1. 必须包含一个 `function initCanvasBg() {{...}}` 用来接管 `<canvas id="canvas-bg">`。请根据【[[topic]]】为其设计一个独创的、视觉震撼的Canvas动效，例如：计算流体力学可用水波扭曲背景，量子力学用量子坍缩光晕，航天工程用星辰轨道或星系，生物学用DNA双螺旋矩阵等... 颜色必须使用 `'{theme['accent']}'` 或 `rgba({theme['base']}, [alpha])`。务必要有鼠标交互！代码要专业无错，避免死循环！不要用任何外部素材图片。
2. 必须包含一个变量 `const customLogs = ["...", "...", "..."];` 提供 10 条深奥且逼真的该学科前沿研究方向的终端日志输出字符串。
直接返回原生 JS 代码。
"""
    custom_js = call_gemini_code([{"role": "user", "content": js_prompt}], temperature=0.8)
    if not custom_js:
        custom_js = """function initCanvasBg() {} \n const customLogs = ["SYSTEM NOMINAL", "DATA LINK OK"];"""
    else:
        # Strip script tags if present
        custom_js = custom_js.replace("<script>", "").replace("</script>", "")
    
    # Generate Sub Cards HTML
    cards_html = ""
    for idx, sub in enumerate(subs):
        cards_html += f"""
                <a href="#" class="glass-panel glass-card p-8 group relative overflow-hidden gs-reveal-up" style="transition-delay: {idx*100}ms">
                    <div class="absolute -right-10 -top-10 text-[120px] font-black font-orbitron opacity-5 group-hover:opacity-10 transition-opacity" style="color: {theme['accent']}">{idx+1}</div>
                    <div class="font-mono text-[10px] mb-4 px-2 py-1 w-fit border" style="color: {theme['accent']}; background: rgba({theme['base']},0.1); border-color: rgba({theme['base']},0.2)">PROT_0{idx+1}</div>
                    <h3 class="text-2xl font-bold font-noto mb-4 text-slate-100 group-hover:text-white transition-colors">{sub['title']}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed mb-8 font-light min-h-[80px]">{sub['desc']}</p>
                    <div class="inline-flex items-center gap-2 text-xs font-orbitron tracking-wider cursor-pointer group/btn" style="color: {theme['accent']}">
                        INITIALIZE <span class="group-hover/btn:translate-x-2 transition-transform">→</span>
                    </div>
                </a>"""

    html = TEMPLATE.replace('[[topic]]', topic).replace('[[desc]]', desc).replace('[[icon]]', icon).replace('[[base_rgb]]', theme['base']).replace('[[accent_color]]', theme['accent']).replace('[[en_prefix]]', theme['eng_pref']).replace('[[en_suffix]]', "ENGINEERING").replace('[[sub_cards_html]]', cards_html)
    
    # Inject Custom JS
    html = html.replace('function initCanvasBg() {', custom_js + '\n// Overridden initCanvasBg\nfunction initCanvasBg_old() {')
    html = html.replace('const logs = ["Connecting to core...", "Synchronizing data layers...", "Bypassing security protocols...", "Analyzing metrics..."];', 'const logs = typeof customLogs !== "undefined" ? customLogs : ["System OK"];')
    
    filename = f"hub-auto-{m_idx}.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html)
        
    update_launchpad({"topic": topic, "icon": icon}, m_idx, theme)
    print(f"[{datetime.now()}] ✅ {filename} (High Fidelity) 落盘成功！")


def run():
    print(f"[{datetime.now()}] 🛸 启动深核超高保真织布机，量产 151~200...")
    
    # 1. Ask Gemini for 50 High-End Disciplines (batch of 50 is ok for JSON list)
    prompt = """请一次性列出 50 个真实的、教育部备案或行业高度发展的前沿交叉学科/新工科专业方向。
要求：
1. 必须完全不同于之前的150个专业（避开脑机接口、人形机器人、数据科学、新能源、航空航天等常见）。尝试挖掘冷门但极具赛博感的新前缀（例如：空间碎屑处理、行星防御、数字孪生工程、元宇宙架构、仿生材料、认知智能、声学超维物理、太赫兹工程等真实的交叉领域）。
2. 每项包含 icon, 简短而极具赛博专业感的 desc。
3. 每项提供3个包含具体前沿技术方向的子主题（subs），含 title 和 desc。
不准重复，严格不准包含科幻魔法虚构要素。必须返回纯 JSON 数组，严禁在开头输出 ```json 或任何文字，严格从 [ 开始。"""
    
    # Due to token length, maybe ask for 2 batches of 24 to avoid truncation
    # But let's try 48 first with Flash
    json_str = call_gemini_json([{"role": "user", "content": prompt}])
    if not json_str:
        print("Failed to get disciplines.")
        return
        
    start_idx = 151
    for m in json_str:
        if start_idx > 200: break
        try:
            topic = m.get('topic', m.get('name'))
            desc = m.get('desc', m.get('description'))
            icon = m.get('icon', '🔹')
            subs = m.get('subs', m.get('subtopics', []))
            build_advanced_module(start_idx, topic, icon, desc, subs)
        except Exception as e:
            print(f"Error building {start_idx} with dict {m}: {e}")
            traceback.print_exc()
        start_idx += 1
        time.sleep(1.5) # Prevent rate limits
        
    print(f"[{datetime.now()}] 🎯 全系统注入完毕！151~200 部署上线。")

if __name__ == "__main__":
    run()
