import json
import os

def gen_hub(topic, en_title, icon, desc, sub1, sub2, sub3, sub1_desc, sub2_desc, sub3_desc, color_base, color_accent, file_path):
    color_base_rgb = color_base  # e.g., '168, 85, 247' for purple
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{topic} | TITAN OS</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/index.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    colors: {{
                        dark: '#030712',
                        theme_base: 'rgb({color_base_rgb})',
                        theme_accent: '{color_accent}',
                    }},
                    fontFamily: {{
                        orbitron: ['Orbitron', 'sans-serif'],
                        noto: ['"Noto Sans SC"', 'sans-serif'],
                        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
                    }}
                }}
            }}
        }}
    </script>
    
    <style>
        .cyber-grid {{
            position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.15;
            background-image: 
                linear-gradient(rgba({color_base_rgb},0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba({color_base_rgb},0.4) 1px, transparent 1px);
            background-size: 40px 40px;
            transform: perspective(600px) rotateX(60deg) translateY(-100px) translateZ(-200px);
            animation: grid-move 20s linear infinite;
        }}
        @keyframes grid-move {{ 0% {{ background-position: 0 0; }} 100% {{ background-position: 0 40px; }} }}
        .glass-panel {{ background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border: 1px solid rgba({color_base_rgb},0.2); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
        .holo-card {{ transition: transform 0.3s ease, border-color 0.3s; }}
        .holo-card:hover {{ border-color: rgba({color_base_rgb},0.8); box-shadow: 0 0 20px rgba({color_base_rgb},0.3); }}
        
        #preloader {{ position: fixed; inset: 0; background: #030712; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
        .loader-bar {{ width: 300px; height: 2px; background: rgba(255,255,255,0.1); margin-top: 20px; position: relative; overflow: hidden; }}
        .loader-progress {{ position: absolute; top: 0; left: 0; height: 100%; width: 0%; background: {color_accent}; box-shadow: 0 0 10px {color_accent}; }}
        
        .core-visual {{ width: 100%; height: 100%; position: absolute; display: flex; align-items: center; justify-content: center; transform-style: preserve-3d; }}
        .core-ring {{ position: absolute; border-radius: 50%; opacity: 0.8; }}
        .core-ring-1 {{ border: 2px dashed rgba({color_base_rgb}, 0.5); width: 400px; height: 400px; animation: spin 20s linear infinite; }}
        .core-ring-2 {{ border: 1px solid {color_accent}; width: 350px; height: 350px; animation: spin-rev 15s linear infinite; }}
        .core-ring-3 {{ border: 4px dotted rgba({color_base_rgb}, 0.3); width: 480px; height: 480px; animation: spin 30s linear infinite; }}
        @keyframes spin {{ 100% {{ transform: rotate(360deg); }} }}
        @keyframes spin-rev {{ 100% {{ transform: rotate(-360deg); }} }}
    </style>
</head>
<body class="selection:bg-theme_base selection:text-white bg-dark text-white font-noto overflow-x-hidden">

    <div id="preloader">
        <div class="text-[{color_accent}] text-sm tracking-[0.3em] font-bold font-orbitron" id="load-text">INITIALIZING TITAN PROTOCOL...</div>
        <div class="loader-bar"><div class="loader-progress" id="load-progress"></div></div>
    </div>

    <div class="cyber-grid"></div>
    <div class="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[rgba({color_base_rgb},0.08)] rounded-full blur-[150px] pointer-events-none"></div>
    <div class="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[rgba({color_base_rgb},0.05)] rounded-full blur-[120px] pointer-events-none"></div>

    <nav class="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none py-4 px-6 flex justify-between items-center transition-transform duration-300" id="navbar">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full border border-theme_base/50 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba({color_base_rgb},0.3)] text-xl">{icon}</div>
            <div class="font-orbitron font-black text-xl tracking-[0.2em]">{en_title.split()[0].upper()}<span class="text-[{color_accent}]">SYS</span></div>
        </div>
        <a href="index.html" class="flex items-center gap-2 group cursor-pointer">
            <span class="font-orbitron text-xs tracking-widest text-gray-400 group-hover:text-white transition-colors duration-300">[ RETURN_TO_HUB ]</span>
        </a>
    </nav>

    <header class="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div class="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            
            <div class="lg:w-7/12 space-y-8 gs-reveal mt-20 lg:mt-0">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[rgba({color_base_rgb},0.3)] bg-[rgba({color_base_rgb},0.1)]">
                    <span class="w-2 h-2 rounded-full bg-[{color_accent}] animate-ping"></span>
                    <span class="font-mono text-[{color_accent}] text-xs font-bold tracking-widest">NEURAL UPLINK ACTIVE</span>
                </div>
                
                <h1 class="font-orbitron text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight uppercase">
                    {en_title.split()[0]}<br>
                    <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(to right, {color_accent}, rgba({color_base_rgb},1)); filter: drop-shadow(0 0 20px rgba({color_base_rgb},0.4));">{' '.join(en_title.split()[1:]) if len(en_title.split()) > 1 else 'ENGINEERING'}</span><br>
                    <span class="text-3xl lg:text-5xl font-noto tracking-widest text-white mt-4 block">{topic}</span>
                </h1>
                
                <p class="text-gray-400 font-light text-lg leading-relaxed max-w-2xl border-l-2 pl-6 py-2" style="border-color: rgba({color_base_rgb},0.5)">
                    {desc}
                </p>

                <div class="glass-panel p-4 mt-8 w-full max-w-md font-mono text-xs text-green-400 h-32 overflow-hidden relative border border-[rgba({color_base_rgb},0.2)]">
                    <div class="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] pointer-events-none z-10"></div>
                    <div id="typewriter" class="opacity-80 break-all whitespace-pre-wrap"></div>
                </div>
            </div>

            <div class="lg:w-5/12 flex justify-center items-center gs-reveal relative h-[500px]">
                <div class="core-visual">
                    <div class="core-ring core-ring-1"></div>
                    <div class="core-ring core-ring-2"></div>
                    <div class="core-ring core-ring-3"></div>
                    <div class="absolute w-[80%] h-[80%] flex items-center justify-center text-[120px] animate-[pulse_3s_ease-in-out_infinite]" style="filter: drop-shadow(0 0 30px {color_accent});">{icon}</div>
                </div>

                <div class="absolute top-10 right-0 glass-panel px-3 py-2 font-mono text-[10px] text-[{color_accent}] animate-bounce border border-[rgba({color_base_rgb},0.3)]">
                    SYNC_RATE: 99.98%
                </div>
                <div class="absolute bottom-20 -left-10 glass-panel px-3 py-2 font-mono text-[10px] text-white border border-[rgba({color_base_rgb},0.3)]">
                    INTEGRITY: OPTIMAL
                </div>
            </div>
        </div>
    </header>

    <section class="py-32 relative z-10" id="matrix">
        <div class="container mx-auto px-6">
            <div class="flex flex-col items-center text-center mb-24 gs-reveal-up">
                <div class="font-orbitron tracking-[0.5em] text-sm mb-4" style="color: {color_accent}">/// KNOWLEDGE MATRIX</div>
                <h2 class="text-4xl lg:text-5xl font-black font-noto">核心架构阵列</h2>
                <div class="w-24 h-1 mt-6" style="background: linear-gradient(to right, transparent, {color_accent}, transparent)"></div>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                
                <a href="{file_path.replace('hub-', '').replace('.html', '-sub1.html')}" class="block glass-panel p-8 holo-card group cursor-pointer gs-reveal-up border-l-4" style="border-left-color: {color_accent}">
                    <div class="flex justify-between items-start mb-8">
                        <div class="text-[3rem] opacity-20 font-orbitron font-black leading-none group-hover:opacity-100 transition-opacity" style="color: {color_accent}">01</div>
                        <span class="font-mono text-[10px] px-2 py-1 bg-green-500/10 text-green-400 rounded-sm border border-green-500/20">ONLINE</span>
                    </div>
                    <h3 class="text-2xl font-bold font-noto mb-3">{sub1}</h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-6 font-light">{sub1_desc}</p>
                    <div class="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                        <div class="w-0 h-full group-hover:w-full transition-all duration-1000 ease-out" style="background-color: {color_accent}"></div>
                    </div>
                </a>

                <a href="{file_path.replace('hub-', '').replace('.html', '-sub2.html')}" class="block glass-panel p-8 holo-card group cursor-pointer gs-reveal-up border-l-4" style="border-left-color: rgba({color_base_rgb}, 1)">
                    <div class="flex justify-between items-start mb-8">
                        <div class="text-[3rem] opacity-20 font-orbitron font-black leading-none group-hover:opacity-100 transition-opacity" style="color: rgba({color_base_rgb}, 1)">02</div>
                        <span class="font-mono text-[10px] px-2 py-1 bg-green-500/10 text-green-400 rounded-sm border border-green-500/20">ONLINE</span>
                    </div>
                    <h3 class="text-2xl font-bold font-noto mb-3">{sub2}</h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-6 font-light">{sub2_desc}</p>
                    <div class="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                        <div class="w-0 h-full group-hover:w-full transition-all duration-1000 ease-out" style="background-color: rgba({color_base_rgb}, 1)"></div>
                    </div>
                </a>

                <a href="{file_path.replace('hub-', '').replace('.html', '-sub3.html')}" class="block glass-panel p-8 holo-card group cursor-pointer gs-reveal-up border-l-4" style="border-left-color: #38bdf8">
                    <div class="flex justify-between items-start mb-8">
                        <div class="text-[3rem] opacity-20 font-orbitron font-black leading-none group-hover:opacity-100 transition-opacity" style="color: #38bdf8">03</div>
                        <span class="font-mono text-[10px] px-2 py-1 bg-green-500/10 text-green-400 rounded-sm border border-green-500/20">ONLINE</span>
                    </div>
                    <h3 class="text-2xl font-bold font-noto mb-3">{sub3}</h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-6 font-light">{sub3_desc}</p>
                    <div class="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                        <div class="w-0 h-full group-hover:w-full transition-all duration-1000 ease-out" style="background-color: #38bdf8"></div>
                    </div>
                </a>
            </div>
        </div>
    </section>

    <!-- LIVE TELEMETRY LAB TERMINAL -->
    <section class="py-20 bg-black/80 border-y relative overflow-hidden" id="telemetry" style="border-color: rgba({color_base_rgb}, 0.2)">
        <div class="absolute inset-0 cyber-grid opacity-10"></div>
        <div class="container mx-auto px-6 relative z-10 flex justify-center">
            
            <div class="w-full max-w-4xl glass-panel p-1 rounded-lg shadow-2xl gs-telemetry" style="border-color: rgba({color_base_rgb}, 0.4)">
                <div class="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-t-md border-b border-gray-800">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div class="ml-4 font-mono text-[10px] text-gray-500">TITAN_{en_title.split()[0].upper()}_TERMINAL</div>
                </div>
                <div class="bg-[#050505] p-6 h-80 rounded-b-md font-mono text-[12px] leading-relaxed overflow-hidden relative" style="color: {color_accent}">
                    <div class="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.4)_2px,rgba(0,0,0,0.4)_4px)] z-10"></div>
                    <div id="telemetry-feed" class="terminal-lines h-full flex flex-col justify-end space-y-1">
                    </div>
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
            "SYNTHESIZING PARADIGMS: {sub1} ALIGNED",
            "WARNING: ANOMALY DETECTED IN NODE 7X.",
            "CALIBRATION: {sub2} ACTIVE.",
            "NANOBOT SWARM COORDINATES UPDATE: (X, Y, Z)",
            "HEARTBEAT: NORMAL | RESOURCES: OPTIMAL"
        ];
        setInterval(() => {{
            if(feedContainer.children.length > 15) {{
                feedContainer.removeChild(feedContainer.firstChild);
            }}
            const line = document.createElement('div');
            line.innerHTML = `> ${{snippets[Math.floor(Math.random()*snippets.length)]}} <span style="background: {color_accent}; color: black; padding: 0 4px; opacity: 0.7;">OK</span>`;
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
            gsap.from(elem, {{
                scrollTrigger: {{ trigger: elem, start: "top 85%" }},
                y: 50, opacity: 0, duration: 1, ease: "power3.out"
            }});
        }});

        gsap.from(".gs-telemetry", {{
            scrollTrigger: {{ trigger: "#telemetry", start: "top 80%" }},
            scale: 0.95, y: 40, opacity: 0.5, duration: 1.2, ease: "back.out(1)"
        }});

        document.querySelectorAll('.holo-card').forEach(card => {{
            card.addEventListener('mousemove', e => {{
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top;
                const xc = (x / rect.width) * 100;
                const yc = (y / rect.height) * 100;
                const tiltX = (yc - 50) * -0.15; 
                const tiltY = (xc - 50) * 0.15;
                card.style.transform = `perspective(1000px) rotateX(${{tiltX}}deg) rotateY(${{tiltY}}deg) translateY(-5px)`;
            }});
            card.addEventListener('mouseleave', () => {{
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
            }});
        }});
    </script>
</body>
</html>"""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Generated {file_path}")

modules = [
    {
        "topic": "量子信息科学与工程",
        "en_title": "QUANTUM INFORMATION",
        "icon": "⚛️",
        "desc": "突破硅基摩尔定律的终极利器。基于量子叠加与纠缠特性，构建具有超大规模纠错能力的量子图灵机模型与安全信道传输密码体系。",
        "sub1": "量子计算与算法开发", "sub2": "量子密钥分发", "sub3": "量子态隐形传态",
        "sub1_desc": "研发基于超导或离子阱体系的物理量子比特。",
        "sub2_desc": "建设防窃听的绝对安全通信干线网络。",
        "sub3_desc": "实现量子态空间距离上的无接触瞬时投递。",
        "color_base": "168, 85, 247", "color_accent": "#c084fc", "file_path": "hub-auto-61.html"
    },
    {
        "topic": "机器人工程",
        "en_title": "ROBOTICS ENGINEERING",
        "icon": "🤖",
        "desc": "机械与智能的完美融合。涵盖动力学、伺服控制与空间运动学，赋予无生命体以行动、感知与决策能力，推动自动化时代。",
        "sub1": "机器人机构学", "sub2": "智能控制理论", "sub3": "机器视觉感知",
        "sub1_desc": "建立串联与并联机械臂的解析与高精度结构.",
        "sub2_desc": "基于PID到MPC抵制干扰，保持极境中的精确平衡。",
        "sub3_desc": "点云探测与SLAM赋予无生命体在乱局中自我寻录导航。",
        "color_base": "244, 63, 94", "color_accent": "#fb7185", "file_path": "hub-auto-62.html"
    },
    {
        "topic": "智能建造",
        "en_title": "INTELLIGENT CONSTRUCTION",
        "icon": "🏗️",
        "desc": "重塑土木建筑业的基石。将传统工程与物联网及机器人技术深度融合，从BIM数字化设计到施工现场的无人化全生命周期作业。",
        "sub1": "数字化设计与BIM", "sub2": "全自动化施工装备", "sub3": "基础设施健康监测",
        "sub1_desc": "消除碰撞，优化力场，实现造价与物料智能排布。",
        "sub2_desc": "顶升模架系统与打印编织集群自主完成百米高楼。",
        "sub3_desc": "光纤光栅传感赋予大坝“痛觉”，实现灾害毫秒告警。",
        "color_base": "245, 158, 11", "color_accent": "#fbbf24", "file_path": "hub-auto-63.html"
    },
    {
        "topic": "工业智能",
        "en_title": "INDUSTRIAL INTELLIGENCE",
        "icon": "🏭",
        "desc": "第四次工业革命的神经中枢。利用机器视觉、时间序列深度学习与边缘计算设备，全面瓦解孤岛从而实现黑暗工厂的高效自治运转。",
        "sub1": "工业大数据与决策", "sub2": "智能过程调度优化", "sub3": "缺陷视觉检测架构",
        "sub1_desc": "对齐异构工业源日志，实时诊断高炉或流水线异常率。",
        "sub2_desc": "利用运筹学算法在毫秒级别为柔性产线重新分配工单。",
        "sub3_desc": "高速工业相机配合缺陷标注AI精确拦截0.01mm产品瑕疵。",
        "color_base": "56, 189, 248", "color_accent": "#bae6fd", "file_path": "hub-auto-64.html"
    }
]

for m in modules:
    gen_hub(**m)
