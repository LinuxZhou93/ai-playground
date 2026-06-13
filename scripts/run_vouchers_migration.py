#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import subprocess
import time

SQL_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'vouchers_security_upgrade.sql')

def main():
    if not os.path.exists(SQL_FILE_PATH):
        print(f"[ERROR] 未找到 SQL 文件: {SQL_FILE_PATH}")
        return

    print(f"[MIGRATOR] 正在读取 SQL 文件: {SQL_FILE_PATH} ...")
    with open(SQL_FILE_PATH, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print("[MIGRATOR] 正在将 SQL 写入剪贴板...")
    # 使用 macOS pbcopy 工具写入剪贴板
    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(sql_content.encode('utf-8'))
    
    print("[MIGRATOR] 写入成功。")
    print("[MIGRATOR] 准备激活 Google Chrome 并自动模拟粘贴执行...")
    print("[IMPORTANT] 请确保您的 Chrome 浏览器已经处于 Supabase SQL 界面（或已登录完毕）。")
    print("[MIGRATOR] 正在启动 AppleScript 自动化流程...")

    # AppleScript: 激活 Chrome -> 模拟点击编辑器位置 -> 全选 -> 粘贴 -> 运行 (Cmd + Enter)
    applescript_code = """
    tell application "Google Chrome"
        activate
    end tell
    delay 1.5
    tell application "System Events"
        -- 模拟在屏幕中上方点击一次，以使 Monaco Editor 获得输入焦点
        -- 对于 3440x1440 屏幕，中心偏左约 (1400, 600)
        click at {1400, 600}
        delay 0.5
        
        -- 全选并粘贴 SQL
        keystroke "a" using command down
        delay 0.3
        keystroke "v" using command down
        delay 0.8
        
        -- 执行 SQL (Monaco Editor 中的快捷键为 Cmd + Enter, return 的 key code 是 36)
        key code 36 using command down
        delay 0.5
    end tell
    """
    
    # 运行 osascript
    proc = subprocess.Popen(['osascript', '-e', applescript_code], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = proc.communicate()
    
    if proc.returncode == 0:
        print("[SUCCESS] 自动执行指令已全部发送给 Chrome 窗口！")
        print("[INFO] 如果您的系统弹出“辅助功能”授权提示，请选择允许，并重新运行该脚本。")
    else:
        print(f"[ERROR] 执行 AppleScript 失败: {stderr}")

if __name__ == "__main__":
    main()
