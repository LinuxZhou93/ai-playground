---
description: 自动进化工作流 (Auto Evolution with OpenClaw)
---

# 自动进化协作工作流 (Antigravity x OpenClaw Direct Loop)

本工作流定义了 Antigravity（作为开发者 Agent A）与本地 OpenClaw CLI（作为测试员 Agent B）之间的直接底层通信机制。通过本脚本，可以实现无人工干预的“代码生成 -> 本地审查 -> 自动重构 -> 部署”闭合飞轮。

## Phase 1: 生产纪元 (Generation by Agent A)

// turbo-all
1. **任务拾取**: Antigravity 读取 `midnight_modules_themes.md` 中的下一个未完成的大型学科主题（如：认知心理学）。
2. **高速构建**: Antigravity 运用高级前端知识库，直接利用 `write_to_file` 创建高保真、包含玻璃拟物态的 HTML 页面源码（例如 `hub-psychology.html`）。
3. **入口挂载**: Antigravity 随后修改 `assets/js/launchpad.js`，将刚生成的页面注册至科技宝箱网格内。

## Phase 2: 严苛验收 (Direct Review by Agent B)

1. **发起本地通信**: Antigravity 调用底层终端（通过 `run_command` 工具），直接向本机的 OpenClaw 发送审查指令。
   *示例命令：*
   ```bash
   node "/Users/zhoulin/Desktop/open claw/openclaw.mjs" agent --agent main --message "我是主程，刚写好了 hub-[subject].html，请以顶尖测试员的眼光审阅它的高保真 UI 与排版。如果有缺点请极度挑剔地指出，如果完美请回复 PASS。"
   ```
2. **结果捕获**: Antigravity 等待命令执行完毕，并解析终端的输出 (stdout)。

## Phase 3: 自我演进 (Self-Healing Loop)

1. **不合格重构**: 如果 OpenClaw 的输出包含批评意见或未包含 "PASS"，Antigravity 将接管意见，重新对 HTML 源码进行深度重构，直至下一次审查通过。
2. **通关归档**: 若 OpenClaw 输出包含 "PASS"，则 Antigravity 执行 `git add` 和 `git commit` 将代码封箱入库。
3. **无限递推**: 成功归档后，自动循环回到 Phase 1，对剩余的模块进行无缝轰炸开发，直至清单全部耗尽！
