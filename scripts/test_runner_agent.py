#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import subprocess
import urllib.request
import urllib.error
import datetime

# =============================================================================
# 配置与常量定义
# =============================================================================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def load_env():
    env_vars = {}
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

ENV = load_env()
API_KEY = ENV.get("OPENAI_API_KEY", os.environ.get("OPENAI_API_KEY", ""))
BASE_URL = ENV.get("OPENAI_BASE_URL", os.environ.get("OPENAI_BASE_URL", "https://backgrace.com/v1"))
MODEL_NAME = ENV.get("DEFAULT_MODEL", "google:gemini-3.5-flash")

def call_llm(messages):
    if not API_KEY:
        print("[ERROR] 未配置 OPENAI_API_KEY")
        sys.exit(1)
        
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
        "temperature": 0.1
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            return res_json["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[ERROR] LLM API 调用失败: {e}")
        return None

# =============================================================================
# 测试运行与诊断
# =============================================================================
def run_tests(cwd=None):
    print("[RUNNER] 执行项目自动化测试...")
    cmd = ["npx", "vitest", "run"]
    result = subprocess.run(cmd, cwd=cwd or BASE_DIR, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8")
    return result.returncode, result.stdout, result.stderr

def diagnose_errors(stdout, stderr):
    print("[DIAGNOSER] 正在分析测试报错并生成诊断建议...")
    raw_logs = stdout + "\n" + stderr
    if len(raw_logs) > 6000:
        raw_logs = raw_logs[:3000] + "\n\n...[日志截断]...\n\n" + raw_logs[-3000:]
        
    prompt = f"""你是一个高级软件测试专家与故障排除智能体。
以下是项目在跑测过程中捕获的报错日志：
---
{raw_logs}
---

请执行以下诊断：
1. 找出具体是哪几个测试文件报错了，以及抛出错误的源文件（源文件路径和大概的行数，如果能从 stack trace 里看出来的话）。
2. 分析报错的本质原因是什么（例如：TypeScript 类型不匹配、变量未定义、断言数据不一致、API 连线超时等）。
3. 给开发 Agent 提出一份清晰、结构化的代码修复步骤建议（以 Markdown 形式）。

请直接返回你的诊断结果和修复建议，言简意赅。
"""
    messages = [
        {"role": "system", "content": "你只负责诊断测试错误并提供代码修复建议。不要说多余的问候语。"},
        {"role": "user", "content": prompt}
    ]
    
    return call_llm(messages)

def main():
    code, stdout, stderr = run_tests()
    if code == 0:
        print("[RUNNER SUCCESS] 所有测试均顺利跑通！不需要诊断。")
        sys.exit(0)
        
    print(f"[RUNNER FAILURE] 跑测不通过 (错误退出码: {code})。")
    diagnosis = diagnose_errors(stdout, stderr)
    if diagnosis:
        print("\n======================= 智能诊断修复建议 =======================")
        print(diagnosis)
        print("================================================================")
        
        # 将报告保存到本地，以供 Agent 或开发者阅读
        report_path = os.path.join(BASE_DIR, "scripts", "last_test_failure_report.md")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(f"# 测试失败智能诊断报告\n生成时间: {json.dumps(str(datetime.datetime.now()))}\n\n")
            f.write(diagnosis)
        print(f"[SUCCESS] 诊断建议已导出至: {report_path}")
    else:
        print("[ERROR] 无法获取诊断建议。")

if __name__ == "__main__":
    main()
