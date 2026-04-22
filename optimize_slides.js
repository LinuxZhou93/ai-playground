const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/resources/carbon-x/slides');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'L02.html' && f !== 'L15.html');

for (const file of files) {
    const filePath = path.join(dir, file);
    let original = fs.readFileSync(filePath, 'utf-8');

    // Extracting basic info using regex
    const slideTagMatch = original.match(/<div class="slide-tag">([^<]+)<\/div>/);
    const h1Match = original.match(/<h1 class="neon-text-green">([^<]+)<\/h1>/);
    const h2Match = original.match(/<h2>([^<]+)<\/h2>/);
    const moduleTextMatch = original.match(/<div class="module-text">([^<]+)<\/div>/);
    const challengeTextMatch = original.match(/<p style="[^"]*font-size: *1\.0em;[^"]*text-align: *left;[^"]*">([\s\S]*?)<\/p>/) || original.match(/<p>([\s\S]*?)<\/p>/);

    // Fallbacks if not found
    const slideTag = slideTagMatch ? slideTagMatch[1] : `REPORT · ${file.replace('.html', '')}`;
    const h1 = h1Match ? h1Match[1] : '极客实操';
    const h2 = h2Match ? h2Match[1] : '工程挑战';
    const moduleText = moduleTextMatch ? moduleTextMatch[1] : 'MOZI LAUNCH';
    const challengeText = challengeTextMatch ? challengeTextMatch[1].trim() : '完成本节课的硬核工程闭环挑战。';

    const newHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Carbon-X - ${file.replace('.html', '')} ${h1}：${h2}</title>
    <!-- Reveal.js 核心及极客主题 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reset.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/black.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+SC:wght@400;700;900&family=JetBrains+Mono&display=swap" rel="stylesheet">
    
    <!-- 引入 FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        /* FUTURECLASS x NOTEBOOKLM 极客风格 */
        .reveal { font-family: 'Noto Sans SC', sans-serif; background: #07080c; }
        .reveal h1, .reveal h2, .reveal h3 { font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-weight: 900; text-transform: uppercase; }
        
        /* 霓虹特效 */
        .neon-text-green { background: linear-gradient(135deg, #00ff88, #00cc66); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .neon-text-blue { background: linear-gradient(135deg, #00ccff, #0088ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .slide-tag { display: inline-block; font-size: 0.4em; padding: 4px 16px; border: 1px solid rgba(0,255,136,0.3); border-radius: 20px; color: #00ff88; letter-spacing: 2px; margin-bottom: 20px; font-family: 'Orbitron'; background: rgba(0,255,136,0.05); }
        .module-text { font-size: 0.5em; color: #888; letter-spacing: 4px; margin-top: 10px; text-transform: uppercase; }
        
        .glass-panel { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(10px); }
        
        /* FutureClass 进度线 */
        .progress-indicator { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #00ff88, #00ccff); z-index: 1001; transition: width 0.3s ease; }
        
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    </style>
    <!-- 原生启发式辅助系统 (Titan AI) -->
    <link rel="stylesheet" href="../../../assets/css/titan-ai-assistant.css">
    <style>
        /* 针对 PPT 特殊场景：微调小创老师蓝色星球的位置，避免遮挡底部操作提示文字 */
        #titan-ai-container {
            bottom: 60px !important;
            right: 40px !important;
            z-index: 999999 !important;
        }
    </style>
</head>
<body>

    <div class="progress-indicator" id="top-progress" style="width: 0%;"></div>

    <!-- PPT 核心 -->
    <div class="reveal">
        <div class="slides">
            
            <!-- Slide 1: 封面 -->
            <section data-transition="zoom" data-background-color="#07080c">
                <div class="slide-tag">${slideTag}</div>
                <h1 class="neon-text-green" style="font-size: 3.5em; letter-spacing: 5px; margin-bottom: 0;">${h1}</h1>
                <h2 style="font-size: 1.8em; color: #fff; letter-spacing: 2px;">${h2}</h2>
                <div class="module-text" style="color: #00ccff; font-weight: bold; font-size: 0.6em;">${moduleText}</div>
                
                <div style="margin-top: 40px; font-size: 0.4em; color: #555; letter-spacing: 2px;">
                    FUTURECLASS × 碳基极客工坊 <br><br>
                    <span style="color:rgba(0,255,136,0.8); animation: pulse 2s infinite;">[ PRESS SPACE TO INITIATE ]</span>
                </div>
            </section>

            <!-- Slide 2: 工程挑战 -->
            <section data-transition="fade">
                <h2 class="neon-text-blue">THE CHALLENGE</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">核心实操演练</h3>
                
                <div style="display: flex; gap: 30px; justify-content: center;">
                    <div class="glass-panel" style="flex: 1; border-color: rgba(0,255,136,0.3);">
                        <i class="fas fa-rocket" style="font-size: 2.5em; color: #00ff88; margin-bottom: 15px;"></i>
                        <h4 style="color: #00ff88;">任务目标 / MISSION OBJECTIVE</h4>
                        <p style="font-size: 0.8em; text-align: left; color: #ccc; line-height: 1.8;">
                            ${challengeText.replace(/本次核心实操：|本次核心任务：/, '')}
                        </p>
                    </div>
                </div>
            </section>

            <!-- Slide 3: Q&A / 启发探讨 -->
            <section data-transition="slide">
                <h2 class="neon-text-green">启发式探讨 / EXPLORATION</h2>
                <h3 style="font-size: 1.2em; color: #888; margin-bottom: 30px;">站在架构师的高度审视你的工程</h3>
                
                <div style="display: flex; gap: 20px; text-align: left;">
                    <div class="glass-panel" style="flex: 1; padding: 20px; border-top: 4px solid #00ccff; background: rgba(0,204,255,0.05);">
                        <i class="fas fa-lightbulb" style="font-size: 2em; color: #00ccff; margin-bottom: 15px;"></i>
                        <h4 style="font-size: 1em; color: #fff;">Q1: 工程底层的反思</h4>
                        <p style="font-size: 0.7em; color: #aaa; margin-top: 10px; line-height: 1.6;">如果你是未来这款产品的总工，当遇到极端参数失效或资源瓶颈时，会怎样重新设计架构？尝试将当前挑战中遇到的某个致命 Bug，转化为值得进一步深究的物理法则或软件逻辑命题。</p>
                    </div>
                </div>

                <div style="margin-top: 40px; padding: 20px; border: 1px dashed rgba(0,255,136,0.6); border-radius: 12px; background: rgba(0,255,136,0.05);">
                    <p style="color: #00ff88; font-size: 0.85em; font-weight: bold; margin: 0; letter-spacing: 1px; line-height: 1.5;">
                        <i class="fas fa-robot"></i> 遇到理解瓶颈？不知道如何开展下一步实操？<br>
                        点击右下角的【小创老师】，向它索要本章节的《底层思维导图》吧！
                    </p>
                </div>
            </section>

        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            controls: false,
            progress: false,
            center: true,
            transition: 'slide'
        });

        Reveal.on('slidechanged', event => {
            const total = Reveal.getTotalSlides() - 1;
            const current = event.indexh;
            const pct = total === 0 ? 100 : (current / total) * 100;
            document.getElementById('top-progress').style.width = pct + '%';
        });
    </script>
    <script src="../../../assets/js/titan-ai-assistant.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (window.TitanAIAssistantInstance) {
                    window.TitanAIAssistantInstance.popHeuristicIntervention(
                        "嗨！我已经把《${h1}：${h2}》这节课的技术大纲都装载完毕啦～\\n你想直接从硬核原理开始探讨，还是先看看极客工程的避坑指南呢？"
                    );
                }
            }, 1000);
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(filePath, newHtml, 'utf-8');
    console.log('Optimized:', file);
}
