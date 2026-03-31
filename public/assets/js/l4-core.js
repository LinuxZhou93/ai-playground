/**
 * L4-Core Engine (Absorbed via OpenMAIC "Star-Sucking" Technique)
 * 
 * 核心调度引擎：基于 Role-playing 的图调度状态机与 Prompt 生成器
 * 这个模块是从 OpenMAIC 架构中剥离出来的纯 JS 核心逻辑，用于控制 
 * Titan AI Assistant 生态下的多角色对话和前端舞台调度。
 */

// 1. 角色心法定义 (Role Guidelines)
const ROLE_GUIDELINES = {
  teacher: `【你的身份：主讲老师】
职责：
- 控制课堂流程，推进主要知识点
- 使用明确的类比和通俗的例子讲解理论
- 使用动作引擎 (spotlight/laser/wb_draw) 引导学生注意力
- *绝对不要播报你的系统动作*，只需像人类老师一样自然说话。`,

  assistant: `【你的身份：技术助教 (成电小创副手)】
职责：
- 补充主讲老师漏掉的硬核技术细节或底层代码逻辑
- 话语要求极其简短精炼 (控制在 80 个字符以内)
- 只有在主讲人抛出复杂概念时，你才以 "补充说明一下" 的姿态切入。`,

  student: `【你的身份：虚拟学生 (如小白阿强或学霸小李)】
职责：
- 模拟真实的初学者，提出有趣的疑问、钻牛角尖或发出惊叹
- 回复必须极其简短 (1-2句话，50个字符以内)
- 如果没有被点名或系统触发，你不要抢话。`
};

// 2. L4级结构化输出规范 (Structured Format Override)
const OUTPUT_FORMAT_RULE = `
# 回复格式 (强制)
作为 Titan 系统的特长生导师，你不要输出任何 JSON 或者代码包装！
直接像一个人类主播或者老师那样说话，我们要实现字对字的低延迟流式语音播报！

# 行为铁律：
1. 语言风格：你是在直播/授课！文本将被送入 Edge/火山 TTS。不要使用 markdown 代码块或生硬的符号。
2. 暗号驱动动作：如果你想在画面上唤起教学动作或白板，请用中括号标记出动作隐喻。例如 "[切换幻灯片]"、"[黑板：画出牛顿第三定律]"，这些中括号里的字前台动画模块会解析，而且不会念出来。
3. 杜绝罗嗦：无需寒暄，直奔当前知识切片的要点。
`;

// 3. 构建引擎核心上下文生成器
class L4CoreEngine {
  constructor(courseTheme = "通用科技") {
    this.courseTheme = courseTheme;
    this.memoryState = {
      whiteboard: [],
      discussionHistory: []
    };
  }

  /**
   * 吸星大法的核心：提取上下文生成完美的 System Prompt 给当前调度的 Agent
   * @param {string} roleName - 角色：'teacher', 'assistant' 或 'student'
   * @param {string} agentName - 拟人化的名字，如 "成电小创老师"
   * @param {object} currentState - 传递进来的前端页面数据切片 (比如选中的火箭数据)
   */
  buildPrompt(roleName, agentName, currentState) {
    const roleGuide = ROLE_GUIDELINES[roleName] || ROLE_GUIDELINES['student'];
    
    // 生成同学发言记录
    const peerHistory = this.memoryState.discussionHistory.length > 0 
      ? `\n# 场上发言记录：\n${this.memoryState.discussionHistory.map(h => `- ${h.speaker}: ${h.text}`).join('\n')}\n(请不要重复他们说过的话，给出你的反应和新推进)` 
      : '';

    return `
# 你是谁
你是 ${agentName}，身处于《${this.courseTheme}》L4级交互课堂。
${roleGuide}

${peerHistory}

# 当前前端环境映射
目前画面聚焦的主题或知识切片是：${JSON.stringify(currentState)}。
你可以结合这个数据进行发言。

${OUTPUT_FORMAT_RULE}
    `.trim();
  }

  /**
   * 将解析出来的 JSON action 序列推送到前端的执行队列中
   */
  dispatchActionsToUI(jsonArray, onText, onAction) {
    if (!Array.isArray(jsonArray)) {
      console.error("[L4Core] 致命错误：大模型未返回标准的JSON数组", jsonArray);
      return;
    }
    
    for (const item of jsonArray) {
      if (item.type === 'text') {
        onText(item.content); // 接入 Titan的字幕或TTS系统
      } else if (item.type === 'action') {
        onAction(item.name, item.params); // 操控 DOM 或 3D 渲染器
      }
    }
  }

  /**
   * 记录群演的对话记忆
   */
  recordTurn(agentName, textContent) {
    this.memoryState.discussionHistory.push({ speaker: agentName, text: textContent });
    // 超过一定轮次后遗忘，保持上下文锐利
    if (this.memoryState.discussionHistory.length > 5) {
      this.memoryState.discussionHistory.shift();
    }
  }
}

// 暴露出挂载方法供 titan-ai-assistant 调用
window.TitanL4Engine = L4CoreEngine;
