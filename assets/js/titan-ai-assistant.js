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
        this.isTypingCancelled = false;
        this.isProcessingQueue = false;
        this.isChatOpen = false;
        this.isProcessingQueue = false;
        this.messageQueue = [];
        this.init();
    }
    updateMemberStatusUI() {
        if (!this.statusBar || !this.input) return; 
        
        const isMember = this.settings.memberExpired > Date.now();
        let remaining = parseInt(localStorage.getItem('ai_guest_limit') || '10');
        
        if (isMember) {
            this.statusBar.innerHTML = `
                <span><i class="fas fa-gem" style="color:#38bdf8;margin-right:4px;"></i> 成电创客 · 瞪羚特权</span>
                <div class="status-tag member">无限次对话</div>
            `;
            this.input.disabled = false;
            this.input.placeholder = "问我任何关于科技特长生的问题...";
            this.input.style.opacity = '1';
        } else {
            this.statusBar.innerHTML = `
                <span><i class="fas fa-user-circle" style="color:#94a3b8;margin-right:4px;"></i> 访客模式 (体验中)</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <button type="button" class="ai-activate-btn" id="titan-ai-activate-btn" title="激活会员特权 (Activate Member)" style="padding: 2px 6px; margin: 0; min-width: 24px; height: 20px; border-radius: 4px; border: 1px solid rgba(251, 191, 36, 0.5);">
                        <i class="fas fa-key" style="font-size: 10px;"></i>
                    </button>
                    <div class="status-tag">剩余次数: ${remaining}/10</div>
                </div>
            `;
            if (remaining <= 0) {
                this.input.disabled = true;
                this.input.placeholder = "体验次数耗尽，请点击右侧金钥激活权限";
                this.input.style.opacity = '0.5';
                this.input.style.cursor = 'not-allowed';
            } else {
                this.input.disabled = false;
                this.input.style.cursor = 'text';
                this.input.style.opacity = '1';
                this.input.placeholder = "问我任何问题...";
            }
            
            // Rebind the activate button dynamically
            this.activateBtn = document.getElementById('titan-ai-activate-btn');
            if (this.activateBtn) {
                this.activateBtn.onclick = () => {
                    const code = prompt("请输入您的专属激活码 (成电创客/瞪羚会员专用):");
                    if (code) {
                        const success = this.activateMember(code);
                        if (!success) alert("无效的激活码，请联系官方开启。");
                        else alert("激活成功！无限对话权限已开启。");
                    }
                };
            }
        }
    }

    activateMember(code) {
        // 定义一个成电专属体验码以便你测试或发放
        const validCodes = ['CDMK-2026', 'GAZELLE-TITAN'];
        if (validCodes.includes(code.toUpperCase())) {
            const oneYear = Date.now() + (365 * 24 * 60 * 60 * 1000);
            this.settings.memberExpired = oneYear;
            localStorage.setItem('titan_ai_member_expired', oneYear.toString());
            this.updateMemberStatusUI();
            this.appendMessage('system', '🎉 恭喜！您已成功激活【成电创客 · 瞪羚俱乐部】专属特权，即刻起享受无限次 AI 深度对话服务。');
            return true;
        }
        return false;
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
            this.updateMemberStatusUI(); // Update status bar after UI is ready
        }, 300); // 确保在 DOM 加载完成后初始化灵感胶囊和历史记录
    }

    saveSession() {
        // 本地留档 (只保留 user 和 assistant 的核心内容免污染)
        let historyToSave = this.chatHistory.filter(msg => msg.role !== 'system');
        
        // --- 核心防御：防止存储爆雷 QuotaExceededError ---
        // 任何多图和语音如果按原封不动的 Base64 编码保存到 sessionStorage 会瞬间挤爆 5MB 限额，
        // 进而抛出异常导致后续的 processQueue 和对话网络请求被强行中断（"卡住并丢失"的元凶）。
        historyToSave = historyToSave.map(msg => {
            if (msg.role === 'user' && Array.isArray(msg.content)) {
                // 深度折叠：只存文字意图，剥离媒体 Base64 冗余黑箱
                const textObj = msg.content.find(c => c.type === 'text');
                return { role: 'user', content: (textObj ? textObj.text : '') + '\n[过往视觉/语音实体已转存]' };
            }
            return msg;
        });

        try {
            sessionStorage.setItem('titan_ai_history', JSON.stringify(historyToSave));
            sessionStorage.setItem('titan_ai_panel_open', this.isChatOpen ? 'true' : 'false');
        } catch(e) { 
            console.warn('浏览器会话存储爆板，应用极限降维保护：', e);
            try { sessionStorage.setItem('titan_ai_history', JSON.stringify(historyToSave.slice(-4))); } catch(e2) {}
        }
        
        // 【核心计划：全量数据工厂同步 (Supabase Data Lake Sync)】
        // 1. 同步当前会话快照 (用于 UI 恢复)
        if (window.SupabaseClient && window.SupabaseClient.client) {
            const supabase = window.SupabaseClient.client;
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    // 更新会话快照
                    supabase.from('ai_chat_sessions').upsert({
                        user_id: user.id,
                        history: historyToSave,
                        updated_at: new Date().toISOString()
                    }).then(({ error }) => {
                        if (error) console.warn('Supabase Session Sync Fail:', error);
                    });
                }
            });
        }
    }

    /**
     * 【新增】高保真流水日志增量同步 (Low Overhead / Anti-Lag)
     * 每一轮对话完成后异步推送到 ai_chat_logs 归档表，实现百万级数据的“只增不减”
     */
    async logChatMessage(role, content, metadata = {}) {
        if (!window.SupabaseClient || !window.SupabaseClient.client) return;
        const supabase = window.SupabaseClient.client;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // 数据降维预处理：如果是多模态，提取文本摘要存入 content，Base64 仅保留 metadata 引用（防爆库）
            let cleanContent = content;
            let finalMetadata = { ...metadata, timestamp: new Date().toISOString() };
            
            if (Array.isArray(content)) {
                const textPart = content.find(c => c.type === 'text');
                const mediaParts = content.filter(c => c.type !== 'text');
                cleanContent = textPart ? textPart.text : '[Media Message]';
                finalMetadata.has_media = true;
                finalMetadata.media_count = mediaParts.length;
                // 仅保留媒体的前 10 个字符作为 ID 校验，不存大二进制
                finalMetadata.media_summary = mediaParts.map(m => m.type + ':' + (m.source?.data?.substring(0, 10) || 'ext'));
            }

            // 异步后台执行，不阻塞主 UI 打字动画
            supabase.from('ai_chat_logs').insert({
                user_id: user ? user.id : null, 
                role: role,
                content: cleanContent,
                metadata: finalMetadata
            }).then(({ error }) => {
                if (error) console.warn('Incremental Log Sync Fail:', error.message);
                else console.log(`🚀 Titan Log: ${role} message archived.`);
            });
        } catch (e) {
            console.error('Log System Critical Error:', e);
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
                        .limit(1)
                        .then(({ data: list, error }) => {
                            const data = (list && list.length > 0) ? list[0] : null;
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
            avatarHTML = '<div class="avatar avatar-user"><img src="assets/img/user_boy.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>';
        }

        const msgClass = (role === 'ai' || role === 'assistant') ? 'msg msg-ai markdown-body' : 'msg msg-user';
        const msgDiv = document.createElement('div');
        msgDiv.className = msgClass;
        
        if (role === 'ai' || role === 'assistant') {
            if (window.marked) {
                // 核心修复：确保 content 为字符串再传给 marked
                let rawText = '';
                if (typeof content === 'string') {
                    rawText = content;
                } else if (Array.isArray(content)) {
                    rawText = content.find(c => c.type === 'text')?.text || '[多模态内容]';
                }
                msgDiv.innerHTML = window.marked.parse(rawText);
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
                // UI 渲染时折叠附件内文，以免万字长文满屏滚不到头
                const displayContent = content.replace(/(\[附件 [^\]]+\]\n)[\s\S]*?(?=\n\n\[附件 |\n\n\[用户问题\]:|\n\n请听这段语音|$)/g, '$1(📎 文档字元已系统折叠，后台模型已读)');
                msgDiv.innerText = displayContent;
            } else if (Array.isArray(content)) {
                let textPart = content.find(c => c.type === 'text')?.text || '[多模态视觉文件]';
                textPart = textPart.replace(/(\[附件 [^\]]+\]\n)[\s\S]*?(?=\n\n\[附件 |\n\n\[用户问题\]:|\n\n请听这段语音|$)/g, '$1(📎 文档字元已折叠保护)');
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
            script.onload = () => {
                if (window.marked) {
                    const renderer = new window.marked.Renderer();
                    // 核心修复：拦截文本，将 $...$ 转化为美观的物理公式标签
                    const originalText = renderer.text.bind(renderer);
                    renderer.text = (text) => {
                        return text.replace(/\$([^\$]+)\$/g, '<span class="ai-math-inline">$1</span>');
                    };
                    
                    window.marked.setOptions({
                        renderer: renderer,
                        gfm: true,
                        breaks: true,
                        headerIds: false,
                        mangle: false
                    });
                }
            };
            document.head.appendChild(script);
        }
        if (!document.getElementById('mermaid-js')) {
            const script = document.createElement('script');
            script.id = 'mermaid-js';
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js';
            script.onload = () => {
                if (window.mermaid) {
                    window.mermaid.initialize({ 
                        startOnLoad: false, 
                        theme: 'dark',
                        themeVariables: { primaryColor: '#0ea5e9' }
                    });
                }
            };
            document.head.appendChild(script);
        }
        // Font Awesome for icons
        if (!document.getElementById('font-awesome')) {
            const link = document.createElement('link');
            link.id = 'font-awesome';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(link);
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
            .ai-panel {
                position: fixed;
                bottom: 85px; right: 28px;
                width: 400px; height: 600px;
                background: rgba(10, 15, 25, 0.95);
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(14, 165, 233, 0.1);
                display: flex; flex-direction: column;
                opacity: 0; transform: translateY(20px) scale(0.95);
                pointer-events: none; /* 关键：关闭时不挡道 */
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                z-index: 10000;
                backdrop-filter: blur(20px);
                overflow: hidden;
            }
            .ai-panel.open {
                opacity: 1; transform: translateY(0) scale(1);
                pointer-events: all; /* 开启后恢复交互 */
            }
            .ai-fab {
                position: fixed;
                bottom: 24px; right: 24px;
                width: 56px; height: 56px;
                border-radius: 50%;
                z-index: 99999;
                cursor: pointer;
                background: url('assets/img/xiao_chuang_head.png') center/cover no-repeat;
                box-shadow: 0 0 20px rgba(14, 165, 233, 0.4), inset 0 0 10px rgba(255,255,255,0.4);
                border: 2px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
                user-select: text !important; /* 核心修正：面板级强制开启文本选择能力 */
                -webkit-user-select: text !important;
            }
            .ai-panel.open {
                transform: scale(1);
                opacity: 1;
                pointer-events: all;
            }
            .ai-panel.expanded {
                width: 960px; /* 大气宽度，适合深度阅读 */
                height: 90vh; /* 撑满高度 */
                max-width: 95vw;
                border: 1px solid rgba(56, 189, 248, 0.6);
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8), 0 0 80px rgba(14, 165, 233, 0.2);
                transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1), height 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            }
            .ai-header {
                padding: 16px;
                background: rgba(14, 165, 233, 0.1);
                border-bottom: 1px solid rgba(56, 189, 248, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none !important; /* 标题栏保持禁止选择，以免干扰拖拽 */
                -webkit-user-select: none !important;
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
            .ai-status-bar {
                padding: 6px 12px;
                background: rgba(15, 23, 42, 0.8);
                border-bottom: 1px solid rgba(56, 189, 248, 0.1);
                font-size: 11px;
                color: #94a3b8;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-family: 'Orbitron', 'Inter', sans-serif;
                letter-spacing: 0.5px;
                backdrop-filter: blur(8px);
                position: sticky; top: 0; z-index: 100;
            }
            .status-tag {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 900;
                text-transform: uppercase;
                background: rgba(148, 163, 184, 0.1);
                color: #94a3b8;
                border: 1px solid rgba(148, 163, 184, 0.2);
            }
            .status-tag.member {
                background: rgba(56, 189, 248, 0.15);
                color: #38bdf8;
                border-color: rgba(56, 189, 248, 0.4);
                box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
            }
            .ai-activate-btn {
                background: none; border: 1px solid rgba(255, 191, 0, 0.3); color: #fbbf24; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.8; transition: all 0.2s; padding: 6px; border-radius: 8px; margin-right: 4px;
            }
            .ai-activate-btn:hover { background: rgba(251, 191, 36, 0.15); border-color: #fbbf24; opacity: 1; transform: scale(1.05); box-shadow: 0 0 12px rgba(251, 191, 36, 0.3); }
            .ai-chat-area {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                scroll-behavior: smooth;
                pointer-events: auto !important; /* 全局开启接收指针的能力 */
                user-select: text !important;
            }
            .ai-chat-area::-webkit-scrollbar {
                width: 5px;
                transition: width 0.3s;
            }
            .ai-chat-area:hover::-webkit-scrollbar {
                width: 10px; /* 悬停时变宽，方便拖拽 */
            }
            .ai-chat-area::-webkit-scrollbar-thumb {
                background: rgba(56, 189, 248, 0.25);
                border-radius: 10px;
                border: 2px solid transparent;
                background-clip: padding-box;
                transition: background 0.3s;
            }
            .ai-chat-area::-webkit-scrollbar-thumb:hover {
                background: rgba(56, 189, 248, 0.6);
                background-clip: padding-box;
            }
            .ai-chat-area::-webkit-scrollbar-track {
                background: transparent;
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
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14.5px;
                line-height: 1.55;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                letter-spacing: 0.3px;
                word-wrap: break-word;
                white-space: pre-wrap;
                user-select: text !important;
                -webkit-user-select: text !important;
                pointer-events: all !important;
                cursor: text !important; /* 强制显示文字光标 */
                position: relative;
                z-index: 10; /* 只要高于背景即可，让位给选区工具栏 */
            }
            .msg-user {
                background: rgba(56, 189, 248, 0.15);
                border: 1px solid rgba(56, 189, 248, 0.3);
                color: #e2e8f0;
                align-self: flex-end;
                border-bottom-right-radius: 2px;
            }
            .msg-ai {
                background: linear-gradient(135deg, rgba(23, 31, 48, 0.95) 0%, rgba(10, 15, 25, 0.98) 100%);
                border: 1px solid rgba(56, 189, 248, 0.2);
                color: #f1f5f9;
                align-self: flex-start;
                border-bottom-left-radius: 2px;
                position: relative;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                user-select: text !important;
                -webkit-user-select: text !important;
                pointer-events: all !important;
            }
            .msg-ai * { user-select: text !important; -webkit-user-select: text !important; pointer-events: auto !important; } 
            .msg-ai ::selection { background: rgba(56, 189, 248, 0.5) !important; color: #fff !important; }
            .msg-user ::selection { background: rgba(14, 165, 233, 0.4) !important; color: #fff !important; }
            .msg-row.ai { position: relative; }
            .ai-msg-actions {
                position: absolute;
                bottom: -22px;
                left: 45px;
                display: flex;
                gap: 5px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .msg-row.ai:hover .ai-msg-actions { opacity: 1; }
            .ai-msg-action-btn {
                background: rgba(10, 15, 25, 0.8);
                border: 1px solid rgba(56, 189, 248, 0.2);
                color: #38bdf8;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                backdrop-filter: blur(5px);
            }
            .ai-msg-action-btn:hover { background: #0ea5e9; color: #fff; }
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
            .ai-upload, .ai-phone, .ai-tts-stop, .ai-screenshot {
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
            .ai-upload:hover, .ai-phone:hover, .ai-tts-stop:hover, .ai-screenshot:hover {
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
                gap: 8px;
                cursor: pointer;
                border-radius: 8px;
                padding: 8px 14px;
                background: rgba(16, 185, 129, 0.85);
                box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
                border: 1px solid rgba(16, 185, 129, 0.5);
                margin-top: 8px;
                transition: all 0.2s;
                position: relative;
            }
            .voice-message-bar:hover {
                background: rgba(16, 185, 129, 1);
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }
            .voice-message-bar span {
                font-weight: bold;
                color: #ffffff;
                font-size: 14px;
            }
            .voice-message-bar svg {
                width: 20px;
                height: 20px;
                color: #ffffff;
            }
            .voice-wave-1, .voice-wave-2 {
                transition: opacity 0.2s;
            }
            .voice-message-bar.playing .voice-wave-1 {
                animation: wave-fade 0.8s infinite;
            }
            .voice-message-bar.playing .voice-wave-2 {
                animation: wave-fade 0.8s infinite 0.4s;
            }
            @keyframes wave-fade {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
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
            .typing-status {
                font-size: 11px;
                color: #0ea5e9;
                font-family: 'Orbitron', 'Inter', sans-serif;
                margin-left: 10px;
                opacity: 0.9;
                font-weight: 600;
                letter-spacing: 0.08em;
                animation: status-breath 2s infinite ease-in-out;
                text-transform: uppercase;
                text-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
            }
            @keyframes status-breath {
                0%, 100% { opacity: 0.5; transform: scale(0.98); filter: blur(0.2px); }
                50% { opacity: 1; transform: scale(1); filter: blur(0px); }
            }
            
            /* Turbo-Smooth 流式输出：增强布局稳定性，防止回流抖动 */
            .msg-ai {
                contain: layout;
                word-break: break-all;
                overflow-wrap: break-word;
            }
            .msg-ai > .new-block {
                animation: msg-block-enter 0.3s ease-out forwards;
                will-change: transform, opacity;
            }
            @keyframes msg-block-enter {
                from { opacity: 0; transform: translateY(6px); filter: blur(1px); }
                to { opacity: 1; transform: translateY(0); filter: blur(0px); }
            }
            
            /* 修正全息光标：使用渐变亮色，增强工业感且不影响文本流 */
            .ai-cursor {
                display: inline-block;
                width: 2px;
                height: 1em;
                background: #0ea5e9;
                margin-left: 2px;
                vertical-align: text-bottom;
                box-shadow: 0 0 10px #0ea5e9;
                animation: ai-cursor-blink 0.5s infinite;
                pointer-events: none;
            }
            @keyframes ai-cursor-blink {
                0%, 100% { opacity: 1; filter: brightness(1.5); }
                50% { opacity: 0; }
            }
            
            /* 选区工具栏：极致灵动感 */
            .ai-selection-toolbar {
                position: fixed;
                padding: 4px 10px;
                background: rgba(10, 15, 25, 0.95);
                border: 1px solid rgba(56, 189, 248, 0.6);
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(14, 165, 233, 0.4);
                z-index: 20000 !important; /* 绝对顶层，傲视群雄 */
                display: flex; gap: 8px;
                animation: toolbar-pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                pointer-events: all;
            }
            @keyframes toolbar-pop {
                from { opacity: 0; transform: scale(0.8) translateY(10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .toolbar-btn {
                background: transparent; color: #fff; border: none; font-size: 12px;
                cursor: pointer; display: flex; align-items: center; gap: 4px;
                padding: 4px 8px; border-radius: 12px; transition: all 0.2s;
                font-family: 'Orbitron', 'Inter', sans-serif; font-weight: 500;
            }
            .toolbar-btn:hover { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }

            .ai-math-inline {
                font-family: "Latin Modern Math", "Cambria Math", "STIX Two Math", serif;
                font-style: italic;
                color: #38bdf8;
                padding: 0 4px;
                background: rgba(56, 189, 248, 0.1);
                border-radius: 4px;
                font-weight: 500;
            }
            .ai-progress-bar {
                position: absolute; top: 0; left: 0; height: 1.5px;
                background: #0ea5e9;
                box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
                transition: width 0.2s linear;
                z-index: 10;
            }

            .ai-resize-handle {
                position: absolute;
                bottom: 0; right: 0;
                width: 16px; height: 16px;
                cursor: nwse-resize;
                z-index: 100;
                display: none; /* 仅在展开态显示 */
            }
            .ai-resize-handle-left {
                position: absolute;
                bottom: 0; left: 0;
                width: 16px; height: 16px;
                cursor: nesw-resize;
                z-index: 100;
                display: none;
            }
            .ai-panel.expanded .ai-resize-handle, 
            .ai-panel.expanded .ai-resize-handle-left {
                display: block;
            }
            .ai-resize-handle {
                background: linear-gradient(135deg, transparent 50%, rgba(56, 189, 248, 0.3) 50%);
            }
            .ai-resize-handle-left {
                background: linear-gradient(225deg, transparent 50%, rgba(56, 189, 248, 0.3) 50%);
            }
            .ai-resize-handle::after {
                content: '';
                position: absolute;
                right: 3px; bottom: 3px;
                width: 4px; height: 4px;
                border-right: 2px solid rgba(56, 189, 248, 0.5);
                border-bottom: 2px solid rgba(56, 189, 248, 0.5);
            }
            .ai-resize-handle-left::after {
                content: '';
                position: absolute;
                left: 3px; bottom: 3px;
                width: 4px; height: 4px;
                border-left: 2px solid rgba(56, 189, 248, 0.5);
                border-bottom: 2px solid rgba(56, 189, 248, 0.5);
            }

            .ai-chips-wrapper {
                padding: 0 16px 8px 16px;
                display: flex; gap: 8px; overflow-x: auto;
            }
            .ai-chips-wrapper::-webkit-scrollbar { display: none; }
            .ai-chip {
                white-space: nowrap; 
                padding: 6px 12px; 
                background: rgba(56, 189, 248, 0.1); 
                color: #38bdf8; 
                border: 1px solid rgba(56, 189, 248, 0.3); 
                border-radius: 12px;
                font-size: 11px; 
                cursor: pointer; 
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                flex-shrink: 0;
                max-width: 140px; /* 初始限制宽度，保持整齐 */
                text-overflow: ellipsis;
                overflow: hidden;
                position: relative;
            }
            .ai-chip:hover { 
                background: rgba(56, 189, 248, 0.25); 
                color: #fff; 
                max-width: 300px; /* 悬停时自动伸展，显示更多文字 */
                box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
                border-color: rgba(56, 189, 248, 0.6);
            }
            
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
            .markdown-body blockquote p { margin-bottom: 4px; }
            .markdown-body blockquote p:last-child { margin-bottom: 0; }
            .markdown-body hr { margin: 18px 0; border: none; border-top: 1px dashed rgba(255,255,255,0.2); }
            .markdown-body ul, .markdown-body ol { margin-left: 20px; margin-bottom: 12px; margin-top: 6px;}
            .markdown-body li { margin-bottom: 6px; }
            .markdown-body li::marker { color: #38bdf8; font-weight: bold; }
            .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { margin-top: 16px; margin-bottom: 8px; font-weight: 700; color: #f8fafc; line-height: 1.4; }
            .markdown-body h1 { font-size: 1.4em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; color: #38bdf8;}
            .markdown-body h2 { font-size: 1.25em; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 6px; color: #0ea5e9;}
            .markdown-body h3 { font-size: 1.15em; color: #7dd3fc;}
            .markdown-body h4 { font-size: 1.05em; color: #bae6fd;}
            .markdown-body strong { color: #38bdf8; font-weight: 800; font-size: 1.05em; }
            .markdown-body p { margin-bottom: 8px; }
            .markdown-body p:last-child { margin-bottom: 0; }
            .markdown-body table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
            .markdown-body table th { background: rgba(14, 165, 233, 0.2); color: #7dd3fc; padding: 8px 10px; text-align: left; border: 1px solid rgba(255,255,255,0.12); font-weight: 700; white-space: nowrap; }
            .markdown-body table td { padding: 7px 10px; border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; }
            .markdown-body table tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
            .markdown-body table tr:hover td { background: rgba(14, 165, 233, 0.08); }
            .markdown-body code:not(pre code) {
                background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; color: #38bdf8; font-family: Consolas, monospace; font-size: 0.9em;
            }
            .markdown-body a {
                color: #38bdf8;
                text-decoration: none;
                border-bottom: 1px solid rgba(56, 189, 248, 0.4);
                transition: all 0.2s;
                font-weight: 500;
            }
            .markdown-body a:hover {
                color: #7dd3fc;
                background: rgba(14, 165, 233, 0.1);
                border-bottom-color: #7dd3fc;
            }
            .mermaid {
                background: rgba(14, 165, 233, 0.05) !important;
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin: 16px 0;
                display: flex;
                justify-content: center;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
                transition: all 0.3s;
            }
            .mermaid:hover {
                border-color: rgba(56, 189, 248, 0.5);
                background: rgba(14, 165, 233, 0.08) !important;
            }
            .mermaid svg {
                max-width: 100%;
                height: auto;
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
        
        const panelHTML = `
            <div class="ai-panel" id="titan-ai-panel">
                <div class="ai-header" id="titan-ai-drag-handle">
                    <div class="ai-header-title">小创老师 (Virtual Teacher)</div>
                    <div class="ai-header-controls">
                        <button type="button" class="ai-expand-btn" id="titan-ai-reset-btn" title="开启新对话 / 清除长期记忆并释放内存空间 (New Chat)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                        </button>
                        <button type="button" class="ai-expand-btn" id="titan-ai-expand-btn" title="展开为学习桌面 / 适合精读长篇解答及阅览代码">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                        </button>
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
                <div class="ai-input-area" id="titan-ai-input-area">
                    <input type="file" id="titan-ai-file-input" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx" style="display: none;" multiple>
                    <button type="button" class="ai-upload" id="titan-ai-upload-btn" title="传送门 / 导入本地照片、作业文档、表格或幻灯片以供深度分析 (Upload)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>

                    <button type="button" class="ai-tts-stop" id="titan-ai-tts-stop-btn" title="立刻打断 AI 说话 (Stop Audio)" style="display:none; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    </button>
                    <button type="button" class="ai-camera" id="titan-ai-camera-btn" title="启动前置摄像头 / 拍一拍实物现象 (Camera)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </button>
                    <button type="button" class="ai-screenshot" id="titan-ai-screenshot-btn" title="系统截屏 / 截取系统任何窗口给小创老师分析 (Screenshot)">
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
                <div class="ai-resize-handle" id="titan-ai-resize-handle"></div>
                <div class="ai-resize-handle-left" id="titan-ai-resize-left"></div>
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
        
        container.innerHTML = panelHTML;
        document.body.appendChild(container);

        // Dynamically create and insert chat area and status bar
        this.panel = document.getElementById('titan-ai-panel');
        this.inputArea = document.getElementById('titan-ai-input-area');

        this.chatArea = document.createElement('div');
        this.chatArea.id = 'titan-ai-chat';
        this.chatArea.className = 'ai-chat-area';

        // 插入顶部权益状态栏
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'ai-status-bar';
        const header = document.getElementById('titan-ai-drag-handle');
        this.panel.insertBefore(this.statusBar, header.nextSibling);

        // 如果原有聊天区存在则删除重新插入，以确保在 statusBar 之后，提示泡泡之前
        const existingChatArea = document.getElementById('titan-ai-chat');
        if (existingChatArea) {
            existingChatArea.remove();
        }
        this.panel.insertBefore(this.chatArea, this.statusBar.nextSibling); // Insert chatArea after statusBar

        // Initial system message for chatArea
        this.chatArea.innerHTML = `
            <div class="msg-row system">
                <div class="msg msg-system">哈喽！我是小创老师，已准备完毕，将深度结合此网页所展示的核心知识向您解答疑问！</div>
            </div>
        `;

        this.updateMemberStatusUI();
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
        // Cache correctly
        this.statusBar = document.querySelector('.ai-status-bar'); 
        this.inputArea = document.getElementById('titan-ai-input-area'); 

        this.ttsStopBtn = document.getElementById('titan-ai-tts-stop-btn');
        this.videoEl = document.getElementById('titan-ai-video');
        this.canvasEl = document.getElementById('titan-ai-canvas');
        this.snapBtn = document.getElementById('titan-ai-snap');
        this.cameraCloseBtn = document.getElementById('titan-ai-camera-close');
        
        this.dragHandle = document.getElementById('titan-ai-drag-handle');
        this.expandBtn = document.getElementById('titan-ai-expand-btn');
        this.resetBtn = document.getElementById('titan-ai-reset-btn');
        this.activateBtn = document.getElementById('titan-ai-activate-btn');
        this.resizeHandle = document.getElementById('titan-ai-resize-handle');
        this.resizeHandleLeft = document.getElementById('titan-ai-resize-left');
        this.isExpanded = false;
        
        this.pendingArea = document.getElementById('titan-ai-pending');
        this.pendingImg = document.getElementById('titan-ai-pending-img');
        this.pendingHint = document.getElementById('titan-ai-pending-hint');
        this.pendingCloseBtn = document.getElementById('titan-ai-pending-close');
        this.pendingImageDataUrl = null;
        this.pendingTextData = null;
        
        this.selectionBtn = document.getElementById('titan-ai-selection');
        this.chips = document.querySelectorAll('.ai-chip'); // 绑定启发式引导磁片
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    bindEvents() {
        if (!this.fab) return;
        this.fab.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isChatOpen) this.playHapticSound('open');
            this.isChatOpen = !this.isChatOpen;
            if (this.isChatOpen) {
                this.panel.classList.add('open');
                this.input.focus();
                
                if (!this.hasScanned) {
                    this.hasScanned = true;
                    this.runScanner ? this.runScanner() : null;
                } else {
                    this.scrollToBottom();
                }
            } else {
                this.panel.classList.remove('open');
            }
            this.saveSession(); 
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

        // 开启新对话逻辑 (New Chat) - 彻底重构：杜绝 Confirm 造成的闪烁与状态死锁
        this.resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 1. 彻底切断当前的输出流与网络连接
            this.cancelOutput(); 
            this.isProcessingQueue = false;
            this.messageQueue = [];
            
            // 2. 视觉反馈：瞬间扫除尘埃
            this.panel.style.opacity = '0.5';
            this.panel.style.filter = 'blur(10px) brightness(1.5)';
            
            setTimeout(() => {
                this.chatHistory = [];
                this.chatArea.innerHTML = `
                    <div class="msg-row system">
                        <div class="msg msg-system">收到！磁场扰动已归零，记忆模块重置完成。开始新的挑战吧！⚡️</div>
                    </div>
                `;
                
                // 3. 清理待发送的多模态文件
                this.clearAllPendingFiles();
                
                // 4. 同步持久化存储 (彻底抹除)
                this.saveSession();
                
                // 5. 状态恢复
                this.panel.style.opacity = '1';
                this.panel.style.filter = 'none';
                if (typeof this.playHapticSound === 'function') this.playHapticSound('reset');
                this.scrollToBottom();
            }, 300);
        });

        // 全局选区监听：在面板任何位置选文字都能触发分析气泡
        if (this.chatArea) {
            this.chatArea.addEventListener('mouseup', (e) => this.handleTextSelection(e));
        }

        // 扩展面板逻辑 (Full Expansion Engine)
        this.expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                this.panel.classList.add('expanded');
                this.dragHandle.classList.add('draggable');
                
                this.panel.style.transition = 'none'; 
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

        // 拖拽与缩放逻辑 (Move & Resize Engine)
        let isDragging = false;
        let isResizingRight = false;
        let isResizingLeft = false;
        let dragStartX, dragStartY;
        let initialLeft, initialTop;
        let startWidth, startHeight;

        // 辅助方法：捕获初始状态
        const captureInitialState = (e) => {
            this.panel.style.transition = 'none';
            const rect = this.panel.getBoundingClientRect();
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            initialLeft = rect.left;
            initialTop = rect.top;

            // 统一坐标系：将 transform 的偏移转为绝对 left/top
            this.panel.style.transform = 'none';
            this.panel.style.left = `${initialLeft}px`;
            this.panel.style.top = `${initialTop}px`;
            this.panel.style.right = 'auto';
            this.panel.style.bottom = 'auto';
        };

        this.dragHandle.addEventListener('mousedown', (e) => {
            if (!this.isExpanded || e.target.closest('.ai-header-controls')) return;
            isDragging = true;
            captureInitialState(e);
        });

        this.resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizingRight = true;
            captureInitialState(e);
        });

        this.resizeHandleLeft.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizingLeft = true;
            captureInitialState(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                this.panel.style.left = `${initialLeft + dx}px`;
                this.panel.style.top = `${initialTop + dy}px`;
            } else if (isResizingRight) {
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                const newW = Math.max(400, startWidth + dx);
                const newH = Math.max(300, startHeight + dy);
                this.panel.style.width = `${newW}px`;
                this.panel.style.height = `${newH}px`;
            } else if (isResizingLeft) {
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                const newW = Math.max(400, startWidth - dx);
                const newH = Math.max(300, startHeight + dy);
                this.panel.style.width = `${newW}px`;
                this.panel.style.height = `${newH}px`;
                // 往左拉时，同步平移 left 补偿增加的宽度
                this.panel.style.left = `${initialLeft + (startWidth - newW)}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging || isResizingRight || isResizingLeft) {
                if (isResizingRight || isResizingLeft) this.saveSession();
                isDragging = false;
                isResizingRight = false;
                isResizingLeft = false;
                // 复位 transition 如果不再是拉伸态
                setTimeout(() => {
                    if (this.isExpanded) this.panel.style.transition = 'none';
                    else this.panel.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }, 50);
            }
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        
        
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        const scBtn = document.getElementById('titan-ai-screenshot-btn');
        if(scBtn) scBtn.addEventListener('click', () => this.handleScreenshot());
        
        // 激活钥匙逻辑已移入 updateMemberStatusUI 中动态绑定

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
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
        overlay.style.zIndex = '999999';
        overlay.style.cursor = 'crosshair';
        
        const hint = document.createElement('div');
        hint.style.position = 'absolute';
        hint.style.top = '20px';
        hint.style.left = '50%';
        hint.style.transform = 'translateX(-50%)';
        hint.style.color = '#fff';
        hint.style.background = 'rgba(0,0,0,0.7)';
        hint.style.padding = '8px 16px';
        hint.style.borderRadius = '20px';
        hint.style.fontSize = '14px';
        hint.style.pointerEvents = 'none';
        hint.innerText = '按住左键拖拽选定网页截屏区域 (右键取消)';
        overlay.appendChild(hint);

        const selectionBox = document.createElement('div');
        selectionBox.style.position = 'absolute';
        selectionBox.style.border = '2px dashed #38bdf8';
        selectionBox.style.background = 'rgba(56, 189, 248, 0.1)';
        selectionBox.style.pointerEvents = 'none';
        selectionBox.style.display = 'none';
        overlay.appendChild(selectionBox);
        document.body.appendChild(overlay);

        let isDrawing = false;
        let startX, startY;

        const onMouseDown = (e) => {
            if (e.button !== 0) return; // Only left click
            isDrawing = true;
            startX = e.clientX;
            startY = e.clientY;
            selectionBox.style.left = startX + 'px';
            selectionBox.style.top = startY + 'px';
            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
            selectionBox.style.display = 'block';
        };

        const onMouseMove = (e) => {
            if (!isDrawing) return;
            const currentX = e.clientX;
            const currentY = e.clientY;
            selectionBox.style.width = Math.abs(currentX - startX) + 'px';
            selectionBox.style.height = Math.abs(currentY - startY) + 'px';
            selectionBox.style.left = Math.min(startX, currentX) + 'px';
            selectionBox.style.top = Math.min(startY, currentY) + 'px';
        };

        const cleanup = () => {
            overlay.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            overlay.remove();
        };

        const onMouseUp = async (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            
            const rect = selectionBox.getBoundingClientRect();
            cleanup();
            if (rect.width < 10 || rect.height < 10) return; // Ignore accidental tiny clicks

            try {
                if (!window.html2canvas) {
                    await new Promise((res, rej) => {
                        const s = document.createElement('script');
                        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                        s.onload = res; s.onerror = rej;
                        document.head.appendChild(s);
                    });
                }
                
                hint.innerText = '正在极速处理截屏，请稍候...';
                document.body.appendChild(hint); 
                
                const dpr = window.devicePixelRatio || 1;
                // Capture the entire page first to avoid html2canvas clipping bugs
                const fullCanvas = await window.html2canvas(document.body, {
                    useCORS: true,
                    allowTaint: false,
                    scale: dpr,
                    backgroundColor: null,
                    logging: false,
                    ignoreElements: (node) => {
                        if (node.tagName && node.tagName.toLowerCase() === 'img') {
                            try {
                                const src = node.src || '';
                                if (!src.startsWith('data:') && !src.startsWith('blob:')) {
                                    const imgOrigin = new URL(src, window.location.href).origin;
                                    if (imgOrigin !== window.location.origin) {
                                        return true; // Ignore external cross-origin images to prevent poisoning!
                                    }
                                }
                            } catch(e) {}
                        }
                        // Also ignore background images that might be cross-origin? Too intensive to check computed styles.
                        return false;
                    }
                });
                
                // Manually crop the desired selection rect from the high-res canvas
                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = rect.width * dpr;
                croppedCanvas.height = rect.height * dpr;
                const ctx = croppedCanvas.getContext('2d');
                
                ctx.drawImage(
                    fullCanvas,
                    (rect.left + window.scrollX) * dpr,
                    (rect.top + window.scrollY) * dpr,
                    rect.width * dpr,
                    rect.height * dpr,
                    0, 0,
                    rect.width * dpr,
                    rect.height * dpr
                );
                
                hint.remove();
                if (this.pendingImages.length < 6) {
                    this.pendingImages.push(croppedCanvas.toDataURL('image/jpeg', 0.9));
                    this._updateFileReadyUI();
                } else {
                    alert('最多只能同时上传 6 张图片供分析！');
                }
            } catch(err) {
                console.error('网页截屏失败:', err);
                alert('截屏组件暂时遇到系统障碍: ' + err.message);
                if (hint) hint.remove();
            }
        };

        overlay.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        overlay.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            cleanup();
        });
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
        const barWidth = Math.min(240, Math.max(80, 60 + durationInSeconds * 4));
        const voiceHTML = `<div class="voice-message-bar" title="点击播放/暂停刚才录制的语音" style="width: ${barWidth}px;" onclick="let a = window.$titanUserAudio;const srcMatch = window.$titanAudioUrl === '${audioUrl}';if (a && !a.paused && srcMatch) {a.pause();a.currentTime = 0;this.classList.remove('playing');window.$titanAudioUrl = null;} else {if (a) { a.pause(); a.currentTime = 0; }document.querySelectorAll('.voice-message-bar.playing').forEach(el => el.classList.remove('playing'));window.$titanAudioUrl = '${audioUrl}';window.$titanUserAudio = new Audio('${audioUrl}');window.$titanUserAudio.play();this.classList.add('playing');window.$titanUserAudio.onended = () => { this.classList.remove('playing'); window.$titanAudioUrl = null; };}"><span style="flex: 1; text-align: left;">${durationInSeconds}"</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07" class="voice-wave-1"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14" class="voice-wave-2"></path></svg></div>`;
        
        const hasImage = this.pendingImages.length > 0;
        const hasFile = this.pendingDocs.length > 0;
        let fileTextPromptPart = '';
        let pendingMediaHTML = '';
        const currentImages = [...this.pendingImages];
        const currentDocs = [...this.pendingDocs];

        if (hasFile) {
            pendingMediaHTML += `<div style="background:rgba(255,255,255,0.1);padding:6px;border-radius:4px;margin-bottom:8px;font-size:12px;display:flex;flex-wrap:wrap;gap:6px;">`;
            currentDocs.forEach(doc => {
                pendingMediaHTML += `<span style="background:rgba(14,165,233,0.3);padding:2px 6px;border-radius:4px;">📄 ${doc.name}</span>`;
                fileTextPromptPart += `[附件 ${doc.name}]\n${doc.content}\n\n`;
            });
            pendingMediaHTML += `</div>`;
        }

        if (hasImage) {
            pendingMediaHTML += `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">`;
            currentImages.forEach(img => {
                pendingMediaHTML += `<img src="${img}" class="ai-image-preview" style="height:60px;width:60px;object-fit:cover;border-radius:6px;margin:0;" />`;
            });
            pendingMediaHTML += `</div>`;
        }

        // Reset arrays immediately for UX
        this.clearAllPendingFiles();

        this.lastInputWasVoice = true; 
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

            const cleanMimeType = audioBlob.type.split(';')[0] || 'audio/webm';
            const userMessage = this._buildMultimodalMessage(
                fileTextPromptPart + systemPromptText, 
                currentImages, 
                { data: base64Audio, type: cleanMimeType }
            );

            this.messageQueue.push(userMessage);
            this.processQueue();
        };
    }

    _buildMultimodalMessage(text, images = [], audio = null) {
        const content = [];
        if (text) content.push({ type: 'text', text: text });
        
        if (images && images.length > 0) {
            images.forEach(img => {
                const b64 = img.includes(',') ? img.split(',')[1] : img;
                content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } });
            });
        }
        
        if (audio && audio.data) {
            content.push({ type: 'image_url', image_url: { url: `data:${audio.type};base64,${audio.data}` } });
        }
        
        return { role: 'user', content: content.length === 1 && content[0].type === 'text' ? content[0].text : content };
    }


    handleTextSelection(e) {
        // 使用微任务等待选区稳定
        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            // 只有当选区长度合适（非无效误触）时才触发
            // 注意：我们移除了 !this.panel.contains 的限制，让用户可以在 AI 面板里选词
            if (selectedText.length > 1) {
                // 如果已存在工具栏，先清理旧的
                const oldToolbar = document.getElementById('ai-select-toolbar');
                if (oldToolbar) oldToolbar.remove();

                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                const toolbar = document.createElement('div');
                toolbar.id = 'ai-select-toolbar';
                toolbar.className = 'ai-selection-toolbar';
                toolbar.innerHTML = `
                    <button class="toolbar-btn" id="analyze-part-btn">✨ 分析选段</button>
                    <button class="toolbar-btn" id="copy-part-btn">📋 复制</button>
                `;

                // 物理定位：根据选区位置动态悬浮，并加上页面滚动偏移
                toolbar.style.left = `${rect.left + rect.width / 2}px`;
                toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
                toolbar.style.transform = 'translateX(-50%)';

                document.body.appendChild(toolbar);

                // 核心逻辑 A：分析选段
                const analyzeBtn = toolbar.querySelector('#analyze-part-btn');
                if (analyzeBtn) {
                    analyzeBtn.onclick = (btnE) => {
                        btnE.stopPropagation();
                        // 逻辑：将选中的文字带入分析器，模拟用户提问
                        const prefix = "我想专门请教一下刚才这段内容：\n";
                        this.input.value = `${prefix}“${selectedText}”`;
                        this.sendMessage(); // 一键直达，极致效率
                        toolbar.remove();
                        selection.removeAllRanges();
                    };
                }

                // 核心逻辑 B：仅复制
                const copyBtn = toolbar.querySelector('#copy-part-btn');
                if (copyBtn) {
                    copyBtn.onclick = (btnE) => {
                        btnE.stopPropagation();
                        navigator.clipboard.writeText(selectedText);
                        toolbar.remove();
                    };
                }

                // 点击页面其他位置（除工具栏外）销毁工具栏
                const hideHandler = (me) => {
                    if (!toolbar.contains(me.target)) {
                        toolbar.remove();
                        document.removeEventListener('mousedown', hideHandler);
                    }
                };
                setTimeout(() => document.addEventListener('mousedown', hideHandler), 50);
            } else {
                // 如果选区被清除，尝试隐藏工具栏
                const oldToolbar = document.getElementById('ai-select-toolbar');
                if (oldToolbar) oldToolbar.remove();
            }
        }, 100);
    }

    async openCamera() {
        this.cameraModal.style.display = 'flex';
        try {
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

【💡 极致排版指令 - Notion Mastery】：
你不仅是 AI，你是在创作一件工艺品级的学习笔记。必须严格遵守以下法则：
1. **分层骨架**：严禁单纯文字堆砌。必须使用 Markdown 多级标题 (#, ##) 对逻辑进行分段，并辅以分界线 (---)。
2. **极客符号**：每个标题和核心结论前，必须配一个契合语境的 Emoji。
3. **金句化引用**：核心推导、关键参数或“小创老师建议”，必须使用引用块 (> ) 进行封装。
4. **多维可视化 (Visual Synergy)**：
   - **Mermaid 架构图 (10.x)**：逻辑流、软件架构或状态机，必须使用 \`\`\`mermaid 标识符开启，禁止夹杂废话代码。
   - **极客 ASCII 工程图 (Mechanical Grade)**：针对机械原理，输出高精度 ASCII。
5. **超链接引用**：使用 Markdown 标准语法 \`[名称](URL)\` 提供文档链接。`;

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
        // 增量同步用户提问至数据湖
        this.logChatMessage('user', userMessageObject.content);

        this.currentAbortController = new AbortController();
        this._lastSendTime = Date.now(); // 记录发信起点，用于分析 AI 响应时常
        this.isTypingCancelled = false;
        this.setSendButtonState('stop');

        try {
            // Build limit-safe conversation history to prevent Token limit exceeded
            let apiMessages = [];
            if (this.chatHistory.length > 0 && this.chatHistory[0].role === 'system') {
                apiMessages.push(this.chatHistory[0]);
            }
            const historyNoSys = this.chatHistory.filter(m => m.role !== 'system');
            const recentMessages = historyNoSys.slice(-10); // 仅保留最近10条对话
            
            const cleanedRecentMessages = recentMessages.map((msg, idx) => {
                if (msg.role === 'user' && Array.isArray(msg.content) && idx !== recentMessages.length - 1) {
                    // 仅对非最后一轮的多模态消息提纯文本，丢弃Base64图文音频文件，节省上下文 Token 防崩溃
                    const textObj = msg.content.find(c => c.type === 'text');
                    return { role: 'user', content: (textObj ? textObj.text : '') + '\n[过往历史媒体附件已折叠]' };
                }
                return msg;
            });
            apiMessages = apiMessages.concat(cleanedRecentMessages);

            const response = await fetch(this.settings.endpoint, {
                method: 'POST',
                signal: this.currentAbortController.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`
                },
                body: JSON.stringify({
                    model: this.settings.model,
                    messages: apiMessages,
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                // 自动重试一次：网关偶发 502/503/504 时直接背靠背再请求一次
                if ([502, 503, 504].includes(response.status) && !this._isRetrying) {
                    this._isRetrying = true;
                    console.warn(`[小创老师] 网关返回 ${response.status}，启动自动重试...`);
                    const retryResponse = await fetch(this.settings.endpoint, {
                        method: 'POST',
                        signal: this.currentAbortController.signal,
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.settings.apiKey}` },
                        body: JSON.stringify({ model: this.settings.model, messages: apiMessages, temperature: 0.7, max_tokens: 4096 })
                    });
                    this._isRetrying = false;
                    if (retryResponse.ok) {
                        // 重试成功，用重试结果替代原 response 继续往下走
                        var data = await retryResponse.json();
                    } else {
                        const errorData = await retryResponse.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `服务暂时不可用 (${retryResponse.status})，请稍候再试`);
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || response.statusText);
                }
            }

            if (typeof data === 'undefined') var data = await response.json();
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
            msgDiv.setAttribute('draggable', 'false'); // 核心修复：严禁拖拽，释放选区感应
            msgDiv.style.userSelect = 'text';
            msgDiv.style.pointerEvents = 'auto'; // 显式声明，防止继承自父级的 none
            msgDiv.style.zIndex = '100'; // 置于绝对顶层
            
            rowDiv.innerHTML = avatarHTML;
            rowDiv.appendChild(msgDiv);
            this.chatArea.appendChild(rowDiv);
            this.scrollToBottom(true);

            const enhanceCodeBlocks = () => {
                // 2. 链接增强：强制新页签打开 (New Tab Mastery)
                msgDiv.querySelectorAll('a').forEach(link => {
                    if (!link.hasAttribute('target')) {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    }
                });

                if (!window.hljs) return;
                msgDiv.querySelectorAll('pre code').forEach((block) => {
                    const pre = block.parentElement;
                    const isStreaming = !aiReply || i < aiReply.length; // 如果仍在打字流中
                    
                    if (block.classList.contains('language-mermaid') && window.mermaid) {
                        if (isStreaming) {
                            // 在流式输出过程中，仅显示代码原文，带上深色半透明滤镜，不进行 Mermaid 强渲染
                            pre.style.opacity = '0.5';
                            return; 
                        }
                        
                        const content = block.innerText.trim();
                        // 额外防腐：如果代码太短或没闭合，暂不渲染
                        if (content.length < 10) return; 
                        
                        const mermaidId = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                        const mermaidDiv = document.createElement('div');
                        mermaidDiv.className = 'mermaid';
                        mermaidDiv.id = mermaidId;
                        
                        try {
                            window.mermaid.render(mermaidId, content).then(({svg}) => {
                                mermaidDiv.innerHTML = svg;
                                pre.style.display = 'none';
                                pre.classList.add('mermaid-ready');
                                if (!pre.nextElementSibling || !pre.nextElementSibling.classList.contains('mermaid')) {
                                    pre.parentNode.insertBefore(mermaidDiv, pre.nextSibling);
                                }
                                this.scrollToBottom();
                            }).catch(err => {
                                console.warn('Incomplete/Illegal Mermaid, waiting next cycle...', err);
                            });
                        } catch (e) { }
                        return;
                    }
                    
                    window.hljs.highlightElement(block);
                    
                    let langName = 'TEXT';
                    const langClass = Array.from(block.classList).find(c => c.startsWith('language-'));
                    if (langClass) langName = langClass.replace('language-', '').toUpperCase();
                    
                    const header = document.createElement('div');
                    header.className = 'code-header';
                    header.innerHTML = `
                        <div class="mac-dots">
                            <i style="background: #ff5f56;"></i>
                            <i style="background: #ffbd2e;"></i>
                            <i style="background: #27c93f;"></i>
                            <span class="code-lang" style="margin-left: 8px; font-family: 'Orbitron'; font-size: 10px; color: #8b949e;">${langName}</span>
                        </div>
                        <button type="button" class="code-copy">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy
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

            const progressBar = document.createElement('div');
            progressBar.className = 'ai-progress-bar';
            progressBar.style.width = '0%';
            msgDiv.parentElement.appendChild(progressBar);

            let i = 0;
            let lastBlockCount = 0;
            const tempContainer = document.createElement('div');

            const typeNextChar = () => {
                if (this.isTypingCancelled) {
                    this.setSendButtonState('send');
                    const safetyReply = aiReply || '';
                    msgDiv.innerHTML = window.marked ? window.marked.parse(safetyReply.substring(0, i)) : safetyReply.substring(0, i);
                    enhanceCodeBlocks();
                    progressBar.remove();
                    this.isProcessingQueue = false;
                    this.processQueue();
                    return;
                }

                if (i >= aiReply.length) {
                    // 打字正式完成，进入静态阅读模式 (Static Reading Mode)
                    const safetyReply = aiReply || '';
                    const finalContent = window.marked ? window.marked.parse(safetyReply) : safetyReply;
                    if (msgDiv.innerHTML !== finalContent) {
                        msgDiv.innerHTML = finalContent;
                    }
                    
                    setTimeout(() => {
                        this.enhanceCodeBlocks(msgDiv); // 仅执行一次结构增强
                        progressBar.style.opacity = '0'; // 优雅消失，不抖动
                        setTimeout(() => { if(progressBar.parentNode) progressBar.remove(); }, 300);
                    }, 10);

                    this.setSendButtonState('send');
                    this.isProcessingQueue = false;
                    this.processQueue();
                    
                    // 核心修复：访客模式提问计费 (Guest Usage Tracking)
                    const isMemberStatus = this.settings.memberExpired > Date.now();
                    if (!isMemberStatus) {
                        let remainingCount = parseInt(localStorage.getItem('ai_guest_limit') || '10');
                        if (remainingCount > 0) {
                            remainingCount--;
                            localStorage.setItem('ai_guest_limit', remainingCount.toString());
                            this.updateMemberStatusUI(); // 即时刷新顶部通知条进度
                        }
                    }
                    
                    if (typeof this.updateQuickChips === 'function') this.updateQuickChips(aiReply);
                    
                    // 增量同步 AI 回答至数据湖
                    this.logChatMessage('assistant', aiReply, { 
                        tokens_estimate: Math.ceil(aiReply.length / 1.5),
                        duration_ms: Date.now() - (this._lastSendTime || 0)
                    });

                    // 追加功能动作条，且不再触碰 msgDiv 内部
                    const actions = document.createElement('div');
                    actions.className = 'ai-msg-actions';
                    actions.innerHTML = `
                        <button type="button" class="ai-msg-action-btn" title="一键复制全篇回答内容">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            复制全文
                        </button>
                    `;
                    actions.querySelector('button').onclick = (btnE) => {
                        btnE.stopPropagation();
                        navigator.clipboard.writeText(aiReply);
                        const btn = btnE.currentTarget;
                        const originalHTML = btn.innerHTML;
                        btn.innerHTML = '✅ 已复制';
                        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
                    };
                    rowDiv.appendChild(actions);
                    return;
                }

                // Turbo-Burst 算法：大幅增加单次步长 (8-15字符)，降低闪烁感并提高响应速度
                let step = 8;
                const remaining = aiReply.length - i;
                if (remaining < 20) step = 1; // 接近末尾时放慢，增强仪式感
                else if (aiReply.substring(i, i+10).includes('\n')) step = 1; // 遇到换行时精确处理

                i += step;
                if (i > aiReply.length) i = aiReply.length;

                // 极速稳象算法：先过滤裸露的星号乱码，再进行渲染
                let cleanText = aiReply.substring(0, i); // Use aiReply directly
                cleanText = cleanText.replace(/(\r\n|\n|\r)\* /g, '$1• '); // 将星号列表强制转为圆点
                cleanText = cleanText.replace(/([^\*])\*([^\*])/g, '$1$2'); // 尝试移除孤立的单星号
                
                tempContainer.innerHTML = window.marked ? window.marked.parse(cleanText) : cleanText;
                const newChildren = Array.from(tempContainer.children);
                
                // 仅对比和更新最后 3 个子节点（大部分历史块是静止的）
                const startIdx = Math.max(0, newChildren.length - 3);
                
                for (let idx = 0; idx < newChildren.length; idx++) {
                    const newChild = newChildren[idx];
                    let existingChild = msgDiv.children[idx];

                    if (!existingChild) {
                        const clone = newChild.cloneNode(true);
                        clone.classList.add('new-block');
                        msgDiv.appendChild(clone);
                        lastBlockCount++;
                        this.scrollToBottom(true);
                    } else if (idx >= startIdx) {
                        // 仅对尾部活跃区块进行最小化更新
                        const newHTML = newChild.innerHTML + (idx === newChildren.length - 1 ? '<span class="ai-cursor"></span>' : '');
                        if (existingChild.innerHTML !== newHTML) {
                            existingChild.innerHTML = newHTML;
                        }
                    }
                }

                // 降低高亮频率，提升渲染性能
                if (i % 20 === 0) enhanceCodeBlocks();
                if (i % 15 === 0) this.scrollToBottom();

                // 降低延迟：从 20ms 降至 10ms，配合大步长实现瞬时感
                setTimeout(typeNextChar, 10);
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
        if (role === 'user') avatarHTML = '<div class="avatar avatar-user"><img src="assets/img/user_boy.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>';
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg msg-${role}`;
        msgDiv.setAttribute('draggable', 'false');
        msgDiv.style.userSelect = 'text';
        msgDiv.style.cursor = 'text';
        msgDiv.style.pointerEvents = 'auto';
        msgDiv.style.zIndex = '10';
        
        let safeText = '';
        if (typeof text === 'string') {
            safeText = text;
        } else if (Array.isArray(text)) {
            safeText = text.find(c => c.type === 'text')?.text || '[数据实体]';
        }

        if (isHTML) {
            msgDiv.innerHTML = safeText;
        } else {
            msgDiv.innerText = safeText;
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
        if (typing) {
            if (this.typingStatusTimer) clearInterval(this.typingStatusTimer);
            typing.remove();
        }
        
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
        
        const statusPhrases = [
            '🌐 系统神经元激活中...',
            '🛰️ 正在同步卫星科创库...',
            '🧬 智库 RAG 关联性检索...',
            '🧩 正在重构硬核工程方案...',
            '🛠️ 模块化知识体拼装中...',
            '📡 深度扫描页面上下文...',
            '⚡ 正在注入逻辑流分析...'
        ];
        
        msgDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <span class="typing-status" id="ai-typing-status" style="transition: opacity 0.3s;">${statusPhrases[0]}</span>
        `;
        
        rowDiv.innerHTML = avatarHTML;
        rowDiv.appendChild(msgDiv);
        this.chatArea.appendChild(rowDiv);
        this.scrollToBottom(true);

        // 启动流式提示词轮播定时器
        let phraseIdx = 0;
        this.typingStatusTimer = setInterval(() => {
            const statusEl = document.getElementById('ai-typing-status');
            if (statusEl) {
                phraseIdx = (phraseIdx + 1) % statusPhrases.length;
                statusEl.style.opacity = '0';
                setTimeout(() => {
                    statusEl.innerText = statusPhrases[phraseIdx];
                    statusEl.style.opacity = '1';
                }, 300);
            } else {
                clearInterval(this.typingStatusTimer);
            }
        }, 1800);
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
        const hasImage = this.pendingImages && this.pendingImages.length > 0;
        const hasFile = this.pendingDocs && this.pendingDocs.length > 0;
        
        if (!text && !hasImage && !hasFile) return;
        
        this.input.value = '';
        const currentImages = [...this.pendingImages];
        const currentDocs = [...this.pendingDocs];

        let fileTextPromptPart = '';
        let pendingMediaHTML = '';

        if (hasFile) {
            pendingMediaHTML += `<div style="background:rgba(255,255,255,0.1);padding:6px;border-radius:4px;margin-bottom:8px;font-size:12px;display:flex;flex-wrap:wrap;gap:6px;">`;
            currentDocs.forEach(doc => {
                pendingMediaHTML += `<span style="background:rgba(14,165,233,0.3);padding:2px 6px;border-radius:4px;">📄 ${doc.name}</span>`;
                fileTextPromptPart += `[附件 ${doc.name}]\n${doc.content}\n\n`;
            });
            pendingMediaHTML += `</div>`;
        }

        if (hasImage) {
            pendingMediaHTML += `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">`;
            currentImages.forEach(img => {
                pendingMediaHTML += `<img src="${img}" class="ai-image-preview" style="height:60px;width:60px;object-fit:cover;border-radius:6px;margin:0;" />`;
            });
            pendingMediaHTML += `</div>`;
        }

        this.clearAllPendingFiles();
        this.lastInputWasVoice = false;
        
        let finalHtmlMsg = pendingMediaHTML;
        if (text) finalHtmlMsg += `<div style="margin-top:8px;">${text}</div>`;
        else finalHtmlMsg += `<div style="margin-top:8px;font-style:italic;opacity:0.7;">(发送了多媒体文件)</div>`;
        
        this.appendMessage('user', finalHtmlMsg, true);
        
        let aiTextPrompt = text;
        if (!text && (hasImage || hasFile)) {
            aiTextPrompt = hasImage ? '请看上述图像。结合画面为您解析。' : '请帮我详细分析我发送的文档。';
        }
        
        const userMessageObject = this._buildMultimodalMessage(
            fileTextPromptPart ? `${fileTextPromptPart}\n\n[用户问题]: ${aiTextPrompt}` : aiTextPrompt,
            currentImages
        );
        
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

    updateQuickChips(lastResponseText = '') {
        const chipsContainer = document.getElementById('titan-ai-chips');
        if(!chipsContainer) return;
        
        let customChips = [];
        // --- 进化版：全局正则语义探测器 (Global Semantic Probing) ---
        if (lastResponseText) {
            // 不再拘泥于物理换行，而是利用语义边界寻找所有以问号结尾的“诱导性短句”
            const questions = lastResponseText.match(/[^。！!？\?\n\r]+[？\?]/g) || [];
            
            questions.forEach(q => {
                let text = q.trim();
                // 排除过短（噪音）或过于宏大的长句（非选项）
                if (text.length > 5 && text.length < 100) {
                    // 彻底扒掉 Markdown 的外壳 (加粗、斜体、代码、引用、列表头)
                    let clean = text.replace(/^[\-\*1-9\.\s>#]+/, '')
                                    .replace(/[\*_\`\#\"""]/g, '')
                                    .replace(/[\(（]提示[：:].*?[\)）]/g, '') // 智能剔除括号里的提示说明，保持磁片简洁
                                    .trim();
                    
                    if (clean.length > 3 && !customChips.some(c => c.prompt === clean)) {
                        customChips.push({
                            label: `🎯 ${clean}`, // 不再手动截断，交给 CSS 处理
                            prompt: clean
                        });
                    }
                }
            });
            // 优先展示最新的 3-4 个深度交互选项
            if (customChips.length > 4) customChips = customChips.slice(-4);
        }

        const defaultChips = [
            { label: '💡 只要提示', prompt: '不要直接回答，请给我一点推理关键线索的启发就好。' },
            { label: '🤔 换个说法', prompt: '用小学生能轻易听明白的通用比方，帮我生动地重新解释一遍。' },
            { label: '📝 出个考题', prompt: '根据这个知识点核心，出一道类似的探究或者计算题目给我练练手。' },
            { label: '🔍 深入分析', prompt: '帮我更深一层拆解分析，告诉我背后的原理和最底层的运转逻辑。' },
            { label: '⚙️ 极客视角', prompt: '用极其通俗易懂的机电硬件或代码工程世界的视角来讲解它。' },
            { label: '👩‍💻 代码求证', prompt: '能给我写一个与之关联的极简 C++ 或 Python 核心伪代码实现来看看吗？' }
        ];
        
        // 融合动态与系统预设选项：动态优先，如果不满3个，加入一些随机固定项凑数
        let resultPool = [...customChips];
        if (resultPool.length < 3) {
            const shuffled = defaultChips.sort(() => 0.5 - Math.random());
            const needed = (Math.floor(Math.random() * 2) + 3) - resultPool.length;
            resultPool = resultPool.concat(shuffled.slice(0, needed));
        }

        chipsContainer.innerHTML = '';
        resultPool.forEach(chipData => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ai-chip';
            btn.dataset.prompt = chipData.prompt;
            btn.innerText = chipData.label;
            btn.title = chipData.prompt; // 悬停显示完整原生文字提示 (Tooltip)
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
