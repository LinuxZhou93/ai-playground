class CyberManual {
    constructor() {
        this.overlayId = 'cyber-manual-overlay';
        this.activeTab = 'student'; // 'student', 'parent', 'geek'
    }

    init() {
        if (document.getElementById(this.overlayId)) return this.open();

        // 注入专属内部样式
        const style = document.createElement('style');
        style.textContent = `
            #cyber-manual-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(5, 5, 10, 0.7); backdrop-filter: blur(10px);
                z-index: 999995; opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
                display: flex; justify-content: center; align-items: center;
                font-family: 'Noto Sans SC', sans-serif;
            }
            #cyber-manual-overlay.active {
                opacity: 1; pointer-events: auto;
            }
            .cyber-manual-window {
                width: 900px; max-width: 95vw; height: 75vh; max-height: 800px;
                background: rgba(13, 17, 23, 0.85); border: 1px solid rgba(0, 240, 255, 0.3);
                border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.1) inset;
                display: flex; flex-direction: column; overflow: hidden;
                transform: scale(0.95); opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #cyber-manual-overlay.active .cyber-manual-window {
                transform: scale(1); opacity: 1;
            }
            .cm-header {
                height: 60px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
                background: linear-gradient(90deg, rgba(0,240,255,0.05) 0%, transparent 100%);
            }
            .cm-header-title {
                display: flex; align-items: center; gap: 12px; font-family: 'Orbitron'; font-weight: 800; font-size: 18px; color: #e2e8f0;
            }
            .cm-close-btn {
                background: rgba(255, 255, 255, 0.05); border: none; color: #94a3b8; font-size: 16px; width: 32px; height: 32px;
                border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
            }
            .cm-close-btn:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
            .cm-body {
                display: flex; flex: 1; overflow: hidden;
            }
            .cm-sidebar {
                width: 220px; border-right: 1px solid rgba(255, 255, 255, 0.1); padding: 20px 10px;
                display: flex; flex-direction: column; gap: 8px; font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
            }
            .cm-tab {
                padding: 12px 16px; border-radius: 8px; color: #94a3b8; cursor: pointer; font-size: 14px; transition: 0.2s;
                display: flex; align-items: center; gap: 10px; font-weight: 600; border: 1px solid transparent;
            }
            .cm-tab:hover { background: rgba(255, 255, 255, 0.05); color: #cbd5e1; }
            .cm-tab.active { background: rgba(0, 240, 255, 0.1); color: #00f0ff; border: 1px solid rgba(0, 240, 255, 0.3); box-shadow: 0 0 15px rgba(0, 240, 255, 0.1) inset; }
            .cm-content-area {
                flex: 1; padding: 30px 40px; overflow-y: auto; color: #cbd5e1; font-size: 14px; line-height: 1.7; scroll-behavior: smooth;
            }
            .cm-content-area::-webkit-scrollbar { width: 6px; }
            .cm-content-area::-webkit-scrollbar-track { background: transparent; }
            .cm-content-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
            
            /* Markdown Typography */
            .cm-content-area h1 { color: #fff; font-size: 24px; margin: 0 0 20px 0; border-bottom: 2px solid rgba(0, 240, 255, 0.2); padding-bottom: 10px; }
            .cm-content-area h2 { color: #e2e8f0; font-size: 18px; margin: 24px 0 12px 0; display:flex; align-items:center; gap:8px;}
            .cm-content-area h2::before { content: '■'; color: #00f0ff; font-size: 10px; }
            .cm-content-area p { margin-bottom: 16px; }
            .cm-content-area ul { margin-bottom: 16px; padding-left: 20px; }
            .cm-content-area li { margin-bottom: 8px; color: #94a3b8; }
            .cm-content-area strong { color: #fff; }
            .cm-badge { display:inline-block; padding:2px 6px; border-radius:4px; font-size:11px; font-family:'Orbitron'; font-weight:800; background:rgba(0,240,255,0.15); color:#00f0ff; border:1px solid rgba(0,240,255,0.3); margin:0 4px;}
            .cm-badge.warning { background:rgba(245,158,11,0.15); color:#f59e0b; border-color:rgba(245,158,11,0.3); }
            .cm-code { background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:monospace; color:#3b82f6;}
            .cm-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
            .cm-func-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 8px; transition: 0.2s; }
            .cm-func-card:hover { border-color: rgba(0,240,255,0.3); background: rgba(0,240,255,0.02); }
        `;
        document.head.appendChild(style);

        // 创建 DOM
        const overlay = document.createElement('div');
        overlay.id = this.overlayId;
        
        overlay.innerHTML = `
            <div class="cyber-manual-window">
                <div class="cm-header">
                    <div class="cm-header-title">
                        <span style="font-size:22px;">📚</span>
                        SYSTEM MANUAL <span style="font-size:12px; color:#64748b; font-weight:500;">v2.0 指南矩阵</span>
                    </div>
                    <button class="cm-close-btn" id="cyber-manual-close">✕</button>
                </div>
                <div class="cm-body">
                    <div class="cm-sidebar">
                        <div class="cm-tab active" data-tab="student">🚀 学员生存指北</div>
                        <div class="cm-tab" data-tab="parent">👨‍👩‍👦 家长领航手册</div>
                        <div class="cm-tab" data-tab="geek">🧬 极客隐藏终端</div>
                    </div>
                    <div class="cm-content-area" id="cyber-manual-content">
                        <!-- Content Injected Here -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // 绑定事件
        document.getElementById('cyber-manual-close').addEventListener('click', () => this.close());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        const tabs = overlay.querySelectorAll('.cm-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderContent(tab.getAttribute('data-tab'));
            });
        });

        // 初始渲染并展开
        this.renderContent('student');
        this.open();
    }

    renderContent(tabId) {
        const contentArea = document.getElementById('cyber-manual-content');
        let html = '';

        if (tabId === 'student') {
            html = `
                <h1>🚀 学员生存指北：踏入科技迷宫</h1>
                <p>欢迎探索系统的核心区。这可不是让你单纯背单词的地方，而是一个能够<b>运行代码、生成矢量架构并且时刻响应你的超级终端</b>。</p>
                
                <h2>1. 右下角的小创老师能做什么？</h2>
                <div class="cm-card-grid">
                    <div class="cm-func-card">
                        <h3 style="margin:0 0 10px 0; color:#fff; font-size:14px;">🎨 神级画图驱动</h3>
                        <p style="font-size:12px; color:#94a3b8; margin:0;">不需要任何复杂配置，直接告诉小创老师：“<span class="cm-badge">帮我画一张马斯克星舰的高清图片</span>”，内置的 Flux 大模型就会即刻出图！</p>
                    </div>
                    <div class="cm-func-card">
                        <h3 style="margin:0 0 10px 0; color:#fff; font-size:14px;">🛠️ 逻辑思维梳理 (Mermaid)</h3>
                        <p style="font-size:12px; color:#94a3b8; margin:0;">想要理清某个算法？你可以问：“<span class="cm-badge">请用脑图帮我总结递归的思想</span>”。引擎会自动为你渲染高清交互式架构图。</p>
                    </div>
                    <div class="cm-func-card">
                        <h3 style="margin:0 0 10px 0; color:#fff; font-size:14px;">📐 纯手工矢量透视 (SVG)</h3>
                        <p style="font-size:12px; color:#94a3b8; margin:0;">如果在做物理实验，需要精密切面，告诉它：“<span class="cm-badge">请用响应式 SVG 给画个弹簧振子</span>”，绝无像素损失的矢量图形即刻呈现。</p>
                    </div>
                    <div class="cm-func-card">
                        <h3 style="margin:0 0 10px 0; color:#fff; font-size:14px;">⚡ 联网搜索引擎 (Bing)</h3>
                        <p style="font-size:12px; color:#94a3b8; margin:0;">当大模型需要真实的资料辅助时，它会自动在后台调度系统联网为您捕捉最新的图片资源。</p>
                    </div>
                </div>

                <h2>2. 我要怎样推进【能力网】的进度条？</h2>
                <p>仪表盘上那些名为 <b>HOLOGRAPHIC INDEX</b> 和徽章的组件，记录的是你每一次有效提问累积的<b>专注力算力与知识厚度</b>。</p>
                <ul>
                    <li>每次深度有效的询问，将被转化为 <span class="cm-badge">Study Log</span> 里的真实专注分钟数。</li>
                    <li>当能力图的进度拉满，系统将会自动点亮你左侧的<b>科技护照头衔徽章</b>。</li>
                </ul>
            `;
        } else if (tabId === 'parent') {
            html = `
                <h1>👨‍👩‍👦 家长领航手册：透视教育数据</h1>
                <p>这里没有“冷冰冰的打卡监控”，只有通过大模型对提问轨迹进行语义萃取后，展现出来的<b>核心学习倾向和高精尖能力图谱</b>。</p>
                
                <h2>1. “他在系统里到底干了什么？”</h2>
                <p>我们采用 <span class="cm-badge warning">隐私日志引擎</span>。您可以直接点击右侧 <b>STUDY LOG</b> 里面的蓝色最近活动记录。</p>
                <ul>
                    <li>点击任意一条 <code>15:43 ⏱️</code> 的足迹，立刻弹出原生浮层还原当时的深层问答情况。</li>
                    <li>这并非监控键盘，而是量化孩子主动提问与探索的能力，那些敢于向AI提出大体量深度问题的孩子，会有远超常人的 <b>Missions 数值</b> 飞升。</li>
                </ul>

                <h2>2. 能力图谱到底有多精准？</h2>
                <p>我们的 <b>HOLOGRAPHIC INDEX (全息指数)</b> 从四个维度剖析：</p>
                <div style="background:rgba(255,255,255,0.02); padding:16px; border-left:3px solid #10b981; border-radius:4px; margin-bottom:16px;">
                    <strong>自我管理 (Self Mgmt)</strong>: 分析孩子在设定目标类的提问频次。<br>
                    <strong>基础思维 (Cognition)</strong>: 在逻辑、数学推演上的钻研与对话时长。<br>
                    <strong>学科突破 (Academic)</strong>: 指向性的传统学科与知识点探索。<br>
                    <strong>技术栈 (Tech Stack)</strong>: 编程语言、架构图(Mermaid)以及算法工程实践的比重。
                </div>
            `;
        } else if (tabId === 'geek') {
            html = `
                <h1>🧬 极客暗网：系统高阶控制权</h1>
                <p>作为顶级黑客与操作人员，你需要掌握这座信息堡垒的底座调用指令。</p>
                
                <h2>1. 秘密入口点 (Shortcuts)</h2>
                <ul>
                    <li><b>一键重塑向导</b>：在主控制台最下方 <code>Dock</code> 栏目点击 <span class="cm-code">系统向导</span> ，可以强制重走新手教程。</li>
                    <li><b>全局清空记录</b>：在对话区连续输入清除指令会彻底重置 AI 助理记忆。但您的统计任务分数进度（记录在云端 Supabase 数据库）始终留存。</li>
                </ul>

                <h2>2. 魔法指令词汇表 (Cheat Sheet)</h2>
                <p>当你需要对 Titan AI （小创老师）发起高级指令时，只要在句首带上以下词缀，即可强制引擎按顶级模式渲染：</p>
                <table style="width:100%; text-align:left; border-collapse: collapse; margin-top:20px; font-size:12px;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.2); color:#fff;">
                            <th style="padding:10px;">魔法前缀</th>
                            <th style="padding:10px;">执行响应引擎</th>
                            <th style="padding:10px;">视觉输出表现</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px dashed rgba(255,255,255,0.05); color:#94a3b8;">
                            <td style="padding:10px;"><span class="cm-code">/Mindmap/</span></td>
                            <td style="padding:10px;">Mermaid 脑图引擎</td>
                            <td style="padding:10px;">思维扩散的互动层级图</td>
                        </tr>
                        <tr style="border-bottom: 1px dashed rgba(255,255,255,0.05); color:#94a3b8;">
                            <td style="padding:10px;"><span class="cm-code">/Draw/</span></td>
                            <td style="padding:10px;">Pollinations.AI 节点</td>
                            <td style="padding:10px;">原生图片下行指令流</td>
                        </tr>
                        <tr style="border-bottom: 1px dashed rgba(255,255,255,0.05); color:#94a3b8;">
                            <td style="padding:10px;"><span class="cm-code">/Vector/</span></td>
                            <td style="padding:10px;">SVG Render 组件</td>
                            <td style="padding:10px;">超清晰，深色科幻蓝的数学图形代码</td>
                        </tr>
                    </tbody>
                </table>
                <br>
                <p style="color:#64748b; font-size:12px;"><i>>> // 本文档数据直接由大模型引擎与后台控制总线映射同步，所有说明随版本迭代实时进化。</i></p>
            `;
        }

        // Fade out and in
        contentArea.style.opacity = 0;
        setTimeout(() => {
            contentArea.innerHTML = html;
            contentArea.scrollTo(0, 0);
            contentArea.style.opacity = 1;
        }, 200);
    }

    open() {
        const overlay = document.getElementById(this.overlayId);
        if (overlay) overlay.classList.add('active');
    }

    close() {
        const overlay = document.getElementById(this.overlayId);
        if (overlay) overlay.classList.remove('active');
    }
}

window.startCyberManual = function() {
    if (!window.cyberManualInstance) {
        window.cyberManualInstance = new CyberManual();
    }
    window.cyberManualInstance.init();
};
