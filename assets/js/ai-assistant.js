/**
 * AI客服助手 - 全站通用组件
 * 提供智能客服支持功能
 */

// 页面上下文配置
const AI_PAGE_CONTEXTS = {
    'index': {
        title: '网站导览助手',
        prompt: '你好!我是周小麦的个人网站AI助手。这里展示了我的学习历程、技能树和各种项目。我可以帮你了解网站内容、推荐学习资源,或解答任何问题。请问有什么可以帮助你的吗?'
    },
    'coding': {
        title: '编程学习顾问',
        prompt: '你好!我是编程学习AI助手。这个页面提供Scratch、Python等编程学习资源和项目案例。我可以帮你选择合适的编程项目、解答编程问题、推荐学习路径。请问需要什么帮助?'
    },
    'labs': {
        title: '实验指导助手',
        prompt: '你好!我是实验室AI助手。这里有391个互动STEM实验,涵盖物理、化学、生物等多个学科。我可以帮你找到合适的实验、解释实验原理、提供操作指导。请问想做什么实验?'
    },
    'learn': {
        title: '课程推荐顾问',
        prompt: '你好!我是在线学习AI助手。这里提供各类优质在线课程资源。我可以根据你的学习目标和水平,推荐合适的课程,制定学习计划。请问你想学习什么?'
    },
    'forum': {
        title: '社区互动助手',
        prompt: '你好!我是论坛AI助手。这里是学习交流社区,大家可以分享经验、提问讨论。我可以帮你找到相关话题、解答技术问题、推荐优质帖子。请问需要什么帮助?'
    },
    'blog': {
        title: '博客阅读助手',
        prompt: '你好!我是博客AI助手。这里记录了周小麦的学习心得和项目经验。我可以帮你找到感兴趣的文章、总结文章要点、解答相关问题。请问想了解什么内容?'
    },
    'minecraft': {
        title: 'Minecraft教学助手',
        prompt: '你好!我是Minecraft教育版AI助手。Minecraft是一个强大的教育工具,可以学习编程、数学、科学等知识。我可以介绍教育版功能、推荐教学资源、解答使用问题。请问需要什么帮助?'
    },
    'wiki': {
        title: '知识星系助手',
        prompt: '你好!我是知识星系AI助手。这里用3D可视化展示了各学科知识的关联。我可以帮你探索知识图谱、理解知识关系、推荐学习路径。请问想了解什么知识?'
    },
    'course': {
        title: '课程学习助手',
        prompt: '你好!我是课程学习AI助手。我可以帮你理解课程内容、解答课程问题、推荐相关资源、制定学习计划。请问需要什么帮助?'
    },
    'math': {
        title: '数学学习助手',
        prompt: '你好!我是数学学习AI助手。我可以帮你理解数学概念、解答数学问题、提供解题思路、推荐练习资源。请问有什么数学问题?'
    },
    'roadmap': {
        title: '技术路线顾问',
        prompt: '你好!我是技术路线AI顾问。这里展示了全栈开发的学习路线图。我可以帮你规划学习路径、推荐学习资源、解答技术问题。请问想学习什么技术?'
    },
    'ide-scratch': {
        title: 'Scratch编程助手',
        prompt: '你好!我是Scratch编程AI助手。我可以帮你学习Scratch编程、解答编程问题、提供项目创意、优化代码逻辑。请问需要什么帮助?'
    },
    'ide-jr': {
        title: 'ScratchJr编程助手',
        prompt: '你好!我是ScratchJr编程AI助手。ScratchJr适合5-7岁儿童学习编程基础。我可以提供简单的编程指导和项目创意。请问需要什么帮助?'
    },
    'drone': {
        title: '无人机飞行顾问',
        prompt: '你好!我是无人机实验室AI顾问。我可以提供飞行安全法规咨询、FPV模拟器入门指导、穿越机组装配置建议以及编程飞行课程辅导。无论你是新手小白还是想进阶的飞手，都可以问我。'
    },
    'default': {
        title: 'AI智能助手',
        prompt: '你好!我是周小麦网站的AI助手。我可以回答关于网站内容、学习资源、技术问题等各类问题。请问有什么可以帮助你的吗?'
    }
};

// API配置
const AI_CONFIG = {
    apiKey: 'app-XZYyFcpsU6Qk1dIoWDz92ZCR',
    apiUrl: 'https://turn-uni-potato-inch.trycloudflare.com/v1/chat-messages',
    user: 'zhou-xiaomai'
};

// 全局变量
let currentContext = 'default';
let conversationId = null;

/**
 * 初始化AI助手
 * @param {string} pageContext - 页面上下文关键词
 */
function initAIAssistant(pageContext = 'default') {
    currentContext = pageContext;

    // 创建AI助手HTML结构
    createAIAssistantHTML();

    // 绑定事件监听器
    bindAIAssistantEvents();

    console.log(`AI助手已初始化 - 上下文: ${pageContext}`);
}

/**
 * 创建AI助手的HTML结构
 */
