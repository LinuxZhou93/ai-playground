const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/resources/carbon-x');
const slidesDir = path.join(dir, 'slides');

for (let i = 1; i <= 16; i++) {
    const padded = i.toString().padStart(2, '0');
    const mdFile = path.join(dir, `L${padded}.md`);
    if (!fs.existsSync(mdFile)) continue;
    
    const content = fs.readFileSync(mdFile, 'utf8');
    
    function extractRegex(regex, fallback = '') {
        const match = content.match(regex);
        return match ? match[1].trim() : fallback;
    }
    
    // parse Title
    const titleLine = extractRegex(/# (.*?)\n/);
    let cCode = `L${padded}`;
    let mainTitle = '极客实操';
    let subTitle = '探索与解构';
    
    if (titleLine.includes('：')) {
        let parts = titleLine.split('：');
        cCode = parts[0].trim();
        mainTitle = parts[1].trim();
        subTitle = parts[2] || '';
    } else if (titleLine.includes(' ')) {
        const split = titleLine.split(' ');
        cCode = split[0];
        mainTitle = split.slice(1).join(' ').split('：')[0];
        subTitle = split.slice(1).join(' ').split('：')[1] || '';
    }

    const moduleTextFull = extractRegex(/- \*\*所属模块\*\*：(.*?)\n/);
    const objText = extractRegex(/- \*\*教学目标\*\*：([\s\S]*?)(?=- \*\*|- ##|##)/);
    
    const introContext = extractRegex(/\*\*情境导入\*\*：(.*?)\n/);
    const introQuestion = extractRegex(/\*\*问题驱动\*\*：(.*?)\n/);
    
    const invText = extractRegex(/\*\*材料清单\*\*：\n([\s\S]*?)(?=\n\*\*操作步骤|\n###)/);
    const opText = extractRegex(/\*\*操作步骤\*\*：\n([\s\S]*?)(?=\n\*\*预期数据|\n\*\*安全提示|\n###)/);
    const dataText = extractRegex(/\*\*预期数据\*\*：\n?([\s\S]*?)(?=\n\*\*安全提示|\n###)/);
    const safetyText = extractRegex(/\*\*安全提示\*\*：\n?([\s\S]*?)(?=\n###)/);
    
    const retroText = extractRegex(/### 三、总结与反思[\s\S]*?\n([\s\S]*?)(?=###)/);
    const challText = extractRegex(/### 四、拓展挑战(?:.*?)\n([\s\S]*?)(?=##)/);
    
    function mdToHtml(md) {
        if (!md) return '';
        let lines = md.split('\n').filter(l => l.trim() !== '');
        let htmlContext = '<ul style="padding-left:20px;">';
        lines.forEach(l => {
            let pureText = l.replace(/^(\d+\.|-)\s/, '');
            // bold text replacement
            pureText = pureText.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00ff88;">$1</strong>');
            htmlContext += `<li style="margin-bottom: 15px;">${pureText}</li>`;
        });
        htmlContext += '</ul>';
        return htmlContext;
    }

    const compiledRetro = retroText
        .replace(/\*\*.*?师生活动.*?\*\*/g, '')
        .replace(/\*\*.*?学生展示\*\*：(.*?)\n/g, '<p><strong style="color:#00ccff">观察结论：</strong> $1</p>')
        .replace(/\*\*.*?教师点评\*\*：(.*?)\n/g, '<p><strong style="color:#00ff88">底层原理：</strong> $1</p>')
        .replace(/\*\*.*?知识建构\*\*：(.*?)\n/g, '<p><strong style="color:#ff3366">架构升华：</strong> $1</p>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Make code HTML
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Carbon-X - ${cCode} ${mainTitle}：${subTitle}</title>
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
    </style>
    <!-- 原生启发式辅助系统 (Titan AI) -->
    <link rel="stylesheet" href="../../../assets/css/titan-ai-assistant.css">
    <style>
        #titan-ai-container { bottom: 60px !important; right: 40px !important; z-index: 999999 !important; }
    </style>
</head>
<body>

    <div class="progress-indicator" id="top-progress" style="width: 0%;"></div>

    <div class="reveal">
        <div class="slides">
            
            <!-- Slide 1: 封面 -->
            <section data-transition="zoom" data-background-color="#07080c" data-background-image="../assets/bg/cover.png" data-background-opacity="0.2">
                <div class="slide-tag">REPORT · ${cCode}</div>
                <h1 class="neon-text-green" style="font-size: 3.2em; letter-spacing: 5px; margin-bottom: 0;">${mainTitle}</h1>
                <h2 style="font-size: 1.5em; color: #fff; letter-spacing: 2px; margin-top: 15px;">${subTitle}</h2>
                <div class="module-text" style="color: #00ccff; font-weight: bold; font-size: 0.6em; margin-top: 30px;">${moduleTextFull}</div>
                
                <div style="margin-top: 60px; font-size: 0.4em; color: #555; letter-spacing: 2px;">
                    FUTURECLASS × 碳基极客工坊 <br><br>
                    <span style="color:rgba(0,255,136,0.8); animation: pulse 2s infinite;">[ PRESS SPACE TO INITIATE ]</span>
                </div>
            </section>

            <!-- Slide 2: 教学目标 -->
            <section data-transition="fade" data-background-image="../assets/bg/data.png" data-background-opacity="0.1">
                <h2 class="neon-text-blue">OBJECTIVES</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">核心素养与通关要求</h3>
                <div class="glass-panel" style="text-align: left; font-size: 0.7em; line-height: 1.8;">
                     ${mdToHtml(objText)}
                </div>
            </section>

            <!-- Slide 3: 极客痛点导入 -->
            <section data-transition="convex" data-background-image="../assets/bg/hook.png" data-background-opacity="0.2">
                <h2 style="color: #ff3366;">THE HOOK</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">情境导入</h3>
                <div class="glass-panel" style="border-left: 4px solid #ff3366; text-align: left; background: rgba(255,51,102,0.05);">
                    <i class="fas fa-bolt" style="font-size: 2.5em; color: #ff3366; margin-bottom: 15px;"></i>
                    <p style="font-size: 0.8em; color: #fff; line-height: 1.8;"><strong>情境再现：</strong>${introContext}</p>
                    <div style="margin-top: 20px; padding: 15px; border-radius: 8px; background: rgba(0,0,0,0.5);">
                        <p style="font-size: 0.8em; color: #00ff88; margin: 0; font-family: 'Orbitron'; font-weight: bold;">[ QUESTION ]</p>
                        <p style="font-size: 0.7em; color: #ccc; margin-top: 10px;">${introQuestion}</p>
                    </div>
                </div>
            </section>

            <!-- Slide 4: 物料兵器库 -->
            <section data-transition="slide" data-background-image="../assets/bg/inventory.png" data-background-opacity="0.2">
                <h2 class="neon-text-blue">INVENTORY</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">装备与红线</h3>
                <div style="display: flex; gap: 30px;">
                    <div class="glass-panel" style="flex: 1; text-align: left; font-size: 0.6em;">
                        <h4 style="color: #00ccff; padding-bottom: 10px; border-bottom: 1px solid rgba(0,204,255,0.3);"><i class="fas fa-tools"></i> 硬件装备</h4>
                        ${mdToHtml(invText)}
                    </div>
                    <div class="glass-panel" style="flex: 1; background: rgba(255,51,102,0.05); border-color: rgba(255,51,102,0.3); text-align: left; font-size: 0.6em;">
                        <h4 style="color: #ff3366; padding-bottom: 10px; border-bottom: 1px solid rgba(255,51,102,0.3);"><i class="fas fa-exclamation-triangle"></i> 安全阈值警告</h4>
                        <p style="color: #ccc; line-height: 1.8; margin-top: 15px;">${safetyText.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ff3366">$1</strong>')}</p>
                    </div>
                </div>
            </section>

            <!-- Slide 5: 执行协议 -->
            <section data-transition="fade" data-background-image="../assets/bg/cover.png" data-background-opacity="0.1">
                <h2 class="neon-text-green">EXECUTION PROTOCOL</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">极客实操步骤</h3>
                <div class="glass-panel" style="text-align: left; font-size: 0.6em; line-height: 1.8; max-height: 50vh; overflow-y: auto;">
                    ${mdToHtml(opText)}
                </div>
            </section>
            
            <!-- Slide 6: 数据矩阵复盘 -->
            <section data-transition="zoom" data-background-image="../assets/bg/data.png" data-background-opacity="0.2">
                <h2 class="neon-text-blue">DATA MATRIX</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">预期数据扫描</h3>
                <div class="glass-panel" style="border-top: 4px solid #00ff88; text-align: left; background: rgba(0,255,136,0.05);">
                    <i class="fas fa-chart-network" style="font-size: 2em; color: #00ff88; margin-bottom: 15px;"></i>
                    <p style="font-size: 0.8em; color: #ccc; line-height: 1.8;">${dataText.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00ff88">$1</strong>')}</p>
                </div>
            </section>

            <!-- Slide 7: 底层法则重建 -->
            <section data-transition="slide" data-background-image="../assets/bg/data.png" data-background-opacity="0.1">
                <h2 class="neon-text-blue">ARCHITECTURE</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">反思与物理法则重建</h3>
                <div class="glass-panel" style="text-align: left; font-size: 0.7em; line-height: 1.8;">
                    ${compiledRetro}
                </div>
            </section>

            <!-- Slide 8: 拓展边界 -->
            <section data-transition="convex" data-background-image="../assets/bg/hook.png" data-background-opacity="0.2">
                <h2 class="neon-text-green">PUSH THE LIMITS</h2>
                <h3 style="font-size: 1.2em; color: #aaa; margin-bottom: 40px;">进阶拓展挑战</h3>
                <div class="glass-panel" style="border-left: 4px solid #ffff00; background: rgba(255,255,0,0.05); text-align: left;">
                    <i class="fas fa-space-shuttle" style="font-size: 2em; color: #ffff00; margin-bottom: 15px;"></i>
                    <p style="font-size: 0.7em; color: #ccc; line-height: 1.8;">${challText.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffff00">$1</strong>')}</p>
                </div>
                
                <div style="margin-top: 40px; padding: 20px; border: 1px dashed rgba(0,255,136,0.6); border-radius: 12px; background: rgba(0,255,136,0.05);">
                    <p style="color: #00ff88; font-size: 0.7em; font-weight: bold; margin: 0; letter-spacing: 1px; line-height: 1.5;">
                        <i class="fas fa-robot"></i> 遇到理解瓶颈？不知道如何开展下一步实操？<br>
                        马上点击右下角的【小创老师】，向它索要本章节的专属启发协助！
                    </p>
                </div>
            </section>

        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            controls: true,
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
                        "嗨！我已经把《${mainTitle}：${subTitle}》的架构大纲全装载完毕啦～\\n你想从第一页的基础定义看起，还是跳过新手村直接跟我辩论拓展挑战？"
                    );
                }
            }, 1000);
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(slidesDir, `${cCode}.html`), html, 'utf-8');
    console.log('Fully Expanded Slide:', cCode);
}
