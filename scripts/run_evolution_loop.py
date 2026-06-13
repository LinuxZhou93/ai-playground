#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import subprocess
import time
from datetime import datetime

BASE_DIR = os.getcwd()
TASKS_FILE = os.path.join(BASE_DIR, 'scripts', 'tasks_queue.json')
ARTIFACT_PROGRESS_FILE = "/Users/zhoulin/.gemini/antigravity/brain/9f314f51-298e-4fe7-95a0-dea06b113f6e/evolution_progress.md"

def get_stats():
    if not os.path.exists(TASKS_FILE):
        return 0, 0, 0, 0, []
        
    with open(TASKS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    tasks = data.get("tasks", [])
    total = len(tasks)
    completed = len([t for t in tasks if t.get("status") == "completed"])
    failed = len([t for t in tasks if t.get("status") in ["failed", "conflict"]])
    pending = len([t for t in tasks if t.get("status") == "pending"])
    
    # 获取最近完成/失败的任务记录
    sorted_tasks = sorted(
        [t for t in tasks if t.get("status") != "pending"], 
        key=lambda x: x.get("updated_at", ""), 
        reverse=True
    )
    
    return total, completed, failed, pending, sorted_tasks[:10]

def update_progress_artifact():
    total, completed, failed, pending, recent_logs = get_stats()
    
    progress_pct = (completed / total * 100) if total > 0 else 0
    success_rate = (completed / (completed + failed) * 100) if (completed + failed) > 0 else 100
    
    # 渲染赛博朋克极客风格的仪表盘进度条
    bar_len = 30
    filled_len = int(round(bar_len * progress_pct / 100))
    bar = "█" * filled_len + "░" * (bar_len - filled_len)
    
    markdown_content = f"""# 墨子实验室 (zhouxiaomai.com) 自动进化 Harness 运行看板

> [!NOTE]
> 本看板由 24*7 进化调度器自动维护。显示当前平台正在执行的 100 轮代码自愈与功能优化飞轮进度。

---

## 📊 进化仪表盘 (Evolution Dashboard)

```
进化总进度: {progress_pct:.1f}%  [{bar}]  ({completed}/{total})
构建成功率: {success_rate:.1f}%  (自愈成功: {completed} | 熔断失败: {failed})
待处理队列: {pending} 个 pending 任务
```

| 指标 | 当前数值 | 状态 |
| :--- | :--- | :--- |
| **已运行轮数** | {completed + failed} / 100 | 进行中 |
| **自愈代码合并** | {completed} | 成功 |
| **测试未通过熔断** | {failed} | 已处理 |
| **最近同步脉冲** | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | 绿标 |

---

## 🪵 最近 10 轮进化任务日志

| 任务 ID | 标题 | 状态 | 完成时间 |
| :--- | :--- | :--- | :--- |
"""

    for t in recent_logs:
        status_emoji = "✅ completed" if t["status"] == "completed" else "❌ failed"
        updated_time = t.get("updated_at", "").split(".")[0].replace("T", " ")
        markdown_content += f"| `{t['id']}` | {t['title']} | {status_emoji} | {updated_time} |\n"
        
    markdown_content += "\n### 🔔 最新一轮自愈日志摘要\n"
    if recent_logs:
        latest = recent_logs[0]
        # 剥离 markdown 的头部做引用展示
        log_txt = latest.get("log", "无日志记录")
        markdown_content += f"#### [{latest['id']}] {latest['title']}\n"
        markdown_content += f"> {log_txt.replace(chr(10), chr(10) + '> ')}\n"
    else:
        markdown_content += "> 暂无完成的任务，等待飞轮起旋。\n"
        
    # 自动写入 artifact 目录
    os.makedirs(os.path.dirname(ARTIFACT_PROGRESS_FILE), exist_ok=True)
    with open(ARTIFACT_PROGRESS_FILE, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
        
    print(f"[看板更新] 看板已保存至 {ARTIFACT_PROGRESS_FILE}")

def run_loop():
    print("[SCHEDULER] 启动自动进化主循环飞轮...")
    round_num = 0
    
    while True:
        # 1. 检测是否有 pending 任务
        total, completed, failed, pending, _ = get_stats()
        if pending == 0:
            print("[SCHEDULER] 队列中已无 pending 任务，飞轮自然停机。")
            break
            
        round_num += 1
        print(f"\n==================================================")
        print(f"       ★ 启动第 {round_num} 轮 Harness 开发循环 ★")
        print(f"==================================================")
        
        # 2. 调用 agent_harness.py 处理下一个任务
        start_time = time.time()
        process = subprocess.Popen(['python3', 'scripts/agent_harness.py'])
        process.wait()
        duration = time.time() - start_time
        
        print(f"[ROUND FINISH] 第 {round_num} 轮结束，耗时 {duration:.1f} 秒。")
        
        # 3. 更新看板数据
        update_progress_artifact()
        
        # 限制单次调度最大只跑 100 轮
        if round_num >= 100:
            print("[SCHEDULER] 已达到单次调度最大限制 (100轮)，安全退栈。")
            break
            
        # 喘息时间 1 秒
        time.sleep(1)

if __name__ == "__main__":
    # 第一次初始化看板
    update_progress_artifact()
    # 跑主循环
    run_loop()