function createAIAssistantHTML() {
    const html = `
        <!-- AI客服浮动按钮 -->
        <div id="ai-assistant-btn" class="ai-assistant-btn" title="AI智能客服">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z" fill="currentColor"/>
                <path d="M15.5 11C16.3284 11 17 10.3284 17 9.5C17 8.67157 16.3284 8 15.5 8C14.6716 8 14 8.67157 14 9.5C14 10.3284 14.6716 11 15.5 11Z" fill="currentColor"/>
                <path d="M12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z" fill="currentColor"/>
            </svg>
            <span class="ai-assistant-badge">AI</span>
        </div>

        <!-- AI对话面板 -->
        <div id="ai-assistant-panel" class="ai-assistant-panel">
            <div class="ai-assistant-header">
                <div class="ai-assistant-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/>
                        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor"/>
                        <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span id="ai-assistant-title-text">AI智能助手</span>
                </div>
                <button id="ai-assistant-close" class="ai-assistant-close" title="关闭">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div id="ai-assistant-content" class="ai-assistant-content">
                <div class="ai-welcome">
                    <div class="ai-avatar">🤖</div>
                    <div class="ai-welcome-text">你好!我是AI助手,有什么可以帮助你的吗?</div>
                </div>
            </div>
            <div class="ai-assistant-input-area">
                <input type="text" id="ai-assistant-input" class="ai-assistant-input" placeholder="输入你的问题...">
                <button id="ai-assistant-send" class="ai-assistant-send-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // 添加到body末尾
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * 绑定事件监听器
 */
function bindAIAssistantEvents() {
    const btn = document.getElementById('ai-assistant-btn');
    const panel = document.getElementById('ai-assistant-panel');
    const closeBtn = document.getElementById('ai-assistant-close');
    const sendBtn = document.getElementById('ai-assistant-send');
    const input = document.getElementById('ai-assistant-input');

    // 打开面板
    btn.addEventListener('click', openAIPanel);

    // 关闭面板
    closeBtn.addEventListener('click', closeAIPanel);

    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

/**
 * 打开AI面板
 */
function openAIPanel() {
    const panel = document.getElementById('ai-assistant-panel');
    const titleText = document.getElementById('ai-assistant-title-text');
    const content = document.getElementById('ai-assistant-content');

    // 更新标题
    const context = AI_PAGE_CONTEXTS[currentContext] || AI_PAGE_CONTEXTS['default'];
    titleText.textContent = context.title;

    // 显示面板
    panel.classList.add('active');

    // 如果是首次打开,发送欢迎消息
    if (!conversationId) {
        setTimeout(() => {
            callAI(context.prompt, true);
        }, 300);
    }
}

/**
 * 关闭AI面板
 */
function closeAIPanel() {
    const panel = document.getElementById('ai-assistant-panel');
    panel.classList.remove('active');
}

/**
 * 发送用户消息
 */
function sendMessage() {
    const input = document.getElementById('ai-assistant-input');
    const message = input.value.trim();

    if (!message) return;

    // 显示用户消息
    appendMessage('user', message);

    // 清空输入框
    input.value = '';

    // 调用AI
    callAI(message, false);
}

/**
 * 添加消息到对话区
 */
function appendMessage(role, content) {
    const contentDiv = document.getElementById('ai-assistant-content');

    const messageHtml = `
        <div class="ai-message ${role}">
            <div class="ai-message-avatar">${role === 'user' ? '👤' : '🤖'}</div>
            <div class="ai-message-content">${content}</div>
        </div>
    `;

    contentDiv.insertAdjacentHTML('beforeend', messageHtml);

    // 滚动到底部
    contentDiv.scrollTop = contentDiv.scrollHeight;
}

/**
 * 调用AI API
 */
async function callAI(prompt, isWelcome = false) {
    const contentDiv = document.getElementById('ai-assistant-content');

    // 添加加载提示
    const loadingId = 'ai-loading-' + Date.now();
    const loadingHtml = `
        <div class="ai-message assistant" id="${loadingId}">
            <div class="ai-message-avatar">🤖</div>
            <div class="ai-message-content">
                <div class="ai-typing">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    contentDiv.insertAdjacentHTML('beforeend', loadingHtml);
    contentDiv.scrollTop = contentDiv.scrollHeight;

    try {
        const response = await fetch(AI_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {},
                query: prompt,
                response_mode: "streaming",
                conversation_id: conversationId || "",
                user: AI_CONFIG.user
            })
        });

        if (!response.ok) {
            throw new Error(`API错误: ${response.statusText}`);
        }

        // 移除加载提示
        document.getElementById(loadingId).remove();

        // 创建AI回复消息
        const messageId = 'ai-message-' + Date.now();
        const messageHtml = `
            <div class="ai-message assistant" id="${messageId}">
                <div class="ai-message-avatar">🤖</div>
                <div class="ai-message-content"></div>
            </div>
        `;
        contentDiv.insertAdjacentHTML('beforeend', messageHtml);

        const messageContent = document.querySelector(`#${messageId} .ai-message-content`);

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullAnswer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    if (jsonStr === '[DONE]') break;

                    try {
                        const data = JSON.parse(jsonStr);

                        // 保存conversation_id
                        if (data.conversation_id && !conversationId) {
                            conversationId = data.conversation_id;
                        }

                        // 处理消息内容
                        if (data.event === 'message' || data.event === 'agent_message') {
                            const delta = data.answer;
                            if (delta) {
                                fullAnswer += delta;
                                messageContent.innerHTML = formatMessage(fullAnswer);
                                contentDiv.scrollTop = contentDiv.scrollHeight;
                            }
                        }
                    } catch (e) {
                        console.error('JSON解析错误:', e);
                    }
                }
            }
        }

    } catch (error) {
        console.error('AI调用失败:', error);

        // 移除加载提示
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        // 显示错误消息
        const errorHtml = `
            <div class="ai-message assistant error">
                <div class="ai-message-avatar">⚠️</div>
                <div class="ai-message-content">
                    抱歉,AI服务暂时不可用。<br>
                    错误信息: ${error.message}<br>
                    请稍后再试或联系管理员。
                </div>
            </div>
        `;
        contentDiv.insertAdjacentHTML('beforeend', errorHtml);
        contentDiv.scrollTop = contentDiv.scrollHeight;
    }
}

/**
 * 格式化消息内容
 */
function formatMessage(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

// 导出初始化函数
window.initAIAssistant = initAIAssistant;
