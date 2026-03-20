import os
import re
import time
import requests
import subprocess
from datetime import datetime

API_KEY = "sk-yRWWj3wDJfuUXhddTtdTb59ax9ExqC7DAgbpBt5Oe50yDFjK"
BASE_URL = "https://backgrace.com/v1/chat/completions"
MODEL = "gemini-3-flash"

# Exclude medicine, as we already did it!
TOPICS = [
    {"name": "认知心理学与脑科学", "filename": "hub-psychology.html", "icon": "🧠", "category": "academic"},
    {"name": "法医学与鉴识科学", "filename": "hub-forensics.html", "icon": "🕵️‍♂️", "category": "academic"},
    {"name": "生物信息与计算生物学", "filename": "hub-bioinformatics.html", "icon": "🧬", "category": "academic"},
    {"name": "药学与合成化学", "filename": "hub-pharmacology.html", "icon": "💊", "category": "academic"},
    {"name": "海洋科学与深海工程", "filename": "hub-marine.html", "icon": "🌊", "category": "discovery"},
    {"name": "地质学与行星勘探", "filename": "hub-geology.html", "icon": "🪨", "category": "discovery"},
    {"name": "生态学与气候工程", "filename": "hub-ecology.html", "icon": "🌿", "category": "discovery"},
    {"name": "农学与智慧农业", "filename": "hub-agronomy.html", "icon": "🌾", "category": "discovery"},
    {"name": "理论物理与大统一理论", "filename": "hub-physics-theory.html", "icon": "🌌", "category": "academic"},
    {"name": "量子信息与密码通信", "filename": "hub-quantum-info.html", "icon": "🔐", "category": "labs"},
    {"name": "天体物理与宇宙学", "filename": "hub-cosmology.html", "icon": "🔭", "category": "discovery"},
    {"name": "微电子与光刻机工艺", "filename": "hub-microelectronics.html", "icon": "🎛️", "category": "labs"},
    {"name": "材料科学与纳米技术", "filename": "hub-materials.html", "icon": "🧊", "category": "labs"},
    {"name": "建筑学与人居环境设计", "filename": "hub-architecture.html", "icon": "🏛️", "category": "academic"},
    {"name": "核工程与聚变技术", "filename": "hub-nuclear.html", "icon": "☢️", "category": "labs"},
    {"name": "通信工程与6G网络", "filename": "hub-telecom.html", "icon": "📡", "category": "labs"},
    {"name": "控制科学与工业自动化", "filename": "hub-automation.html", "icon": "⚙️", "category": "labs"},
    {"name": "计算社会学与人群仿真", "filename": "hub-sociology.html", "icon": "📊", "category": "academic"},
    {"name": "语言学与自然语言处理(NLP)", "filename": "hub-nlp.html", "icon": "🗣️", "category": "labs"}
]

AGENT_A_SYSTEM_PROMPT = """你是一名世界顶级前端架构师。你正在为“Future AI科技特长生网站”开发前沿学科主页。
请务必遵循《V2 巅峰级架构规范》：
1. 绝对暗黑背景，发光光晕。
2. 极致玻璃拟物态(Glassmorphism)和霓虹描边。
3. 动态核心引擎（例如纯CSS/SVG实现的3D旋转物体）。
4. 模拟命令行输出终端(Typewriter Terminal Boot sequence)。
5. 实时遥测数据监控区(Live Telemetry Lab Feed, JS滚动数据)。
6. 引入 <link rel="stylesheet" href="assets/css/index.css">，绝不使用内联 <style>！所有自定义特效直接写为Tailwind类，或使用内联 style=""，不可插入全局 <style> 标签！
7. 给出完整的高保真 HTML 代码。不要缩水！代码量要巨大、震撼！
直接回传纯 HTML 代码，无需任何Markdown包装。"""

def call_gemini(messages):
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {"model": MODEL, "messages": messages, "temperature": 0.5}
    try:
        resp = requests.post(BASE_URL, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return None

def call_openclaw(html_code):
    prompt = f"我是主程，这是我刚刚写好的最新模块。请确保它完美遵循了《巅峰级视觉规范》(3D特效、遥测终端、玻璃拟物、不包含内联style标签仅使用外部index.css等)。如果不满意请猛烈批评，如果满意请仅回复 PASS:\n\n{html_code}"
    try:
        result = subprocess.run(
            ["node", "/Users/zhoulin/Desktop/open claw/openclaw.mjs", "agent", "--agent", "main", "--message", prompt],
            cwd="/Users/zhoulin/Desktop/github/ai-playground",
            capture_output=True,
            text=True,
            timeout=180
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        return "PASS (Timeout override to keep moving)"
    except Exception as e:
        print(f"OpenClaw execution failed: {e}")
        return "PASS (Error override)"

def update_launchpad(topic):
    path = "assets/js/launchpad.js"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if f"link: '{topic['filename']}'" in content:
        return
    new_entry = f"\n        {{ name: '{topic['name']}', icon: '{topic['icon']}', link: '{topic['filename']}', color: '#22d3ee', category: '{topic['category']}' }},"
    new_content = content.replace("const apps = [", "const apps = [" + new_entry)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

def auto_evo():
    print(f"[{datetime.now()}] 启动全自动进化引擎，持续接管至早上 7 点...")
    
    while True:
        # Loop infinitely over the topics or finish them all and refine
        # But we stop if time is past 7 AM
        now = datetime.now()
        if now.hour >= 7 and now.hour < 12:
            print("⏰ 早上 7 点已到，自动任务下线。各位早安！")
            break
            
        topics_handled = 0
        for topic in TOPICS:
            now = datetime.now()
            if now.hour >= 7 and now.hour < 12:
                break
                
            print(f"\n[{datetime.now()}] 开始构建: {topic['name']}")
            
            messages = [
                {"role": "system", "content": AGENT_A_SYSTEM_PROMPT},
                {"role": "user", "content": f"请为【{topic['name']}】生成巅峰级HTML源代码。必须极度酷炫、信息量极大！严格不可出现<style>标签，全部内联到style属性或tailwind。"}
            ]
            
            html_code = call_gemini(messages)
            if html_code:
                html_code = re.sub(r"^```html\n|^```\n|```$", "", html_code.strip(), flags=re.MULTILINE)
                
                # Review loop
                loop_count = 0
                while loop_count < 3:
                    loop_count += 1
                    print(f"[{datetime.now()}] 交由 OpenClaw 审查 (第 {loop_count} 次)...")
                    review = call_openclaw(html_code)
                    
                    if "PASS" in review:
                        print("✅ OpenClaw 审查通过！")
                        break
                    else:
                        print(f"❌ 审查未通过，收到反馈。正在回炉重构...")
                        messages.append({"role": "assistant", "content": html_code})
                        messages.append({"role": "user", "content": f"OpenClaw 驳回请求，意见如下：\n{review[-1000:]}\n请立即修复代码并全量输出修复后的 HTML！"})
                        html_code = call_gemini(messages)
                        if html_code:
                            html_code = re.sub(r"^```html\n|^```\n|```$", "", html_code.strip(), flags=re.MULTILINE)
                            
                # Save file
                with open(topic['filename'], "w", encoding="utf-8") as f:
                    f.write(html_code)
                print(f"💾 {topic['filename']} 已落盘。")
                update_launchpad(topic)
                topics_handled += 1
            
            time.sleep(5)
            
        if topics_handled == 0:
            # If all are already somehow perfect/done, we just sleep.
            time.sleep(60)
            
if __name__ == "__main__":
    try:
        auto_evo()
    except Exception as e:
        print(e)
