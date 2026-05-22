import os
import re
import time
import requests
import subprocess
import json

# ================= 配置区 =================
# 您提供的 API Key
API_KEY = os.getenv("AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
# 您提供的 API Base URL 
BASE_URL = "https://backgrace.com/v1/chat/completions"
# 根据您的需求，指定的模型是 Gemini 1.5 Flash (有时简写或映射为 gemini-1.5-flash)
MODEL = "gemini-1.5-flash"  
# 每个模块最多对抗的轮数，防止进入无尽死循环消耗 Token
MAX_LOOPS_PER_MODULE = 3 

# 这里的 20 大模块是根据您的最新要求，全部替换为“宏观大学科专业前沿导览”，形成有意义的科普大页面。
TOPICS = [
    {"name": "临床医学与前沿医疗", "filename": "hub-medicine.html", "icon": "🩺", "category": "academic"},
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

# ================= AI 代理设定 =================
AGENT_A_PROMPT = """你是一名世界顶尖的前端架构师和科普内容主编。你正在为 "Future AI 科技特长生网站" 开发极其生动、专业的大学前沿学科科普主页。
这些不是小小的一个工具页面，而是宏观的一流学科主页 (Hub级)。应具有：
1. 头部的超震撼的大幅 Hero 区介绍该学科。
2. 内部通过卡片网格罗列该学科当前的 3-4 个前沿探索热点。
3. 深色模式 (黑色/极深蓝背景)、毛玻璃 (Glassmorphism) 拟物态面板，大量发光霓虹色点缀。
4. 必须使用网站内建的 <link rel="stylesheet" href="assets/css/index.css">，字体使用 Orbitron 和 Noto Sans SC。

产出：
输出最完美的完整单文件 HTML（内联特有交互的 JS/CSS）。极其高级，不要任何 Markdown 代码块，不要任何废话。代码质量就是你的全部！"""

AGENT_B_PROMPT = """你是世界最严苛的产品专家体验官与高级前端审查员。
检查 Agent A 的大学科主页设计代码：
1. 页面是不是过于简陋（字太少、内容太空洞）？是不是没有体现一个大一级学科的宏大气场？
2. 设计与排版是否足够高端暗黑风（Glassmorphism，毛玻璃拟物化）？
3. 内容里是否真正包含深入浅出的专业学科解析概念？
如果不够震撼或有任何上述不足，请用极端挑剔刻薄的语气指出，并勒令重写。如果一切已达到世界顶尖的视觉和知识呈现范畴，请在结语加上一个词："PASS" 。"""

def call_llm(system_prompt, user_content):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.8
    }
    try:
        resp = requests.post(BASE_URL, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"❌ API 调用通信失败: {e}")
        return ""

def update_launchpad(topic):
    launchpad_path = "assets/js/launchpad.js"
    if not os.path.exists(launchpad_path):
        print(f"⚠️ 找不到 {launchpad_path} ! 请确保在 ai-playground 根目录下运行。")
        return False
        
    with open(launchpad_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    if f"link: '{topic['filename']}'" in content:
        print("⏭️ 此模块已在宝箱中，跳过注入。")
        return True
        
    new_entry = f"\n        {{ name: '{topic['name']}', icon: '{topic['icon']}', link: '{topic['filename']}', color: '#d946ef', category: '{topic['category']}' }},"
    
    # 插入到数组开头
    new_content = content.replace("const apps = [", "const apps = [" + new_entry)
    with open(launchpad_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True

def git_commit(filename, topic_name):
    try:
        subprocess.run(["git", "add", "assets/js/launchpad.js", filename], check=True, capture_output=True)
        subprocess.run(["git", "commit", "-m", f"auto-evo: add {topic_name} macro hub"], check=True, capture_output=True)
        print(f"✅ 成功归档保存 Commit: {topic_name}")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Git commit failed (如果您没有初始化git，可忽略): {e}")

def main():
    print("🏛️========================================🏛️")
    print("    Future AI 大学科午夜无人值守进化引擎启动...    ")
    print("🏛️========================================🏛️")
    print(f"🔗 API Endpoint: {BASE_URL} (Model: {MODEL})")
    
    for topic in TOPICS:
        print(f"\n=======================================================")
        print(f"🎯 攻坚宏大的前沿学科领域主页: 【 {topic['icon']} {topic['name']} 】")
        
        print("🧑‍💻 [Agent A] 正在高速构建骨干模块和视觉...")
        html_code = call_llm(AGENT_A_PROMPT, f"开发【{topic['name']}】的最顶级专业科普导览主页。这是一门宏大的人类现代学科，需要内容充实、排版大气、深色高级。代码不能缩水，直接输出唯一的 HTML。")
        
        loop = 0
        while loop < MAX_LOOPS_PER_MODULE:
            loop += 1
            print(f"🕵️‍♂️ [Agent B] (第 {loop}/{MAX_LOOPS_PER_MODULE} 轮) 在显微镜下进行挑骨头审查...")
            review = call_llm(AGENT_B_PROMPT, f"下面是A新出的【{topic['name']}】的代码，请找茬：\n\n{html_code}")
            
            if not review:
                print("⚠️ API通信中断，跳过此轮重试。")
                break
                
            if "PASS" in review.upper():
                print("✨✨ [Agent B] 发出惊叹声：高级感爆棚，验收通过！✨✨")
                break
            else:
                print(f"🤬 [Agent B] 不满意架构深度并出具长篇整改要求给 A ！")
                html_code = call_llm(AGENT_A_PROMPT, f"你的【{topic['name']}】学科主页代码被驳回了：\n\n{review}\n\n全面升级它！用上你毕生的功力生成震撼的版本代码：\n\n{html_code}")
                time.sleep(2)
                
        # 整理输出并落盘
        if html_code:
            html_code = re.sub(r"^```html\n|^```\n|```$", "", html_code.strip(), flags=re.MULTILINE)
            with open(topic["filename"], "w", encoding="utf-8") as f:
                f.write(html_code)
            print(f"💾 实体巨作文件 [{topic['filename']}] 落盘生辉！")
            
            # 挂载进 Launchpad
            if update_launchpad(topic):
                print(f"🚀 已作为全新大学类入口成功挂载至【科技宝箱】。")
                git_commit(topic["filename"], topic["name"])
        else:
            print("❌ AI 脑血栓发作，输出为空，跳过本页。")
            
        print(f"💤 挂起 3 秒钟散热...进入下一个文明结晶。")
        time.sleep(3)
        
    print("\n🎉 今夜所有的大学科主页都已封顶！科技宝箱已扩充完毕。")

if __name__ == "__main__":
    main()
