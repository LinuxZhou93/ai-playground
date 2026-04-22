#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Evolution Probe 进化探针
用于在 AI Agent 获得系统架构提升、实现重要功能（Evolution）后，
自动化地将成就提纯并插入至 Antigravity Wiki 的 Mermaid 时间线源码中。
可借由 Cron 守护进程定时触发，或在 Agent 执行完 `/learn` 操作后直接调用。
"""

import os
import sys
import datetime

TARGET_FILE = "/Users/zhoulin/Desktop/github/ai-playground/public/ai_evolution_map.html"

def inject_evolution(events):
    if not os.path.exists(TARGET_FILE):
        print(f"❌ [Probe] 错误: 未发现目标 Wiki 文件 {TARGET_FILE}")
        return False

    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_timeline = False
    insert_idx = -1
    
    # 扫描定位 Timeline 的作用域
    for i, line in enumerate(lines):
        if "timeline" in line and "Evolution" not in line: 
            # 进入 timeline 块
            in_timeline = True
            
        # 在 </pre> 关闭标签前插入（并且确保在 timeline 作用块内）
        if in_timeline and "</pre>" in line:
            insert_idx = i
            break

    if insert_idx == -1:
        print("❌ [Probe] 错误: 未在文件中找到 Timeline 模块闭合标签")
        return False

    today_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # 往前追溯 10 行，看看今天是否已经有过节点（简单防重/接续判断）
    has_today = False
    for i in range(max(0, insert_idx - 15), insert_idx):
        if today_date in lines[i]:
            has_today = True
            break
            
    new_lines = []
    
    # 如果今天是全新的记录日
    if not has_today:
        new_lines.append(f"    {today_date} : 自动化记录节点 (Auto evolution sync)\n")
        
    for event in events:
        new_lines.append(f"               : {event}\n")
        
    # 执行倒序插入，保证排盘正确
    for item in reversed(new_lines):
        lines.insert(insert_idx, item)
        
    with open(TARGET_FILE, 'w', encoding='utf-8') as f:
        f.writelines(lines)
        
    print(f"✅ [Probe] 成功：已将 {len(events)} 件进化资产同步至 Wiki 知识库体系全息图！")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        events = sys.argv[1:]
        inject_evolution(events)
    else:
        print("💡 用法: python wiki_evolution_probe.py '成功集成微信数据库' '开启右侧侧边栏特性'")
