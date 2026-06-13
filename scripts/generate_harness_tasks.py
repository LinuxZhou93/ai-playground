#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import urllib.request
import urllib.error

BASE_DIR = os.getcwd()
ENV_PATH = os.path.join(BASE_DIR, '.env')
TASKS_FILE = os.path.join(BASE_DIR, 'scripts', 'tasks_queue.json')

def load_env():
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

ENV = load_env()
API_KEY = ENV.get('OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY', ''))
BASE_URL = ENV.get('OPENAI_BASE_URL', os.environ.get('OPENAI_BASE_URL', 'https://backgrace.com/v1'))
MODEL_NAME = ENV.get('DEFAULT_MODEL', 'google:gemini-3.5-flash')

def call_llm(messages):
    url = f"{BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    model = MODEL_NAME
    if ":" in model:
        model = model.split(":", 1)[1]
        
    data = {
        "model": model,
        "messages": messages,
        "temperature": 0.5,
        "response_format": {"type": "json_object"}  # 强制 LLM 返回 JSON 格式
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            return res_json["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[ERROR] LLM Request failed: {e}")
        raise e

def generate_batch(batch_num, current_count):
    print(f"[GENERATOR] 正在生成第 {batch_num} 批优化任务 (已有 {current_count} 个)...")
    
    prompt = f"""你是一个高级的系统架构师。你需要为 `zhouxiaomai.com` 项目生成 10 个具体的功能优化和内容迭代任务，并追加到自动进化 Harness 的待开发队列中。

当前项目技术栈：
- 前端：Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Echarts
- 数据库：Supabase (PostgreSQL)
- 测试：Vitest (单元测试), Playwright (E2E测试)
- 历史架构：在 `public/` 和 `public/resources/` 下有大量用于展示炫酷视觉效果的物理 H5 页面（如 explain.html, course.html, pricing-demo.html, labs.html, ide-scratch.html, debate_lab.html）
- 订阅系统：Stripe 订阅 + Webhook + 安全卡密核销

请设计 10 个可交付、目标精确、可自动测试验收的优化任务。每个任务必须包含以下四个维度之一的优化：
1. **全球化与多语言 (i18n)**: 抽取静态页面中硬编码的中文并替换为动态 locale 提取，补充完善英文翻译映射表。
2. **前端 UI 极客炫酷度**: 增加毛玻璃态（Glassmorphism）、微交互悬停动效、Echarts图表空状态和加载骨架屏、移动端适配优化。
3. **测试覆盖率与架构安全**: 为已有 API 接口（Checkout/Redeem 等）补充异常测试，或为核心功能模块编写单元测试，封锁数据边界。
4. **功能细化打磨**: 完善 profiles 表用户字段扩展与 API、打磨课程页面中的代码运行或案例卡片、优化中间件对静态资源文件的智能映射缓存头部等。

请以 JSON 格式输出，结构必须是一个包含 "tasks" 数组的对象。每个 task 对象必须包含以下字段：
- "id": 唯一 ID，格式如: "opt_t[数字]_描述" (请根据当前已有任务数计数，当前已生成到第 {current_count} 个任务，本次生成的任务 ID 计数应从 {current_count + 1} 开始)
- "title": 简洁的任务标题，例如: "优化定价卡片 hover 极客微交互"
- "description": 详细、具体的开发动作指南。需要指出修改什么文件、新增什么内容或测试，如何使用 Vitest 验收。这要能够被另一个无人工干预的 Coding Agent 听懂并完美执行。
- "status": 必须固定为 "pending"

输出格式示例：
{{
  "tasks": [
    {{
      "id": "opt_t1_pricing_hover",
      "title": "优化定价卡片 hover 极客微交互",
      "description": "修改 public/resources/pricing-demo.html 定价卡片样式，在 hover 状态下引入赛博朋克霓虹光晕（neon shadow）与 subtle scale 动效。并在 tests 目录下编写/追加对于 pricing 页面的交互事件绑定验证断言，确保改动没有打断 Stripe 支付绑定的点击行为。",
      "status": "pending"
    }}
  ]
}}
"""

    messages = [
        {"role": "system", "content": "You are a professional software architect. Output JSON only."},
        {"role": "user", "content": prompt}
    ]
    
    res_str = call_llm(messages)
    try:
        batch_data = json.loads(res_str)
        tasks = batch_data.get("tasks", [])
        print(f"[SUCCESS] 成功生成 {len(tasks)} 个任务。")
        return tasks
    except Exception as e:
        print(f"[ERROR] 解析 JSON 失败: {e}\n模型返回内容:\n{res_str}")
        return []

def main():
    if not API_KEY:
        print("[ERROR] 未配置 OPENAI_API_KEY")
        sys.exit(1)
        
    print("[MIGRATOR] 24*7 进化队列引擎：正在全量生成 100 轮优化任务...")
    
    # 1. 加载已有任务列表
    existing_tasks = []
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                existing_tasks = data.get("tasks", [])
        except Exception as e:
            print(f"[WARN] 读取任务文件失败，将全新创建: {e}")

    # 过滤出非 pending 任务，保留其完成状态
    completed_tasks = [t for t in existing_tasks if t.get("status") != "pending"]
    
    all_new_tasks = []
    # 2. 分 10 批，每批 10 个，总共 100 个优化任务
    total_to_generate = 100
    for i in range(10):
        current_count = len(completed_tasks) + len(all_new_tasks)
        tasks_batch = generate_batch(i + 1, current_count)
        all_new_tasks.extend(tasks_batch)
        
    # 3. 合并写入 TASKS_FILE
    final_tasks = completed_tasks + all_new_tasks
    
    # 限制只保留最先生成的 100 个新任务（加上已完成的）
    final_data = {"tasks": final_tasks}
    
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
        
    print(f"\n[FINISH] 任务库构建完毕！当前队列共有 {len(final_tasks)} 个任务（其中新追加了 {len(all_new_tasks)} 个 pending 任务）。")

if __name__ == "__main__":
    main()
