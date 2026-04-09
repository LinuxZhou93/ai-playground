#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unit-2 Mercury Radar (破晓黎明自动雷达系统)
自动化嗅探 HuggingFace 的 Trendy 模型，并通过本地 Ollama 大模型提纯分析，
生成智能每日战报，并自动将事件注入 Antigravity Wiki。
"""

import sys
import json
import urllib.request
import urllib.error
from datetime import datetime
import os

# 导入 Wiki 探针
try:
    from wiki_evolution_probe import inject_evolution
except ImportError:
    print("❌ [Radar] 错误: 请确保跟 wiki_evolution_probe.py 在同一目录执行。")
    sys.exit(1)

HF_API_URL = "https://huggingface.co/api/models?sort=trendingScore&limit=5"
OLLAMA_API_URL = "http://localhost:11434/api/generate"
# 系统目前已确认安装的模型
OLLAMA_MODEL = "gemma4:latest"

def get_huggingface_trends():
    print("📡 [Radar] 正在连线 HuggingFace 大气层，搜寻最新信号...")
    try:
        req = urllib.request.Request(HF_API_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))
            models = []
            for item in data:
                models.append({
                    "id": item.get("id"),
                    "downloads": item.get("downloads", 0),
                    "task": item.get("pipeline_tag", "Unknown"),
                    "tags": item.get("tags", [])[:3]
                })
            return models
    except Exception as e:
        print(f"❌ [Radar] 嗅探由于天气原因受到干扰: {e}")
        return []

def analyze_with_ollama(models_data):
    print(f"🧠 [Radar] 正在将原始数据接驳入 [{OLLAMA_MODEL}] 核心神经元进行提纯...")
    prompt = f"""
你现在是 Mozi Lab 的顶级科技情报分析官军师。
我从 HuggingFace 截获了今日 Trending 前 5 的 AI 模型数据。请你为其撰写一份专业、结构化、富有赛博极客风格的情报日报。

原始数据（JSON）：
{json.dumps(models_data, ensure_ascii=False, indent=2)}

要求：
1. 语言：中文。语气要专业、精炼，仿佛是向上级（长官）汇报的内部军情专报。
2. 结构：
   - ⚡ 核心情报总览 (一段话概括今天的发展趋势)
   - 🔍 高能单位剖析 (分条陈述这些模型的突破点和潜在应用场景)
   - 💡 战略建议 (给我们在系统或者产品上可以引入的思路)
3. 不要使用过于随意的网络语言，保持高端科研机构的格调。不要编造任何模型信息，直接基于提供的数据提取。
"""
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        req = urllib.request.Request(
            OLLAMA_API_URL, 
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=240) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get("response", "提纯失败，未能获取到有效分析。")
    except Exception as e:
        print(f"❌ [Radar] 大模型神经元断连: {e}")
        return "⚠️ 当前大语言模型处理管线离线，仅呈现原始坐标：" + str(models_data)

def save_report(content):
    date_str = datetime.now().strftime("%Y-%m-%d")
    out_dir = "/Users/zhoulin/Desktop/github/ai-playground/000_Kernel/05_Memory/Daily"
    os.makedirs(out_dir, exist_ok=True)
    
    file_path = os.path.join(out_dir, f"{date_str}_HF_Radar.md")
    try:
        final_content = f"# 📡 Unit-2 Mercury Radar (破晓黎明情报站) - {date_str}\n\n{content}\n"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(final_content)
        print(f"✅ [Radar] 情报研报已加密写入潜意识库：{file_path}")
        return file_path
    except Exception as e:
        print(f"❌ [Radar] 回写存储盘遇阻: {e}")
        return None

def main():
    models = get_huggingface_trends()
    if not models:
        print("🤷 [Radar] 今日无情报波动，休眠中。")
        return

    analysis = analyze_with_ollama(models)

    report_path = save_report(analysis)
    if report_path:
        events = [
            f"⚡ Unit-2 (Mercury 游骑兵) 完成前沿侦测：捕获 5 个 HuggingFace 高维 AI 模型情报，并由 gemma4 提纯归档。"
        ]
        print("💉 [Radar] 正在将成就注入系统全局 Wiki (Evolution Probe)...")
        inject_evolution(events)

if __name__ == "__main__":
    main()
