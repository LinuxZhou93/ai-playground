#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import shutil
import subprocess
import urllib.request
import urllib.error
import re
from datetime import datetime

# =============================================================================
# 配置与常量定义
# =============================================================================
BASE_DIR = os.getcwd()
WORKTREES_DIR = os.path.join(BASE_DIR, "worktrees")
TASKS_FILE = os.path.join(BASE_DIR, "scripts", "tasks_queue.json")
MAX_REPAIR_ATTEMPTS = 5
MAX_API_CALLS_PER_RUN = 50

# =============================================================================
# 辅助函数：解析 .env 配置文件
# =============================================================================
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
MODEL_NAME = ENV.get("DEFAULT_MODEL", "google:gemini-3.5-flash")  # 动态读取并使用冒号形式模型名

# =============================================================================
# 大模型调用接口 (无依赖 HTTP 请求)
# =============================================================================
def call_llm(messages, temperature=0.2):
    if not API_KEY:
        print("[ERROR] 未配置 OPENAI_API_KEY 环境变量或在 .env 中未找到！")
        sys.exit(1)
        
    url = f"{BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    # 针对部分中转做模型名称归一化
    model = MODEL_NAME
    if ":" in model:
        model = model.split(":", 1)[1]
        
    data = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "response_format": {"type": "text"}
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            content = res_json["choices"][0]["message"]["content"]
            return content
    except urllib.error.HTTPError as e:
        print(f"[ERROR] LLM API HTTP Error: {e.code} - {e.reason}")
        print(e.read().decode("utf-8"))
        raise e
    except Exception as e:
        print(f"[ERROR] LLM API Exception: {e}")
        raise e

