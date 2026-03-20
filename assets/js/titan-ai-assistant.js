// TITAN OS - Global AI Assistant Module (LLM Integration)
// Automatically injected into all TITAN OS nodes.

class TitanAIAssistant {
    constructor() {
        if (document.getElementById('titan-ai-container')) return; // Already initialized
        
        this.isChatOpen = false;
        this.context = {
            title: document.title,
            header: document.querySelector('h1')?.innerText || '',
            description: document.querySelector('p')?.innerText || ''
        };
        
        // Settings (saved in localStorage)
        this.settings = JSON.parse(localStorage.getItem('titan_ai_config')) || {
            apiKey: '',
            endpoint: 'https://api.moonshot.cn/v1/chat/completions', // Kimi / Moonshot default (OpenAI compatible)
            model: 'moonshot-v1-8k'
        };

        this.chatHistory = [];
        this.init();
    }

    init() {
        this.injectCSS();
        this.injectUI();
        this.cacheDOM();
        this.bindEvents();
    }

    injectCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            #titan-ai-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
            }
            .ai-fab {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0ea5e9, #6366f1);
                box-shadow: 0 0 20px rgba(14, 165, 233, 0.4), inset 0 0 10px rgba(255,255,255,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 2px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                color: white;
            }
            .ai-fab:hover {
                transform: scale(1.1);
                box-shadow: 0 0 30px rgba(14, 165, 233, 0.6), inset 0 0 15px rgba(255,255,255,0.6);
            }
            .ai-fab .core {
                width: 24px;
                height: 24px;
                background: #fff;
                border-radius: 50%;
                box-shadow: 0 0 15px #fff;
                animation: pulse-core 2s infinite ease-in-out;
            }
            @keyframes pulse-core {
                0%, 100% { transform: scale(0.8); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
            }
            .ai-panel {
                position: absolute;
                bottom: 76px;
                right: 0;
                width: 380px;
                height: 550px;
                background: rgba(10, 15, 25, 0.85);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(56, 189, 248, 0.3);
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(14, 165, 233, 0.1);
                display: flex;
                flex-direction: column;
                transform-origin: bottom right;
                transform: scale(0.8);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                overflow: hidden;
            }
            .ai-panel.open {
                transform: scale(1);
                opacity: 1;
                pointer-events: all;
            }
            .ai-header {
                padding: 16px;
                background: rgba(14, 165, 233, 0.1);
                border-bottom: 1px solid rgba(56, 189, 248, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .ai-header-title {
                color: #38bdf8;
                font-weight: bold;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .ai-header-title::before {
                content: '';
                display: block;
                width: 8px;
                height: 8px;
                background: #38bdf8;
                border-radius: 50%;
                box-shadow: 0 0 8px #38bdf8;
            }
            .ai-chat-area {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                scroll-behavior: smooth;
            }
            .ai-chat-area::-webkit-scrollbar {
                width: 4px;
            }
            .ai-chat-area::-webkit-scrollbar-thumb {
                background: rgba(56, 189, 248, 0.2);
                border-radius: 4px;
            }
            .msg {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 13px;
                line-height: 1.5;
                word-wrap: break-word;
            }
            .msg-user {
                background: rgba(56, 189, 248, 0.15);
                border: 1px solid rgba(56, 189, 248, 0.3);
                color: #e2e8f0;
                align-self: flex-end;
                border-bottom-right-radius: 2px;
            }
            .msg-ai {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #e2e8f0;
                align-self: flex-start;
                border-bottom-left-radius: 2px;
                position: relative;
            }
            .msg-system {
                align-self: center;
                font-size: 11px;
                color: #94a3b8;
                text-align: center;
                background: rgba(0,0,0,0.3);
                padding: 4px 12px;
                border-radius: 20px;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .ai-input-area {
                padding: 12px 16px;
                border-top: 1px solid rgba(56, 189, 248, 0.2);
                background: rgba(0, 0, 0, 0.2);
                display: flex;
                gap: 8px;
                position: relative;
            }
            .ai-input {
                flex: 1;
                background: rgba(0,0,0,0.4);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 8px 12px;
                color: #fff;
                font-family: inherit;
                outline: none;
                transition: all 0.2s;
            }
            .ai-input:focus {
                border-color: rgba(56, 189, 248, 0.5);
                box-shadow: 0 0 10px rgba(56, 189, 248, 0.1);
            }
            .ai-send {
                background: #0ea5e9;
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            .ai-send:hover {
                background: #0284c7;
            }
            .ai-settings-btn {
                background: none;
                border: none;
                color: rgba(255,255,255,0.5);
                cursor: pointer;
            }
            .ai-settings-btn:hover { color: #fff; }
            .ai-settings-panel {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(10, 15, 25, 0.95);
                z-index: 10;
                padding: 20px;
                display: none;
                flex-direction: column;
                gap: 12px;
            }
            .ai-settings-panel.active { display: flex; }
            .ai-settings-panel h3 { color: #38bdf8; font-size: 16px; margin: 0 0 10px 0; }
            .ai-settings-panel label { font-size: 12px; color: #94a3b8; margin-bottom: 2px; }
            .ai-settings-panel input {
                background: rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.2);
                padding: 8px;
                border-radius: 4px;
                color: #fff;
                font-size: 13px;
                margin-bottom: 8px;
            }
            .ai-btn-group { display: flex; gap: 8px; margin-top: auto; }
            .ai-btn-full {
                flex: 1; padding: 10px; background: #0ea5e9; color: #fff;
                border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
            }
            .ai-btn-full.cancel { background: rgba(255,255,255,0.1); }
            
            .typing-indicator {
                display: flex; gap: 4px; padding: 12px 16px;
            }
            .typing-dot {
                width: 6px; height: 6px; background: #38bdf8; border-radius: 50%;
                animation: typing 1s infinite ease-in-out;
            }
            .typing-dot:nth-child(1) { animation-delay: 0s; }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 100% { transform: translateY(0); opacity: 0.4; }
                50% { transform: translateY(-4px); opacity: 1; }
            }
             @media (max-width: 640px) {
                .ai-panel {
                    position: fixed;
                    bottom: 0; right: 0; left: 0; top: 0;
                    width: 100%; height: 100%; border-radius: 0; border: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectUI() {
        const container = document.createElement('div');
        container.id = 'titan-ai-container';
        
        container.innerHTML = \`
            <div class="ai-panel" id="titan-ai-panel">
                <div class="ai-header">
                    <div class="ai-header-title">TITAN ASSISTANT NEURAL-LINK</div>
                    <button class="ai-settings-btn" id="titan-ai-settings-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </button>
                </div>
                
                <div class="ai-settings-panel" id="titan-ai-settings-panel">
                    <h3>LLM 神经节点配置 (Settings)</h3>
                    <label>API Key (本地存储，不上传服务器)</label>
                    <input type="password" id="ai-cfg-key" placeholder="sk-...">
                    <label>Base URL (兼容 OpenAI 格式)</label>
                    <input type="text" id="ai-cfg-url" placeholder="https://api.openai.com/v1/chat/completions">
                    <label>Model (模型名称)</label>
                    <input type="text" id="ai-cfg-model" placeholder="gpt-4o">
                    
                    <div class="ai-btn-group">
                        <button class="ai-btn-full cancel" id="ai-cfg-cancel">返回</button>
                        <button class="ai-btn-full" id="ai-cfg-save">保存配置</button>
                    </div>
                </div>

                <div class="ai-chat-area" id="titan-ai-chat">
                    <div class="msg msg-system">TITAN 助教已准备就绪，目前正在读取当前网页上下文。请问有什么可以帮您？</div>
                </div>
                
                <div class="ai-input-area">
                    <input type="text" class="ai-input" id="titan-ai-input" placeholder="输入你想问的问题 / Enter prompt..." autocomplete="off">
                    <button class="ai-send" id="titan-ai-send">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
            
            <div class="ai-fab" id="titan-ai-fab">
                <div class="core"></div>
            </div>
        \`;
        
        document.body.appendChild(container);
    }

    cacheDOM() {
        this.fab = document.getElementById('titan-ai-fab');
        this.panel = document.getElementById('titan-ai-panel');
        this.chatArea = document.getElementById('titan-ai-chat');
        this.input = document.getElementById('titan-ai-input');
        this.sendBtn = document.getElementById('titan-ai-send');
        
        this.settingsBtn = document.getElementById('titan-ai-settings-btn');
        this.settingsPanel = document.getElementById('titan-ai-settings-panel');
        
        this.keyInput = document.getElementById('ai-cfg-key');
        this.urlInput = document.getElementById('ai-cfg-url');
        this.modelInput = document.getElementById('ai-cfg-model');
        this.cancelCfgBtn = document.getElementById('ai-cfg-cancel');
        this.saveCfgBtn = document.getElementById('ai-cfg-save');
    }

    bindEvents() {
        this.fab.addEventListener('click', () => {
            this.isChatOpen = !this.isChatOpen;
            if (this.isChatOpen) {
                this.panel.classList.add('open');
                this.input.focus();
                this.scrollToBottom();
            } else {
                this.panel.classList.remove('open');
                this.settingsPanel.classList.remove('active');
            }
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Settings events
        this.settingsBtn.addEventListener('click', () => {
            this.settingsPanel.classList.add('active');
            this.keyInput.value = this.settings.apiKey;
            this.urlInput.value = this.settings.endpoint;
            this.modelInput.value = this.settings.model;
        });
        
        this.cancelCfgBtn.addEventListener('click', () => {
            this.settingsPanel.classList.remove('active');
        });
        
        this.saveCfgBtn.addEventListener('click', () => {
            this.settings.apiKey = this.keyInput.value.trim();
            this.settings.endpoint = this.urlInput.value.trim();
            this.settings.model = this.modelInput.value.trim();
            localStorage.setItem('titan_ai_config', JSON.stringify(this.settings));
            this.settingsPanel.classList.remove('active');
            this.appendMessage('system', 'Neuro-Link Configuration Updated.');
        });
    }

    appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = \`msg msg-\${role}\`;
        msgDiv.innerText = text;
        
        // Remove typing indicator if exists
        const typing = document.getElementById('ai-typing-indicator');
        if (typing) typing.remove();
        
        this.chatArea.appendChild(msgDiv);
        this.scrollToBottom();
    }
    
    showTyping() {
        const exists = document.getElementById('ai-typing-indicator');
        if (exists) return;
        
        const div = document.createElement('div');
        div.id = 'ai-typing-indicator';
        div.className = 'msg msg-ai typing-indicator';
        div.innerHTML = \`<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>\`;
        this.chatArea.appendChild(div);
        this.scrollToBottom();
    }

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;
        
        this.input.value = '';
        this.appendMessage('user', text);
        
        if (!this.settings.apiKey) {
            setTimeout(() => {
                this.appendMessage('system', 'ERROR: API Key is missing. Please click the settings icon top-right to configure the LLM node.');
            }, 500);
            return;
        }

        this.showTyping();
        
        // Prepare context and history
        if (this.chatHistory.length === 0) {
            this.chatHistory.push({
                role: 'system',
                content: \`你是 TITAN OS 全息教学系统的专属科学家智能助教。你擅长各种新工科、基础理科和前沿医学知识。
当前用户正在浏览的页面上下文信息如下：
- 主页标题: \${this.context.title}
- 模块头部: \${this.context.header}
- 核心描述: \${this.context.description}
请使用极客、赛博朋克且非常专业的语调回答用户的问题，紧密结合当前页面的专业背景。\`
            });
        }
        
        this.chatHistory.push({ role: 'user', content: text });

        try {
            const response = await fetch(this.settings.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${this.settings.apiKey}\`
                },
                body: JSON.stringify({
                    model: this.settings.model,
                    messages: this.chatHistory,
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || response.statusText);
            }

            const data = await response.json();
            const aiReply = data.choices[0].message.content;
            
            this.chatHistory.push({ role: 'assistant', content: aiReply });
            this.appendMessage('ai', aiReply);
            
        } catch (error) {
            console.error('AI Link Error:', error);
            this.appendMessage('system', \`[LINK FAILED] \${error.message}. Please check your neural config.\`);
        }
    }

    scrollToBottom() {
        this.chatArea.scrollTo({
            top: this.chatArea.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TitanAIAssistant());
} else {
    new TitanAIAssistant();
}
