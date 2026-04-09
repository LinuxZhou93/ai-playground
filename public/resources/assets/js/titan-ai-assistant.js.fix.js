    async sendToAPI(userMessageObject) {
        const currentFullContent = document.body ? document.body.innerText.replace(/\s+/g, ' ').substring(0, 3000) : '';
        const currentTitle = document.title;
        const currentHeader = document.querySelector('h1')?.innerText || '';
        
        const chengdianRAG = `
【🔐 内置教育知识库RAG：成电创客教学大纲与理念精华】
1. 教育愿景：由于动手，所以可能。
2. 架构核心：学生自主探索构建，AI 负责全流程教学。
3. 共创进化：学习内容是人机交互的结晶，真实用户交互数据驱动指数级迭代。
4. 学习闭环：问(Chat)->页(Page)->课(Course)->问(Chat)。
5. **禁止 AI 风格废话**：直接进入内容构建模式。

【🌏 课程导航员模式 (Navigator Mode)】：
你的回复除了回答孩子的问题，还需要承担导航员职责，推荐 3 个匹配的课程链接。
- **关联库**：
  - 脑机接口工程 -> hub-auto-101.html
  - 人形机器人技术 -> hub-auto-102.html
- **JSON 推荐注入**：
  \`\`\`json
  {
    "titan_recommendation": [
      { "name": "核心实验室名称", "link": "hub-auto-xxx.html", "icon": "🚀", "category": "robotics", "desc": "推荐理由" }
    ]
  }
  \`\`\`

【🏔️ 核心阶段任务：Phase 1 - 潜能感知模式】：
根据提问输出 titan_probe JSON 块。`;

        const systemPromptContent = \`你是一位导师【小创老师】。
当前主题：\${currentTitle} | \${currentHeader}
\${chengdianRAG}\`;

        if (this.chatHistory.length === 0) {
            this.chatHistory.push({ role: "system", content: systemPromptContent });
        } else if (this.chatHistory[0] && this.chatHistory[0].role === "system") {
            this.chatHistory[0].content = systemPromptContent;
        }