# =============================================================================
# Git Worktree 与 分支管理
# =============================================================================
def run_cmd(args, cwd=None, capture_output=True):
    print(f"[CMD] Running: {' '.join(args)} in {cwd or '.'}")
    if capture_output:
        result = subprocess.run(args, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8")
        return result.returncode, result.stdout, result.stderr
    else:
        result = subprocess.run(args, cwd=cwd)
        return result.returncode, "", ""

USE_WORKTREE = False

def create_worktree(task_id):
    branch_name = f"agent-task-{task_id}"
    
    # 移除已有的同名分支并确保处于 main 状态
    run_cmd(["git", "checkout", "main"], cwd=BASE_DIR)
    run_cmd(["git", "branch", "-D", branch_name], cwd=BASE_DIR)
    
    if USE_WORKTREE:
        os.makedirs(WORKTREES_DIR, exist_ok=True)
        wt_path = os.path.join(WORKTREES_DIR, task_id)
        run_cmd(["git", "worktree", "prune"], cwd=BASE_DIR)
        if os.path.exists(wt_path):
            shutil.rmtree(wt_path, ignore_errors=True)
            
        code, stdout, stderr = run_cmd(["git", "worktree", "add", "-b", branch_name, wt_path, "main"], cwd=BASE_DIR)
        if code != 0:
            print(f"[ERROR] Failed to create worktree: {stderr}")
            return None
        return wt_path
    else:
        # 降级模式：直接在主项目目录下签出临时开发分支
        code, stdout, stderr = run_cmd(["git", "checkout", "-b", branch_name], cwd=BASE_DIR)
        if code != 0:
            print(f"[ERROR] Failed to checkout branch: {stderr}")
            return None
        return BASE_DIR

def cleanup_worktree(task_id):
    branch_name = f"agent-task-{task_id}"
    print(f"[CLEANUP] Cleaning up branch/worktree for {task_id}...")
    
    # 切回 main 分支
    run_cmd(["git", "checkout", "main"], cwd=BASE_DIR)
    
    if USE_WORKTREE:
        wt_path = os.path.join(WORKTREES_DIR, task_id)
        run_cmd(["git", "worktree", "remove", "--force", wt_path], cwd=BASE_DIR)
        run_cmd(["git", "branch", "-D", branch_name], cwd=BASE_DIR)
        if os.path.exists(wt_path):
            shutil.rmtree(wt_path, ignore_errors=True)
    else:
        # 直接删除任务分支
        run_cmd(["git", "branch", "-D", branch_name], cwd=BASE_DIR)

# =============================================================================
# 搜索替换引擎 (Aider-style SEARCH/REPLACE Block Parser)
# =============================================================================
def apply_search_replace(file_path, search_content, replace_content):
    if not os.path.exists(file_path):
        return False, f"文件 {file_path} 不存在"
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # 规范化换行符进行匹配
    search_norm = search_content.replace("\r\n", "\n").strip()
    content_norm = content.replace("\r\n", "\n")
    
    if search_norm not in content_norm:
        # 如果找不到完全匹配，尝试剥离前后空白字符再查找
        search_lines = [line.strip() for line in search_norm.split("\n") if line.strip()]
        if not search_lines:
            return False, "SEARCH 块内容为空"
            
        # 模糊匹配：寻找包含首尾关键行的最大块
        first_line = search_lines[0]
        last_line = search_lines[-1]
        if first_line in content_norm and last_line in content_norm:
            return False, f"SEARCH 块匹配失败：未找到精确代码匹配。请确保缩进和字符完全一致。"
        return False, f"无法在文件中定位 SEARCH 块内容"

    # 执行替换
    new_content = content_norm.replace(search_norm, replace_content.replace("\r\n", "\n"))
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True, "替换成功"

# =============================================================================
# 任务队列初始化与读取
# =============================================================================
def get_pending_task():
    if not os.path.exists(TASKS_FILE):
        # 初始化一个默认队列文件
        default_queue = {
            "tasks": [
                {
                    "id": "t1_setup_harness_test",
                    "title": "测试 Harness 并行跑测能力",
                    "description": "在项目中创建一个临时的测试文件 tests/harness_stub.test.ts 并在里面写入一个简单的 Vitest 断言确保测试跑通。以此验证 Harness 对项目的自动化跑测能力。",
                    "status": "pending"
                }
            ]
        }
        with open(TASKS_FILE, "w", encoding="utf-8") as f:
            json.dump(default_queue, f, indent=2, ensure_ascii=False)
            
    with open(TASKS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for task in data.get("tasks", []):
        if task.get("status") == "pending":
            return task
    return None

def update_task_status(task_id, status, log=""):
    with open(TASKS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for task in data.get("tasks", []):
        if task["id"] == task_id:
            task["status"] = status
            task["updated_at"] = datetime.now().isoformat()
            task["log"] = log
            break
            
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# =============================================================================
# Agent 主控循环与动作解析
# =============================================================================
def agent_loop(wt_path, task):
    print(f"\n[AGENT] 开始处理任务: {task['id']} - {task['title']}")
    
    system_prompt = f"""你是一个顶级的 AI 自动编码 Agent，在一个独立的 Git Worktree 沙箱中开发。
工作区路径: {wt_path}
主技术栈: Next.js 15, TypeScript, Tailwind CSS 4, Vitest, Playwright

你必须通过输出特定的指令来控制你的开发过程。你每次只能输出一个操作，在操作完成后，系统会给你返回结果。你可以根据结果继续进行开发，直到任务完成。

支持的指令列表：
1. **读取文件内容**
   指令格式：
   ```READ_FILE
   <工作区相对路径，例如: tests/stub.test.ts>
   ```

2. **写入/创建文件**
   指令格式：
   ```WRITE_FILE <工作区相对路径>
   <完整的文件内容>
   ```

3. **编辑修改已有文件 (SEARCH/REPLACE 块方式，推荐使用)**
   指令格式：
   ```EDIT_FILE <工作区相对路径>
   <<<<<<< SEARCH
   <要被替换的精确代码段>
   =======
   <替换后的新代码段>
   >>>>>>> REPLACE
   ```

4. **运行测试套件**
   指令格式：
   ```RUN_TEST
   ```
   (这将在你的隔离工作区中运行 `pnpm test`)

5. **宣布任务完成**
   指令格式：
   ```TASK_DONE
   <任务总结陈词与修改点>
   ```

请按照你的开发步骤，先发出读取文件或写入文件指令。每次回复仅包含一个操作块，不要有多余的客套废话。
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"任务描述：{task['description']}\n\n请开始你的第一步开发动作。"}
    ]
    
    api_calls = 0
    attempts = 0
    
    while api_calls < MAX_API_CALLS_PER_RUN:
        api_calls += 1
        print(f"\n[LLM CALL {api_calls}/{MAX_API_CALLS_PER_RUN}] 调用大模型...")
        try:
            response = call_llm(messages)
        except Exception as e:
            print(f"[ERROR] 连线大模型失败: {e}")
            break
            
        print(f"[LLM RESPONSE]:\n{response}\n")
        
        # 将 LLM 响应存入会话历史
        messages.append({"role": "assistant", "content": response})
        
        # 解析指令
        # 1. TASK_DONE
        if "```TASK_DONE" in response or "TASK_DONE" in response.split("\n")[0]:
            print("[AGENT] 宣布任务完成！")
            return True, response
            
        # 2. READ_FILE
        read_match = re.search(r"```READ_FILE\s*\n(.*?)\n```", response, re.DOTALL)
        if read_match:
            rel_path = read_match.group(1).strip()
            abs_path = os.path.join(wt_path, rel_path)
            print(f"[ACTION] 读取文件: {rel_path}")
            if os.path.exists(abs_path):
                with open(abs_path, "r", encoding="utf-8") as f:
                    file_content = f.read()
                result_msg = f"文件 {rel_path} 的内容如下：\n```\n{file_content}\n```"
            else:
                result_msg = f"错误：文件 {rel_path} 不存在。"
            messages.append({"role": "user", "content": result_msg})
            continue
            
        # 3. WRITE_FILE
        write_match = re.search(r"```WRITE_FILE\s+(\S+)\n(.*?)\n```", response, re.DOTALL)
        if write_match:
            rel_path = write_match.group(1).strip()
            file_content = write_match.group(2)
            abs_path = os.path.join(wt_path, rel_path)
            print(f"[ACTION] 写入文件: {rel_path}")
            try:
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                with open(abs_path, "w", encoding="utf-8") as f:
                    f.write(file_content)
                result_msg = f"文件 {rel_path} 成功写入。"
            except Exception as e:
                result_msg = f"写入失败：{e}"
            messages.append({"role": "user", "content": result_msg})
            continue
            
        # 4. EDIT_FILE (SEARCH/REPLACE)
        edit_match = re.search(r"```EDIT_FILE\s+(\S+)\n<<<<<<< SEARCH\n(.*?)\n=======\n(.*?)\n>>>>>>> REPLACE\n```", response, re.DOTALL)
        if edit_match:
            rel_path = edit_match.group(1).strip()
            search_content = edit_match.group(2)
            replace_content = edit_match.group(3)
            abs_path = os.path.join(wt_path, rel_path)
            print(f"[ACTION] 修改文件: {rel_path}")
            success, info = apply_search_replace(abs_path, search_content, replace_content)
            result_msg = f"修改结果: {'成功' if success else '失败 - ' + info}"
            messages.append({"role": "user", "content": result_msg})
            continue
            
        # 5. RUN_TEST
        if "```RUN_TEST" in response or "RUN_TEST" in response:
            print("[ACTION] 执行单元测试跑测...")
            # 运行项目中的 Vitest 单元测试
            code, stdout, stderr = run_cmd(["npx", "vitest", "run"], cwd=wt_path)
            test_log = stdout + "\n" + stderr
            # 截断过长日志以防占满 Context
            if len(test_log) > 4000:
                test_log = test_log[:2000] + "\n\n...[日志过长，中间部分截断]...\n\n" + test_log[-2000:]
            
            result_msg = f"测试执行完毕 (退出码 {code})。输出日志如下：\n```\n{test_log}\n```"
            messages.append({"role": "user", "content": result_msg})
            continue
            
        # 兜底：如果 LLM 回复中没有检测到任何已知命令，进行提示
        print("[WARNING] 未检测到标准的 Agent 指令格式。")
        messages.append({
            "role": "user", 
            "content": "系统提示：未识别到你的有效操作指令，请确保你输出的操作格式是 ```READ_FILE、```WRITE_FILE、```EDIT_FILE、```RUN_TEST 或 ```TASK_DONE。如果你已经完成了全部修改并且测试通过，请输出 ```TASK_DONE 宣布完成。"
        })
        
    return False, "超出最大交互限制或网络异常中断"

# =============================================================================
# 主入口
# =============================================================================
def main():
    print("=============================================================================")
    print("          zhouxiaomai.com 24*7 多 Agent 开发 Harness 运行中")
    print("=============================================================================")
    
    # 1. 扫描未处理任务
    task = get_pending_task()
    if not task:
        print("[SUCCESS] 任务队列中暂无待开发任务。")
        return
        
    # 2. 为该任务分配 Git Worktree 隔离沙箱
    task_id = task["id"]
    update_task_status(task_id, "running", log="正在创建沙箱中...")
    
    wt_path = create_worktree(task_id)
    if not wt_path:
        update_task_status(task_id, "failed", log="创建 Git Worktree 沙箱失败")
        return
        
    success = False
    log_summary = ""
    try:
        # 3. 运行 Agent 循环开发闭环
        success, log_summary = agent_loop(wt_path, task)
    except Exception as e:
        log_summary = f"执行过程中抛出异常: {e}"
        print(f"[FATAL] {log_summary}")
        
    # 4. 根据执行结果处理
    if success:
        print(f"\n[SUCCESS] 任务 {task_id} 成功跑通并完成！正在进行自动代码合并...")
        # 自动将该分支合并到主干 (或者如果是 PR 模式，可以留作 PR)
        # 本地模拟时我们直接安全合并到主干
        branch_name = f"agent-task-{task_id}"
        merge_code, m_out, m_err = run_cmd(["git", "merge", branch_name], cwd=BASE_DIR)
        
        if merge_code == 0:
            print("[MERGE] 代码合并成功！")
            update_task_status(task_id, "completed", log=log_summary)
        else:
            print(f"[MERGE ERROR] 合并冲突！请手动解决:\n{m_err}")
            update_task_status(task_id, "conflict", log=f"代码已开发完成但合并冲突，原因:\n{m_err}\n\nAgent总结:\n{log_summary}")
    else:
        print(f"\n[FAILED] 任务 {task_id} 失败。")
        update_task_status(task_id, "failed", log=log_summary)
        
    # 5. 清理 Worktree
    cleanup_worktree(task_id)
    print("[FINISHED] Harness 调度结束。")

if __name__ == "__main__":
    main()
