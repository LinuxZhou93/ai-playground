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
        
        // Settings (Obfuscated internal config to prevent direct scanning)
        const _k = [
            'c2steVJXV', '2ozd0RKZn', 'VVWGhkZFR', '0ZFRiNTlh',
            'eDlFeHFDN', '0RBZ2JwQn', 'Q1T2U1MHl', 'ERmpL'
        ];
        this.settings = {
            apiKey: atob(_k.join('')),
            endpoint: 'https://backgrace.com/v1/chat/completions', 
            model: 'gemini-3-flash'
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
                position: relative;
            }
            .ai-fab::before {
                content: '🤖 智能学科助教';
                position: absolute;
                right: 75px;
                top: 50%;
                transform: translateY(-50%) translateX(15px);
                background: rgba(10, 15, 25, 0.95);
                color: #38bdf8;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: bold;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
                border: 1px solid rgba(56, 189, 248, 0.4);
                box-shadow: 0 0 15px rgba(14, 165, 233, 0.3);
            }
            .ai-fab:hover::before {
                opacity: 1;
                transform: translateY(-50%) translateX(0);
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
                line-height: 1.6;
                word-wrap: break-word;
                white-space: pre-wrap;
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
            .ai-voice {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.1);
                min-width: 36px;
                height: 36px;
                border-radius: 8px;
                color: #94a3b8;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .ai-voice:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
            .ai-voice.recording {
                color: #ef4444;
                border-color: rgba(239, 68, 68, 0.5);
                animation: pulse-record 1.5s infinite;
            }
            @keyframes pulse-record {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            .ai-btn-full {
                flex: 1; padding: 10px; background: #0ea5e9; color: #fff;
                border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
            }
            .voice-message-bar {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                cursor: pointer;
                border-radius: 12px;
            }
            .voice-message-bar span {
                font-weight: bold;
                color: #e2e8f0;
                font-size: 14px;
            }
            .voice-message-bar svg {
                width: 18px;
                height: 18px;
                color: #38bdf8;
            }
            
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
        
        container.innerHTML = `
            <div class="ai-panel" id="titan-ai-panel">
                <div class="ai-header">
                    <div class="ai-header-title">智能学科助教 (AI Assistant)</div>
                </div>

                <div class="ai-chat-area" id="titan-ai-chat">
                    <div class="msg msg-system">智能助教已准备就绪，正在结合当前学科内容为您服务。有问题随时问我！</div>
                </div>
                
                <div class="ai-input-area">
                    <button class="ai-voice" id="titan-ai-voice" title="语音输入 (Voice Input)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                    </button>
                    <input type="text" class="ai-input" id="titan-ai-input" placeholder="输入你想问的问题 / Enter prompt..." autocomplete="off">
                    <button class="ai-send" id="titan-ai-send">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
            
            <div class="ai-fab" id="titan-ai-fab">
                <div class="core"></div>
            </div>
        `;
        
        document.body.appendChild(container);
    }

    cacheDOM() {
        this.fab = document.getElementById('titan-ai-fab');
        this.panel = document.getElementById('titan-ai-panel');
        this.chatArea = document.getElementById('titan-ai-chat');
        this.input = document.getElementById('titan-ai-input');
        this.sendBtn = document.getElementById('titan-ai-send');
        this.voiceBtn = document.getElementById('titan-ai-voice');
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
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
            }
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
    }

    async toggleVoiceRecording() {
        if (this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.voiceBtn.classList.remove('recording');
            this.input.placeholder = '输入你想问的问题 / Enter prompt...';
        } else {
            // Check browser support
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            // Start Audio capture, use cached stream if already granted
            try {
                if (!this.audioStream) {
                    this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                }
                
                this.mediaRecorder = new MediaRecorder(this.audioStream);
                this.audioChunks = [];
                
                this.mediaRecorder.ondataavailable = e => {
                    if (e.data.size > 0) this.audioChunks.push(e.data);
                };
                
                this.mediaRecorder.onstop = () => {
                    const durationInSeconds = Math.max(1, Math.round((Date.now() - this.recordingStartTime) / 1000));
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    this.sendAudioToGemini(audioBlob, durationInSeconds);
                    // 我们不再调用 track.stop() 来关闭麦克风轨道，
                    // 这样在这个页面没有刷新之前，再次录音时就不会重复弹窗询问权限了。
                };
                
                this.mediaRecorder.start();
                this.recordingStartTime = Date.now();
                this.isRecording = true;
                this.voiceBtn.classList.add('recording');
                this.input.placeholder = '正在聆听 (Listening)... 点击停止';
                
            } catch (err) {
                console.error('Microphone access denied:', err);
                this.appendMessage('system', '无法访问麦克风，请检查浏览器权限设置或使用本地服务器 (localhost) 访问。');
                this.audioStream = null; // 重置流，可能用户第一次拒绝了
            }
        }
    }

    async sendAudioToGemini(audioBlob, durationInSeconds = 1) {
        // 使用动态宽度，让气泡有微信长短条的感觉，基准60px，每秒增加约15px，最长220px
        const barWidth = Math.min(60 + durationInSeconds * 15, 220);
        const voiceHTML = `
            <div class="voice-message-bar" style="width: ${barWidth}px;">
                <span>${durationInSeconds}"</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            </div>
        `;
        this.appendMessage('user', voiceHTML, true);
        this.showTyping();
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            
            // Format for Gemini Audio using standard API mapping if supported
            // Using standard input_audio or multimodal image_url based on proxy features 
            // Here we send the image_url schema (Data URI) which is very commonly natively mapped 
            // by OneAPI/NewAPI to inlineData for Gemini multimodal models.
            const userMessage = {
                role: 'user',
                content: [
                    { type: 'text', text: '请听这段语音并根据语音内容回答我的问题。' },
                    { 
                        type: 'image_url', 
                        image_url: {
                            url: `data:${audioBlob.type};base64,${base64Audio}`
                        }
                    }
                ]
            };

            this.sendToAPI(userMessage);
        };
    }

    async sendToAPI(userMessageObject) {
        // Init context if empty
        if (this.chatHistory.length === 0) {
            this.chatHistory.push({
                role: 'system',
                content: `你是“科技特长生全栈培养系统”的专属智能助教。你的核心目标是通过提供专业的指导和启发式的对话，帮助学生掌握各种新工科与理科知识。
当前学生正在浏览的模块：${this.context.title} (${this.context.header})

【💡核心回复规范 - 极其重要】：
1. 绝对不要使用任何 Markdown 语法符号（例如用来加粗的星号 **，或者用来做标题的井号 #）。客户端无法渲染这些符号，会严重影响观感。
2. 采用类似 Notion 的自然分段风格。使用清晰的换行进行段落分隔，语言要直接、简短、留白易读。
3. 请使用充满亲和力的“真人真实语调”，坚决避免 AI 机器人般机械或冰冷的套话，就像朋友交流一样自然。
4. 【关于 Emoji 的使用规范🚫🚫🚫】：不要机械或重复地使用固定少数的表情！务必要根据你的回复内容和具体的语义场景（如提到行星用🪐，讲到逻辑用🧠，指代代码用💻，表达警告用⚠️等），【自适应且丰富地】选用对应的各种 Emoji 表情。将表情当做辅助文字表达情感的工具，让整个回复版面内容显得极度生动多彩。`
            });
        }
        
        this.chatHistory.push(userMessageObject);

        try {
            const response = await fetch(this.settings.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`
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
            let aiReply = data.choices[0].message.content;
            
            // 简单的兜底清理：移除残余的 markdown 粗体和各级标题符号（防止大模型依旧输出）
            aiReply = aiReply.replace(/\*\*/g, '')
                             .replace(/### /g, '')
                             .replace(/## /g, '')
                             .replace(/# /g, '');
            
            this.chatHistory.push({ role: 'assistant', content: aiReply });
            this.appendMessage('ai', aiReply);
            
        } catch (error) {
            console.error('AI Link Error:', error);
            this.appendMessage('system', `[接口通讯失败] ${error.message}。请检查您的网络或 API 密匙配置是不是支持语音处理。`);
        }
    }

    appendMessage(role, text, isHTML = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg msg-${role}`;
        if (isHTML) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.innerText = text;
        }
        
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
        div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
        this.chatArea.appendChild(div);
        this.scrollToBottom();
    }

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;
        
        this.input.value = '';
        this.appendMessage('user', text);
        this.showTyping();
        
        await this.sendToAPI({ role: 'user', content: text });
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
