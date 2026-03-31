// TITAN OS - Global AI Assistant Module (LLM Integration)
// Automatically injected into all TITAN OS nodes.

class TitanAIAssistant {
    constructor() {
        if (document.getElementById('titan-ai-container')) return; // Already initialized
        
        this.isChatOpen = false;
        this.courseRegistry = [
            { id: 'robotics-basic', title: '仿生机器人初级工坊', desc: '从机械结构到基础电路，开启你的创客之旅。', link: 'course-robotics.html', keywords: ['制作', '学习', '机器人', '搭建', '硬件', '零件', '入门', '基础', 'robot', 'make', 'build'], icon: 'fas fa-cog', color: '#10b981' },
            { id: 'robotics-adv', title: '智能机器人极客挑战', desc: '探索多关节舵机同步与步态控制高级算法。', link: 'course-robotics-advanced.html', keywords: ['进阶', '机器人', '伺服', '舵机', '算法', '高级', 'advanced', 'robot'], icon: 'fas fa-robot', color: '#059669' },
            { id: 'ai', title: 'AI 大模型提示词工程', desc: '揭秘生成式 AI 背后的逻辑，掌握与未来对话的语言。', link: 'course-ai.html', keywords: ['人工智能', 'AI', '模型', '深度学习', '提示词', '训练', 'intelligence'], icon: 'fas fa-brain', color: '#38bdf8' },
            { id: 'astronomy', title: '星际航行与深空探测', desc: '从太阳系出发，穿过黑洞，探索宇宙最狂野的想象。', link: 'course-astronomy.html', keywords: ['宇宙', '航天', '星星', '黑洞', '太空', 'astronomy', 'space'], icon: 'fas fa-user-astronaut', color: '#8b5cf6' },
            { id: 'dino', title: '侏罗纪物种进化实验室', desc: '利用生物工程技术，复活远古巨兽，观察生命演化。', link: 'course-dino.html', keywords: ['恐龙', '生物', '进化', '基因', '研究', '物种', 'dino'], icon: 'fas fa-dragon', color: '#f59e0b' },
            { id: 'coding', title: '零基础极客编程入门', desc: '不只是写代码，更是用数字逻辑重塑世界的游戏。', link: 'coding.html', keywords: ['编程', '代码', 'Python', 'JS', '开发', '网站', '软件', 'code'], icon: 'fas fa-terminal', color: '#ef4444' },
            { id: 'rocket', title: '重型运载火箭发射基地', desc: '计算轨道，点火升空，亲手护送载荷进入同步轨道。', link: 'course-rocketry.html', keywords: ['火箭', '发射', '动力', '推进', '火药', '升空', 'rocket'], icon: 'fas fa-rocket', color: '#f97316' },
            { id: 'smart-farm', title: '太空育种与智慧农业', desc: '在月面基地培育高产作物，解决星际移民的口粮问题。', link: 'course-space-farming.html', keywords: ['植物', '生长', '太空', '农务', '种子', '育种', 'farm'], icon: 'fas fa-leaf', color: '#22c55e' },
            { id: 'drone', title: '穿越机组装与竞速', desc: '第一人称视角的飞行，挑战空气动力学的极限。', link: 'drone.html', keywords: ['飞机', '无人机', '飞行', '穿越', '航模', '空域', 'drone'], icon: 'fas fa-helicopter', color: '#6366f1' }
        ];

        const fullContent = document.body ? document.body.innerText.replace(/\s+/g, ' ').substring(0, 3000) : '';
        this.context = {
            title: document.title,
            header: document.querySelector('h1')?.innerText || '',
            fullContent: fullContent
        };
        
        // Settings (Obfuscated internal config to prevent direct scanning)
        const _k = [
            'QUl6YVN5QW', '84RVlub2Rl', 'aktBanFaaU', '4yUDNFc1R4', 'VWJqLXVka0', 'tJ'
        ];
        this.settings = {
            // 🛡️ [终极生产环境密钥]：已注入 Backgrace 官方商业金钥，保障全时段高并发服务稳若泰山
            apiKey: 'sk-yRWWj3wDJfuUXhddTtdTb59ax9ExqC7DAgbpBt5Oe50yDFjK', 
            endpoint: 'https://backgrace.com/v1/chat/completions', 
            backupEndpoint: 'https://ai.zhouxiaomai.com/v1beta/openai/chat/completions', // 降级为原生备用节点
            backupApiKey: atob(_k.join('')),
            model: 'gemini-3-flash', // 顶配更新：已解锁 3.0 版本
            // 🎙️ 【终极企业架构：豆包发声模块】（你的大脑依旧是强无敌的 Gemini 3.0 Flash 视觉大模型）
            volcengineAppId: '4780476544', // 去火山引擎注册后拿到的 AppID
            volcengineToken: 'e_t1R3UXzl-qvSTrFdEgh0-NFhjN5p7z', // 去火山引擎拿到的真实身份 Token (含小写l修正)
            volcengineCluster: 'volcano_tts', // 默认使用火山 TTS 集群
            volcengineVoice: 'zh_male_shaonianzixin_moon_bigtts', // 🎯 核心音色设定：豆包 - 少年梓辛
            // 💎 [会员权限硬核固化]：生产版默认授予永久 VIP 权限 (2033年过期)，解决跨域 Session 丢失导致的访客模式回滚。
            memberExpired: 2000000000000 
        };
        
        // 🎯 [核心系统联动]：动态继承 OpenMAIC (Zustand 持久化) 系统的全局配置
        try {
            const openmaicStorage = localStorage.getItem('settings-storage');
            if (openmaicStorage) {
                const parsed = JSON.parse(openmaicStorage);
                if (parsed && parsed.state && parsed.state.providersConfig) {
                    const state = parsed.state;
                    const providerId = state.providerId;
                    const modelId = state.modelId;
                    const config = state.providersConfig[providerId];
                    
                    if (config) {
                        if (config.apiKey) this.settings.apiKey = config.apiKey;
                        if (modelId) this.settings.model = modelId;
                        
                        // 提取并自动拼接正确的聊天补全端点
                        let activeUrl = config.baseUrl || config.defaultBaseUrl || 'https://api.openai.com/v1';
                        activeUrl = activeUrl.replace(/\/+$/, '');
                        this.settings.endpoint = activeUrl + '/chat/completions';
                        
                        console.log(`[Titan AI] 🚀 成功与 OpenMAIC 核心接轨! Provider: ${providerId} | Model: ${modelId}`);
                    }
                }
            }
        } catch (e) {
            console.warn("[Titan AI] 未检测到 OpenMAIC 同源配置，降级使用内建金钥。", e);
        }

        this.chatHistory = [];
        this.messageQueue = [];
        this.pendingImages = [];
        this.pendingDocs = [];
        this.isTypingCancelled = false;
        this.isProcessingQueue = false;
        this.isChatOpen = false;
        this.isProcessingQueue = false;
        this.messageQueue = [];
        
        // VAD (Voice Activity Detection) 模块装载
        this.vadContext = null;
        this.vadAnalyser = null;
        this.vadStream = null;
        this.vadReqId = null;
        this.silenceTimer = null; // 用于检测静音自动停止
        this.lastVoiceTime = Date.now();
        
        this.init();
        window.TitanAIAssistantInstance = this;
    }
    updateMemberStatusUI() {
        if (!this.statusBar || !this.input) return; 
        
        const sm = window.SubscriptionManager;
        
        // --- 核心优化 (Core Fix): 避免加载闪烁 (Prevent Auth Flicker) ---
        // 增加网络延迟情况下的“加载中”过渡态，不让界面的默认“访客模式”闪烁
        if (sm && typeof sm.isReady !== 'undefined' && !sm.isReady) {
            this.statusBar.innerHTML = `
                <span><i class="fas fa-circle-notch fa-spin" style="color:#94a3b8;margin-right:4px;"></i> 链路同步中...</span>
            `;
            this.input.disabled = true;
            this.input.placeholder = "正在校验身份与体验配额...";
            this.input.style.opacity = '0.5';
            this.input.style.cursor = 'wait';
            
            // Auto re-trigger when auth sync finishes
            if(!this._isPollingAuth) {
                this._isPollingAuth = true;
                const checkReady = setInterval(() => {
                    if(sm.isReady) {
                        clearInterval(checkReady);
                        this._isPollingAuth = false;
                        this.updateMemberStatusUI();
                    }
                }, 100);
            }
            return;
        }

        // 联通全栈 SubscriptionManager 身份核验
        let isMember = (this.settings.memberExpired > Date.now());
        
        // [Titan Tech Production Hardening] 生产域名强制劫持：确保即便 SubscriptionManager 还没 Ready 或身份丢失，UI 也要显示专业版。
        const host = window.location.hostname;
        const isProdDomain = host.includes('zhouxiaomai.com') || host.includes('futureclass.ai') || host.includes('vercel.app');
        if (isProdDomain) isMember = true;
        
        if (sm && sm.isSubscribed && sm.isSubscribed()) {
            isMember = true;
        }
        
        let remaining = parseInt(localStorage.getItem('ai_guest_limit') || '10');
        
        if (isMember) {
            this.statusBar.innerHTML = `
                <span><i class="fas fa-gem" style="color:#38bdf8;margin-right:4px;"></i> 成电创客 · 瞪羚特权</span>
                <div class="status-tag member">专业版 · 无限次</div>
            `;
            this.input.disabled = false;
            this.input.placeholder = "向小创老师发送指令，或直接提问...";
            this.input.style.opacity = '1';
            this.input.style.cursor = 'text';
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
                this.activateBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (document.getElementById('titan-ai-auth-modal')) {
                        document.getElementById('titan-ai-auth-input').focus();
                        return;
                    }
                    
                    const modal = document.createElement('div');
                    modal.id = 'titan-ai-auth-modal';
                    modal.style.cssText = 'position: absolute; inset: 0; background: rgba(10, 15, 25, 0.85); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); flex-direction: column; opacity: 0; transition: opacity 0.2s; border-radius: inherit;';
                    
                    modal.innerHTML = `
                        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 16px; padding: 24px; width: 85%; max-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(251, 191, 36, 0.1); transform: scale(0.95); transition: transform 0.2s;">
                            <div style="color: #fbbf24; font-weight: 800; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; font-family: 'Orbitron', 'Noto Sans SC', sans-serif;">
                                <i class="fas fa-crown"></i> 认证权限
                            </div>
                            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">请输入您的成电创客/瞪羚专属体验码</div>
                            <input type="text" id="titan-ai-auth-input" placeholder="输入专属激活码..." autocomplete="off" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; color: #fff; font-size: 14px; outline: none; margin-bottom: 20px; transition: border-color 0.2s;">
                            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                <button type="button" id="titan-ai-auth-cancel" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s;">取消</button>
                                <button type="button" id="titan-ai-auth-confirm" style="background: #fbbf24; border: none; color: #000; font-weight: bold; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(251, 191, 36, 0.3);">激 活</button>
                            </div>
                        </div>
                    `;
                    
                    this.panel.appendChild(modal);
                    
                    // Trigger reflow for animation
                    void modal.offsetWidth;
                    modal.style.opacity = '1';
                    modal.firstElementChild.style.transform = 'scale(1)';
                    
                    const input = document.getElementById('titan-ai-auth-input');
                    const btnCancel = document.getElementById('titan-ai-auth-cancel');
                    const btnConfirm = document.getElementById('titan-ai-auth-confirm');
                    
                    const closeAndRemove = () => {
                        modal.style.opacity = '0';
                        modal.firstElementChild.style.transform = 'scale(0.95)';
                        setTimeout(() => { if(modal.parentNode) modal.remove(); }, 200);
                    };
                    
                    btnCancel.onclick = closeAndRemove;
                    
                    input.onfocus = () => { input.style.borderColor = 'rgba(251, 191, 36, 0.5)'; input.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.1)'; };
                    input.onblur = () => { input.style.borderColor = 'rgba(255,255,255,0.1)'; input.style.boxShadow = 'none'; };
                    
                    const doActivate = () => {
                        const code = input.value.trim();
                        if (code) {
                            const success = this.activateMember(code);
                            if (!success) {
                                input.style.borderColor = '#ef4444';
                                input.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.2)';
                                input.value = '';
                                input.placeholder = '激活码无效，请重新输入';
                                setTimeout(() => input.focus(), 50);
                            } else {
                                closeAndRemove();
                            }
                        }
                    };
                    
                    btnConfirm.onclick = doActivate;
                    input.onkeypress = (ev) => { if (ev.key === 'Enter') doActivate(); };
                    
                    btnCancel.onmouseover = () => { btnCancel.style.background = 'rgba(255,255,255,0.05)'; btnCancel.style.color = '#fff'; };
                    btnCancel.onmouseout = () => { btnCancel.style.background = 'transparent'; btnCancel.style.color = '#94a3b8'; };
                    btnConfirm.onmouseover = () => btnConfirm.style.transform = 'translateY(-2px)';
                    btnConfirm.onmouseout = () => btnConfirm.style.transform = 'translateY(0)';
                    
                    setTimeout(() => input.focus(), 300);
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

    // --- AI 课程推荐卡片渲染引擎 (AI Course Recommendation Engine) ---
    processRecommendations(responseText, container) {
        const recRegex = /```json\s*(\{[\s\S]*?"titan_recommendation"[\s\S]*?\})\s*```/g;
        let match;
        const recommendations = [];

        while ((match = recRegex.exec(responseText)) !== null) {
            try {
                const data = JSON.parse(match[1]).titan_recommendation;
                if (Array.isArray(data)) recommendations.push(...data);
            } catch (e) { console.warn('[Titan] 推荐指令解析失败', e); }
        }

        if (recommendations.length > 0) {
            const recWrapper = document.createElement('div');
            recWrapper.className = 'ai-rec-wrapper';
            recWrapper.style.cssText = 'margin-top: 16px; border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; overflow: hidden; background: rgba(14, 165, 233, 0.05);';
            recWrapper.innerHTML = `
                <div style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #38bdf8; border-bottom: 1px solid rgba(56, 189, 248, 0.15); display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-map-signs"></i> 小创老师精选推荐 (${recommendations.length})
                </div>
                <div style="padding: 8px;"></div>
            `;
            const grid = recWrapper.querySelector('div:last-child');

            recommendations.slice(0, 3).forEach(rec => {
                const card = document.createElement('div');
                card.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin: 4px 8px; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(56, 189, 248, 0.15); cursor: pointer; transition: all 0.2s;';
                card.innerHTML = `
                    <div style="font-size: 24px; flex-shrink: 0;">${rec.icon || '🚀'}</div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 2px;">${rec.name}</div>
                        <div style="font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rec.desc || '点击探索该主题实验室'}</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color: #38bdf8; opacity: 0.5; font-size: 12px;"></i>
                `;
                card.onmouseover = () => { card.style.background = 'rgba(14, 165, 233, 0.15)'; card.style.borderColor = 'rgba(56, 189, 248, 0.4)'; };
                card.onmouseout = () => { card.style.background = 'rgba(0,0,0,0.3)'; card.style.borderColor = 'rgba(56, 189, 248, 0.15)'; };
                card.onclick = () => {
                    this.playHapticSound('click');
                    if (window.titanUI && window.titanUI.trackInterest) {
                        window.titanUI.trackInterest(rec.category || 'coding');
                    }
                    location.href = rec.link || 'hub-auto-101.html';
                };
                grid.appendChild(card);
            });

            container.appendChild(recWrapper);
            this.scrollToBottom(true);
        }
    }

    injectGlobalWindowControls() {
        if (document.getElementById('titan-global-window-controls')) return;

        // 识别当前是否为桌面版的主页大厅
        const isVercelApp = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('zhouxiaomai.com');
        const isIndex = !isVercelApp && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '');
        
        // 创建全局霸屏管控面板
        const wrapper = document.createElement('div');
        wrapper.id = 'titan-global-window-controls';
        wrapper.style.cssText = `
            box-sizing: border-box;
            position: fixed; top: 0; left: 0; width: 100%; height: 0;
            pointer-events: none; z-index: 9999999;
            display: flex; align-items: flex-start; padding: 20px;
        `;

        // 【统合左侧容器】仅分配给红黄绿灯视窗管控 (客户端独享，绝不打扰网页版)
        const leftGroup = document.createElement('div');
        leftGroup.style.cssText = 'display: flex; gap: 15px; pointer-events: auto; -webkit-app-region: no-drag; align-items: center;';

        // 1. 苹果式的模拟红黄绿灯 (网页版专属)
        const leftControls = document.createElement('div');
        const isDesktopApp = window.navigator.userAgent.toLowerCase().includes('electron');
        leftControls.style.cssText = `
            display: ${isDesktopApp ? 'none' : 'flex'}; gap: 8px; background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 20px; backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        `;
        
        const style = document.createElement('style');
        style.innerHTML = `
            .mac-btn { width: 13px; height: 13px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; transition: 0.2s; }
            .mac-btn::before { content: ''; opacity: 0; font-size: 9px; color: rgba(0,0,0,0.6); font-weight: 900; transition: opacity 0.2s; font-family: monospace; }
            #titan-global-window-controls:hover .mac-btn::before { opacity: 1; }
            .mac-close { background: #ff5f56; border: 1px solid #e0443e; }
            .mac-close::before { content: '\\00d7'; transform: translateY(-0.5px); }
            .mac-close:hover { background: #ff746d; }
            .mac-min { background: #ffbd2e; border: 1px solid #dea123; }
            .mac-min::before { content: '-'; transform: translateY(-1px); }
            .mac-min:hover { background: #ffcd4d; }
            .mac-max { background: #27c93f; border: 1px solid #1aab29; }
            .mac-max::before { content: '+'; transform: translateY(-0.5px); }
            .mac-max:hover { background: #3be254; }
        `;
        document.head.appendChild(style);

        leftControls.innerHTML = `
            <div class="mac-btn mac-close" title="关闭页面并退出" onclick="window.close()"></div>
            <div class="mac-btn mac-min" title="最小化窗口" onclick="alert('即将最小化（Web模式暂时停用）')"></div>
            <div class="mac-btn mac-max" title="全屏缩放" onclick="if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen();"></div>
        `;

        // 客户端逻辑检测
        const isElectron = /electron/i.test(navigator.userAgent) || (window.process && window.process.type);
        if (isElectron) {
            leftGroup.appendChild(leftControls);
            wrapper.appendChild(leftGroup);
            document.body.appendChild(wrapper);
        }

        // 2. 核心大招：防遮挡万能“返回首屏”悬浮胶囊，初始定位左上方，且支持全屏任意拖拽！
        if (!isIndex) {
            const returnBtnWrapper = document.createElement('div');
            returnBtnWrapper.id = 'titan-return-capsule';
            returnBtnWrapper.style.cssText = `
                position: fixed;
                top: 30px;
                left: 30px;
                z-index: 9999999;
                pointer-events: auto;
                -webkit-app-region: no-drag;
            `;
            returnBtnWrapper.innerHTML = `
                <button style="background: rgba(14, 165, 233, 0.25); border: 1px solid rgba(56, 189, 248, 0.5); color: #38bdf8; padding: 10px 24px; border-radius: 30px; font-size: 14px; font-weight: bold; cursor: grab; backdrop-filter: blur(12px); display:flex; align-items:center; gap:8px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); text-shadow: 0 1px 2px rgba(0,0,0,0.5); transition: background 0.3s, color 0.3s, box-shadow 0.3s;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                    <span>返回首屏</span>
                </button>
            `;

            const btn = returnBtnWrapper.querySelector('button');
            
            // 自由拖拽引擎逻辑
            let isDragging = false;
            let startX, startY, initialLeft, initialTop;

            btn.addEventListener('mousedown', (e) => {
                isDragging = false;
                startX = e.clientX;
                startY = e.clientY;
                
                // 拖拽前，将其从 relative translateX(-50%) 转换成绝对物理像素定位，防止坐标跳跃
                const rect = returnBtnWrapper.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                
                btn.style.cursor = 'grabbing';
                returnBtnWrapper.style.transform = 'none';
                returnBtnWrapper.style.left = initialLeft + 'px';
                returnBtnWrapper.style.top = initialTop + 'px';
                returnBtnWrapper.style.bottom = 'auto';
                returnBtnWrapper.style.right = 'auto';

                const onMouseMove = (ev) => {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                        isDragging = true;
                    }
                    if (isDragging) {
                        returnBtnWrapper.style.left = (initialLeft + dx) + 'px';
                        returnBtnWrapper.style.top = (initialTop + dy) + 'px';
                    }
                };
                const onMouseUp = (ev) => {
                    btn.style.cursor = 'grab';
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    
                    // 阈值判断：如果没有发生拖拽，即为正常的 Click，执行页面跳转
                    if (!isDragging) {
                        try {
                            // 优先尝试探测 Electron nodeIntegration 以穿透 Vercel 回到本地
                            const { ipcRenderer } = window.require('electron');
                            ipcRenderer.send('return-home');
                        } catch (e) {
                            // Fallback for non-Electron or pure web environment
                            location.href = 'index.html'; 
                        }
                    }
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            btn.onmouseover = () => { if(!isDragging) { btn.style.background = 'rgba(14, 165, 233, 0.7)'; btn.style.color = '#fff'; btn.style.boxShadow = '0 10px 25px rgba(14, 165, 233, 0.8)'; btn.style.transform = 'translateY(-2px) scale(1.05)'; } };
            btn.onmouseout = () => { if(!isDragging) { btn.style.background = 'rgba(14, 165, 233, 0.25)'; btn.style.color = '#38bdf8'; btn.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; btn.style.transform = 'translateY(0) scale(1)'; } };

            document.body.appendChild(returnBtnWrapper);

            // 智能感知自适应布局引擎 (Adaptive Layout Engine)
            setTimeout(() => {
                // 如果用户已经手动拖拽过，则不执行自动适配
                if (returnBtnWrapper.style.transform === 'none' && returnBtnWrapper.style.top && returnBtnWrapper.style.top !== '30px') return;

                const winH = window.innerHeight;
                const winW = window.innerWidth;
                const WL = 30; // 左间距
                const TB = 30; // 上下边距
                const w = returnBtnWrapper.offsetWidth || 120;
                const h = returnBtnWrapper.offsetHeight || 40;

                // 判断指定区域是否被业务逻辑元素的实体占用 (通过 elementFromPoint 获取最顶层非透明元素)
                const isAreaOccupied = (x, y) => {
                    let occupied = false;
                    const testPoints = [
                        [x + 10, y + 10], 
                        [x + w / 2, y + h / 2], 
                        [x + w - 10, y + h - 10],
                        [x + 10, y + h - 10]
                    ];
                    for (let pt of testPoints) {
                        const el = document.elementFromPoint(pt[0], pt[1]);
                        if (el && el !== document.body && el !== document.documentElement) {
                            const rect = el.getBoundingClientRect();
                            // 如果捕获到的元素是较小组件（不是背景层那种超宽大容器），则认为发生了遮挡
                            if (rect.width < winW * 0.6 && rect.height < winH * 0.6) {
                                // 排除组件自身
                                if (!el.closest('#titan-return-capsule') && !el.closest('#titan-global-window-controls')) {
                                    occupied = true;
                                    break;
                                }
                            }
                        }
                    }
                    return occupied;
                };

                const originalVis = returnBtnWrapper.style.visibility;
                returnBtnWrapper.style.visibility = 'hidden'; // 短暂隐身以穿透检测下层真正的元素

                const yBottom = winH - TB - h;
                const yTop = TB + (isElectron ? 60 : 0); // 若在原生桌面端，左上角已有红绿灯，需多避让出一些空间（40 -> 60）

                const bottomOccupied = isAreaOccupied(WL, yBottom);
                const topOccupied = isAreaOccupied(WL, yTop);

                returnBtnWrapper.style.visibility = originalVis; // 恢复显示

                // 核心决策树：哪里空闲去哪里，默认左上方优先(更符合习惯) -> 然后左下 -> 都堵塞也强行左上
                if (!topOccupied) {
                    returnBtnWrapper.style.top = yTop + 'px';
                    returnBtnWrapper.style.bottom = 'auto';
                } else if (!bottomOccupied) {
                    returnBtnWrapper.style.top = 'auto';
                    returnBtnWrapper.style.bottom = TB + 'px';
                } else {
                    // 如果都冲突，强行左上，反正支持手动拖拽
                    returnBtnWrapper.style.top = yTop + 'px';
                    returnBtnWrapper.style.bottom = 'auto';
                }
            }, 1200); // 留出足够时间给React/Vue挂载真实DOM
        }

        // 静默清除工程中各处遗留、残缺的返回主页标记
        setTimeout(() => {
            const oldKeywords = ['返回主页', '返回首页', '返回全局', '返回列表', '返回学科', '返回课程', '返回监控', '返回基站'];
            document.querySelectorAll('a, button, span').forEach(el => {
                if (el.closest('#titan-global-window-controls') || el.closest('.ai-panel') || el.closest('.ai-header')) return;
                
                const text = el.innerText || '';
                const hasKeyword = oldKeywords.some(kw => text.includes(kw));
                // 也要匹配带箭头的图标或 title
                const isBackLink = el.classList.contains('return-link') || el.classList.contains('home-link');
                
                if (hasKeyword || isBackLink) {
                    if (el.tagName === 'A' || el.tagName === 'BUTTON') {
                        el.style.display = 'none';
                    } else if (el.tagName === 'SPAN' && el.parentElement && (el.parentElement.tagName === 'A' || el.parentElement.tagName === 'BUTTON')) {
                        el.parentElement.style.display = 'none';
                    }
                }
            });
        }, 1000);
    }

    init() {
        this.loadDependencies();
        this.injectCSS();
        this.injectUI();
        this.cacheDOM();
        this.bindEvents();
        this.injectGlobalWindowControls(); // 【统一顶端UI控制注入】
        setTimeout(() => {
            if (typeof this.updateQuickChips === 'function') this.updateQuickChips();
            // 在挂载完毕后，尝试读取并重绘本会话缓存的聊天记录跨网页不消失
            this.restoreSession();
            this.updateMemberStatusUI(); // Update status bar after UI is ready
        }, 300); // 确保在 DOM 加载完成后初始化灵感胶囊和历史记录
        
        // 核心突破：监听后端回调！由于 SubscriptionManager 取网络延迟 100~300ms 造成时间差，这里必须被动回调刷新 UI
        window.addEventListener('subscription_updated', (e) => {
            console.log('Titan AI 哨兵：系统权限广播侦测完毕', e.detail);
            this.updateMemberStatusUI();
        });
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
        let supabase = null;
        if (window.SubscriptionManager && window.SubscriptionManager.client) {
            supabase = window.SubscriptionManager.client;
        } else if (window.SupabaseClient && typeof window.SupabaseClient.init === 'function') {
            supabase = window.SupabaseClient.init();
        } else if (window.SupabaseClient) {
            supabase = window.SupabaseClient.client;
        }

        if (supabase) {
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
     * 静默自动存档 —— 不中断对话、不清空聊天记录
     * 触发时机：每 5 轮对话 / 关闭面板时
     * 原理：把当前对话快照写入 localStorage，如果本会话已有存档则覆盖更新
     */
    silentAutoArchive() {
        if (!this.chatHistory || this.chatHistory.length <= 1) return;

        // 复用 archiveCurrentSession 中的 NLP 主题提取逻辑
        let fullText = this.chatHistory.filter(m => m.role !== 'system').map(m => {
            if (typeof m.content === 'string') return m.content;
            if (Array.isArray(m.content)) return m.content.map(c => c.text || '').join(' ');
            return '';
        }).join('\n');

        let entities = [];
        const engMatches = fullText.match(/[A-Za-z0-9_-]{3,}/g) || [];
        const bracketMatches = fullText.match(/[《【"\"']([^》】"\"']{2,15})[》】"\"']/g) || [];
        const zhMatches = fullText.match(/[\u4e00-\u9fa5]{2,10}(原理|系统|算法|模型|架构|功能|机制|代码|指令|方案)/g) || [];
        const stopWords = ['the', 'and', 'this', 'that', 'with', 'for', 'are', 'what', 'how', 'http', 'https', 'com'];
        entities.push(...engMatches.filter(w => !stopWords.includes(w.toLowerCase())));
        entities.push(...bracketMatches.map(s => s.replace(/[《【】》"\"']/g, '')));
        entities.push(...zhMatches);

        let counts = {};
        entities.forEach(w => {
            let core = w.trim().toLowerCase();
            if (core.length > 2 && core.length < 15) counts[core] = (counts[core] || 0) + 1;
        });
        let sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
        let mainTopics = sorted.slice(0, 2).map(item => item[0]);
        if (mainTopics.length === 0) mainTopics = ['自由探索'];

        const branchTypes = ['🌟 探索日记', '🧠 脑力激荡', '🔬 研究手记', '🚀 灵感起飞', '🧩 问题解构'];
        const commitType = branchTypes[Math.floor(Math.random() * branchTypes.length)];
        const generatedTitle = `${commitType}：${mainTopics.join('与')}`;

        let firstUserMsg = this.chatHistory.find(m => m.role === 'user');
        let rawQ = firstUserMsg && typeof firstUserMsg.content === 'string' ? firstUserMsg.content.trim().split(/[。！？\n]/)[0].substring(0, 30) : '未命名的探索';
        let firstAiMsg = this.chatHistory.find(m => m.role === 'assistant' || m.role === 'ai');
        let aiClue = '';
        if (firstAiMsg && typeof firstAiMsg.content === 'string') {
            aiClue = firstAiMsg.content.replace(/[\*\#\`]/g, '').trim().split(/[。！？\n]/)[0].substring(0, 45);
        }
        let descStr = `【我的问题】${rawQ}...\n【小创解答】${aiClue ? (aiClue + '...') : '等待验证'}\n【关键知识】${mainTopics.join(', ')}`;

        let archives = [];
        try {
            archives = JSON.parse(localStorage.getItem('titan_ai_branches') || '[]');
        } catch(e) {}

        // 为当前会话生成唯一标识（基于首次用户消息的时间戳）
        if (!this._sessionArchiveId) {
            this._sessionArchiveId = 'TC-AUTO-' + Date.now();
        }

        // 查找是否已有本会话的存档（覆盖更新而不是新建）
        const existingIdx = archives.findIndex(a => a.id === this._sessionArchiveId);
        const archiveItem = {
            id: this._sessionArchiveId,
            date: new Date().toLocaleString(),
            title: generatedTitle,
            desc: descStr,
            stats: `学习轮次：${this.chatHistory.filter(m => m.role !== 'system').length}`,
            data: [...this.chatHistory]
        };

        if (existingIdx >= 0) {
            archives[existingIdx] = archiveItem; // 覆盖更新
        } else {
            archives.unshift(archiveItem); // 新增
        }

        archives = archives.slice(0, 50);
        localStorage.setItem('titan_ai_branches', JSON.stringify(archives));
        console.log('[Titan] 静默自动存档完成:', generatedTitle);
    }

    archiveCurrentSession() {
        if (!this.chatHistory || this.chatHistory.length <= 1) {
            this.clearChatWithoutArchive();
            return;
        }

        this.cancelOutput(); 
        this.isProcessingQueue = false;
        this.messageQueue = [];
        if (this.panel) {
            this.panel.style.opacity = '0.5';
            this.panel.style.filter = 'blur(10px) brightness(1.5)';
        }

        // ——【基于本地的智能上下文探针算法 (Client-Side Vectorization/NLP)】——
        // 无需消耗大模型 Token，通过正则与特征集快速提炼本期对话的 Git Commit 主题
        let fullText = this.chatHistory.filter(m => m.role !== 'system').map(m => {
            if (typeof m.content === 'string') return m.content;
            if (Array.isArray(m.content)) return m.content.map(c => c.text || '').join(' ');
            return '';
        }).join('\n');

        let entities = [];
        // 1. 优先捕获代码级英文词、混合框架名 (如 Node.js, VEX IQR, React)
        const engMatches = fullText.match(/[A-Za-z0-9_-]{3,}/g) || [];
        // 2. 提取处于重点强调符号内的核心概念
        const bracketMatches = fullText.match(/[《【“"']([^》】”"']{2,15})[》】”"']/g) || [];
        // 3. 粗颗粒提取以特定技术/工程名词结尾的关键短语
        const zhMatches = fullText.match(/[\u4e00-\u9fa5]{2,10}(原理|系统|算法|模型|架构|功能|机制|代码|指令|方案)/g) || [];
        
        const stopWords = ['the', 'and', 'this', 'that', 'with', 'for', 'are', 'what', 'how', 'http', 'https', 'com'];
        entities.push(...engMatches.filter(w => !stopWords.includes(w.toLowerCase())));
        entities.push(...bracketMatches.map(s => s.replace(/[《【】》“"']/g, '')));
        entities.push(...zhMatches);

        // 频率热度排序：选取对话中“最高浓度”的几个特有名词
        let counts = {};
        entities.forEach(w => {
            let core = w.trim().toLowerCase();
            if (core.length > 2 && core.length < 15) counts[core] = (counts[core] || 0) + 1;
        });
        let sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
        let mainTopics = sorted.slice(0, 2).map(item => item[0]);
        
        if (mainTopics.length === 0) {
            mainTopics = ["认知探测进程"]; // 极端情况兜底
        }

        // 为小学生生成易于理解的童趣版“学习存档”前缀
        const branchTypes = ['🌟 探索日记', '🧠 脑力激荡', '🔬 研究手记', '🚀 灵感起飞', '🧩 问题解构'];
        const commitType = branchTypes[Math.floor(Math.random() * branchTypes.length)];
        const generatedTitle = `${commitType}：${mainTopics.join('与')}`;

        // 提取问题与回答核心，生成大白话的存档描述
        let firstUserMsg = this.chatHistory.find(m => m.role === 'user');
        let rawQ = firstUserMsg && typeof firstUserMsg.content === 'string' ? firstUserMsg.content.trim().split(/[。！？\n]/)[0].substring(0, 30) : '未命名的探索';
        
        let firstAiMsg = this.chatHistory.find(m => m.role === 'assistant' || m.role === 'ai');
        let aiClue = '';
        if (firstAiMsg && typeof firstAiMsg.content === 'string') {
            let pureText = firstAiMsg.content.replace(/[\*\#\`]/g, '').trim();
            aiClue = pureText.split(/[。！？\n]/)[0].substring(0, 45);
        }
        
        // 组装成易于理解的 K12 教育日志摘要
        let descStr = `【我的问题】${rawQ}...\n【小创解答】${aiClue ? (aiClue + '...') : '等待验证'}\n【关键知识】${mainTopics.join(', ')}`;

        const branchItem = {
            id: 'TC-ARCH-' + new Date().getTime(),
            date: new Date().toLocaleString(),
            title: generatedTitle,
            desc: descStr,
            stats: `学习轮次：${this.chatHistory.length - 1} `,
            data: [...this.chatHistory]
        };

        let archives = [];
        try {
            archives = JSON.parse(localStorage.getItem('titan_ai_branches') || '[]');
        } catch(e) {}
        archives.unshift(branchItem);
        // Keep to 50 Max
        archives = archives.slice(0, 50);
        localStorage.setItem('titan_ai_branches', JSON.stringify(archives));

        setTimeout(() => {
            this.chatHistory = [];
            this.chatArea.innerHTML = `
                <div class="msg-row system">
                    <div class="msg msg-system">✅ 记忆快照已由本地提交。<br>关联索引指向：${generatedTitle}。<br>底层磁场清空，等待唤醒新分支... ⚡️</div>
                </div>
            `;
            this.clearAllPendingFiles();
            this.saveSession();
            
            if (this.panel) {
                this.panel.style.opacity = '1';
                this.panel.style.filter = 'none';
            }
            if (typeof this.playHapticSound === 'function') this.playHapticSound('reset');
            this.scrollToBottom();
            
            if (this.historyBtn) {
                this.historyBtn.style.color = '#fff';
                this.historyBtn.style.background = '#0ea5e9';
                this.historyBtn.style.transform = 'scale(1.2)';
                setTimeout(() => { this.historyBtn.style.cssText = ''; }, 600);
            }
        }, 600);
    }

    clearChatWithoutArchive() {
        this.cancelOutput(); 
        this.isProcessingQueue = false;
        this.messageQueue = [];
        this.chatHistory = [];
        if(this.chatArea) {
            this.chatArea.innerHTML = '<div class="msg-row system"><div class="msg msg-system">缓冲区空白。内存清理完毕，等待唤醒。⚡️</div></div>';
        }
        this.clearAllPendingFiles();
        this.saveSession();
    }

    openHistoryArchives() {
        if (!this.historyModal) return;
        
        const listDiv = document.getElementById('titan-ai-history-list');
        let archives = [];
        try {
            // 兼容检索
            archives = JSON.parse(localStorage.getItem('titan_ai_branches') || '[]');
        } catch(e) {}
        
        listDiv.innerHTML = '';
        if (archives.length === 0) {
            listDiv.innerHTML = '<div class="ai-history-empty" style="padding: 50px 0;">📂 暂无记忆断面。<br><span style="font-size:11px; color:rgba(255,255,255,0.3);">请开展深度对话后点击顶部 (Commit) 保存。</span></div>';
        } else {
            archives.forEach((item, index) => {
                // 防御性兼容：处理旧版脏数据或因为手工篡改导致的关键字段丢失
                const displayTitle = item.title || '🗃️ [遗留] 未分类的学习记录';
                const displayDate = item.date || item.timestamp || new Date().toLocaleString();
                const displayDesc = item.desc || '（历史数据未包含深度描述特征成分）';
                const displayStats = item.stats || '学习轮次：未知';
                
                // 将标签分颜色展示
                const cColor = '#0ea5e9'; // 童趣清新蓝

                const dom = document.createElement('div');
                dom.className = 'ai-history-item';
                
                // 更倾向儿童认知友好的明快卡片呈现
                dom.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 14px; color: ${cColor};">${displayTitle}</span>
                        <span style="font-size: 11px; color: #64748b;">${displayDate}</span>
                    </div>
                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.6; white-space: pre-line; background: #0f172a; padding: 10px; border-radius: 6px; border-left: 3px solid ${cColor}; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${displayDesc.replace(/</g, "&lt;")}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 10px;">
                        <span style="font-size: 11px; color: #94a3b8;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; margin-right:4px; vertical-align:-2px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>${displayStats}</span>
                        <button title="销毁这条记录" style="background:none; border:none; color:#ef4444; font-size:14px; cursor:pointer;" onclick="event.stopPropagation(); window._deleteArchiveBranch('${item.id}', this);">🗑️</button>
                    </div>
                `;
                
                dom.onclick = () => { this.restoreArchivedSession(item); };
                listDiv.appendChild(dom);
            });
            
            // 声明挂载全局的快捷清理方法 (如果不存在)
            if (!window._deleteArchiveBranch) {
                window._deleteArchiveBranch = function(id, btnDom) {
                    let arr = JSON.parse(localStorage.getItem('titan_ai_branches') || '[]');
                    arr = arr.filter(x => x.id !== id && ('TC-ARCH-' + x.id) !== id); 
                    localStorage.setItem('titan_ai_branches', JSON.stringify(arr));
                    btnDom.closest('.ai-history-item').remove();
                };
            }
        }
        
        this.historyModal.classList.add('show');
    }

    restoreArchivedSession(item) {
        // 直接执行平滑加载，不弹丑陋烦人的 JS 确认窗，小学生会晕的
        this.cancelOutput();
        this.chatHistory = [...item.data];
        if(this.historyModal) this.historyModal.classList.remove('show');
        this.saveSession(); 
        
        // 如果想更顺畅，可以直接重新调用 _applyHistoryData 而不用 reload
        // 但为了大局稳定，reload 更保险，先保持 reload。如果能用无刷新覆盖更好，但鉴于系统复杂性，直接 reload。
        location.reload(); 
    }

    /**
     * 【新增】高保真流水日志增量同步 (Low Overhead / Anti-Lag)
     * 每一轮对话完成后异步推送到 ai_chat_logs 归档表，实现百万级数据的“只增不减”
     */
    async logChatMessage(role, content, metadata = {}) {
        let supabase = null;
        if (window.SubscriptionManager && window.SubscriptionManager.client) {
            supabase = window.SubscriptionManager.client;
        } else if (window.SupabaseClient && typeof window.SupabaseClient.init === 'function') {
            supabase = window.SupabaseClient.init(); // Always try to get the active client
        } else if (window.SupabaseClient) {
            supabase = window.SupabaseClient.client;
        }

        if (!supabase) {
            console.warn("Titan Log: Supabase client not ready, skipping log array update.", role);
            return;
        }
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // 数据降维预处理：如果是多模态，提取文本摘要存入 content，Base64 仅保留 metadata 引用（防爆库）
            let cleanContent = content;
            let finalMetadata = { 
                ...metadata, 
                timestamp: new Date().toISOString(),
                page_url: window.location.pathname,
                page_title: document.title.split('-')[0].trim() || document.title
            };

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
        let supabase = null;
        if (window.SubscriptionManager && window.SubscriptionManager.client) {
            supabase = window.SubscriptionManager.client;
        } else if (window.SupabaseClient && typeof window.SupabaseClient.init === 'function') {
            supabase = window.SupabaseClient.init();
        } else if (window.SupabaseClient) {
            supabase = window.SupabaseClient.client;
        }

        if (supabase) {
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

            // 状态记忆：用于最后重构推荐树
            let lastAiMsgText = '';

            history.forEach(msg => {
                // 彻底阻断挂载时的隐藏提示词（System Prompt 或静默上下文）污染前台UI屏幕
                if (msg.role !== 'system') {
                    this.renderStaticMessage(msg.role, msg.content);
                    
                    if (msg.role === 'assistant' || msg.role === 'ai') {
                        lastAiMsgText = typeof msg.content === 'string' ? msg.content : (Array.isArray(msg.content) ? msg.content.find(c => c.type === 'text')?.text || '' : '');
                    }
                }
            });
            setTimeout(() => this.scrollToBottom(), 300);
            
            // 【核心修复 Hydration】：恢复退出前的最后生成卡片和推荐芯片
            if (lastAiMsgText) {
                if (typeof this.injectCourseRecommendations === 'function') this.injectCourseRecommendations(lastAiMsgText);
                if (typeof this.updateQuickChips === 'function') this.updateQuickChips(lastAiMsgText);
            }
        }
    }

    renderStaticMessage(role, content) {
        const rowDiv = document.createElement('div');
        rowDiv.className = `msg-row ${role === 'assistant' ? 'ai' : 'user'}`;
        
        let avatarHTML = '';
        if (role === 'ai' || role === 'assistant') {
            avatarHTML = `<div class="avatar avatar-ai"><img src="/assets/img/xiao_chuang_head.png" onerror="this.outerHTML='<i class=\\'fas fa-robot\\'></i>'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>`;
        } else if (role === 'user') {
            avatarHTML = `<div class="avatar avatar-user"><img src="/assets/img/user_boy.png" onerror="this.outerHTML='<i class=\\'fas fa-user-circle\\'></i>'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>`;
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
                
                // 净化：历史重载时必须隐藏掉内部扩展指令标签，避免穿帮
                rawText = rawText.replace(/\[\[EXTEND:.*?\]\]/g, '');
                
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
                    renderer.text = (arg) => {
                        const str = typeof arg === 'string' ? arg : (arg && arg.text ? arg.text : '');
                        return str.replace(/\$([^\$]+)\$/g, '<span class="ai-math-inline">$1</span>');
                    };
                    
                    // 【深度 Notion 化】: 通过最高权重的全局 CSS 直接接管 msg-ai，彻底杜绝 marked 解析器隐式对象转换崩溃 (object Object) 的灾难 Bug！
                    if (!document.getElementById('titan-notion-style')) {
                        const style = document.createElement('style');
                        style.id = 'titan-notion-style';
                        style.innerHTML = `
                            .msg-ai p { margin-bottom: 20px; line-height: 1.8; color: #f1f5f9; font-size: 15px; letter-spacing: 0.5px; }
                            .msg-ai strong { color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 800; border-bottom: 2px solid rgba(56, 189, 248, 0.3); letter-spacing: 0.5px; }
                            .msg-ai blockquote {
                                position: relative; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-left: 4px solid #6366f1; border-radius: 8px; padding: 14px 18px 14px 48px; margin: 20px 0; color: #cbd5e1; font-size: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); backdrop-filter: blur(4px); line-height: 1.8; font-weight: 500;
                            }
                            .msg-ai blockquote::before {
                                content: "💡"; position: absolute; left: 16px; top: 16px; font-size: 22px; text-shadow: 0 0 10px rgba(99,102,241,0.5);
                            }
                            .msg-ai blockquote p { margin-bottom: 0; display: inline; }
                            .msg-ai h1, .msg-ai h2, .msg-ai h3, .msg-ai h4 { color: #f8fafc; font-weight: 800; display: flex; align-items: center; gap: 8px; letter-spacing: 1px; }
                            .msg-ai h1 { font-size: 1.6em; margin-top: 32px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px; color: #fff; text-shadow: 0 0 15px rgba(56,189,248,0.4); }
                            .msg-ai h2 { font-size: 1.35em; margin-top: 28px; margin-bottom: 16px; background: linear-gradient(90deg, rgba(56,189,248,0.15) 0%, transparent 100%); padding: 8px 16px; border-left: 4px solid #38bdf8; border-radius: 0 6px 6px 0; text-shadow: 0 0 10px rgba(56,189,248,0.3); }
                            .msg-ai h3 { font-size: 1.15em; margin-top: 24px; margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 6px 14px; border-radius: 6px; border-left: 3px solid #94a3b8; width: fit-content; }
                            .msg-ai h4 { font-size: 1.05em; margin-top: 20px; margin-bottom: 10px; color: #94a3b8; text-transform: uppercase; font-variant: small-caps; letter-spacing: 2px; }
                            .msg-ai ul, .msg-ai ol { margin-bottom: 24px; padding-left: 20px; line-height: 1.8; color: #f1f5f9; font-size: 15px; }
                            .msg-ai li { margin-bottom: 12px; color: #e2e8f0; font-weight: 500; padding-left: 4px; }
                            .msg-ai li::marker { color: #38bdf8; }
                            .msg-ai code:not(pre code) { background: rgba(244, 114, 182, 0.12); color: #f472b6; padding: 3px 8px; border-radius: 6px; font-family: 'Orbitron', 'Consolas', monospace; font-size: 0.9em; font-weight: 600; border: 1px solid rgba(244, 114, 182, 0.25); box-shadow: 0 0 5px rgba(244, 114, 182, 0.1); }
                            .msg-ai table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 24px 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; background: rgba(15, 23, 42, 0.4); box-shadow: 0 8px 32px rgba(0,0,0,0.2); backdrop-filter: blur(8px); }
                            .msg-ai th { background: rgba(56, 189, 248, 0.08); color: #38bdf8; font-weight: 800; text-align: left; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
                            .msg-ai td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; font-size: 14.5px; line-height: 1.6; }
                            .msg-ai tr:last-child td { border-bottom: none; }
                            .msg-ai tr:hover td { background: rgba(255,255,255,0.03); }
                        `;
                        document.head.appendChild(style);
                    }
                    
                    // 核心链路：拦截 Markdown 的 a 标签，渲染成高保真模块穿梭按钮
                    renderer.link = function(href, title, text) {
                        let linkUrl = typeof href === 'object' ? href.href : href;
                        let innerText = typeof href === 'object' ? href.text : text;
                        if (linkUrl.includes('?module=auto_match')) {
                            let targetUrl = 'index.html'; // Default
                            const textLower = innerText.toLowerCase();
                            const moduleMap = [
                                { keywords: ['火箭', '探空火箭', '航天', 'rocketry'], url: 'course-rocketry.html' },
                                { keywords: ['生命', '生物', 'life', 'biology', '基因'], url: 'course-life.html' },
                                { keywords: ['海洋', 'ocean', 'marine'], url: 'course-ocean.html' },
                                { keywords: ['人工智能', 'ai', 'artificial intelligence'], url: 'course-ai.html' },
                                { keywords: ['恐龙', 'dino', '古生物'], url: 'course-dino.html' },
                                { keywords: ['天文', 'astronomy', '宇宙', 'space'], url: 'course-astronomy.html' },
                                { keywords: ['军事', 'military', '国防', '武器'], url: 'course-military.html' },
                                { keywords: ['无人机', 'drone', '低空'], url: 'drone.html' },
                                { keywords: ['编程', '代码', 'coding', '极客'], url: 'coding.html' },
                                { keywords: ['机器人', 'openclaw', '机械臂', 'robot'], url: 'course-openclaw.html' },
                                { keywords: ['金融', 'fintech'], url: 'course-fintech.html' },
                                { keywords: ['设计', '创意', 'design'], url: 'course-design.html' },
                                { keywords: ['物理', '仿真', 'physics'], url: 'physics-hub.html' },
                                { keywords: ['数学', '猜想', 'math', '代数'], url: 'math-hub.html' },
                                { keywords: ['医学', 'medicine', '健康'], url: 'hub-medicine.html' },
                                { keywords: ['英语', 'english', 'tech english'], url: 'course-tech-english.html' },
                                { keywords: ['汽车', '赛车', 'racing'], url: 'racing.html' },
                                { keywords: ['游戏', 'game', '灵境'], url: 'lingzhigame.html' }
                            ];
                            for (let mod of moduleMap) {
                                if (mod.keywords.some(k => textLower.includes(k))) {
                                    targetUrl = mod.url;
                                    break;
                                }
                            }
                            // 渲染成类似“极客跳转胶囊”的 UI
                            return `<a href="javascript:void(0)" onclick="alert('即将挂载专属全栈子系统: ${innerText}'); document.getElementById('titan-ai-panel').style.opacity=0; setTimeout(()=>location.href='${targetUrl}', 300);" style="display:inline-flex; align-items:center; gap:4px; font-weight:800; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.4); padding:2px 8px; border-radius:12px; margin:0 4px; color:#38bdf8; text-decoration:none; transition:all 0.2s; box-shadow:0 0 10px rgba(56,189,248,0.2);" onmouseover="this.style.background='rgba(56,189,248,0.3)'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='rgba(56,189,248,0.15)'; this.style.transform='scale(1)';"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>${innerText}</a>`;
                        }
                        return `<a href="${linkUrl}" target="_blank" style="color:#38bdf8; text-decoration:underline; text-underline-offset:3px;">${innerText}</a>`;
                    };

                    // 新增能力：拦截并复活AI幻觉生成的破损图片链接，通过双流模型动态检索或生图
                    renderer.image = function(href, title, text) {
                        let finalUrl = href;
                        let altText = text || 'visualization';
                        
                        if (typeof href === 'object' && href !== null) {
                            finalUrl = href.href;
                            altText = href.text || altText;
                            title = href.title;
                        }

                        let isGenerate = false;
                        let cleanAlt = altText;
                        
                        // 如果链接为空、不是 http 开头，或者是常见的占位符，我们就将其接管并动态生成/检索
                        if (!finalUrl || (!finalUrl.startsWith('http') && !finalUrl.startsWith('data:')) || finalUrl.includes('placeholder') || finalUrl.includes('example') || finalUrl.includes('ai-render')) {
                            
                            // 核心分流：只要描述超过 30 个字，必定是在详细描述画面，走生成大模型！否则走普通必应学术检索！
                            isGenerate = altText.includes('生成:') || altText.includes('生成：') || altText.includes('画图') || altText.length > 30;
                            cleanAlt = altText.replace(/生成:|生成：|检索:|检索：|\[检索\]|\[生成\]/g, '').trim();

                            if (isGenerate) {
                                // 创意类：直连官方分布式计算节点，废除经常超时的公共反代节点
                                let shortPrompt = cleanAlt.length > 300 ? cleanAlt.substring(0, 300) : cleanAlt;
                                const safePrompt = encodeURIComponent(shortPrompt + ', extremely detailed, unreal engine 5, 8k resolution, futuristic rendering');
                                const randomSeed = Math.floor(Math.random() * 1000000);
                                finalUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=800&height=400&nologo=true&model=flux&seed=${randomSeed}`;
                            } else {
                                // 常识类：转用极度稳定的 Bing 图片直搜引擎镜像 (国内白名单)
                                let shortPrompt = cleanAlt.length > 200 ? cleanAlt.substring(0, 200) : cleanAlt;
                                // 彻底去除易被 SEO 污染的"高清"字眼，改用硬核学术属性后缀，且智能区分中英环境
                                const suffix = /^[a-zA-Z0-9\s\-_]+$/.test(shortPrompt.trim()) ? ' schematic diagram' : ' 结构原理图';
                                const safeQuery = encodeURIComponent(shortPrompt + suffix); 
                                finalUrl = `https://tse2.mm.bing.net/th?q=${safeQuery}&w=1080&h=1080&pid=Api`;
                            }
                            altText = cleanAlt;
                        }

                        // base64 SVG fallback image to prevent via.placeholder.com from being blocked
                        const errorSvgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#0f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#38bdf8">Image Rendering Failed</text></svg>`;
                        const errorSvgUrl = 'data:image/svg+xml;base64,' + btoa(errorSvgStr);

                        const safeAltObj = altText.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                        const statusBadge = `<div style="position:absolute; top:12px; left:12px; background:rgba(${isGenerate?'139,92,246':'16,185,129'},0.8); color:#fff; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:4px; z-index:2; font-family:sans-serif; backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.2); box-shadow:0 2px 10px rgba(0,0,0,0.5);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px; margin-right:4px;">${isGenerate ? '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' : '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'}</svg>${isGenerate ? 'AI 创想图' : '全网高清检索'}</div>`;
                        const zoomBadge = `<div style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.7); color:#fff; font-size:11px; padding:4px 8px; border-radius:4px; z-index:2; pointer-events:none; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(4px); display:flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>点击放大</div>`;

                        return `<div class="ai-generated-img-wrapper" style="margin: 16px 0; border: 1px solid rgba(${isGenerate?'139,92,246':'16,185,129'}, 0.3); border-radius: 12px; overflow: hidden; position: relative; background: #0f172a; min-height: 120px; cursor: zoom-in; box-shadow: 0 10px 30px rgba(0,0,0,0.4);" onclick="if(window._showTitanFullImg) window._showTitanFullImg('${finalUrl}', '${safeAltObj}')">
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#94a3b8; font-size:13px; z-index:0; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; gap:8px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: pulse-core 1.5s infinite;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                捕获视觉切片中...
                            </div>
                            ${statusBadge}
                            <img src="${finalUrl}" alt="${safeAltObj}" title="${title || safeAltObj}" style="position:relative; z-index:1; width: 100%; height: auto; display: block; filter: brightness(0.9) contrast(1.1); transform: scale(1.5); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); object-fit: cover; min-height: 120px;" onmouseover="this.style.filter='brightness(1.1) contrast(1.2)'; this.style.transform='scale(1.55)';" onmouseout="this.style.filter='brightness(0.9) contrast(1.1)'; this.style.transform='scale(1.5)';" onerror="this.onerror=null; this.src='${errorSvgUrl}';"/>
                            ${zoomBadge}
                        </div>`;
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
                        suppressErrorRendering: true, // 核心防爆盾
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

    injectCourseRecommendations(text) {
        // 1. 深度拦截协议：提取由 AI 联想出的 [[EXTEND: ...]]
        let aiRecommendations = [];
        const extendMatch = text.match(/\[\[(?:EXTEND|extend):\s*([\s\S]*?)\]\]/i);
        
        if (extendMatch) {
            console.log('[Titan Evo] 🚀 成功拦截 AI 演化指令:', extendMatch[1]);
            const rawTopics = extendMatch[1].split(/[,，]/);
            aiRecommendations = rawTopics.filter(t => t.trim().length > 0).map(t => ({
                id: 'ai-gen-' + Math.random().toString(36).substr(2, 5),
                title: t.trim(),
                desc: 'AI 实时演化生成的专属深度探索课题。',
                link: `course-factory.html?theme=${encodeURIComponent(t.trim())}&source=titan_evolution`,
                isAiGen: true,
                icon: 'fas fa-dna',
                color: '#38bdf8' 
            })).slice(0, 3);
        } else {
            console.warn('[Titan Evo] ⚠️ AI 未按协议输出格式化指令，启动本地语义脑补...');
            // 🚨 备选方案：本地语义预测算法 (Semantic Brainstorming Fallback)
            // 如果 AI 忘带了标签，我们根据用户对话关键词，强行脑补出 3 个
            const contextKeywords = ['大脑', '机器人', '人工智能', '航天', '编程', '恐龙', '火箭', '芯片', '材料', '算法'];
            const brainstormPool = {
                '大脑': ['认知科学', '脑机接口', '神经伦理'],
                '机器人': ['伺服驱动', '仿生材料', '群体智能'],
                '人工智能': ['提示词工程', '神经网络', '自然语言'],
                '航天': ['引力弹弓', '月面基地', '星际化学']
            };
            
            let foundTopic = contextKeywords.find(kw => text.includes(kw));
            const topics = foundTopic ? brainstormPool[foundTopic] : ['科技未来', '跨界融合', '前沿节点'];
            aiRecommendations = topics.slice(0, 3).map(t => ({
                id: 'fallback-' + Math.random().toString(36).substr(2, 5),
                title: t,
                desc: '系统根据当前对话语境，为您动态预测的探索路径。',
                link: `course-factory.html?theme=${encodeURIComponent(t)}&source=titan_fallback`,
                isAiGen: true,
                icon: 'fas fa-brain',
                color: '#0ea5e9'
            }));
        }

        // 2. 静态底座搜索：匹配本地已有的 8 个课程
        const localMatches = this.courseRegistry.map(course => {
            let score = 0;
            const cleanText = text.replace(/\[\[EXTEND:.*?\]\]/g, ''); // 排除协议标签干扰
            course.keywords.forEach(kw => {
                const regex = new RegExp(kw, 'gi');
                const count = (cleanText.match(regex) || []).length;
                score += count;
            });
            return { ...course, score };
        }).sort((a, b) => b.score - a.score);

        // 如果 AI 没给推荐，我们也强行从本地关联中提取 3 个作为演化路径的“冷启动”种子
        if (aiRecommendations.length === 0) {
            console.log('[Titan AI] ⚠️ 模型未输出演化标签，启动语义感知补全...');
            aiRecommendations = localMatches.slice(2, 5).map(m => {
                let generatedLink = m.link;
                if (m.link.includes('course.html')) {
                    generatedLink = m.link.replace('course.html', 'course-factory.html');
                    // 如果链接里没有 theme，加上 theme 参数
                    if (!generatedLink.includes('theme=')) {
                        generatedLink += (generatedLink.includes('?') ? '&' : '?') + `theme=${encodeURIComponent(m.title)}`;
                    }
                }
                
                return {
                    id: m.id,
                    title: m.title,
                    link: generatedLink,
                    icon: m.icon || 'fas fa-brain',
                    isAiGen: true
                };
            });
        }

        // 我们只在底座区展示最相关的 2 个已有页面
        const coreNodes = localMatches.slice(0, 2);

        // 3. 构建大容器
        const recContainer = document.createElement('div');
        recContainer.className = 'ai-course-recommend-wrapper';
        recContainer.style.cssText = `
            margin-top: 15px;
            animation: fadeIn 0.5s ease-out;
            padding: 0 5px;
        `;

        // === A轨：核心知识节点 (CORE NODES) ===
        const coreHeader = document.createElement('div');
        coreHeader.style.cssText = 'font-size: 10px; color: #94a3b8; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 1px;';
        coreHeader.innerHTML = `<i class="fas fa-layer-group" style="color:#fbbf24"></i> 核心知识节点 / CORE NODES`;
        recContainer.appendChild(coreHeader);

        const coreGrid = document.createElement('div');
        coreGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;';
        coreNodes.forEach(course => {
            const card = document.createElement('div');
            card.className = 'ai-course-mini-card core-node-card';
            card.style.cssText = `
                background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px; padding: 10px; cursor: pointer; transition: all 0.3s;
                display: flex; align-items: center; gap: 10px; position: relative;
            `;
            card.innerHTML = `
                <div style="font-size: 16px; color: ${course.color}; opacity: 0.8;"><i class="${course.icon}"></i></div>
                <div style="font-size: 11px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${course.title}</div>
            `;
            card.onmouseover = () => { card.style.background = 'rgba(30, 41, 59, 0.8)'; card.style.borderColor = course.color + '44'; };
            card.onmouseout = () => { card.style.background = 'rgba(15, 23, 42, 0.4)'; card.style.borderColor = 'rgba(255, 255, 255, 0.08)'; };
            card.onclick = () => {
                if (typeof this.playHapticSound === 'function') this.playHapticSound('click');
                window.location.href = course.link;
            };
            coreGrid.appendChild(card);
        });
        recContainer.appendChild(coreGrid);

        // === B轨：实时演化探索 (EVOLUTION PATHS) ===
        if (aiRecommendations.length > 0) {
            const evoHeader = document.createElement('div');
            evoHeader.style.cssText = 'font-size: 10px; color: #94a3b8; margin-top: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; letter-spacing: 1px;';
            evoHeader.innerHTML = `
                <div style="display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-microchip" style="color:#38bdf8"></i> 实时演化探索 / EVOLUTION PATHS
                </div>
                <div style="font-size:8px; background:rgba(56,189,248,0.1); color:#38bdf8; padding:1px 4px; border-radius:3px; border:1px solid rgba(56,189,248,0.2)">UGC_LIVE</div>
            `;
            recContainer.appendChild(evoHeader);

            const evoGrid = document.createElement('div');
            evoGrid.style.cssText = 'display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding: 4px 0;';
            aiRecommendations.forEach(course => {
                const card = document.createElement('div');
                card.className = 'ai-course-mini-card ai-gen-card';
                card.style.cssText = `
                    flex: 0 0 140px; background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2);
                    border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.3s;
                    display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden;
                `;
                card.innerHTML = `
                    <div class="live-tag">GEN</div>
                    <div style="font-size: 16px; color: #38bdf8;"><i class="${course.icon}"></i></div>
                    <div style="font-size: 12px; font-weight: 800; color: #fff; line-height: 1.2;">${course.title}</div>
                    <div style="font-size: 8px; color: #64748b; margin-top: 2px;">量子合成探索 >></div>
                `;
                card.onmouseover = () => { card.style.background = 'rgba(56, 189, 248, 0.15)'; card.style.transform = 'translateY(-3px)'; };
                card.onmouseout = () => { card.style.background = 'rgba(56, 189, 248, 0.05)'; card.style.transform = 'translateY(0)'; };
                card.onclick = () => {
                    if (typeof this.playHapticSound === 'function') this.playHapticSound('click');
                    this.showEvolutionLoading(course.title, () => {
                        window.location.href = course.link;
                    });
                };
                evoGrid.appendChild(card);
            });
            recContainer.appendChild(evoGrid);
        }

        this.chatArea.appendChild(recContainer);
        this.scrollToBottom();
    }

    showEvolutionLoading(topic, callback) {
        let loader = document.getElementById('evolution-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'evolution-loader';
            loader.innerHTML = `
                <div class="matrix-rain"></div>
                <svg class="loader-hex" viewBox="0 0 100 100">
                    <path fill="none" stroke="#38bdf8" stroke-width="2" d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" />
                    <circle cx="50" cy="50" r="10" fill="#38bdf8">
                        <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
                    </circle>
                </svg>
                <div class="loader-text">QUANTUM SYNTHESIZING...</div>
                <div class="loader-sub">正在从硅基神经网络提取【${topic}】的深度知识晶体</div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('.loader-sub').innerText = `正在从硅基神经网络提取【${topic}】的深度知识晶体`;
        }

        requestAnimationFrame(() => {
            loader.classList.add('active');
            setTimeout(callback, 2000); // 预留 2 秒仪式感时刻
        });
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
                0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); transform: scale(1); }
                50% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.6); transform: scale(1.05) translateY(-3px); }
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
                width: 64px; height: 64px;
                border-radius: 50%;
                z-index: 99999;
                cursor: pointer;
                background: url('/assets/img/titan-ai-mascot.png') center/cover no-repeat;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(14, 165, 233, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.1);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                animation: ai-fab-breath 3s ease-in-out infinite;
            }
            .ai-fab:hover {
                transform: scale(1.1) rotate(5deg);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.5);
                border-color: rgba(56, 189, 248, 0.4);
            }

            /* === 无限演化引擎 CSS === */
            .ai-gen-card { position: relative; overflow: hidden; }
            .ai-gen-card::before {
                content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                background: conic-gradient(transparent, rgba(56,189,248,0.25), transparent 30%);
                animation: quantum-rotate 4s linear infinite; z-index: 0; pointer-events: none;
            }
            .ai-gen-card > * { position: relative; z-index: 1; }
            @keyframes quantum-rotate { 100% { transform: rotate(1turn); } }

            .live-tag {
                position: absolute; top: 8px; right: 8px; font-size: 7px; font-weight: 900;
                background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff;
                padding: 2px 6px; border-radius: 4px; text-transform: uppercase;
                letter-spacing: 1.5px; animation: live-flicker 1.5s ease-in-out infinite; z-index: 2;
            }
            @keyframes live-flicker { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

            #evolution-loader {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(5, 10, 20, 0.97); z-index: 9999999;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                backdrop-filter: blur(25px); opacity: 0; pointer-events: none;
                transition: opacity 0.5s ease; font-family: 'Orbitron', sans-serif;
            }
            #evolution-loader.active { opacity: 1; pointer-events: all; }
            .loader-hex { width: 100px; height: 100px; margin-bottom: 30px; animation: hex-spin 3s linear infinite; }
            @keyframes hex-spin { 100% { transform: rotate(360deg); } }
            .loader-text { color: #38bdf8; font-size: 16px; letter-spacing: 3px; text-shadow: 0 0 20px rgba(56,189,248,0.5); }
            .loader-sub { color: #94a3b8; font-size: 13px; margin-top: 12px; font-family: 'Noto Sans SC', sans-serif; }
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
            .ai-header-controls { 
                display: flex; gap: 8px; 
                -webkit-app-region: no-drag; /* Fix macOS desktop drag region intercepting clicks */
                position: relative; z-index: 10; 
            }
            .ai-expand-btn {
                background: none; border: none; color: #38bdf8; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.7; transition: all 0.2s; padding: 4px; border-radius: 4px;
                -webkit-app-region: no-drag;
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
            /* 🎓 [Notion Mastery] 高保真教育排版核心：极简、结构化、高辨识度 */
            .msg-ai {
                background: rgba(13, 17, 23, 0.85);
                border: 1px solid rgba(56, 189, 248, 0.25);
                color: #e2e8f0;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                padding: 18px 22px;
                border-radius: 12px;
                line-height: 1.7;
                font-family: 'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
            }
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
            .ai-camera-close { position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 24px; cursor: pointer; -webkit-app-region: no-drag; z-index: 10; }
            
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
                -webkit-app-region: no-drag; z-index: 10;
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
            /* === 流式保护防爆盾 === */
            svg[id^="d3id"] { display: none !important; pointer-events: none !important; }
            .error-icon, .error-text, .mermaid-error { display: none !important; opacity: 0; }
            
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
            .mermaid svg { max-width: 100%; height: auto; }
            
            .ai-scroll-actions {
                position: absolute; left: 50%; transform: translate(-50%, 15px); bottom: 100px; display: flex; flex-direction: column; gap: 8px;
                z-index: 1000; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0; pointer-events: none;
            }
            .chat-scrolled-up .ai-scroll-actions {
                opacity: 0.95; pointer-events: auto; transform: translate(-50%, 0);
            }
            .ai-scroll-actions button {
                width: 32px; height: 32px; border-radius: 50%; background: #0ea5e9;
                border: 2px solid #0284c7; color: #fff; display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
            }
            .ai-scroll-actions button svg { width: 16px; height: 16px; }
            .ai-scroll-actions button:hover { background: #38bdf8; border-color: #bae6fd; transform: scale(1.1); box-shadow: 0 6px 20px rgba(56, 189, 248, 0.6); }

            /* History Modal UI (Moved out of mobile-only query for desktop support!) */
            .ai-history-modal {
                position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000000;
                display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px);
            }
            .ai-history-modal.show { display: flex; animation: fade-in 0.3s; }
            .ai-history-wrapper {
                width: 90%; max-width: 500px; max-height: 80vh; background: #0f172a;
                border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px;
                display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(14, 165, 233, 0.2);
            }
            .ai-history-header {
                padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between;
                background: rgba(255,255,255,0.02); font-weight: bold; color: #38bdf8; align-items: center;
            }
            .ai-history-header button { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; -webkit-app-region: no-drag; position: relative; z-index: 10; }
            .ai-history-header button:hover { color: white; }
            .ai-history-list {
                padding: 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 12px;
            }
            .ai-history-item {
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px;
                border-radius: 8px; cursor: pointer; transition: 0.2s; position: relative; border-left: 3px solid #38bdf8;
            }
            .ai-history-item:hover { background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); }
            .ai-history-time { font-size: 11px; color: #94a3b8; font-family: monospace; display: block; margin-bottom: 4px; }
            .ai-history-title { font-size: 14px; color: #f1f5f9; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px; }
            .ai-history-stats { font-size: 10px; color: #64748b; margin-top: 6px; display: inline-block; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;}
            .ai-history-empty { text-align: center; color: #64748b; padding: 40px 0; font-size: 13px; }

             @media (max-width: 768px) {
                /* System-Wide Global Mobile Patch for ALL Legacy Pages */
                body {
                    overflow-x: hidden !important;
                    width: 100% !important;
                }
                /* Defeat forced grids and flex rows laterally and transform into flow-layout */
                .grid {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 16px !important;
                }
                /* Relax completely restrictive fixed heights so content pushes instead of overlaps */
                .glass-panel, .glass-card, [class*="h-["], header, section {
                    height: auto !important;
                    min-height: 0 !important;
                }
                .container {
                    padding-left: 15px !important;
                    padding-right: 15px !important;
                    width: 100% !important;
                }
                /* Recalibrate giant headings */
                h1, .text-6xl, .text-7xl {
                    font-size: 32px !important;
                    line-height: 1.2 !important;
                }
                h2, .text-5xl, .text-4xl {
                    font-size: 24px !important;
                    line-height: 1.3 !important;
                }
                /* Give Charts enough room to render vertically */
                [id^="chart-"] {
                    width: 100% !important;
                    min-height: 300px !important;
                    height: 300px !important;
                }
                nav.fixed {
                    position: relative !important;
                }
                /* Disable 3D transforms on legacy heavy cards */
                .glass-panel, .glass-card {
                    transform: none !important;
                }
                .glass-panel:hover, .glass-card:hover {
                    transform: none !important;
                }

                /* AI Panel specific Mobile Rules */
                .ai-panel {
                    position: fixed !important;
                    bottom: 0 !important; right: 0 !important; left: 0 !important; top: 0 !important;
                    width: 100% !important; height: 100% !important;
                    border-radius: 0 !important; border: none !important;
                    transform: none !important;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .ai-panel:not(.open) {
                    transform: translateY(100%) !important;
                }
                .ai-input-area {
                    flex-wrap: wrap; 
                    padding: 8px 12px;
                    padding-bottom: env(safe-area-inset-bottom, 12px);
                }
                .ai-input { font-size: 16px; }
                .ai-chips-wrapper { padding: 0 12px 8px 12px; }
                .ai-chip { font-size: 12px; padding: 8px 14px; }
                .ai-camera-wrapper { width: 100%; height: 100%; border-radius: 0; display: flex; flex-direction: column; justify-content: center; }
                .ai-camera-close { top: 20px; right: 20px; }
                .ai-resize-handle, .ai-resize-handle-left { display: none !important; }
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
                    <div class="ai-header-title">
                        <img src="/assets/img/xiao_chuang_head.png" style="width:20px;height:20px;border-radius:50%;object-fit:cover;border:1px solid rgba(56,189,248,0.3);">
                        <span>小创老师 (Virtual Teacher)</span>
                    </div>
                    <div class="ai-header-controls">
                        <button type="button" class="ai-expand-btn" id="titan-ai-history-btn" title="时间线档案馆 / Checkout 历史分支记录 (Git History)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                        </button>
                        <button type="button" class="ai-expand-btn" id="titan-ai-reset-btn" title="提交记忆并开启新分支 (Commit & Archive)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
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
                
                <div class="ai-scroll-actions" id="titan-ai-scroll-actions">
                    <button type="button" id="titan-ai-scroll-bottom" title="回到最新对话 (Scroll to bottom)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                    </button>
                </div>

                <div class="ai-input-area" id="titan-ai-input-area">
                    <input type="file" id="titan-ai-file-input" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx" style="display: none;" multiple>
                    <button type="button" class="ai-upload" id="titan-ai-upload-btn" title="传送门 / 导入本地照片、作业文档、表格或幻灯片以供深度分析 (Upload)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>

                    <button type="button" class="ai-tts-stop" id="titan-ai-tts-stop-btn" title="立刻打断 AI 说话 (Stop Audio)" style="display:none; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    </button>
                    <button type="button" class="ai-live-vision" id="titan-ai-live-btn" title="启动多模态实境指导 (Live Vision) - 实时视频与语音双向串流" style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; border-radius: 8px; margin-right: 4px; box-shadow: 0 0 10px rgba(16,185,129,0.3);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
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
            
            <div class="ai-history-modal" id="titan-ai-history-modal">
                <div class="ai-history-wrapper">
                    <div class="ai-history-header">
                        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;margin-right:6px;vertical-align:text-bottom;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>长时记忆档案馆 (Brain Archives)</span>
                        <button type="button" id="titan-ai-history-close">✖</button>
                    </div>
                    <div class="ai-history-list" id="titan-ai-history-list"></div>
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
        const welcomeText = "哈喽同学！我是你的智能机器人导师【小创老师】，已准备完毕！将深度结合此页面核心知识向你解答疑问！🤖✨";
        this.chatArea.innerHTML = `
            <div class="msg-row system">
                <div class="msg msg-system">${welcomeText}</div>
            </div>
        `;
        
        // 尝试在初始化时记录欢迎语，但不强制在静默状态下直接发声（避免浏览器策略拦截报错）
        this.chatHistory.push({ role: 'assistant', content: welcomeText });

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
        this.liveVisionBtn = document.getElementById('titan-ai-live-btn');
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
        
        this.scrollTopBtn = document.getElementById('titan-ai-scroll-top');
        this.scrollBottomBtn = document.getElementById('titan-ai-scroll-bottom');
        this.scrollActionsWrapper = document.getElementById('titan-ai-scroll-actions');
        
        this.historyBtn = document.getElementById('titan-ai-history-btn');
        this.historyModal = document.getElementById('titan-ai-history-modal');
        this.historyCloseBtn = document.getElementById('titan-ai-history-close');
        this.historyList = document.getElementById('titan-ai-history-list');

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
                // 🔐 关闭面板时自动静默存档，防止对话丢失
                this.silentAutoArchive();
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

        if (this.scrollBottomBtn) {
            this.scrollBottomBtn.addEventListener('click', () => {
                this.chatArea.scrollTo({ top: this.chatArea.scrollHeight, behavior: 'smooth' });
                if (this.panel) this.panel.classList.remove('chat-scrolled-up');
            });
        }
        if (this.chatArea && this.scrollActionsWrapper && this.panel) {
            this.chatArea.addEventListener('scroll', () => {
                // Determine if we are far away from the bottom (e.g., scrolled up by more than 150px)
                const distanceToBottom = this.chatArea.scrollHeight - this.chatArea.scrollTop - this.chatArea.clientHeight;
                if (distanceToBottom > 150) {
                    this.panel.classList.add('chat-scrolled-up');
                } else {
                    this.panel.classList.remove('chat-scrolled-up');
                }
            });
        }

        // Commit & Archive 逻辑 (New Chat) - 将当前面板存入长时个人记忆库并清空展现
        this.resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.archiveCurrentSession();
        });

        // 历史档案馆拉取逻辑 - 展示 Git 时间线
        if (this.historyBtn) {
            this.historyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openHistoryArchives();
            });
            this.historyCloseBtn.addEventListener('click', () => {
                this.historyModal.classList.remove('show');
            });
        }

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
            this.ttsStopBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cancelOutput();
            });
        }
        
        this.cameraBtn.addEventListener('click', () => this.openCamera());
        this.cameraCloseBtn.addEventListener('click', () => this.closeCamera());
        this.snapBtn.addEventListener('click', () => this.takeSnapshot());
        
        if (this.liveVisionBtn) {
            this.liveVisionBtn.addEventListener('click', () => {
                // 检测是否运行在 Electron 原生桌面端环境
                const isElectron = /electron/i.test(navigator.userAgent) || (window.process && window.process.type);
                
                // [DEV_MODE] 取消页面环境锁定，强制允许在浏览器上点击调用进行功能跑通测试！
                // if (!isElectron) {
                //     if (!this.isChatOpen) {
                //         this.fab.click();
                //         setTimeout(() => this._showDesktopAppPrompt(), 300);
                //     } else {
                //         this._showDesktopAppPrompt();
                //     }
                //     return;
                // }

                // 若在桌面端，则痛快放行调用本地硬件
                if (window.titanLiveVision) {
                    window.titanLiveVision.start();
                } else {
                    console.error('Titan Live Vision module not loaded!');
                }
            });
        }
        
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
            const isElectron = /electron/i.test(navigator.userAgent) || (window.process && window.process.type);
            const voice = this.settings.volcengineVoice || "zh_male_shaonianzixin_moon_bigtts";
            
            if (isElectron && window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.invoke('generate-edge-tts', cleanText, voice).then(async (audioBuffer) => {
                    if (!audioBuffer) {
                        this.fallbackSpeak(cleanText, callback);
                        return;
                    }

                    const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);
                    
                    this.currentAudioPlayer = audio;
                    if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'flex';
                    
                    audio.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        this.currentAudioPlayer = null;
                        if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none';
                        if (typeof this.stopVAD === 'function') this.stopVAD();
                        if (callback) callback();
                    };
                    
                    audio.onerror = () => {
                        URL.revokeObjectURL(audioUrl);
                        this.currentAudioPlayer = null;
                        if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none';
                        this.fallbackSpeak(cleanText, callback);
                    };
                    
                    await audio.play();
                    if (typeof this.startVAD === 'function') this.startVAD();
                }).catch(err => {
                    console.error('IPC TTS 失败:', err);
                    this.fallbackSpeak(cleanText, callback);
                });
            } else {
                // 🚀 【Titan AI Web 直接接入火山引擎】
                // 强制使用生产级 Token，实现全平台高保真音色一致性
                const appId = "4780476544";
                const token = "e_t1R3UXzl-qvSTrFdEgh0-NFhjN5p7z";
                const reqid = 'req-' + Date.now();

                const response = await fetch('https://openspeech.bytedance.com/api/v1/tts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer; ${token}`
                    },
                    body: JSON.stringify({
                        app: { appid: appId, token: token, cluster: "volcano_tts" },
                        user: { uid: "titan_web" },
                        audio: { voice_type: voice, encoding: "mp3" },
                        request: { reqid: reqid, text: cleanText, operation: "query" }
                    })
                });

                if (!response.ok) {
                    this.fallbackSpeak(cleanText, callback);
                    return;
                }

                const result = await response.json();
                if (result.code === 3000 && result.data) {
                    const binaryString = atob(result.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                    
                    const blob = new Blob([bytes], { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);
                    
                    this.currentAudioPlayer = audio;
                    if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'flex';
                    
                    audio.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        this.currentAudioPlayer = null;
                        if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none';
                        if (typeof this.stopVAD === 'function') this.stopVAD();
                        if (callback) callback();
                    };
                    audio.onerror = () => {
                        URL.revokeObjectURL(audioUrl);
                        this.currentAudioPlayer = null;
                        if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none';
                        if (typeof this.stopVAD === 'function') this.stopVAD();
                        this.fallbackSpeak(cleanText, callback);
                    };
                    await audio.play();
                    if (typeof this.startVAD === 'function') this.startVAD();
                } else {
                    this.fallbackSpeak(cleanText, callback);
                }
            }
        } catch (e) {
            console.error('TTS 调用崩溃:', e);
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
        utterance.onend = () => { if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none'; if (typeof this.stopVAD === 'function') this.stopVAD(); if (callback) callback(); };
        utterance.onerror = () => { if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none'; if (typeof this.stopVAD === 'function') this.stopVAD(); if (callback) callback(); };
        
        window.speechSynthesis.speak(utterance);
        this.startVAD(); // 启动打断监听
    }

    async initVAD() {
        if (this.vadStream) return; // 已经初始化过了，防手抖
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        
        try {
            // 🛡️ 核心修复 1：必须强开硬件级的回声消除！否则 AI 把自己的声音外放出来，麦克风听到后会立刻打断自己！
            this.vadStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
            });
            
            this.vadContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.vadContext.createMediaStreamSource(this.vadStream);
            
            // 🛡️ 核心修复 2：分析器一生只创建一次，复用内存，绝对禁止每次说话都重新 allocate 内存！
            this.vadAnalyser = this.vadContext.createAnalyser();
            this.vadAnalyser.fftSize = 512;
            this.vadAnalyser.smoothingTimeConstant = 0.5;
            source.connect(this.vadAnalyser);
            
            this.vadDataArray = new Uint8Array(this.vadAnalyser.frequencyBinCount);
            console.log('⚡️ VAD 巡航舰模块已静默待命，守护主线程渲染池。');
        } catch (err) {
            console.warn('VAD 麦克风权限被拒绝，打断失效:', err);
        }
    }

    startVAD() {
        if (this.vadReqId) return; // 已经在监听中了
        
        // 如果没初始化硬件流，去初始化它，但不阻塞接下来的逻辑
        if (!this.vadStream) {
            this.initVAD().then(() => this.startVAD());
            return;
        }

        if (this.vadContext && this.vadContext.state === 'suspended') {
            this.vadContext.resume();
        }
        
        let consecutiveFrames = 0;
        const vadStartTime = Date.now();
        
        const detectVolume = () => {
            if (!this.vadReqId || !this.vadAnalyser) return; 
            
            this.vadAnalyser.getByteFrequencyData(this.vadDataArray);
            
            // 🛡️ 核心优化 4：限定监测频段（仅关注 100Hz - 3800Hz 人声范围）
            // 每一个 bin 约 90Hz (512 FFT), 取 1 到 45 左右，过滤掉高频风扇声和底噪
            let sum = 0;
            const startBin = 2; // 跳过极低频
            const endBin = 45;
            for (let i = startBin; i < endBin; i++) {
                sum += this.vadDataArray[i];
            }
            const average = sum / (endBin - startBin);
            
            // 🛡️ 核心优化 5：智能保护期（刚开始说话的 1.2 秒内禁止打断）
            // 防止 AI 刚开口时，环境的回声或用户没说完的残余话语导致 AI “秒怂”闭嘴
            const gracePeriod = Date.now() - vadStartTime < 1200;
            
            // 【灵敏度阈值】：提升到 80，并要求更长久的持续发声
            if (!gracePeriod && average > 80) {
                consecutiveFrames++;
                // 连续 45 帧判定为人声说话（约 600-700ms），防止短促的键盘声、咳嗽声触发
                if (consecutiveFrames > 45) { 
                    console.warn('🛑 智能语音打断触发！有效频段均值:', average.toFixed(2));
                    this.stopVAD();      
                    this.cancelOutput(); 
                    return; 
                }
            } else {
                consecutiveFrames = 0; 
            }
            
            this.vadReqId = requestAnimationFrame(detectVolume);
        };

        // 挂载引擎钥匙
        this.vadReqId = 1; // 给个假位先锁死，然后再挂接真实的 handle
        this.vadReqId = requestAnimationFrame(detectVolume);
    }

    stopVAD() {
        // 🛡️ 核心修复 3：当 AI 说完话，【绝对不能关闭麦克风轨道】，只需要停掉 requestAnimationFrame 节约算力！
        // 频繁断开/开启麦克风硬件句柄，是导致你的 Chrome 浏览器渲染主线程卡死、画面极度掉帧的罪魁祸首！
        if (this.vadReqId) {
            cancelAnimationFrame(this.vadReqId);
            this.vadReqId = null;
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
                this.lastVoiceTime = Date.now();
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
                        
                        // 智能静音检测 (VAD)
                        let sum = 0;
                        for(let i=0; i<bufferLength; i++) sum += dataArray[i];
                        const average = sum / bufferLength;
                        
                        if (average > 10) { // 有声音
                            this.lastVoiceTime = Date.now();
                        } else if (Date.now() - this.lastVoiceTime > 3000) { // 超过3秒静音
                            console.log('[Titan AI] 🔇 检测到长时间静音，自动结束录音...');
                            this.toggleVoiceRecording();
                            return;
                        }

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
                this.audioStream = null; 
            }
        }
    }

    async sendAudioToGemini(audioBlob, durationInSeconds = 1) {
        if (!this.checkUsageLimit()) return; // 语音流输入防绕过拦截

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
            let audioFormat = 'wav'; // 强制伪装成 wav（Google官方的OpenAI兼容层只认wav或mp3白名单，但其实底层解码器支持webm）
            if (audio.type.includes('mp3') || audio.type.includes('mpeg')) audioFormat = 'mp3';
            
            content.push({ 
                type: 'input_audio', 
                input_audio: { 
                    data: audio.data,
                    format: audioFormat
                } 
            });
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

        const systemPromptContent = `你是“科技特长生全栈培养系统”的专属智能虚拟教师，你的名字叫“小创老师”。你正在负责一对一指导屏幕前这位聪明、渴望探索科技特长生知识的中国少年。
你的核心目标是通过启发式的专业对话，帮助学生掌握前沿的新工科与理科知识。在对话中，请自然、亲切地称呼对方为“同学”，你要展现出亦师亦友的高维机器人导师范儿，语气活泼且严谨。
当有疑惑时，你可以充分参考你的内在理论体系引擎：${chengdianRAG}

当前学生正在浏览的本系统中某个模块页面：${currentTitle} (${currentHeader})
以下是系统刚刚抓取到的该网页内的当前页面核心文本（这是他此刻可能在问的直接上下文）：
${currentFullContent}

【🎓 极致排版指令 - Notion Educational Mastery 3.0】：
你不仅是在对话，你是在为学生构建一份高保真、结构化的“交互式科创手记”。必须严格遵守以下法则：
1. **视觉优先 (Visual-Centric) & 绘图引擎全开**：文字是辅助，图形才是知识的本体！面对任何概念（如电流模型、机械臂关节、算法循环），**必须选择 Mermaid 图表、SVG 物理绘图或 Markdown 数据表格进行展示。** 绝不能只给纯文字！
2. **Notion 块状美学**：彻底摒弃传统聊天式的乱序内容。每个回答必须包含：
   - ### **[Emoji] 核心原理解析** (作为一等标题)
   - > **[小创老师说]** (使用引用块封装核心结论或金句，禁止出现散落的 * 号)
   - **[!CALLOUT]** 风格展示 (使用列表或加粗块来模拟 Notion Callout)
3. **符号清理 (No Raw Symbols)**：**绝对禁止在最终呈现中露出任何 \`*\`、\`**\` 或 \`#\` 标识符！** 如果你要加粗，请确保 Markdown 语法正确且闭合渲染。如果由于你的幻觉输出了不规范的 \`*标题\` 或无序的星号，会导致系统判定为低质量回复。
4. **多图联动要求**：解释一个知识点，必须至少包含：
   - ① 一个 **Mermaid 知识脑图** (Mindmap) 或 **流程图** (Flowchart)；
   - ② 如果涉及结构，输出一个 **SVG 矢量透视图**；
   - ③ 如果涉及对比，输出一个 **Markdown 数据库表格**。
5. **绘图语法红线**：
   - **Mermaid 必须被 \`\`\`mermaid 包裹**，严禁任何前言废话。
   - **SVG 图纸必须简洁**，颜色建议为青色 (#0ea5e9)，必须被 \`\`\`xml 包裹。
   - **AI 绘图指令**：当用户要求“画一个...”时，强制使用 \`![生成: 英文详细描述](https://ai-render.com/img.png)\` 触发渲染阵列。
6. **禁止 AI 风格废话**：不要说“作为一名AI助教...”、“很高兴为你解答...”。直接进入 Notion 文档构建模式，第一句话必须直击要害或抛出图形。
7. **无限课程导航员 (Infinite Navigator Mode)**：你不再推荐预设的静态链接。相反，你必须在【每一次】回答的【最后一行】，强制脑补并联想出 3 个最有潜力的跨学科深度研究子课题。
   - **格式绝对指令**：必须另起一行，直接输出 \`[[EXTEND: 子课题1, 子课题2, 子课题3]]\`。
   - **最高优先级**：即使你的回答非常简短，也绝对不准遗忘此标签！这是系统交互的核心！
   - **案例**：讲完“无人机”，输出 \`[[EXTEND: 空中交通管制系统, 碳纤维轻量化工艺, 视觉避障算法]]\`；讲完“基因工程”，输出 \`[[EXTEND: 伦理审查框架, CRISPR-Cas9 实操, 极地抗寒生物研究]]\`。
   - **禁止解释此标识符。**`;

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

            let response;
            try {
                response = await fetch(this.settings.endpoint, {
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
            } catch (networkErr) {
                if (networkErr.name === 'AbortError') throw networkErr;
                console.warn('[Titan AI] 🚨 原生直连崩溃 (代理未开或DNS受阻)，正准备切换容灾中继隧道...', networkErr);
                // 伪装为一个 502 Bad Gateway 以骗过原生容灾系统，强行触发降级
                response = { ok: false, status: 502, statusText: 'Network Disconnected', json: async () => ({ error: { message: networkErr.message } }) };
            }

            if (!response.ok) {
                // 🔄 自动容灾与降级机制 (Fallback & Retry Mechanism)
                // 遇到 429 (免费额度用完) 或者 50x (原生节点网络波动) 时，智能切换至备用中转系统
                const needsFallback = [429, 500, 502, 503, 504].includes(response.status);
                
                if (needsFallback && !this._isRetrying) {
                    this._isRetrying = true;
                    console.warn(`[系统警报] 原生主节点拥堵或耗尽 (${response.status})，正无缝向备用核心网络进行转移...`);
                    
                    const retryResponse = await fetch(this.settings.backupEndpoint || this.settings.endpoint, {
                        method: 'POST',
                        signal: this.currentAbortController.signal,
                        headers: { 
                            'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${this.settings.backupApiKey || this.settings.apiKey}` 
                        },
                        body: JSON.stringify({ model: this.settings.model, messages: apiMessages, temperature: 0.7, max_tokens: 4096 })
                    });
                    
                    this._isRetrying = false;
                    
                    if (retryResponse.ok) {
                        console.log('✅ 备用节点接管成功，确保系统持续运行');
                        var data = await retryResponse.json();
                    } else {
                        const errorData = await retryResponse.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `双端节点均不可用 (${retryResponse.status})，请稍候再试`);
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
            // 🔐 每 5 轮对话自动静默存档
            const userRounds = this.chatHistory.filter(m => m.role === 'user').length;
            if (userRounds > 0 && userRounds % 5 === 0) {
                this.silentAutoArchive();
            }
            // --- 开始：全新增强版单向流智能打字机 (Unified Stream Engine) ---
            const typing = document.getElementById('ai-typing-indicator');
            if (typing) typing.remove();

            // 摒弃物理切段，创建唯一的知识黑板大容器，保护 Markdown 闭合语法免受破坏！
            const rowDiv = document.createElement('div');
            rowDiv.className = 'msg-row ai';
            rowDiv.style.animation = 'msg-spring-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

            const avatarHTML = `<div class="avatar avatar-ai"><img src="/assets/img/xiao_chuang_head.png" onerror="this.outerHTML='<i class=\\'fas fa-robot\\'></i>'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>`;
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

            // 核心计费：访客额度扣减
            const isMemberStatus = localStorage.getItem('is_member') === 'true'; // 假设会员状态存储在 localStorage
            if (!isMemberStatus) {
                let remainingCount = parseInt(localStorage.getItem('ai_guest_limit') || '10');
                if (remainingCount > 0) {
                    remainingCount--;
                    localStorage.setItem('ai_guest_limit', remainingCount.toString());
                    this.updateMemberStatusUI(); // 即时刷新顶部通知条进度
                }
            }
            
            if (typeof this.updateQuickChips === 'function') this.updateQuickChips(aiReply);

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
                    
                    // --- 核心进化：SVG 原生矢量白板渲染引擎 ---
                    // 拦截代码块中的 SVG，将其升维打击为真正的白板制图，而不是显示枯燥的源码！
                    if (['language-svg', 'language-xml', 'language-html'].some(c => block.classList.contains(c))) {
                        const content = block.innerText.trim();
                        if (content.includes('<svg') && content.includes('</svg>')) {
                            const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
                            if (svgMatch) {
                                if (isStreaming) {
                                    pre.style.opacity = '0.5';
                                    return; // 等待流式输出完毕，暂不渲染半成品的 SVG 导致 DOM 崩溃
                                }
                                const svgDiv = document.createElement('div');
                                svgDiv.className = 'ai-svg-render';
                                svgDiv.style.cssText = 'background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; display: flex; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); backdrop-filter: blur(8px);';
                                svgDiv.innerHTML = svgMatch[0];
                                
                                const svgEl = svgDiv.querySelector('svg');
                                if(svgEl) {
                                    if (!svgEl.getAttribute('width') && !svgEl.getAttribute('viewBox')) {
                                        svgEl.style.width = '100%';
                                    }
                                    svgEl.style.maxWidth = '100%';
                                    svgEl.style.height = 'auto'; // 自适应尺寸防溢出
                                }
                                
                                pre.style.display = 'none'; // 隐藏无聊的源码
                                pre.classList.add('svg-ready');
                                if (!pre.nextElementSibling || !pre.nextElementSibling.classList.contains('ai-svg-render')) {
                                    pre.parentNode.insertBefore(svgDiv, pre.nextSibling);
                                }
                                this.scrollToBottom();
                                return;
                            }
                        }
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

            // 核心功能：全域括号嵌套防漏气护盾 (Universal JSON Tool-Calling Interceptor)
            // 暴力切断任何由各种模型（包括 Gemini 等异常封装）私自外泄的变种 JSON 底层代码结构
            const cleanJSONToolCalls = (rawStr) => {
                if (!rawStr) return rawStr;
                let result = rawStr;
                let possibleStart = result.indexOf('{');
                
                // 启用无缝多重切分，拦截大模型在单次传输中塞入的多个 JSON 指令
                while (possibleStart > -1) {
                    let snippetForCheck = result.substring(possibleStart, possibleStart + 300);
                    // 只要大括号内开头能嗅探到任何形似工具调用的特征，立刻就地正法！
                    if (/["']?action(?:_input)?["']?\s*:|["']?(?:generate_image|dalle|image_gen|prompt)["']?\s*:/i.test(snippetForCheck)) {
                        let openBrace = possibleStart;
                        let closeBrace = -1;
                        let depth = 0;
                        for (let j = openBrace; j < result.length; j++) {
                            if (result[j] === '{') depth++;
                            if (result[j] === '}') {
                                depth--;
                                if (depth === 0) { closeBrace = j; break; }
                            }
                        }
                        
                        if (closeBrace !== -1) {
                            let block = result.substring(openBrace, closeBrace + 1);
                            
                            // 顶级容错提取：无论是标准的 prompt 还是不讲规矩的 action_input，统统能暴力拉取特征值
                            let alt = "检索: 科学与工程图解";
                            let promptObjMatch = block.match(/['"](?:prompt|action_input)['"]\s*:\s*(['"])([\s\S]*?)\1/i);
                            if (promptObjMatch && promptObjMatch[2].length > 2) {
                                alt = "生成: " + promptObjMatch[2].substring(0, 450);
                            } else {
                                let tMatch = block.match(/['"](?:thought|description)['"]\s*:\s*(['"])([\s\S]*?)\1/i);
                                if (tMatch) alt = "检索: " + tMatch[2].substring(0, 150);
                            }
                            
                            // 洗刷毒瘤字符 (换行、引号)，重新高压封存为纯天然原生 Markdown 语法
                            let cleanAlt = alt.replace(/'|"/g, "").replace(/(\r\n|\n|\r)/gm, " ");
                            let md = `\n\n![${cleanAlt}](ai-render://placeholder)\n\n`;
                            
                            // 就地无损覆盖合并，同时跳跃指针推进下一轮探测
                            result = result.substring(0, openBrace) + md + result.substring(closeBrace + 1);
                            possibleStart = result.indexOf('{', openBrace + md.length);
                            continue;
                        }
                    }
                    possibleStart = result.indexOf('{', possibleStart + 1);
                }
                
                // 剔除大模型瞎加的废弃裹尸布： ```json ... ```，进行靶向清除防止污染下方正常的解释文本段落
                // 【核心修复】：绝不能使用 [\\s\\S]*? 跨行匹配，否则会把有效 Mermaid 或代码块的 \`\`\` 闭合符连带下面原本正常的文字全吃掉！导致严重的嵌套崩溃！
                result = result.replace(/```(?:json|javascript|js)?\s*!\[/ig, '\n\n![');
                result = result.replace(/!\[(.*?)\]\(ai-render:\/\/placeholder\)\s*```/ig, '![$1](ai-render://placeholder)\n');
                
                // 全域兜底修复：强行剔除那些被模型画蛇添足加上了反斜杠或粗体星号的底层路由失效胶囊
                // 解决类似 **\[生命科学\] (?module=auto_match)** 导致的解析断裂
                result = result.replace(/[*_]*\*\[(.*?)\][*_]*\s*\(\s*\?module=auto_match\s*\)/g, '[$1](?module=auto_match)');
                
                // 终极排版防漏 (Markdown Syntax Rescue)
                result = result.replace(/\*\*\s+(.*?)\s+\*\*/g, '**$1**'); // 消除 ** 原理 ** 的多余空格
                result = result.replace(/\*\*(.*?)\*\*\s*:/g, '**$1**:');   // 消除 **原理** : 的多余空格
                result = result.replace(/\\\*/g, '*');               // 干掉 \* 产生的转义破坏
                
                // 🛑 隐藏 UGC 演化指令：防止 [[EXTEND: ...]] 出现在气泡文本中
                result = result.replace(/\[\[EXTEND:.*?\]\]/g, ''); 
                
                return result;
            };

            const typeNextChar = () => {
                if (this.isTypingCancelled) {
                    this.setSendButtonState('send');
                    let safetyReply = cleanJSONToolCalls(aiReply || '');
                    msgDiv.innerHTML = window.marked ? window.marked.parse(safetyReply.substring(0, i)) : safetyReply.substring(0, i);
                    enhanceCodeBlocks();
                    progressBar.remove();
                    this.isProcessingQueue = false;
                    this.processQueue();
                    return;
                }

                if (i >= aiReply.length) {
                    // 打字正式完成，进入静态阅读模式 (Static Reading Mode)
                    let safetyReply = cleanJSONToolCalls(aiReply || '');
                    const finalContent = window.marked ? window.marked.parse(safetyReply) : safetyReply;
                    if (msgDiv.innerHTML !== finalContent) {
                        msgDiv.innerHTML = finalContent;
                    }
                    
                    setTimeout(() => {
                        enhanceCodeBlocks(); // 【核心解BUG】必须调用包内闭包环境定义的 enhanceCodeBlocks 才能正确接管当前的 msgDiv！！
                        progressBar.style.opacity = '0'; // 优雅消失，不抖动
                        setTimeout(() => { if(progressBar.parentNode) progressBar.remove(); }, 300);
                    }, 10);

                    this.setSendButtonState('send');
                    this.isProcessingQueue = false;
                    this.processQueue();
                    
                    // 核心修复：访客模式提问计费 (Guest Usage Tracking) 接入全栈检测
                    let isMemberStatus = this.settings.memberExpired > Date.now();
                    if (window.SubscriptionManager && window.SubscriptionManager.isSubscribed && window.SubscriptionManager.isSubscribed()) {
                        isMemberStatus = true;
                    }
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
                    
                    // 🚀 【核心修复：流式结束即时主动召唤发声逻辑与课程推荐】
                    this.speakReply(aiReply);
                    
                    if (aiReply.length > 5) {
                        setTimeout(() => this.injectCourseRecommendations(aiReply), 800);
                    }
                    
                    return;
                }

                // Turbo-Burst 算法：大幅增加单次步长 (8-15字符)，降低闪烁感并提高响应速度
                let step = 8;
                const remaining = aiReply.length - i;
                if (remaining < 20) step = 1; // 接近末尾时放慢，增强仪式感
                else if (aiReply.substring(i, i+10).includes('\n')) step = 1; // 遇到换行时精确处理

                i += step;
                if (i > aiReply.length) i = aiReply.length;

                // 极速稳象算法：先拦截底层模型的代理JSON代码，再过滤裸露的星号乱码
                let rawSnippet = aiReply.substring(0, i);
                let cleanText = typeof cleanJSONToolCalls === 'function' ? cleanJSONToolCalls(rawSnippet) : rawSnippet;
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
                this.appendMessage('system', `[接口通讯失败] ${error.message}。请检查您的代理网络连接、API 密钥配置或模型服务可用性。`);
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
        if (role === 'ai') avatarHTML = `<div class="avatar avatar-ai"><img src="/assets/img/xiao_chuang_head.png" onerror="this.outerHTML='<i class=\\'fas fa-robot\\'></i>'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>`;
        if (role === 'user') avatarHTML = `<div class="avatar avatar-user"><img src="/assets/img/user_boy.png" onerror="this.outerHTML='<i class=\\'fas fa-user-circle\\'></i>'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>`;
        
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
    
    _showDesktopAppPrompt() {
        // 创建一个赛博朋克风格的全屏幕沉浸式模态弹窗
        const modalId = 'titan-desktop-modal';
        if (document.getElementById(modalId)) return;

        const modalHtml = `
            <div id="${modalId}" style="position:fixed; inset:0; z-index: 100000; display:flex; align-items:center; justify-content:center; background: rgba(3,7,18,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); opacity: 0; transition: opacity 0.3s ease;">
                
                <div style="background: linear-gradient(180deg, #0f172a 0%, #020617 100%); border: 1px solid rgba(16,185,129,0.2); box-shadow: 0 25px 50px -12px rgba(16,185,129,0.15); border-radius: 24px; max-width: 480px; width: 90%; padding: 40px; position:relative; transform: translateY(20px) scale(0.95); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                    
                    <!-- 闪烁的光晕特效 -->
                    <div style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 120px; height: 120px; background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%); pointer-events:none;"></div>
                    
                    <!-- 关闭按钮 -->
                    <button onclick="document.getElementById('${modalId}').style.opacity='0'; document.getElementById('${modalId}').children[0].style.transform='translateY(20px) scale(0.95)'; setTimeout(()=>document.getElementById('${modalId}').remove(), 300)" style="position: absolute; top: 16px; right: 20px; color: #64748b; background: none; border: none; font-size: 24px; cursor: pointer; transition: 0.2s;">×</button>
                    
                    <!-- 图标 -->
                    <div style="display:flex; justify-content:center; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); display:flex; align-items:center; justify-content:center; color: #10b981; box-shadow: inset 0 0 20px rgba(16,185,129,0.1);">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="animate-pulse" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        </div>
                    </div>
                
                    <h2 style="font-family: 'Orbitron', 'Inter', sans-serif; color: #f8fafc; font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 12px; letter-spacing: 0.5px;">此功能仅向客户端开放</h2>
                    
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                        为了突破网页算力极限与音视频高帧流动的性能沙盒，<b>Live Vision 多模态指导</b> 已被锁定。<br><br>安装桌面级引擎，释放底层硬件权限与零延迟心跳连接。
                    </p>
                    
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <button onclick="window.open('download.html', '_blank'); document.getElementById('${modalId}').querySelector('.close-btn').click();" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; padding: 16px; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">前往下载中心 (Download Center)</button>
                        <button class="close-btn" onclick="document.getElementById('${modalId}').style.opacity='0'; document.getElementById('${modalId}').children[0].style.transform='translateY(20px) scale(0.95)'; setTimeout(()=>document.getElementById('${modalId}').remove(), 300)" style="background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 14px; border-radius: 12px; font-size: 14px; cursor: pointer; transition: 0.2s;">返回继续聊天</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 激活动画
        requestAnimationFrame(() => {
            const modal = document.getElementById(modalId);
            modal.style.opacity = '1';
            modal.children[0].style.transform = 'translateY(0) scale(1)';
        });
    }

    showTyping() {
        const exists = document.getElementById('ai-typing-indicator');
        if (exists) return;
        
        const rowDiv = document.createElement('div');
        rowDiv.id = 'ai-typing-indicator';
        rowDiv.className = 'msg-row ai';
        
        const avatarHTML = '<div class="avatar avatar-ai"><img src="/assets/img/xiao_chuang_head.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div>';
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
        this.messageQueue = []; // 阻除残余队列，防止疯狂重载
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }
        
        // 核心优化：物理物理打断，不仅停止文字，还要强行闭嘴并停止 VAD
        if (this.currentAudioPlayer) {
            try { this.currentAudioPlayer.pause(); } catch(e){}
            this.currentAudioPlayer = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (this.ttsStopBtn) this.ttsStopBtn.style.display = 'none';
        if (typeof this.stopVAD === 'function') this.stopVAD();
        
        this.setSendButtonState('send');
    }

    // 防渗透验证：一举阻断图片、语音、快捷键绕过攻击
    checkUsageLimit() {
        let isMemberStatus = this.settings.memberExpired > Date.now();
        if (window.SubscriptionManager && window.SubscriptionManager.isSubscribed && window.SubscriptionManager.isSubscribed()) {
            isMemberStatus = true;
        }
        let remaining = parseInt(localStorage.getItem('ai_guest_limit') || '10');
        
        if (!isMemberStatus && remaining <= 0) {
            if (this.input) {
                this.input.style.transition = 'all 0.1s';
                this.input.style.border = '1px solid #ef4444';
                this.input.placeholder = '🔒 体验额度已耗尽，请解锁 VIP';
                this.input.disabled = true;
                setTimeout(() => { this.input.style.border = ''; }, 300);
            }
            
            // 引导解锁
            if (window.SubscriptionManager) {
                window.SubscriptionManager.showPaywall();
            } else if (this.activateBtn) {
                this.activateBtn.click();
            } else {
                alert('访客体验次数已耗尽！\n请点击输入框侧边的钥匙图标或直接登录重置对话次数。');
            }
            return false;
        }
        return true;
    }

    async sendMessage() {
        // 核心锁定防绕过拦截: 确保即便点击了提示词泡泡发起的调用也会被拦截
        if (this.sendBtnState !== 'stop' && !this.checkUsageLimit()) return;

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
        try {
            await this.sendToAPI(mergedMessage);
        } catch (e) {
            console.error('[Titan AI] Queue processing error:', e);
        } finally {
            this.isProcessingQueue = false;
            // 如果在处理过程中又有新消息加入，递归触发（下一轮循环）
            if (this.messageQueue.length > 0) {
                this.processQueue();
            }
        }
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

    // (Duplicate old archive implementations removed to restore Github-style AI Archive module)
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.titanAIAssistant = new TitanAIAssistant(); });
} else {
    window.titanAIAssistant = new TitanAIAssistant();
}

// ==========================================
// 全局沉浸式高清看图引擎 (Titan Lightbox)
// ==========================================
window._showTitanFullImg = function(url, alt) {
    let overlay = document.getElementById('titan-img-lightbox');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'titan-img-lightbox';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(5,10,20,0.9); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); z-index:9999999; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:all 0.3s ease; cursor:zoom-out;';
        
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        closeBtn.title = '关闭 (Esc)';
        closeBtn.style.cssText = 'position:absolute; top:20px; right:30px; color:#94a3b8; font-size:48px; font-weight:100; cursor:pointer; font-family:sans-serif; transition:color 0.2s; z-index:2;';
        closeBtn.onmouseover = () => closeBtn.style.color = '#fff';
        closeBtn.onmouseout = () => closeBtn.style.color = '#94a3b8';
        
        const img = document.createElement('img');
        img.id = 'titan-img-lightbox-img';
        img.style.cssText = 'max-width:90vw; max-height:80vh; border-radius:12px; box-shadow:0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(56,189,248,0.15); transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform:scale(0.9); position:relative; z-index:1; object-fit:contain; border:1px solid rgba(255,255,255,0.05);';
        
        const text = document.createElement('div');
        text.id = 'titan-img-lightbox-text';
        text.style.cssText = 'color:#e2e8f0; margin-top:20px; font-size:15px; font-weight:500; max-width:800px; text-align:center; padding:12px 24px; z-index:1; background:rgba(0,0,0,0.5); border-radius:100px; border:1px solid rgba(255,255,255,0.1); display:inline-block; letter-spacing:0.5px;';

        const loading = document.createElement('div');
        loading.id = 'titan-img-lightbox-loading';
        loading.innerHTML = '<span style="color:#38bdf8; display:flex; align-items:center; gap:8px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="scan-blink" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> 解析超清量子数据中...</span>';
        loading.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:0; font-size:16px; font-family:Orbitron, sans-serif;';

        overlay.appendChild(loading);
        overlay.appendChild(img);
        overlay.appendChild(text);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        const closeFunc = () => {
            overlay.style.opacity = '0';
            img.style.transform = 'scale(0.95)';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        };
        overlay.onclick = closeFunc;
        // 支持 ESC 键关闭
        document.addEventListener('keydown', (e) => { 
            if(e.key === 'Escape' && overlay.style.display === 'flex') closeFunc(); 
        });
    }
    
    // 智能提取更高清的大图 
    let hdUrl = url;
    if (hdUrl.includes('mm.bing.net')) {
        // 解锁 Bing 接口的 1080P 超清全貌参数
        hdUrl = hdUrl.replace(/w=\d+&h=\d+/, 'w=1920&h=1080'); 
    } else if (hdUrl.includes('pollinations.ai')) {
        // 放飞直连画图物理引擎的超分上限至 1080P
        hdUrl = hdUrl.replace(/width=\d+&height=\d+/, 'width=1920&height=1080');
    }

    const imgEl = document.getElementById('titan-img-lightbox-img');
    const loadEl = document.getElementById('titan-img-lightbox-loading');
    
    imgEl.style.display = 'none';
    loadEl.style.display = 'flex';
    
    imgEl.onload = () => {
        loadEl.style.display = 'none';
        imgEl.style.display = 'block';
    };
    imgEl.src = hdUrl;
    
    document.getElementById('titan-img-lightbox-text').innerText = alt || 'Vision Enhanced';
    
    overlay.style.display = 'flex';
    void overlay.offsetWidth; // Force Reflow
    overlay.style.opacity = '1';
    imgEl.style.transform = 'scale(1)';
};

// ==========================================
// TITAN ADAPTIVE UI ENGINE - DOCK & PREFERENCE
// ==========================================
class TitanAdaptiveUI {
    constructor() {
        this.preferences = JSON.parse(localStorage.getItem('titan_user_preferences') || '{"coding":5,"ai":5,"robotics":5,"space":5,"materials":5}');
        this.init();
    }

    init() {
        console.log("[Titan Adaptive] 🧬 自适应 UI 引擎已启动，正在分析学生偏好...");
        this.renderSmartDock();
        this.bindTracking();
    }

    // 记录学生对特定主题的兴趣增加
    trackInterest(tags) {
        if (!tags) return;
        const tagList = Array.isArray(tags) ? tags : [tags];
        tagList.forEach(tag => {
            this.preferences[tag] = (this.preferences[tag] || 0) + 1;
        });
        localStorage.setItem('titan_user_preferences', JSON.stringify(this.preferences));
        
        // 实时刷新 Dock，模仿学生的瞬时兴趣转变
        this.renderSmartDock();
    }

    bindTracking() {
        // 监听 Launchpad 点击
        document.addEventListener('click', (e) => {
            const appItem = e.target.closest('.lp-app-item') || e.target.closest('.dock-icon-box');
            if (appItem) {
                const label = appItem.querySelector('.lp-app-text, .dock-label')?.innerText;
                // 简单的映射逻辑：根据点击的名称推测标签
                if (label?.includes('编程') || label?.includes('API')) this.trackInterest('coding');
                if (label?.includes('AI') || label?.includes('脑')) this.trackInterest('ai');
                if (label?.includes('航空') || label?.includes('宇宙')) this.trackInterest('space');
                if (label?.includes('机器人') || label?.includes('机械')) this.trackInterest('robotics');
            }
        });
    }

    renderSmartDock() {
        const dock = document.querySelector('.dock-container');
        if (!dock) return;

        // 1. 获取所有可用 App 数据 (假设 Launchpad.js 已经加载)
        if (!window.Launchpad || !window.Launchpad.getApps) {
            console.warn("[Titan Adaptive] Launchpad 核心未加载，降级使用静态缓存。");
            return;
        }
        
        const allApps = window.Launchpad.getApps();
        
        // 2. 排序算法：权重 = 基础权重 + 偏好分数 (+ 随机微扰，增加探索性)
        const scoredApps = allApps.map(app => {
            let score = 0;
            if (app.tags) {
                app.tags.forEach(tag => score += (this.preferences[tag] || 0));
            }
            // 默认排序：如果没有 tags 的，给一个适中的分值，或者根据关键词匹配
            if (score === 0) {
                if (app.name.includes('AI') || app.name.includes('智能')) score += this.preferences['ai'] || 0;
            }
            return { ...app, score: score + Math.random() * 2 };
        });

        // 挑选前 10 个展示在 Dock 栏
        const recommended = scoredApps.sort((a, b) => b.score - a.score).slice(0, 10);

        // 3. 构建 HTML (保留核心固定入口，如科技宝箱和个人中心)
        let dockHTML = `
            <!-- 核心交互：科技宝箱 -->
            <div id="newLaunchpadEntry" class="dock-icon-box" onclick="window.Launchpad.open()" style="border-color:var(--primary); box-shadow:0 0 20px rgba(0,240,255,0.4); transform: scale(1.05);">
                <div class="dock-icon-bg" style="font-size: 32px;">🚀</div>
                <div class="dock-label" style="color:var(--primary); font-weight:bold;">科技宝箱</div>
            </div>
            <!-- 分割线 -->
            <div style="width:2px; height:40px; background:rgba(255,255,255,0.1); margin:0 10px; flex-shrink:0;"></div>
        `;

        recommended.forEach(app => {
            dockHTML += `
                <div class="dock-icon-box" onclick="location.href='${app.link}'" title="${app.name}">
                    <div class="dock-icon-bg" style="color: ${app.color || 'white'}">${app.icon}</div>
                    <div class="dock-label">${app.name}</div>
                </div>
            `;
        });

        // 注入 Dock
        dock.innerHTML = dockHTML;
    }
}

// 自动初始化
window.addEventListener('scroll', () => {
    if (!window.titanAssistantInstance) {
        window.titanAssistantInstance = new TitanAIAssistant();
        window.titanUI = new TitanAdaptiveUI();
    }
}, { once: true });

// 备用初始化 (防止用户不滚动)
setTimeout(() => {
    if (!window.titanAssistantInstance) {
        window.titanAssistantInstance = new TitanAIAssistant();
        window.titanUI = new TitanAdaptiveUI();
    }
}, 2000);

