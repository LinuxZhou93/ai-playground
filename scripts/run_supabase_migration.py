#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import subprocess
import time

SQL_MIGRATION = """
-- 1. 创建订阅状态同步表
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    price_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 启用行级安全机制 (RLS)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. 允许用户查询自己的订阅
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. 允许特权 Webhook 节点操作所有订阅数据
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
    USING (true) WITH CHECK (true);
"""

def main():
    print("[MIGRATOR] 正在将 SQL 写入剪贴板...")
    # 使用 macOS pbcopy 工具写入剪贴板
    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(SQL_MIGRATION.encode('utf-8'))
    
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
