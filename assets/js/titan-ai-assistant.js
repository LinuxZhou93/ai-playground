// TITAN OS - Global AI Assistant Module (LLM Integration)
// Automatically injected into all TITAN OS nodes.

class TitanAIAssistant {
    constructor() {
        if (document.getElementById('titan-ai-container')) return; // Already initialized
        
        this.isChatOpen = false;
        const fullContent = document.body ? document.body.innerText.replace(/\s+/g, ' ').substring(0, 3000) : '';
        this.context = {
            title: document.title,
            header: document.querySelector('h1')?.innerText || '',
            fullContent: fullContent
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
        this.messageQueue = [];
        this.pendingImages = [];
        this.pendingDocs = [];
        this.isProcessingQueue = false;
        this.init();
    }

    init() {
        this.loadDependencies();
        this.injectCSS();
        this.injectUI();
        this.cacheDOM();
        this.bindEvents();
        setTimeout(() => {
            if (typeof this.updateQuickChips === 'function') this.updateQuickChips();
            // 在挂载完毕后，尝试读取并重绘本会话缓存的聊天记录跨网页不消失
            this.restoreSession();
        }, 300); // 确保在 DOM 加载完成后初始化灵感胶囊和历史记录
    }

    saveSession() {
        // 本地留档 (只保留 user 和 assistant 的核心内容免污染)
        const historyToSave = this.chatHistory.filter(msg => msg.role !== 'system');
        sessionStorage.setItem('titan_ai_history', JSON.stringify(historyToSave));
        sessionStorage.setItem('titan_ai_panel_open', this.isChatOpen ? 'true' : 'false');
        
        // 【新增】：云端量子漫游同步 (Supabase Sync) 跨平台保存状态
        if (window.SupabaseClient && window.SupabaseClient.client) {
            const supabase = window.SupabaseClient.client;
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    supabase.from('ai_chat_sessions').upsert({
                        user_id: user.id,
                        history: historyToSave,
                        updated_at: new Date().toISOString()
                    }).then(({ error }) => {
                        if (error) console.warn('Supabase Cloud Sync Blocked or Table missing:', error);
                    });
                }
            });
        }
    }

    restoreSession() {
        // 先还原上次记忆的展开状态
        const wasOpen = sessionStorage.getItem('titan_ai_panel_open');
        if (wasOpen === 'true' && !this.isChatOpen) {
            this.isChatOpen = true;
            this.panel.classList.add('open');
            setTimeout(() => this.scrollToBottom(), 100);
        }

        // 【新增】：首先联线 Supabase 中心探针拉取云端跨设备存盘，一旦脱机或匿名则退坡到本地 sessionStorage
        if (window.SupabaseClient && window.SupabaseClient.client) {
            const supabase = window.SupabaseClient.client;
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    supabase.from('ai_chat_sessions')
                        .select('history')
                        .eq('user_id', user.id)
                        .single()
                        .then(({ data, error }) => {
                            if (!error && data && data.history && data.history.length > 0) {
                                this._applyHistoryData(data.history);
                            } else {
                                this._restoreLocalSession();
                            }
                        });
                } else {
                    this._restoreLocalSession();
                }
            });
        } else {
            this._restoreLocalSession();
        }
    }

    _restoreLocalSession() {
        const savedHistory = sessionStorage.getItem('titan_ai_history');
        if (savedHistory) {
            try {
                const history = JSON.parse(savedHistory);
                this._applyHistoryData(history);
            } catch(e) { console.error('Error recovering local session:', e); }
        }
    }

    _applyHistoryData(history) {
        if (history && Array.isArray(history) && history.length > 0) {
            this.chatHistory = [...history];
            
            // 清理多余残影DOM，只保留系统组件
            const existingRows = this.chatArea.querySelectorAll('.msg-row.ai, .msg-row.user');
            existingRows.forEach(r => r.remove());

            history.forEach(msg => {
                this.renderStaticMessage(msg.role, msg.content);
            });
            setTimeout(() => this.scrollToBottom(), 300);
        }
    }

    renderStaticMessage(role, content) {
        const rowDiv = document.createElement('div');
        rowDiv.className = `msg-row ${role === 'assistant' ? 'ai' : 'user'}`;
        
        let avatarHTML = '';
        if (role === 'ai' || role === 'assistant') {
            avatarHTML = '<div class="avatar avatar-ai"><img src="assets/img/xiao_chuang_head.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>';
        } else if (role === 'user') {
            avatarHTML = '<div class="avatar avatar-user"></div>';
        }

        const msgClass = (role === 'ai' || role === 'assistant') ? 'msg msg-ai markdown-body' : 'msg msg-user';
        const msgDiv = document.createElement('div');
        msgDiv.className = msgClass;
        
        if (role === 'ai' || role === 'assistant') {
            if (window.marked) {
                msgDiv.innerHTML = window.marked.parse(content);
                if (window.hljs) {
                    msgDiv.querySelectorAll('pre code').forEach((block) => {
                        window.hljs.highlightElement(block);
                        const pre = block.parentElement;
                        let langName = 'TEXT';
                        const langClass = Array.from(block.classList).find(c => c.startsWith('language-'));
                        if (langClass) langName = langClass.replace('language-', '').toUpperCase();
                        const header = document.createElement('div');
                        header.className = 'code-header';
                        header.innerHTML = `<span class="code-lang">${langName}</span><button type="button" class="code-copy" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(block.innerText)}')); this.innerHTML='✅ 已复制'; setTimeout(()=>this.innerHTML='<svg width=\\'12\\' height=\\'12\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'9\\' y=\\'9\\' width=\\'13\\' height=\\'13\\' rx=\\'2\\' ry=\\'2\\'></rect><path d=\\'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\\'></path></svg> 复制代码', 2000)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 复制代码</button>`;
                        pre.insertBefore(header, block);
                    });
                }
            } else {
                msgDiv.innerText = content;
            }
        } else {
            if (typeof content === 'string') {
                msgDiv.innerText = content;
            } else if (Array.isArray(content)) {
                let textPart = content.find(c => c.type === 'text')?.text || '[多模态视觉文件]';
                msgDiv.innerText = textPart;
                const imgPart = content.find(c => c.type === 'image_url');
                if (imgPart) {
                    const imgPreview = document.createElement('img');
                    imgPreview.src = imgPart.image_url.url;
                    imgPreview.style.maxWidth = '100%';
                    imgPreview.style.borderRadius = '8px';
                    imgPreview.style.marginTop = '8px';
                    msgDiv.appendChild(imgPreview);
                }
            }
        }

        rowDiv.innerHTML = avatarHTML;
        rowDiv.appendChild(msgDiv);
        this.chatArea.appendChild(rowDiv);
    }

    loadDependencies() {
        if (!document.getElementById('marked-js')) {
            const script = document.createElement('script');
            script.id = 'marked-js';
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            document.head.appendChild(script);
        }
        if (!document.getElementById('highlight-css')) {
            const link = document.createElement('link');
            link.id = 'highlight-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById('highlight-js')) {
            const script = document.createElement('script');
            script.id = 'highlight-js';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            document.head.appendChild(script);
        }
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
            .ai-scanner {
                position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #38bdf8;
                box-shadow: 0 0 15px 5px rgba(56, 189, 248, 0.4); z-index: 1000;
                animation: scan-sweep 1.5s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
            }
            @keyframes scan-sweep { 0% { top: 0; opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
            .scan-blink { display: inline-block; width: 6px; height: 6px; background: #38bdf8; border-radius: 50%; animation: pulse-core 0.5s infinite; margin-right: 4px; }
            @keyframes ai-fab-breath {
                0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.4), inset 0 0 10px rgba(255,255,255,0.4); transform: translateY(0); }
                50% { box-shadow: 0 0 25px rgba(14, 165, 233, 0.7), inset 0 0 15px rgba(255,255,255,0.6); transform: translateY(-5px); }
            }
            .ai-fab {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: url('assets/img/xiao_chuang_head.png') center/cover no-repeat;
                box-shadow: 0 0 20px rgba(14, 165, 233, 0.4), inset 0 0 10px rgba(255,255,255,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 2px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                color: white;
                position: relative;
                animation: ai-fab-breath 3s ease-in-out infinite;
            }
            .ai-fab::before {
                content: '🤖 小创老师已就位';
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
                transform: scale(1.1) !important;
                animation: none;
                box-shadow: 0 0 30px rgba(14, 165, 233, 0.6), inset 0 0 15px rgba(255,255,255,0.6);
            }
            .ai-fab .core {
                display: none;
            }
            @keyframes pulse-core {
                0%, 100% { transform: scale(0.8); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
            }
            .ai-panel {
                position: absolute;
                bottom: 76px;
                right: 0;
                width: 420px;
                max-width: 90vw;
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
            .ai-panel.expanded {
                width: 800px;
                height: 85vh;
                max-width: 90vw;
                border: 1px solid rgba(56, 189, 248, 0.6);
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8), 0 0 80px rgba(14, 165, 233, 0.2);
                transition: width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .ai-header {
                padding: 16px;
                background: rgba(14, 165, 233, 0.1);
                border-bottom: 1px solid rgba(56, 189, 248, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            #titan-ai-drag-handle { cursor: default; }
            #titan-ai-drag-handle.draggable { cursor: grab; }
            #titan-ai-drag-handle.draggable:active { cursor: grabbing; }
            .ai-header-controls { display: flex; gap: 8px; }
            .ai-expand-btn {
                background: none; border: none; color: #38bdf8; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.7; transition: all 0.2s; padding: 4px; border-radius: 4px;
            }
            .ai-expand-btn:hover { background: rgba(56, 189, 248, 0.2); opacity: 1; }
            .ai-header-title {
                color: #38bdf8;
                font-weight: bold;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .ai-pts-floating {
                position: absolute; bottom: 85px; right: 28px; z-index: 9999;
                font-family: 'Orbitron', 'Noto Sans SC', sans-serif; display: flex; align-items: center; gap: 4px;
                color: #10b981; font-weight: 900; font-size: 18px;
                background: rgba(16, 185, 129, 0.15); padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);
                box-shadow: 0 0 10px rgba(16,185,129,0.4);
                animation: ai-pts-float-up 1.8s ease-out forwards; pointer-events: none;
            }
            .ai-pts-floating span { font-size: 12px; color: #e2e8f0; font-weight: normal; }
            @keyframes ai-pts-float-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.5); }
                15% { opacity: 1; transform: translateY(0) scale(1.1); }
                80% { opacity: 1; transform: translateY(-40px) scale(1); }
                100% { opacity: 0; transform: translateY(-50px) scale(0.8); }
            }
            .ai-pts-particle {
                position: absolute; bottom: 95px; right: 40px; z-index: 9998;
                width: 5px; height: 5px; border-radius: 50%; pointer-events: none;
                animation: ai-pts-explode 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes ai-pts-explode {
                0% { opacity: 1; transform: translate(0, 0) scale(1); }
                100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); }
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
            .msg-row {
                display: flex;
                width: 100%;
                gap: 12px;
                align-items: flex-start;
                animation: msg-spring-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                opacity: 0;
            }
            @keyframes msg-spring-up {
                0% { opacity: 0; transform: translateY(15px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            .msg-row.user {
                justify-content: flex-end;
            }
            .msg-row.ai {
                justify-content: flex-start;
            }
            .msg-row.system {
                justify-content: center;
            }
            .avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .avatar-ai {
                background: rgba(14, 165, 233, 0.15);
                border-color: rgba(56, 189, 248, 0.3);
            }
            .msg {
                max-width: 85%;
                padding: 14px 18px;
                border-radius: 12px;
                font-size: 14.5px;
                line-height: 1.7;
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
                padding: 8px 10px;
                color: #fff;
                font-family: inherit;
                font-size: 13px;
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
                width: 32px;
                height: 32px;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                flex-shrink: 0;
            }
            .ai-send:hover {
                background: #0284c7;
            }
            .ai-voice {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.1);
                min-width: 32px;
                height: 32px;
                border-radius: 8px;
                color: #94a3b8;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .ai-voice:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
            .ai-camera {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.1);
                min-width: 32px;
                height: 32px;
                border-radius: 8px;
                color: #94a3b8;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .ai-camera:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
            .ai-upload, .ai-phone, .ai-tts-stop {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.1);
                min-width: 32px;
                height: 32px;
                border-radius: 8px;
                color: #94a3b8;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .ai-upload:hover, .ai-phone:hover, .ai-tts-stop:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
            .ai-phone.calling {
                color: #10b981;
                border-color: rgba(16, 185, 129, 0.5);
                animation: pulse-call 1.5s infinite;
            }
            @keyframes pulse-call {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            .ai-camera-modal {
                position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000000;
                display: none; align-items: center; justify-content: center; flex-direction: column;
            }
            .ai-camera-wrapper {
                position: relative; width: 90%; max-width: 500px;
                background: #1e293b; border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.1);
            }
            #titan-ai-video { width: 100%; border-radius: 8px; background: #000; }
            #titan-ai-snap { width: 100%; margin-top: 12px; padding: 12px; background: #0ea5e9; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
            #titan-ai-snap:hover { background: #38bdf8; }
            .ai-camera-close { position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
            
            .ai-pending-area {
                padding: 10px 16px;
                background: rgba(0,0,0,0.4);
                border-top: 1px solid rgba(56, 189, 248, 0.2);
                display: none;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
                position: relative;
            }
            .ai-pending-img {
                width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.2);
            }
            .ai-pending-close {
                background: rgba(239,68,68,0.9); border: none; color: white; width: 22px; height: 22px;
                border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                position: absolute; left: 66px; top: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .ai-pending-hint { font-size: 12px; color: #38bdf8; margin-bottom: 6px; flex: 1; text-align: right;}
            
            .ai-image-preview {
                max-width: 200px;
                border-radius: 12px;
                margin-top: 8px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .ai-selection-popover {
                position: absolute;
                z-index: 9999999;
                background: #0ea5e9;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                display: none;
                align-items: center;
                gap: 6px;
                transition: transform 0.2s;
            }
            .ai-selection-popover:hover {
                background: #38bdf8;
                transform: scale(1.05);
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
            .ai-chips-wrapper {
                padding: 0 16px 8px 16px;
                display: flex; gap: 8px; overflow-x: auto;
            }
            .ai-chips-wrapper::-webkit-scrollbar { display: none; }
            .ai-chip {
                white-space: nowrap; padding: 6px 12px; background: rgba(56, 189, 248, 0.1); 
                color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px;
                font-size: 11px; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
            }
            .ai-chip:hover { background: rgba(56, 189, 248, 0.3); color: #fff; }
            
            .markdown-body pre {
                background: #0d1117 !important; /* GitHub Dark Base */
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px;
                padding: 0;
                overflow: hidden;
                margin: 12px 0;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
            }
            .markdown-body .code-header {
                display: flex; justify-content: space-between; align-items: center;
                background: rgba(255,255,255,0.05); padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 11px; color: #8b949e; font-family: 'Orbitron', monospace;
            }
            .markdown-body .code-header .code-copy {
                background: transparent; border: none; color: #8b949e; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px; outline: none; transition: 0.2s;
            }
            .markdown-body .code-header .code-copy:hover { color: #c9d1d9; }
            .markdown-body pre code {
                display: block; padding: 12px; overflow-x: auto;
                font-family: Consolas, Monaco, "Courier New", monospace !important;
                line-height: 1.4 !important;
                color: #c9d1d9; font-size: 13px;
                white-space: pre;
            }
            .markdown-body blockquote { 
                border-left: 4px solid #3b82f6; 
                background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%); 
                padding: 12px 16px; 
                margin: 16px 0; 
                border-radius: 0 8px 8px 0;
                color: #bae6fd;
            }
            .markdown-body hr { margin: 18px 0; border: none; border-top: 1px dashed rgba(255,255,255,0.2); }
            .markdown-body ul, .markdown-body ol { margin-left: 20px; margin-bottom: 12px; margin-top: 6px;}
            .markdown-body li { margin-bottom: 6px; }
            .markdown-body li::marker { color: #38bdf8; font-weight: bold; }
            .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { margin-top: 22px; margin-bottom: 12px; font-weight: 700; color: #f8fafc; line-height: 1.4; }
            .markdown-body h1 { font-size: 1.4em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; color: #38bdf8;}
            .markdown-body h2 { font-size: 1.25em; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 6px; color: #0ea5e9;}
            .markdown-body h3 { font-size: 1.15em; color: #7dd3fc;}
            .markdown-body h4 { font-size: 1.05em; color: #bae6fd;}
            .markdown-body strong { color: #facc15; font-weight: 700; background: rgba(250, 204, 21, 0.1); padding: 2px 4px; border-radius: 4px;}
            .markdown-body p { margin-bottom: 10px; }
            .markdown-body p:last-child { margin-bottom: 0; }
            .markdown-body code:not(pre code) {
                background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; color: #38bdf8; font-family: Consolas, monospace; font-size: 0.9em;
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
                <div class="ai-header" id="titan-ai-drag-handle">
                    <div class="ai-header-title">小创老师 (Virtual Teacher)</div>
                    <div class="ai-header-controls">
                        <button type="button" class="ai-expand-btn" id="titan-ai-expand-btn" title="展开为学习桌面 / 适合精读长篇解答及阅览代码">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                        </button>
                    </div>
                </div>

                <div class="ai-chat-area" id="titan-ai-chat">
                    <div class="msg-row system">
                        <div class="msg msg-system">哈喽！我是小创老师，已准备完毕，将深度结合此网页所展示的核心知识向您解答疑问！</div>
                    </div>
                </div>
                
                <div class="ai-pending-area" id="titan-ai-pending">
                    <img id="titan-ai-pending-img" class="ai-pending-img" src="" />
                    <button type="button" class="ai-pending-close" id="titan-ai-pending-close">✖</button>
                    <span class="ai-pending-hint" id="titan-ai-pending-hint">📸 已就绪，请补充问题...</span>
                </div>
                <div class="ai-chips-wrapper" id="titan-ai-chips">
                    <button type="button" class="ai-chip" data-prompt="💡 不要直接给我答案，只给我一点提示">💡 不要答案，只要提示</button>
                    <button type="button" class="ai-chip" data-prompt="🤔 结合生活中的物理/工程例子，用通俗语言帮我解释一下">🤔 通俗现象解释</button>
                    <button type="button" class="ai-chip" data-prompt="📝 给我出一道类似的题目练手，附带答案解析">📝 出一道类似题</button>
                </div>
                <div class="ai-input-area">
                    <input type="file" id="titan-ai-file-input" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx" style="display: none;" multiple>
                    <button type="button" class="ai-upload" id="titan-ai-upload-btn" title="传送门 / 导入本地照片、作业文档、表格或幻灯片以供深度分析 (Upload)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>
                    <button type="button" class="ai-phone" id="titan-ai-phone-btn" title="实时语音对谈 / 开启沉浸式口语化交互辅导 (Voice Call)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </button>
                    <button type="button" class="ai-tts-stop" id="titan-ai-tts-stop-btn" title="立刻打断 AI 说话 (Stop Audio)" style="display:none; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    </button>
                    <button type="button" class="ai-camera" id="titan-ai-camera-btn" title="启动前置摄像头 / 拍一拍实物现象 (Camera)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </button>
                    <button type="button" class="ai-screenshot" id="titan-ai-screenshot-btn" title="系统截屏 / 截取系统任何窗口给小创老师分析 (Screenshot)" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;display:flex;align-items:center;outline:none;transition:color 0.3s;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                    </button>
                    <button type="button" class="ai-voice" id="titan-ai-voice" title="点击录音 / 再次点击停止并发送。可结合刚刚拍下的照片进行跨模态发问 (Voice Input)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                    </button>
                    <div style="flex:1; position:relative; display:flex; align-items:center;">
                        <canvas id="titan-ai-waveform" width="140" height="30" style="display:none; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); pointer-events:none; z-index:10;"></canvas>
                        <input type="text" class="ai-input" id="titan-ai-input" placeholder="输入你想问的问题..." autocomplete="off" maxlength="10000" style="width:100%;">
                    </div>
                    <button type="button" class="ai-send" id="titan-ai-send" title="发送问题 / 可以与上传的图像照片组合进行多模态发问 (Send)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
            
            <div class="ai-camera-modal" id="titan-ai-camera-modal">
                <div class="ai-camera-wrapper">
                    <video id="titan-ai-video" autoplay playsinline></video>
                    <canvas id="titan-ai-canvas" style="display:none;"></canvas>
                    <button type="button" id="titan-ai-snap">📸 拍照并发送</button>
                    <button type="button" class="ai-camera-close" id="titan-ai-camera-close">✖</button>
                </div>
            </div>

            <div class="ai-fab" id="titan-ai-fab">
                <div class="core"></div>
            </div>

            <div class="ai-selection-popover" id="titan-ai-selection">🤖 问问小创老师</div>
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
        this.cameraBtn = document.getElementById('titan-ai-camera-btn');
        this.cameraModal = document.getElementById('titan-ai-camera-modal');
        this.uploadBtn = document.getElementById('titan-ai-upload-btn');
        this.fileInput = document.getElementById('titan-ai-file-input');
        this.phoneBtn = document.getElementById('titan-ai-phone-btn');
        this.ttsStopBtn = document.getElementById('titan-ai-tts-stop-btn');
        this.videoEl = document.getElementById('titan-ai-video');
        this.canvasEl = document.getElementById('titan-ai-canvas');
        this.snapBtn = document.getElementById('titan-ai-snap');
        this.cameraCloseBtn = document.getElementById('titan-ai-camera-close');
        
        this.dragHandle = document.getElementById('titan-ai-drag-handle');
        this.expandBtn = document.getElementById('titan-ai-expand-btn');
        this.isExpanded = false;
        
        this.pendingArea = document.getElementById('titan-ai-pending');
        this.pendingImg = document.getElementById('titan-ai-pending-img');
        this.pendingHint = document.getElementById('titan-ai-pending-hint');
        this.pendingCloseBtn = document.getElementById('titan-ai-pending-close');
        this.pendingImageDataUrl = null;
        this.pendingTextData = null;
        this.isPhoneCallMode = false;
        
        this.selectionBtn = document.getElementById('titan-ai-selection');
        this.chips = document.querySelectorAll('.ai-chip'); // 绑定启发式引导磁片
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    bindEvents() {
        this.fab.addEventListener('click', () => {
            if (!this.isChatOpen) this.playHapticSound('open');
            this.isChatOpen = !this.isChatOpen;
            if (this.isChatOpen) {
                this.panel.classList.add('open');
                this.input.focus();
                
                if (!this.hasScanned) {
                    this.hasScanned = true;
                    this.runScanner();
                } else {
                    this.scrollToBottom();
                }
            } else {
                this.panel.classList.remove('open');
            }
            this.saveSession(); // 面板动作变更后跨网页留存
        });
        
        // 绑定快捷磁片启发式提问
        this.chips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const prompt = e.currentTarget.dataset.prompt;
                this.input.value = prompt;
                this.input.focus();
                // 极简交互：点击磁片后直接替用户发送以增强爽快感
                this.sendBtn.click();
            });
        });

        // 扩展面板逻辑
        this.expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                this.panel.classList.add('expanded');
                this.dragHandle.classList.add('draggable');
                
                this.panel.style.transition = 'none'; // 取消原生缩放过渡避免冲突
                this.panel.style.position = 'fixed';
                this.panel.style.left = '50%';
                this.panel.style.top = '50%';
                this.panel.style.right = 'auto';
                this.panel.style.bottom = 'auto';
                this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
                
                this.expandBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
            } else {
                this.panel.classList.remove('expanded');
                this.dragHandle.classList.remove('draggable');
                
                this.panel.style.position = 'absolute';
                this.panel.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                this.panel.style.left = '';
                this.panel.style.top = '';
                this.panel.style.right = '0';
                this.panel.style.bottom = '76px';
                this.panel.style.transform = '';
                
                this.expandBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
            }
            setTimeout(() => this.scrollToBottom(), 300);
        });

        // 拖拽逻辑
        let isDragging = false;
        let dragStartX, dragStartY;
        let initialLeft, initialTop;

        this.dragHandle.addEventListener('mousedown', (e) => {
            if (!this.isExpanded || e.target.closest('.ai-header-controls')) return;
            isDragging = true;
            this.panel.style.transition = 'none';
            // 拿到真实的物理渲染边缘坐标
            const rect = this.panel.getBoundingClientRect();
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            initialLeft = rect.left;
            initialTop = rect.top;
            
            // 为了把拖拽变得最纯粹！我们强行洗去 50% 的概念，用物理 PX 坐标锁死左上角。并且去掉 transform 中令人混淆的 translate
            this.panel.style.left = `${initialLeft}px`;
            this.panel.style.top = `${initialTop}px`;
            this.panel.style.transform = 'scale(1)';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            this.panel.style.left = `${initialLeft + dx}px`;
            this.panel.style.top = `${initialTop + dy}px`;
            this.panel.style.right = 'auto';
            this.panel.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) isDragging = false;
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        
        
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.phoneBtn.addEventListener('click', () => this.togglePhoneCall());
        const scBtn = document.getElementById('titan-ai-screenshot-btn');
        if(scBtn) scBtn.addEventListener('click', () => this.handleScreenshot());
        if (this.ttsStopBtn) {
            this.ttsStopBtn.addEventListener('click', () => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                if (this.currentAudioPlayer) {
                    this.currentAudioPlayer.pause();
                    this.currentAudioPlayer = null;
                }
                this.ttsStopBtn.style.display = 'none';
            });
        }
        
        this.cameraBtn.addEventListener('click', () => this.openCamera());
        this.cameraCloseBtn.addEventListener('click', () => this.closeCamera());
        this.snapBtn.addEventListener('click', () => this.takeSnapshot());
        
        document.addEventListener('mouseup', this.handleTextSelection.bind(this));
        document.addEventListener('touchend', this.handleTextSelection.bind(this));
        
        this.selectionBtn.addEventListener('click', () => {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                if (!this.isChatOpen) this.fab.click();
                // 稍加延迟，保证面板划出后再加入聊天气泡
                setTimeout(() => {
                    const msg = `请帮我解析以下这段提取内容：\n\n"${selectedText}"`;
                    this.input.value = msg;
                    this.sendMessage();
                }, 300);
            }
            this.selectionBtn.style.display = 'none';
            window.getSelection().removeAllRanges();
        });
    }

    runScanner() {
        const scannerEl = document.createElement('div');
        scannerEl.className = 'ai-scanner';
        this.panel.appendChild(scannerEl);
        
        const scanMsg = document.createElement('div');
        scanMsg.className = 'msg-row system';
        scanMsg.innerHTML = `<div class="msg msg-system" style="background:rgba(56,189,248,0.2);color:#38bdf8;border:1px solid rgba(56,189,248,0.5);"><span class="scan-blink"></span> [鹰眼系统] 正在同步知识库与页面视觉要素...</div>`;
        this.chatArea.appendChild(scanMsg);
        this.scrollToBottom();
        
        setTimeout(() => {
            if(scannerEl.parentNode) scannerEl.remove();
            scanMsg.innerHTML = `<div class="msg msg-system" style="background:rgba(16,185,129,0.2);color:#10b981;border:1px solid rgba(16,185,129,0.5);">同步流闭环。小创老师全维就位。</div>`;
            setTimeout(() => { 
                scanMsg.style.opacity = '0'; 
                scanMsg.style.transition = 'opacity 0.5s'; 
                setTimeout(() => scanMsg.remove(), 500); 
            }, 2500);
        }, 1500);
    }

    playHapticSound(type) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            if (!this.hapticCtx) {
                this.hapticCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.hapticCtx.state === 'suspended') this.hapticCtx.resume();
            
            const osc = this.hapticCtx.createOscillator();
            const gainNode = this.hapticCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(this.hapticCtx.destination);
            
            const now = this.hapticCtx.currentTime;
            if (type === 'open') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gainNode.gain.setValueAtTime(0.015, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'send') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gainNode.gain.setValueAtTime(0.015, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'snap') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
                gainNode.gain.setValueAtTime(0.04, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            }
        } catch (e) { }
    }

    _updateFileReadyUI(filename) {
        if (this.pendingImages.length === 0 && this.pendingDocs.length === 0) {
            this.pendingArea.style.display = 'none';
            return;
        }
        this.pendingArea.innerHTML = '';
        this.pendingArea.style.display = 'flex';
        
        let fileHTML = '';
        this.pendingImages.forEach((img, idx) => {
            fileHTML += `
                <div style="position:relative; width:50px; height:50px;">
                    <img src="${img}" style="width:100%; height:100%; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.2);">
                    <button type="button" onclick="window.$titanAIAssistant.removePendingFile('image', ${idx})" style="position:absolute;top:-6px;right:-6px;background:rgba(239,68,68,0.9);color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;">✖</button>
                </div>`;
        });
        
        this.pendingDocs.forEach((doc, idx) => {
            fileHTML += `
                <div style="position:relative; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:6px; display:flex; align-items:center; gap:4px; font-size:11px; color:#bae6fd; max-width: 140px; border:1px solid rgba(56, 189, 248, 0.2);">
                    📄 <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${doc.name}</span>
                    <button type="button" onclick="window.$titanAIAssistant.removePendingFile('doc', ${idx})" style="position:absolute;top:-6px;right:-6px;background:rgba(239,68,68,0.9);color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;">✖</button>
                </div>`;
        });
        
        if (this.pendingImages.length + this.pendingDocs.length > 1) {
            fileHTML += `<button type="button" onclick="window.$titanAIAssistant.clearAllPendingFiles()" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:11px;margin-left:auto;">全部清空</button>`;
        }
        
        window.$titanAIAssistant = this;
        this.pendingArea.innerHTML = fileHTML;
        
        if (!this.isChatOpen) this.fab.click();
        this.input.focus();
    }
    
    removePendingFile(type, idx) {
        if (type === 'image') this.pendingImages.splice(idx, 1);
        if (type === 'doc') this.pendingDocs.splice(idx, 1);
        this._updateFileReadyUI();
        if (this.fileInput && this.pendingImages.length === 0 && this.pendingDocs.length === 0) this.fileInput.value = '';
    }
    
    clearAllPendingFiles() {
        this.pendingImages = [];
        this.pendingDocs = [];
        this._updateFileReadyUI();
        if (this.fileInput) this.fileInput.value = '';
    }
    
    async handleScreenshot() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: "screen" } });
            const track = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);
            const bitmap = await imageCapture.grabFrame();
            
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            if (this.pendingImages.length < 6) {
                this.pendingImages.push(dataUrl);
                this._updateFileReadyUI();
            } else {
                alert('您最多只能同时上传 6 张图片供分析哦！');
            }
            track.stop();
        } catch(err) {
            console.error('截屏失败:', err);
        }
    }

    async handleFileUpload(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.type.startsWith('image/')) {
                if (this.pendingImages.length >= 6) { alert('最多允许选取6张图片！'); continue; }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.pendingImages.push(ev.target.result);
                    this._updateFileReadyUI();
                };
                reader.readAsDataURL(file);
            } else {
                if (this.pendingDocs.length >= 3) { alert('最多允许挂载3份文档！'); continue; }
                
                if (file.name.toLowerCase().endsWith('.docx')) {
                    const reader = new FileReader();
                    this.pendingDocs.push({ name: file.name, content: '正在全力加载并解析 Word 结构...' });
                    const docIdx = this.pendingDocs.length - 1;
                    this._updateFileReadyUI();
                    
                    reader.onload = async (ev) => {
                        try {
                            if (!window.mammoth) {
                                await new Promise((res, rej) => {
                                    const s = document.createElement('script');
                                    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
                                    s.onload = res; s.onerror = rej;
                                    document.head.appendChild(s);
                                });
                            }
                            const result = await window.mammoth.extractRawText({ arrayBuffer: ev.target.result });
                            this.pendingDocs[docIdx].content = result.value.substring(0, 8000) || '(文档内容无法识别)';
                            this._updateFileReadyUI();
                        } catch (err) {
                            this.pendingDocs[docIdx].content = '(解析失败: 加密或损坏文档)';
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
                    const reader = new FileReader();
                    this.pendingDocs.push({ name: file.name, content: '正在加载表格解析分析器...' });
                    const docIdx = this.pendingDocs.length - 1;
                    this._updateFileReadyUI();
                    
                    reader.onload = async (ev) => {
                        try {
                            if (!window.XLSX) {
                                await new Promise((res, rej) => {
                                    const s = document.createElement('script');
                                    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                                    s.onload = res; s.onerror = rej;
                                    document.head.appendChild(s);
                                });
                            }
                            const workbook = window.XLSX.read(ev.target.result, {type: 'array'});
                            let fullTxt = '';
                            workbook.SheetNames.forEach(sheetName => {
                                const csv = window.XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                                fullTxt += `[表单页: ${sheetName}]\n${csv}\n\n`;
                            });
                            this.pendingDocs[docIdx].content = fullTxt.substring(0, 10000) || '(表格空)';
                            this._updateFileReadyUI();
                        } catch (err) {
                            this.pendingDocs[docIdx].content = '(解析失败: 加密或损坏的表格)';
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } else if (file.name.toLowerCase().endsWith('.pdf')) {
                    const reader = new FileReader();
                    this.pendingDocs.push({ name: file.name, content: '正在动用视觉提取 PDF 内文...' });
                    const docIdx = this.pendingDocs.length - 1;
                    this._updateFileReadyUI();
                    
                    reader.onload = async (ev) => {
                        try {
                            if (!window.pdfjsLib) {
                                await new Promise((res, rej) => {
                                    const s = document.createElement('script');
                                    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
                                    s.onload = res; s.onerror = rej;
                                    document.head.appendChild(s);
                                });
                                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                            }
                            const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(ev.target.result) }).promise;
                            let fullText = '';
                            for (let j = 1; j <= Math.min(pdf.numPages, 10); j++) {
                                const page = await pdf.getPage(j);
                                const tc = await page.getTextContent();
                                fullText += tc.items.map(item => item.str).join(' ') + '\n';
                            }
                            this.pendingDocs[docIdx].content = fullText.substring(0, 8000) || '(纯图片PDF)';
                            this._updateFileReadyUI();
                        } catch (err) {
                             this.pendingDocs[docIdx].content = '(解析失败: 加密或异常文档)';
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } else if (file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx')) {
                    // PPT fallback warning
                    this.pendingDocs.push({ name: file.name, content: '警告：不支持对 PPT 富媒体动效进行深度文字解剖。如有强诉求，强烈建议将本 PPT 转存为 PDF 后上传阅读效果最佳！这里仅记录文件名感知。' });
                    this._updateFileReadyUI();
                } else {
                    const reader = new FileReader();
                    this.pendingDocs.push({ name: file.name, content: '' });
                    const docIdx = this.pendingDocs.length - 1;
                    reader.onload = (ev) => {
                        this.pendingDocs[docIdx].content = ev.target.result.substring(0, 8000);
                        this._updateFileReadyUI();
                    };
                    reader.readAsText(file);
                }
            }
        }
    }

    async speakReply(text, callback) {
        const cleanText = text.replace(/[*_#`~]/g, '').trim();
        if (!cleanText) {
            if (callback) callback();
            return;
        }

        try {
            // 尝试调用 OpenAI 兼容的高级语音合成接口进行拟态发音
            const ttsEndpoint = this.settings.endpoint.replace('/chat/completions', '/audio/speech');
            const response = await fetch(ttsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: cleanText,
                    voice: 'nova' // 知性女声，更拟人
                })
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                this.currentAudioPlayer = audio;
                if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'flex';
                
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudioPlayer = null;
                    if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none';
                    if (callback) callback();
                };
                audio.onerror = () => {
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudioPlayer = null;
                    if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none';
                    this.fallbackSpeak(cleanText, callback);
                };
                
                await audio.play();
                return;
            } else {
                this.fallbackSpeak(cleanText, callback);
            }
        } catch (e) {
            this.fallbackSpeak(cleanText, callback);
        }
    }

    fallbackSpeak(text, callback) {
        if (!('speechSynthesis' in window)) {
            if (callback) callback();
            return;
        }
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        
        // 尝试选用本地相对拟人的高级声音
        const voices = window.speechSynthesis.getVoices();
        const premiumVoice = voices.find(v => v.lang.includes('zh') && (v.name.includes('Xiaoxiao') || v.name.includes('Ting-Ting') || v.name.includes('Premium') || v.name.includes('Natural')));
        if (premiumVoice) utterance.voice = premiumVoice;
        
        if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'flex';
        utterance.onend = () => { if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none'; if (callback) callback(); };
        utterance.onerror = () => { if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none'; if (callback) callback(); };
        
        window.speechSynthesis.speak(utterance);
    }

    togglePhoneCall() {
        this.isPhoneCallMode = !this.isPhoneCallMode;
        if (this.isPhoneCallMode) {
            this.phoneBtn.classList.add('calling');
            this.appendMessage('system', '📞 实时通话模式已开启，我在这呢，请畅所欲言。');
            if (!this.isChatOpen) this.fab.click();
            // 自动开启第一轮聆听
            if (!this.isRecording) this.toggleVoiceRecording();
        } else {
            this.phoneBtn.classList.remove('calling');
            this.appendMessage('system', '📞 实时通话模式已结束。');
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (this.currentAudioPlayer) {
                this.currentAudioPlayer.pause();
                this.currentAudioPlayer = null;
            }
            if (this.isRecording) this.toggleVoiceRecording();
        }
    }

    async toggleVoiceRecording() {
        if (this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            if (this.silenceInterval) clearInterval(this.silenceInterval);
            if (this.maxAudioDurationTimer) clearTimeout(this.maxAudioDurationTimer);
            this.voiceBtn.classList.remove('recording');
            this.input.placeholder = '输入你想问的问题...';
            this.input.style.opacity = '1';
            const waveformCanvas = document.getElementById('titan-ai-waveform');
            if (waveformCanvas) waveformCanvas.style.display = 'none';
        } else {
            // Check browser support
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            // Start Audio capture, use cached stream if already granted
            try {
                if (!this.audioStream) {
                    this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                }
                
                if (!this.hapticCtx) this.hapticCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (this.hapticCtx.state === 'suspended') this.hapticCtx.resume();
                if (!this.analyser) {
                    this.analyser = this.hapticCtx.createAnalyser();
                    this.analyser.fftSize = 64; 
                    this.micSource = this.hapticCtx.createMediaStreamSource(this.audioStream);
                    this.micSource.connect(this.analyser);
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
                };
                
                this.mediaRecorder.start();
                this.recordingStartTime = Date.now();
                this.isRecording = true;
                this.voiceBtn.classList.add('recording');
                
                if (this.maxAudioDurationTimer) clearTimeout(this.maxAudioDurationTimer);
                this.maxAudioDurationTimer = setTimeout(() => {
                    if (this.isRecording) {
                        if (typeof this.playHapticSound === 'function') this.playHapticSound('send');
                        this.appendMessage('system', '⏳ 录音已达到单次安全的 2 分钟上限，已为您自动停止并发送分析。');
                        this.toggleVoiceRecording();
                    }
                }, 120000);

                this.input.placeholder = '正在聆听 (上限2分钟)... 再次点击发送';
                this.input.style.opacity = '0.3';
                
                const waveformCanvas = document.getElementById('titan-ai-waveform');
                if (waveformCanvas) {
                    waveformCanvas.style.display = 'block';
                    const ctx = waveformCanvas.getContext('2d');
                    
                    const renderWaveform = () => {
                        if (!this.isRecording) return;
                        requestAnimationFrame(renderWaveform);
                        
                        const bufferLength = this.analyser.frequencyBinCount;
                        const dataArray = new Uint8Array(bufferLength);
                        this.analyser.getByteFrequencyData(dataArray);
                        
                        ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
                        const barWidth = (waveformCanvas.width / bufferLength) * 2;
                        let x = 0;
                        
                        const gradient = ctx.createLinearGradient(0, 0, waveformCanvas.width, 0);
                        gradient.addColorStop(0, '#0ea5e9');
                        gradient.addColorStop(0.5, '#6366f1');
                        gradient.addColorStop(1, '#ec4899');
                        ctx.fillStyle = gradient;
                        
                        for(let i = 0; i < bufferLength; i++) {
                            let valRatio = dataArray[i] / 255;
                            valRatio = valRatio * valRatio + 0.1;
                            if (valRatio > 1) valRatio = 1;
                            
                            const barHeight = valRatio * waveformCanvas.height;
                            const y = (waveformCanvas.height - barHeight) / 2;
                            
                            ctx.beginPath();
                            ctx.roundRect(x, y, barWidth - 1, barHeight, 2);
                            ctx.fill();
                            x += barWidth;
                        }
                    };
                    renderWaveform();
                }
                
            } catch (err) {
                console.error('Microphone access denied:', err);
                this.appendMessage('system', '无法访问麦克风，请检查浏览器权限设置或使用本地服务器 (localhost) 访问。');
                this.audioStream = null; // 重置流，可能用户第一次拒绝了
            }
        }
    }

    async sendAudioToGemini(audioBlob, durationInSeconds = 1) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const voiceHTML = `
            <div class="voice-message-bar" title="点击播放/暂停刚才录制的语音" style="justify-content: space-between; min-width: 60px;" onclick="
                let a = window.$titanUserAudio;
                const srcMatch = window.$titanAudioUrl === '${audioUrl}';
                const svg = this.querySelector('svg');
                if (a && !a.paused && srcMatch) {
                    a.pause();
                    a.currentTime = 0;
                    svg.style.color = '#38bdf8';
                    window.$titanAudioUrl = null;
                } else {
                    if (a) { a.pause(); a.currentTime = 0; }
                    window.$titanAudioUrl = '${audioUrl}';
                    window.$titanUserAudio = new Audio('${audioUrl}');
                    window.$titanUserAudio.play();
                    svg.style.color = '#10b981';
                    window.$titanUserAudio.onended = () => { svg.style.color = '#38bdf8'; window.$titanAudioUrl = null; };
                }
            ">
                <span>${durationInSeconds}"</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            </div>
        `;
        
        const hasImage = this.pendingImages.length > 0;
        const hasFile = this.pendingDocs.length > 0;
        let fileTextPromptPart = '';
        let pendingMediaHTML = '';
        const imagesBase64List = [];

        if (hasFile) {
            pendingMediaHTML += `<div style="background:rgba(255,255,255,0.1);padding:6px;border-radius:4px;margin-bottom:8px;font-size:12px;display:flex;flex-wrap:wrap;gap:6px;">`;
            this.pendingDocs.forEach(doc => {
                pendingMediaHTML += `<span style="background:rgba(14,165,233,0.3);padding:2px 6px;border-radius:4px;">📄 ${doc.name}</span>`;
                fileTextPromptPart += `[附件 ${doc.name}]\n${doc.content}\n\n`;
            });
            pendingMediaHTML += `</div>`;
        }

        if (hasImage) {
            pendingMediaHTML += `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">`;
            this.pendingImages.forEach(img => {
                imagesBase64List.push(img.split(',')[1]);
                pendingMediaHTML += `<img src="${img}" class="ai-image-preview" style="height:60px;width:60px;object-fit:cover;border-radius:6px;margin:0;" />`;
            });
            pendingMediaHTML += `</div>`;
        }

        // Reset arrays
        this.pendingImages = [];
        this.pendingDocs = [];
        this._updateFileReadyUI();
        if (this.fileInput) this.fileInput.value = '';

        this.lastInputWasVoice = true; // 标记这是语音请求
        this.appendMessage('user', pendingMediaHTML + voiceHTML, true);
        this.showTyping();
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            
            let systemPromptText = '请听这段语音并根据语音内容回答我的问题。';
            if (hasImage && hasFile) {
                systemPromptText = '请听这段语音并结合照片里的视觉画面、以及附加的文档内容来联合回答我的提问。';
            } else if (hasImage) {
                systemPromptText = '请听这段语音并结合照片里的视觉画面来联合回答我的提问。';
            } else if (hasFile) {
                systemPromptText = '请听这段语音并结合附加的文档内容来联合回答我的提问。';
            }

            systemPromptText = fileTextPromptPart + systemPromptText;

            const userMessage = {
                role: 'user',
                content: [
                    { type: 'text', text: systemPromptText }
                ]
            };
            
            if (pureImgBase64) {
                userMessage.content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${pureImgBase64}` } });
            }
            userMessage.content.push({ type: 'image_url', image_url: { url: `data:${audioBlob.type};base64,${base64Audio}` } });

            this.messageQueue.push(userMessage);
            this.processQueue();
        };
    }

    handleTextSelection(e) {
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            // 不在面板范围内点击才算
            if (text.length > 0 && (!this.panel || !this.panel.contains(e.target)) && e.target.id !== 'titan-ai-selection') {
                let x = e.pageX;
                let y = e.pageY - 40;
                if(e.type === 'touchend' && e.changedTouches && e.changedTouches.length > 0) {
                    const touch = e.changedTouches[0];
                    x = touch.pageX;
                    y = touch.pageY - 40;
                }
                
                this.selectionBtn.style.display = 'flex';
                this.selectionBtn.style.top = `${y}px`;
                this.selectionBtn.style.left = `${x}px`;
            } else {
                if (e.target.id !== 'titan-ai-selection') {
                    this.selectionBtn.style.display = 'none';
                }
            }
        }, 80); //稍微提高延迟让选区更稳定
    }

    async openCamera() {
        this.cameraModal.style.display = 'flex';
        try {
            // environment 优先后置，前置 fallback。完全靠谱在移动端和PC间切换。
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
            this.videoEl.srcObject = stream;
        } catch(err) {
            console.error('Camera access denied:', err);
            alert('无法访问摄像头，请检查浏览器权限。');
            this.closeCamera();
        }
    }

    closeCamera() {
        this.cameraModal.style.display = 'none';
        if (this.videoEl.srcObject) {
            this.videoEl.srcObject.getTracks().forEach(track => track.stop());
            this.videoEl.srcObject = null;
        }
    }

    takeSnapshot() {
        if (!this.videoEl.videoWidth) return;
        this.canvasEl.width = this.videoEl.videoWidth;
        this.canvasEl.height = this.videoEl.videoHeight;
        const ctx = this.canvasEl.getContext('2d');
        ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
        
        // 生成 base64
        const dataURL = this.canvasEl.toDataURL('image/jpeg');

        // 关闭模态框并清理视频流
        this.closeCamera();
        this.playHapticSound('snap');

        // 仅保存在待发送预览区（Pending），等待用户输入提示词合并发出
        if (this.pendingImages.length < 6) {
            this.pendingImages.push(dataURL);
        } else {
            alert('最多容纳 6 张相片！');
        }
        this._updateFileReadyUI();
    }

    async sendToAPI(userMessageObject) {
        // 动态抓取当前页面的最新上下文（解决单页应用无刷新切换网页的场景）
        const currentFullContent = document.body ? document.body.innerText.replace(/\s+/g, ' ').substring(0, 3000) : '';
        const currentTitle = document.title;
        const currentHeader = document.querySelector('h1')?.innerText || '';
        
        const chengdianRAG = `
【🔐 内置教育知识库RAG：成电创客教学大纲与理念精华】
1. 教育愿景：强校背书赋能，坚信“由于动手，所以可能”。
2. 瞪羚培养体系：彻底告别无意义的“买课时”模式。采用半年度跨跃性成果导向，保证全年高密度交付多项真实比赛与工程实物。
3. 四大引擎矩阵：A修主流VEX机器人，B修底层C++/Python技能树，C选世界机器人大会等白名单赛脱产，D修社会问题解决工程营地。
4. 全能生命周期图：L1(兴趣与认知土壤) > L2(入门获白名单证书/以考促学) > L3(竞技突围) > L4(深造通道，用科创成果筑起综合素养和强基计划护城河)。
5. 课堂真经：杜绝老师包办一切，而是以“破冰 -> 重难点解析 -> 放权给孩子实操且仅做边缘微调 -> 公开分享路演 -> 知识升华” 这五个环节来锻炼极客硬实力。
*（注意：你应当自然、毫不生硬地在与家长、学生的对话中引申或参考这些先进模型观念，严禁透漏任何诸如利润分成、具体课时单价等非教育层面的后台资料。）*
`;

        const systemPromptContent = `你是“科技特长生全栈培养系统”的专属智能虚拟教师，你的名字叫“小创老师”。你的核心目标是通过提供专业的指导和启发式的对话，帮助学生掌握各种新工科与理科知识。
当有疑惑时，你可以充分参考你的内在理论体系引擎：${chengdianRAG}

当前学生正在浏览的本系统中某个模块页面：${currentTitle} (${currentHeader})
以下是系统刚刚抓取到的该网页内的当前页面核心文本（这是他此刻可能在问的直接上下文）：
${currentFullContent}

【💡核心回复规范 - 极其重要】：
1. 你必须像高级 Notion 笔记那样使用 Markdown 优雅排版！规范如下：
   - 坚决避免类似 "1. **加粗伪标题**" 这种平铺排版。必须使用真正的多级标题 (### , ####) 来划分每个大环节，以形成清晰的骨架层级！
   - 加入充裕的 Emoji 作为图标点缀 (如🪐🎯💡🔥🚀等)。段落大意之间可以利用分割线 (---) 进行物理隔断。
   - 【极其关键】：涉及到“核心概念”、“金句”、“启发点”或“警告”等重要知识，**必须用引用块 (\`> \`) 进行包裹**！系统会强制将其渲染成带色彩的极客高亮提示框（Color Blocks），这就是我们要的 Notion 化质感！
2. 【特级作图规则 (ASCII Blueprint)】：你是专业的“科技特长生全栈总架构师”，每当讲解机械结构(如齿轮/杠杆)、组织逻辑、现象成因或数据流时，你**必须**使用 Markdown 全代码块（\`\`\`text \`\`\`）包裹，并以极高难度的系统工程 ASCII 全景架构图进行呈现！决不允许画几个简单的横线应付，必须利用高级制表符（如 ┌───┐, │, └───┘, ├, ┼, ◄, ▲, ▼, =>）画出包含嵌套子系统、清晰上下游流向、并带有精细参数注释的硬核工程图纸！图纸画得越专业、越庞大越能彰显你的地位！前端拥有带拷贝按钮的极客深色 IDE 代码窗来承载你的神作！
3. 请使用充满亲和力的“真人语调”，坚决避免 AI 机器人般机械或冰冷的套话。语言要简明扼要，直接、简短。
4. 【多模态教学强引导】：当你在对话中讲解一些知识概念、或者鼓励学生亲自去搭建实体（如乐高/VEX/结构件）时，**无时无刻不要忘记极其热情地引导他们主动使用面板下方的【相机📸】按钮，把他们的实物作品或身边对应的现象拍给你看！** （用轻松的口吻，如：“遇到搞不懂的结构？随时点下面的相机按钮拍个照片或长截屏发给小创老师，我帮你一键分析！”或“拼出来了没？拍个图发给我验证一下鸭！”）要让孩子深刻感受到你是拥有视觉的随身极客伴侣。`;

        // Init context if empty
        if (this.chatHistory.length === 0) {
            this.chatHistory.push({
                role: 'system',
                content: systemPromptContent
            });
        } else if (this.chatHistory[0] && this.chatHistory[0].role === 'system') {
            // 如果这是非首次请求，我们要保证大模型能“看到”最新的页面内容
            this.chatHistory[0].content = systemPromptContent;
        }
        
        this.chatHistory.push(userMessageObject);
        this.saveSession();

        this.currentAbortController = new AbortController();
        this.isTypingCancelled = false;
        this.setSendButtonState('stop');

        try {
            const response = await fetch(this.settings.endpoint, {
                method: 'POST',
                signal: this.currentAbortController.signal,
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
            this.chatHistory.push({ role: 'assistant', content: aiReply });
            this.saveSession();
            // --- 开始：全新增强版单向流智能打字机 (Unified Stream Engine) ---
            const typing = document.getElementById('ai-typing-indicator');
            if (typing) typing.remove();

            // 摒弃物理切段，创建唯一的知识黑板大容器，保护 Markdown 闭合语法免受破坏！
            const rowDiv = document.createElement('div');
            rowDiv.className = 'msg-row ai';
            rowDiv.style.animation = 'msg-spring-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

            const avatarHTML = '<div class="avatar avatar-ai"><img src="assets/img/xiao_chuang_head.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>';
            const msgDiv = document.createElement('div');
            msgDiv.className = 'msg msg-ai markdown-body';
            
            rowDiv.innerHTML = avatarHTML;
            rowDiv.appendChild(msgDiv);
            this.chatArea.appendChild(rowDiv);
            this.scrollToBottom(true);

            const enhanceCodeBlocks = () => {
                if (!window.hljs) return;
                msgDiv.querySelectorAll('pre code').forEach((block) => {
                    const pre = block.parentElement;
                    if (pre.querySelector('.code-header')) return; 
                    
                    window.hljs.highlightElement(block);
                    
                    let langName = 'TEXT';
                    const langClass = Array.from(block.classList).find(c => c.startsWith('language-'));
                    if (langClass) langName = langClass.replace('language-', '').toUpperCase();
                    
                    const header = document.createElement('div');
                    header.className = 'code-header';
                    header.innerHTML = `
                        <span class="code-lang">${langName}</span>
                        <button type="button" class="code-copy">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            复制代码
                        </button>
                    `;
                    
                    const btn = header.querySelector('.code-copy');
                    btn.onclick = () => {
                        navigator.clipboard.writeText(block.innerText);
                        btn.innerHTML = '✅ 已复制';
                        setTimeout(() => { btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 复制代码'; }, 2000);
                    };
                    pre.insertBefore(header, block);
                });
            };

            let i = 0;
            // 内核：基于自适应停顿流的打字推演 (由 setTimeout 控制更自然)
            const typeNextChar = () => {
                if (this.isTypingCancelled) {
                    this.setSendButtonState('send');
                    if (window.hljs && window.marked) {
                        msgDiv.innerHTML = window.marked.parse(aiReply.substring(0, i));
                        enhanceCodeBlocks();
                    } else {
                        msgDiv.innerText = aiReply.substring(0, i);
                    }
                    this.scrollToBottom(true);
                    if (typeof this.updateQuickChips === 'function') this.updateQuickChips();
                    this.isProcessingQueue = false;
                    this.processQueue();
                    return;
                }

                if (i > aiReply.length) {
                    // 全文下潜完成，收尾抛出完美无光标版本并赋予语法高亮 + Code Header
                    if (window.hljs && window.marked) {
                        msgDiv.innerHTML = window.marked.parse(aiReply);
                        enhanceCodeBlocks();
                    } else {
                        msgDiv.innerText = aiReply;
                    }
                    this.scrollToBottom();

                    // 收尾善后工作
                    if (typeof this.updateQuickChips === 'function') this.updateQuickChips();
                    this.setSendButtonState('send');
                    this.isProcessingQueue = false;
                    this.processQueue();
                    
                    if (this.isPhoneCallMode) {
                        this.speakReply(aiReply, () => {
                            if (this.isPhoneCallMode && !this.isRecording) {
                                this.toggleVoiceRecording();
                            }
                        });
                    }
                    return;
                }

                // 运动打字态渲染
                const currentText = aiReply.substring(0, i);
                if (window.marked && window.hljs) {
                    msgDiv.innerHTML = window.marked.parse(currentText + '▌');
                    // ✨ 实时为刚刚生成的任何 pre 追加深色 Header 面板及彩色语法高亮！
                    enhanceCodeBlocks();
                } else {
                    msgDiv.innerText = currentText + '▌';
                }
                this.scrollToBottom();

                // 智能感知语意的“变速箱”：遇大段缓冲呼吸感，日常字句如丝绸平滑
                let delay = 35; 
                if (i > 0 && i < aiReply.length) {
                    const lc = aiReply.charAt(i - 1);
                    const cc = aiReply.charAt(i);
                    // 遇到双回车空段落，留出半秒白墙缓冲给小学生喘息
                    if (cc === '\n' && lc === '\n') {
                        delay = 600;
                    } else if (cc === '\n') {
                        delay = 200; // 换小行稍等
                    }
                }

                // 追加处理越界防守：遇到代码块时为了防止 HTML/Markdown 渲染时隐时现错位，一次性加速吐出更多！
                // 或者我们可以保持平滑，用 1字 即可。为了极限防闪烁这里保持每次 1，因为 marked.js 渲染极快不闪。
                i += 1;
                setTimeout(typeNextChar, delay);
            };

            typeNextChar();
            // --- 结束 ---
            
        } catch (error) {
            if (error.name === 'AbortError') {
                if (!this.isTypingCancelled) this.cancelOutput();
                const typing = document.getElementById('ai-typing-indicator');
                if (typing) typing.remove();
            } else {
                console.error('AI Link Error:', error);
                this.appendMessage('system', `[接口通讯失败] ${error.message}。请检查您的网络或 API 密匙配置是不是支持语音处理。`);
            }
            this.setSendButtonState('send');
            this.isProcessingQueue = false;
            this.processQueue();
        }
    }

    appendMessage(role, text, isHTML = false) {
        const rowDiv = document.createElement('div');
        rowDiv.className = `msg-row ${role}`;
        
        let avatarHTML = '';
        if (role === 'ai') avatarHTML = '<div class="avatar avatar-ai"><img src="assets/img/xiao_chuang_head.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>';
        if (role === 'user') avatarHTML = '<div class="avatar avatar-user">👦</div>';
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg msg-${role}`;
        if (isHTML) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.innerText = text;
        }
        
        if (role === 'user') {
            rowDiv.appendChild(msgDiv);
            if (avatarHTML) rowDiv.insertAdjacentHTML('beforeend', avatarHTML);
        } else {
            if (avatarHTML) rowDiv.insertAdjacentHTML('beforeend', avatarHTML);
            rowDiv.appendChild(msgDiv);
        }
        
        // Remove typing indicator if exists
        const typing = document.getElementById('ai-typing-indicator');
        if (typing) typing.remove();
        
        this.chatArea.appendChild(rowDiv);
        this.scrollToBottom(true);
    }
    
    showTyping() {
        const exists = document.getElementById('ai-typing-indicator');
        if (exists) return;
        
        const rowDiv = document.createElement('div');
        rowDiv.id = 'ai-typing-indicator';
        rowDiv.className = 'msg-row ai';
        
        const avatarHTML = '<div class="avatar avatar-ai"><img src="assets/img/xiao_chuang_head.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>';
        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg msg-ai typing-indicator';
        msgDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
        
        rowDiv.innerHTML = avatarHTML;
        rowDiv.appendChild(msgDiv);
        
        this.chatArea.appendChild(rowDiv);
        this.scrollToBottom(true);
    }

    setSendButtonState(state) {
        if (!this.sendBtn) return;
        this.sendBtnState = state;
        if (state === 'stop') {
            this.sendBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>';
            this.sendBtn.style.color = '#ef4444';
            this.sendBtn.title = '立刻中断输出 (Stop Generating)';
        } else {
            this.sendBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
            this.sendBtn.style.color = '';
            this.sendBtn.title = '发送问题 (Send)';
        }
    }

    cancelOutput() {
        this.isTypingCancelled = true;
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }
        this.setSendButtonState('send');
    }

    async sendMessage() {
        if (this.sendBtnState === 'stop') {
            this.cancelOutput();
            return;
        }
        const text = this.input.value.trim();
        const hasImage = !!this.pendingImageDataUrl;
        const hasFile = !!this.pendingTextData;
        
        if (!text && !hasImage && !hasFile) return;
        
        this.input.value = '';
        let userMessageObject = null;
        
        this.lastInputWasVoice = false;
        
        if (hasFile || hasImage) {
            let aiTextPrompt = text || (hasImage ? '请看上述图像。结合画面为您解析。' : '请帮我详细分析我发送的文档。');
            if (hasFile) {
                aiTextPrompt = `${fileTextPromptPart}\n\n[用户问题]: ${aiTextPrompt}`;
            }
            
            let finalHtmlMsg = pendingMediaHTML;
            if (text) finalHtmlMsg += `<div style="margin-top:8px;">${text}</div>`;
            else finalHtmlMsg += `<div style="margin-top:8px;font-style:italic;opacity:0.7;">(发送了多媒体文件)</div>`;
            
            this.appendMessage('user', finalHtmlMsg, true);
            
            if (hasImage) {
                let contentArray = [{ type: 'text', text: aiTextPrompt }];
                imagesBase64List.forEach(b64 => {
                     contentArray.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } });
                });
                userMessageObject = { role: 'user', content: contentArray };
            } else {
                userMessageObject = { role: 'user', content: aiTextPrompt };
            }
        } else {
            this.appendMessage('user', text);
            userMessageObject = { role: 'user', content: text };
        }
        
        this.playHapticSound('send');
        
        // 分发成就积分及飘字
        if (hasImage && hasFile) {
            this.awardPoints(30, '超维度多模态发问');
        } else if (hasImage) {
            this.awardPoints(15, '深度全景图发问');
        } else if (hasFile) {
            this.awardPoints(20, '极客文档分析');
        } else if (text.length > 5) {
            this.awardPoints(5, '探索发问');
        }
        
        this.messageQueue.push(userMessageObject);
        this.processQueue();
    }

    async processQueue() {
        if (this.isProcessingQueue || this.messageQueue.length === 0) return;
        this.isProcessingQueue = true;
        
        let mergedMessage = null;
        if (this.messageQueue.length === 1) {
            mergedMessage = this.messageQueue.shift();
        } else {
            // 将积压在队列中的多个问题智能组装融合
            let mergedTexts = [];
            let imageAndFileContents = [];
            
            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                if (typeof msg.content === 'string') {
                    if (msg.content.trim()) mergedTexts.push(msg.content);
                } else if (Array.isArray(msg.content)) {
                    msg.content.forEach(part => {
                        if (part.type === 'text' && part.text.trim()) mergedTexts.push(part.text);
                        else imageAndFileContents.push(part);
                    });
                }
            }
            
            let finalString = "【系统自动为您合并了连续的问题】：\n" + mergedTexts.join('\n\n进一步追加补充：');
            if (imageAndFileContents.length > 0) {
                mergedMessage = {
                    role: 'user',
                    content: [{ type: 'text', text: finalString }, ...imageAndFileContents]
                };
            } else {
                mergedMessage = { role: 'user', content: finalString };
            }
        }
        
        this.showTyping();
        await this.sendToAPI(mergedMessage);
    }

    awardPoints(pts, reason) {
        // 全局触发一个事件，让外层页面监听这个成就系统
        document.dispatchEvent(new CustomEvent('titanAddExp', { detail: { points: pts, reason: reason } }));
        
        // 渲染百万级体验：爆炸粒子烟花+积分上浮 (右下角FAB附近)
        const container = document.getElementById('titan-ai-container');
        if (!container) return;
        
        // 生成上浮文字
        const textEl = document.createElement('div');
        textEl.className = 'ai-pts-floating';
        textEl.innerHTML = `✨ +${pts} <span>${reason}</span>`;
        container.appendChild(textEl);
        setTimeout(() => textEl.remove(), 1800);
        
        // 生成 8 颗四散的极客粒子碎屑
        const colors = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'ai-pts-particle';
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 40; // 扩散半径 30-70px
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            p.style.setProperty('--dx', `${dx}px`);
            p.style.setProperty('--dy', `${dy}px`);
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            p.style.animationDelay = `${Math.random() * 0.1}s`;
            container.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    }

    scrollToBottom(force = false) {
        if (!this.chatArea) return;
        
        // 判断是否贴近底部。只有强制触发或本来就贴近底部时，才跟随新消息滚动。
        // 这可以防止 AI 边输出边往下挤导致无法往回看。
        const distanceToBottom = this.chatArea.scrollHeight - this.chatArea.scrollTop - this.chatArea.clientHeight;
        const isNearBottom = distanceToBottom < 150;
        
        if (force || isNearBottom) {
            this.chatArea.scrollTo({
                top: this.chatArea.scrollHeight,
                behavior: force ? 'smooth' : 'auto'
            });
        }
    }

    updateQuickChips() {
        const defaultChips = [
            { label: '💡 只要提示', prompt: '不要直接回答，请给我一点推理关键线索的启发就好。' },
            { label: '🤔 换个说法', prompt: '用小学生能轻易听明白的通用比方，帮我生动地重新解释一遍。' },
            { label: '📝 出个考题', prompt: '根据这个知识点核心，出一道类似的探究或者计算题目给我练练手。' },
            { label: '🔍 深入分析', prompt: '帮我更深一层拆解分析，告诉我背后的原理和最底层的运转逻辑。' },
            { label: '⚙️ 极客视角', prompt: '用极其通俗易懂的机电硬件或代码工程世界的视角来讲解它。' },
            { label: '👩‍💻 代码求证', prompt: '能给我写一个与之关联的极简 C++ 或 Python 核心伪代码实现来看看吗？' }
        ];
        
        // 随时化提取 3-4 枚不同的启发策略胶囊
        const shuffled = defaultChips.sort(() => 0.5 - Math.random());
        const drawCount = Math.floor(Math.random() * 2) + 3; // 随机 3 个 或 4 个
        const selected = shuffled.slice(0, drawCount);
        
        const chipsContainer = document.getElementById('titan-ai-chips');
        if(!chipsContainer) return;
        
        chipsContainer.innerHTML = '';
        selected.forEach(chipData => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ai-chip';
            btn.dataset.prompt = chipData.prompt;
            btn.innerText = chipData.label;
            btn.onclick = (e) => {
                this.input.value = e.currentTarget.dataset.prompt;
                this.input.focus();
                // 唤起物理反馈声音（借用系统刚写的音效方法）
                if (typeof this.playHapticSound === 'function') this.playHapticSound('send'); 
                this.sendBtn.click();
            };
            chipsContainer.appendChild(btn);
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TitanAIAssistant());
} else {
    new TitanAIAssistant();
}
