class CyberTour {
    constructor(steps) {
        this.steps = steps;
        this.currentIndex = 0;
        this.overlay = null;
        this.highlighter = null;
        this.dialog = null;
        this.typewriterInterval = null;
    }

    init() {
        if (document.getElementById('cyber-tour-overlay')) return;

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'cyber-tour-overlay';
        this.overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(5, 5, 10, 0.85); backdrop-filter: blur(5px);
            z-index: 999990; opacity: 0; transition: opacity 0.5s; pointer-events: auto;
        `;

        // Create highlighter
        this.highlighter = document.createElement('div');
        this.highlighter.id = 'cyber-tour-highlighter';
        this.highlighter.style.cssText = `
            position: fixed; border: 2px solid #00f0ff; border-radius: 16px;
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.5), 0 0 30px #00f0ff, inset 0 0 20px #00f0ff;
            z-index: 999991; transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            pointer-events: none; opacity: 0;
        `;

        // Create Dialog Window
        this.dialog = document.createElement('div');
        this.dialog.id = 'cyber-tour-dialog';
        this.dialog.style.cssText = `
            position: fixed; width: 380px; background: rgba(10, 15, 25, 0.95);
            border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 12px;
            padding: 24px; color: #e2e8f0; font-family: 'Noto Sans SC', sans-serif;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.15);
            z-index: 999992; transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            opacity: 0; transform: translateY(20px);
            display: flex; flex-direction: column; gap: 16px;
        `;
        
        // Internal styles for Dialog
        this.dialog.innerHTML = 
            '<div style="font-family:\'Orbitron\'; font-size:12px; color:#00f0ff; font-weight:800; display:flex; align-items:center; gap:8px;">' +
                '<span style="display:inline-block; width:8px; height:8px; background:#00f0ff; border-radius:50%; box-shadow:0 0 8px #00f0ff;"></span>' +
                'SYSTEM GUIDE // 系统向导' +
            '</div>' +
            '<div id="cyber-tour-text" style="font-size: 15px; line-height: 1.6; min-height: 60px;"></div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">' +
                '<button id="cyber-tour-skip" style="background:none; border:none; color:#64748b; font-size:13px; cursor:pointer; font-weight:bold;">SKIP / 跳过</button>' +
                '<div style="display:flex; gap:10px; align-items:center;">' +
                    '<span id="cyber-tour-counter" style="color:#94a3b8; font-size:12px; font-family:\'Orbitron\';">1/N</span>' +
                    '<button id="cyber-tour-next" style="background:#00f0ff; color:#000; border:none; padding:8px 20px; border-radius:6px; font-family:\'Orbitron\'; font-weight:bold; cursor:pointer; box-shadow:0 0 15px rgba(0,240,255,0.4); transition:0.2s;">NEXT 🚀</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(this.highlighter); 
        document.body.appendChild(this.overlay); 
        this.overlay.appendChild(this.highlighter);
        this.overlay.appendChild(this.dialog);

        document.getElementById('cyber-tour-skip').onclick = () => this.end();
        document.getElementById('cyber-tour-next').onclick = () => this.next();

        // Fade in
        setTimeout(() => {
            this.overlay.style.opacity = '1';
            this.highlighter.style.opacity = '1';
            this.dialog.style.opacity = '1';
            this.dialog.style.transform = 'translateY(0)';
            this.renderStep();
        }, 50);
    }

    renderStep() {
        if (this.currentIndex >= this.steps.length) {
            this.end();
            return;
        }

        const step = this.steps[this.currentIndex];
        document.getElementById('cyber-tour-counter').innerText = `${this.currentIndex + 1} / ${this.steps.length}`;
        
        let targetEl = null;
        if (step.selector === 'center') {
            targetEl = {
                getBoundingClientRect: () => ({
                    left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0, right: window.innerWidth / 2, bottom: window.innerHeight / 2
                })
            };
        } else {
            targetEl = document.querySelector(step.selector);
        }

        if (!targetEl) {
            console.warn('Tour missing element:', step.selector);
            this.next(); // Skip broken step
            return;
        }

        const rect = targetEl.getBoundingClientRect();
        const padding = step.padding || 10;
        
        // Position Highlighter
        if (step.selector === 'center') {
            this.highlighter.style.opacity = '0';
        } else {
            this.highlighter.style.opacity = '1';
            this.highlighter.style.left = `${rect.left - padding}px`;
            this.highlighter.style.top = `${rect.top - padding}px`;
            this.highlighter.style.width = `${rect.width + padding*2}px`;
            this.highlighter.style.height = `${rect.height + padding*2}px`;
        }

        // Position Dialog
        let dLeft, dTop;
        const dWidth = 380; const dHeight = 200;
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        if (step.selector === 'center') {
            dLeft = (winW - dWidth) / 2;
            dTop = (winH - dHeight) / 2;
        } else {
            if (rect.right + padding + 20 + dWidth < winW) {
                dLeft = rect.right + padding + 20;
                dTop = Math.max(20, rect.top);
            } else if (rect.left - padding - 20 - dWidth > 0) {
                dLeft = rect.left - padding - 20 - dWidth;
                dTop = Math.max(20, rect.top);
            } else if (rect.bottom + padding + 20 + dHeight < winH) {
                dLeft = Math.max(20, rect.left);
                dTop = rect.bottom + padding + 20;
            } else {
                dLeft = (winW - dWidth) / 2;
                dTop = (winH - dHeight) / 2;
            }
        }

        this.dialog.style.left = `${Math.min(winW - dWidth - 20, Math.max(20, dLeft))}px`;
        this.dialog.style.top = `${Math.min(winH - dHeight - 20, Math.max(20, dTop))}px`;

        const textContainer = document.getElementById('cyber-tour-text');
        textContainer.innerHTML = '';
        if (this.typewriterInterval) clearInterval(this.typewriterInterval);

        textContainer.innerHTML = step.text;
        textContainer.style.opacity = 0;
        setTimeout(() => textContainer.style.opacity = 1, 150);

        const nextBtn = document.getElementById('cyber-tour-next');
        if (this.currentIndex === this.steps.length - 1) {
            nextBtn.innerHTML = 'READY // 登入系统 ★';
            nextBtn.style.background = 'var(--success, #10b981)';
            nextBtn.style.boxShadow = '0 0 15px rgba(16,185,129,0.4)';
        } else {
            nextBtn.innerHTML = 'NEXT 🚀';
            nextBtn.style.background = '#00f0ff';
            nextBtn.style.boxShadow = '0 0 15px rgba(0,240,255,0.4)';
        }
    }

    next() {
        this.currentIndex++;
        this.renderStep();
    }

    end() {
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 600);
        }
        localStorage.setItem('has_completed_tour_v2', 'true');
    }
}

// Data Definition and Global Invoker
window.startCyberTour = function () {
    const defaultSteps = [
        {
            selector: 'center',
            text: '<div style="text-align:center; margin-bottom: 20px;">' +
                  '<div style="font-size:40px; margin-bottom:10px;">🌌</div>' +
                  '<span style="font-family:\'Orbitron\'; font-size:22px; color:white; font-weight:bold;">FUTURE AI LAB</span>' +
                  '</div>' +
                  '<b style="color:#00f0ff;">欢迎登入【科技特长生培养网络】。</b><br><br>这是一个不同寻常的赛博空间，融合了前沿模型库、沉浸级学习雷达和全域知识舱。让我花一分钟为你加载核心链路。'
        },
        {
            selector: '.w-profile',
            text: '<b>🪪 你的神经元档案 (PROFILE)</b><br><br>左侧的卡片是你的极客身份卡，记录了你的<b>专属数字段位 (LV / UID)</b>和目前被解锁的全网技能徽章！这里是你战绩荣誉的大本营。'
        },
        {
            selector: '.holo-group',
            text: '<b>📊 全息能力切面 (HOLOGRAPHIC INDEX)</b><br><br>别再盯着普通的考试分数了！在这里，系统会自动监控你在各个学科维度上的探索深度，实时换算为<b>四大数据切片 (自我管理/基础认知/学科突破/技术栈)</b>，让你清晰看见自己的能力雷达。'
        },
        {
            selector: '#study-log-box',
            text: '<b>⏱️ 真实思考算力仪表板 (STUDY LOG)</b><br><br>我们连接了后端庞大的数据湖，能精准捕捉到你<b style="color:#10b981;">每天与系统交互投入的专注时间 (分钟数)</b> 并呈现出完整的行为热力榜。每次深度提问都会为你累积在这里的宝贵时长！'
        },
        {
            selector: '#ai-fab-btn',
            padding: 20,
            text: '<b>🤖 灵魂核心：Titan 大脑 (Virtual Teacher)</b><br><br>随时点击角落里的这个悬浮球，就可以呼叫内置的<b>【小创老师】</b>。它不是简单的问答机器人，而是一个可以为你<b>原生地用 Mermaid 画流程图、构建精美响应式矢量交互、并能解答物理方程</b>的殿堂级私教导师！'
        },
        {
            selector: '.dock-bar',
            padding: 15,
            text: '<b>🚀 超时空控制底座 (DOCK)</b><br><br>所有的超级应用，像<b>代码控制中心，培养图谱，分析系统</b>，都在这里沉浸式运行。只要把光标移过去，那些神秘功能正等着你调令。'
        },
        {
            selector: 'center',
            text: '<b>✅ 初始化参数已同步！</b><br><br>你的数字分身已锁定，现在就可以在右下角悬浮球尝试对向导说：<b style="color:#8b5cf6;">“请为我生成一张关于学习目标管理的思维脑图”</b>。随时可以在底座点击“<b>系统向导</b>”重新唤出本流程。'
        }
    ];
    
    const tour = new CyberTour(defaultSteps);
    tour.init();
};

// Auto start if never run
document.addEventListener('DOMContentLoaded', () => {
    // Only run on the main dashboard if it hasn't run before
    setTimeout(() => {
        if (!localStorage.getItem('has_completed_tour_v2') && document.querySelector('.main-stage')) {
            window.startCyberTour();
        }
    }, 1500); // 1.5s delay to let UI animations finish first
});
