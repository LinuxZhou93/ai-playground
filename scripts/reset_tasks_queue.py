#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TASKS_FILE = os.path.join(BASE_DIR, 'scripts', 'tasks_queue.json')

def reset_failed_tasks():
    if not os.path.exists(TASKS_FILE):
        print(f"[ERROR] 找不到任务队列文件: {TASKS_FILE}")
        return
        
    with open(TASKS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    tasks = data.get("tasks", [])
    reset_count = 0
    
    for task in tasks:
        # 重置失败或有冲突的任务
        if task.get("status") in ["failed", "conflict"]:
            task["status"] = "pending"
            task["log"] = ""
            if "updated_at" in task:
                del task["updated_at"]
            reset_count += 1
            
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"[SUCCESS] 已将 {reset_count} 个失败/冲突任务重置为 pending。")

if __name__ == "__main__":
    reset_failed_tasks()

