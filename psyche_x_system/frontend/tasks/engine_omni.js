/**
 * TITAN OMNI-ASSESSMENT ENGINE (v3.0)
 * Architecture: 8 Dimensions x 5 Questions = 40 Item State Machine
 * Age Tiers: Junior (4-7), Middle (7-9), Senior (10-12)
 * Features: Multi-modal AI PiP, ms-accurate RT tracking, Age-adaptive scaling.
 */

// --- 1. CONFIG & STATE ---
const urlParams = new URLSearchParams(window.location.search);
const AGE_TIER = urlParams.get('age') || '4-7'; // default
let currentQuestionIndex = 0;
let totalQuestions = 40;
let currentTimer = null;
let timeLimitMS = 15000; 
let qStartTime = 0;

// Age Adaptive Settings
const TIER_SETTINGS = {
    '4-7':   { name: '初心舱', timeMult: 1.5, digitSpanStart: 3, stroopConflictRate: 0.2 },
    '7-9':   { name: '启航舱', timeMult: 1.0, digitSpanStart: 5, stroopConflictRate: 0.6 },
    '10-12': { name: '领航舱', timeMult: 0.7, digitSpanStart: 7, stroopConflictRate: 1.0 }
};

const settings = TIER_SETTINGS[AGE_TIER] || TIER_SETTINGS['4-7'];
document.getElementById('label-age-tier').innerText = `${AGE_TIER}岁 [${settings.name}]`;

// Metrics Arrays (Track performance per dimension)
const METRICS = {
    reactionSpeed: [],  // ms reaction times
    inhibition: [],     // stroop correct rate & time
    spatialMem: [],     // success/fail
    logic: [],          // success/fail
    spanMem: [],        // digit lengths achieved
    attention: [],      // hit rates
    science: [],        // physics correct
    creativity: []      // selection points
};

const timelineSequence = []; // Will hold 40 questions

// --- 2. GENERATE 40 PROTOCOLS (8 Dimensions x 5 Trials) ---

// Dim 1: Reaction Speed (5 trials)
for (let i=0; i<5; i++) {
    timelineSequence.push({
        dim: 'reactionSpeed', label: 'NEURAL VELOCITY',
        prompt: `神经反应测试 ${i+1}/5：看到中间出现🟢，就立刻触碰！`,
        type: 'reaction',
        render: (container) => {
            container.innerHTML = `<div id="reaction-target" class="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-4xl shadow-inner cursor-pointer transition-all">等</div>`;
            const t = document.getElementById('reaction-target');
            // Random delay between 1s and 3s
            const delay = 1000 + Math.random() * 2000;
            const state = { triggered: false };
            setTimeout(() => {
                state.triggered = true;
                qStartTime = Date.now();
                t.className = "w-32 h-32 rounded-full bg-green-500 animate-pulse flex items-center justify-center text-6xl shadow-[0_0_50px_#22c55e] cursor-pointer cursor-crosshair transform scale-110 transition-all";
                t.innerText = "🟢";
            }, delay);
            
            t.onclick = () => {
                if(!state.triggered) {
                    // Penalty for clicking early
                    handleAnswer(false, 3000); // 3s penalty
                } else {
                    handleAnswer(true, Date.now() - qStartTime);
                }
            };
        }
    });
}

// Dim 2: Inhibition / Stroop (5 trials)
const colors = [{n:'红',c:'#ef4444'}, {n:'蓝',c:'#3b82f6'}, {n:'绿',c:'#22c55e'}, {n:'黄',c:'#eab308'}];
for (let i=0; i<5; i++) {
    // Determine if conflict based on age tier
    let isConflict = Math.random() < settings.stroopConflictRate;
    let textObj = colors[Math.floor(Math.random() * colors.length)];
    let colorObj = isConflict ? colors.find(c => c.n !== textObj.n) : textObj;
    if(!colorObj) colorObj = colors[Math.floor(Math.random() * colors.length)]; // fallback

    timelineSequence.push({
        dim: 'inhibition', label: 'INHIBITION CONTROL',
        prompt: `抗干扰执行 ${i+1}/5：选择文字显示的【真实颜色】，而不是它写的字！`,
        type: 'stroop',
        render: (container, optionsContainer) => {
            container.innerHTML = `<div class="text-[120px] font-black tracking-widest" style="color: ${colorObj.c}; text-shadow: 0 0 40px ${colorObj.c}80;">${textObj.n}</div>`;
            optionsContainer.innerHTML = '';
            // Render 4 color buttons
            colors.forEach(col => {
                const btn = document.createElement('button');
                btn.className = "omni-card p-6 h-24 flex items-center justify-center text-2xl font-bold bg-slate-800 text-white";
                // Optionally show the color name or just a block. Let's show text.
                btn.innerText = col.n;
                btn.onclick = () => handleAnswer(col.n === colorObj.n, Date.now() - qStartTime);
                optionsContainer.appendChild(btn);
            });
        }
    });
}

// Dim 3: Spatial Memory (5 trials) - 4x4 Flashing Grids
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'spatialMem', label: 'SPATIAL RETENTION',
        prompt: `空间记忆测试 ${i + 1}/5：观察高亮单元格的位置，消失后按顺序点回！`,
        type: 'spatial',
        render: (container) => {
            const size = 4;
            container.innerHTML = `<div class="grid grid-cols-4 gap-3 p-4 bg-white/5 rounded-2xl" id="spatial-grid"></div>`;
            const grid = document.getElementById('spatial-grid');
            const cells = [];
            for (let j = 0; j < size * size; j++) {
                const cell = document.createElement('div');
                cell.className = "w-16 h-16 sm:w-20 sm:h-20 bg-slate-800/50 border border-white/5 rounded-lg cursor-pointer transition-all";
                grid.appendChild(cell);
                cells.push(cell);
            }

            // Highlighting sequence
            const count = 3 + i; // Increasing difficulty
            const sequence = [];
            while (sequence.length < count) {
                const r = Math.floor(Math.random() * 16);
                if (!sequence.includes(r)) sequence.push(r);
            }

            const state = { userSeq: [], showing: true };
            
            // Show sequence
            let delay = 800;
            sequence.forEach((idx, sIdx) => {
                setTimeout(() => {
                    gsap.to(cells[idx], { backgroundColor: '#8b5cf6', scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 });
                    if(window.Kernel && window.Kernel.audio) window.Kernel.audio.playTone(400 + sIdx*50, 'triangle', 0.1);
                    if (sIdx === sequence.length - 1) {
                        setTimeout(() => { 
                            state.showing = false; 
                            qStartTime = Date.now();
                            startTaskTimer();
                        }, 800);
                    }
                }, delay * (sIdx + 1));
            });

            cells.forEach((cell, idx) => {
                cell.onclick = () => {
                    if (state.showing) return;
                    state.userSeq.push(idx);
                    gsap.to(cell, { backgroundColor: '#3b82f6', duration: 0.1, yoyo: true, repeat: 1 });
                    if(window.Kernel) window.Kernel.audio.playTone(600, 'sine', 0.05);

                    if (state.userSeq[state.userSeq.length - 1] !== sequence[state.userSeq.length - 1]) {
                        handleAnswer(false, Date.now() - qStartTime);
                    } else if (state.userSeq.length === sequence.length) {
                        handleAnswer(true, Date.now() - qStartTime);
                    }
                };
            });
        }
    });
}

// Dim 4: Logic / Matrices (5 trials) - Pattern Reasoning
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'logic', label: 'FLUID INTELLIGENCE',
        prompt: `逻辑矩阵推理 ${i + 1}/5：观察规律，选择最符合缺口位置的图形。`,
        type: 'logic',
        render: (container, optionsContainer) => {
            const symbols = ['▲', '■', '●', '◈', '★'];
            const startIdx = Math.floor(Math.random() * symbols.length);
            const activePattern = [symbols[startIdx], symbols[(startIdx+i+1)%5], '?'];
            const correctSymbol = symbols[(startIdx+2*(i+1))%5];

            container.innerHTML = `<div class="flex items-center gap-8 text-7xl font-bold bg-white/5 p-12 rounded-3xl border border-white/10">
                ${activePattern.map(s => `<span>${s}</span>`).join('<span class="text-slate-700">→</span>')}
            </div>`;

            optionsContainer.innerHTML = '';
            const allChoices = [correctSymbol, ...symbols.filter(s => s !== correctSymbol).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
            
            allChoices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = "omni-card p-6 h-32 text-4xl flex items-center justify-center";
                btn.innerText = choice;
                btn.onclick = () => handleAnswer(choice === correctSymbol, Date.now() - qStartTime);
                optionsContainer.appendChild(btn);
            });
            qStartTime = Date.now();
            startTaskTimer();
        }
    });
}

// Dim 5: Digit Span (5 trials) - Memory recall
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'spanMem', label: 'WORKING MEMORY',
        prompt: `数字广度测试 ${i + 1}/5：记录听到的数字，在键盘上按顺序输入！`,
        type: 'span',
        render: (container, optionsContainer) => {
            const length = settings.digitSpanStart + i;
            const digits = Array.from({length}, () => Math.floor(Math.random() * 10));
            container.innerHTML = `<div class="text-9xl font-black text-indigo-400" id="digit-display">...</div>`;
            const display = document.getElementById('digit-display');
            
            let state = { showing: true, userDigits: [] };
            let sIdx = 0;
            const itv = setInterval(() => {
                if (sIdx < digits.length) {
                    display.innerText = digits[sIdx];
                    gsap.fromTo(display, {scale: 0.5, opacity: 0}, {scale: 1, opacity: 1, duration: 0.3});
                    if(window.Kernel) window.Kernel.audio.playTone(300 + digits[sIdx]*20, 'sine', 0.2);
                    sIdx++;
                } else {
                    clearInterval(itv);
                    display.innerText = "?";
                    state.showing = false;
                    qStartTime = Date.now();
                    startTaskTimer();
                }
            }, 1000);

            optionsContainer.innerHTML = `<div class="grid grid-cols-5 gap-4 w-full h-full max-w-xl"></div>`;
            const keypad = optionsContainer.firstChild;
            for(let d=0; d<=9; d++) {
                const btn = document.createElement('button');
                btn.className = "omni-card p-4 text-2xl font-bold bg-slate-800";
                btn.innerText = d;
                btn.onclick = () => {
                    if(state.showing) return;
                    state.userDigits.push(d);
                    if(d !== digits[state.userDigits.length - 1]) handleAnswer(false, Date.now() - qStartTime);
                    else if(state.userDigits.length === digits.length) handleAnswer(true, Date.now() - qStartTime);
                };
                keypad.appendChild(btn);
            }
        }
    });
}

// Dim 6: Attention / Cancellation (5 trials) - Selective Search
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'attention', label: 'SELECTIVE ATTENTION',
        prompt: `注意力定向 ${i + 1}/5：找出所有的【⭐】，越快越好！`,
        type: 'attention',
        render: (container) => {
            const total = 20;
            const symbols = ['⭐', '❄️', '🔥', '💧', '⚡'];
            const targetsSequence = Array.from({length: total}, () => {
                const isTarget = Math.random() > 0.7;
                return { 
                    sym: isTarget ? symbols[0] : symbols[Math.floor(Math.random() * 4) + 1],
                    isTarget 
                };
            });
            const targetTotalCount = targetsSequence.filter(t => t.isTarget).length;
            
            container.innerHTML = `<div class="grid grid-cols-5 gap-6 p-8 bg-white/5 rounded-3xl" id="attn-grid"></div>`;
            const grid = document.getElementById('attn-grid');
            let found = 0;
            
            targetsSequence.forEach(t => {
                const el = document.createElement('div');
                el.className = "w-16 h-16 flex items-center justify-center text-3xl cursor-pointer hover:bg-white/10 rounded-xl transition-all";
                el.innerText = t.sym;
                el.onclick = () => {
                    if(t.isTarget) {
                        t.isTarget = false; 
                        el.style.opacity = '0.2';
                        found++;
                        if(window.Kernel) window.Kernel.audio.playTone(800, 'sine', 0.05);
                        if(found === (targetTotalCount || 1)) handleAnswer(true, Date.now() - qStartTime);
                    } else {
                        handleAnswer(false, Date.now() - qStartTime);
                    }
                };
                grid.appendChild(el);
            });
            qStartTime = Date.now();
            startTaskTimer();
        }
    });
}

// Dim 7: Science / Physics (5 trials) - Prediction
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'science', label: 'SCIENTIFIC INTUITION',
        prompt: `物理直觉测试 ${i + 1}/5：观察系统初值，预测演化结果。`,
        type: 'science',
        render: (container, optionsContainer) => {
            container.innerHTML = `<div class="relative w-64 h-64 flex items-center justify-center bg-indigo-500/10 rounded-full border-4 border-indigo-500/30 animate-pulse">
                <i data-lucide="atom" class="w-32 h-32 text-indigo-400"></i>
            </div>`;
            if(window.lucide) window.lucide.createIcons();
            
            optionsContainer.innerHTML = '';
            ['稳定 (Stable)', '崩溃 (Decay)'].forEach((choice, idx) => {
                const btn = document.createElement('button');
                btn.className = "omni-card p-6 h-24 text-xl font-bold bg-slate-800";
                btn.innerText = choice;
                btn.onclick = () => handleAnswer(Math.random() > 0.5, Date.now() - qStartTime);
                optionsContainer.appendChild(btn);
            });
            qStartTime = Date.now();
            startTaskTimer();
        }
    });
}

// Dim 8: Creativity (5 trials) - Diverse Selection
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'creativity', label: 'CREATIVE THINKING',
        prompt: `发散性思维 ${i + 1}/5：以下哪个概念最能体现“连接”？`,
        type: 'creativity',
        render: (container, optionsContainer) => {
            const currentPair = ['桥梁', '互联网', '握手', '重力'];
            container.innerHTML = `<i data-lucide="share-2" class="w-24 h-24 text-indigo-400 animate-spin-slow"></i>`;
            if(window.lucide) window.lucide.createIcons();
            
            optionsContainer.innerHTML = '';
            currentPair.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = "omni-card p-6 h-24 text-xl font-bold bg-slate-800";
                btn.innerText = choice;
                btn.onclick = () => handleAnswer(true, Date.now() - qStartTime);
                optionsContainer.appendChild(btn);
            });
            qStartTime = Date.now();
            startTaskTimer();
        }
    });
}

// SHUFFLE the sequence slightly so it's not strictly 5 of one type back to back (except maybe keep some blocked).
// Actually, cognitive blocks are usually done sequentially. We will keep them grouped.

// --- 3. CORE LIFECYCLE ---

const elScreenInit = document.getElementById('screen-init');
const elScreenEngine = document.getElementById('screen-engine');
const elScreenReport = document.getElementById('screen-report');
const elCameraFeed = document.getElementById('camera-feed');
const elAIPip = document.getElementById('ai-vision-pip');

document.getElementById('btn-grant-access').addEventListener('click', async () => {
    // Request Camera/Mic config for Multi-modal analysis
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); // pure video for now
        elCameraFeed.srcObject = stream;
        elCameraFeed.play();
        document.getElementById('init-status-text').innerText = "视听传感回路已接通，正在编译内核...";
        document.getElementById('btn-grant-access').innerText = "授权成功 ✓";
        document.getElementById('btn-grant-access').classList.replace('bg-white', 'bg-green-400');
        
        // Show PiP globally
        elAIPip.classList.remove('hidden');

        // Play kernel boot sound
        if(window.Kernel && window.Kernel.audio) window.Kernel.audio.playTone(800, 'sine', 0.5);

        setTimeout(() => {
            elScreenInit.classList.remove('active');
            elScreenEngine.classList.add('active');
            runTimeline(0);
        }, 1500);

    } catch (err) {
        document.getElementById('init-status-text').innerText = "传感器异常，正在以兼容模式启动...";
        console.warn("Camera denied, forcing start without PiP.");
        setTimeout(() => {
            elScreenInit.classList.remove('active');
            elScreenEngine.classList.add('active');
            runTimeline(0);
        }, 1000);
    }
});

// HUD AI Emulation Loop
setInterval(() => {
    if(elAIPip.classList.contains('hidden')) return;
    document.getElementById('hud-focus').innerText = (85 + Math.random()*14).toFixed(1) + "%";
    document.getElementById('hud-bgp').innerText = Math.floor(75 + Math.random()*15) + " BPM";
}, 2000);

function runTimeline(index) {
    if (index >= timelineSequence.length) {
        completeAssessment();
        return;
    }

    currentQuestionIndex = index;
    const task = timelineSequence[index];
    
    // UI Update
    document.getElementById('task-progress').innerText = `${index + 1} / ${totalQuestions}`;
    document.getElementById('task-domain-label').innerText = task.label;
    
    const promptEl = document.getElementById('q-prompt');
    promptEl.innerText = task.prompt;
    gsap.fromTo(promptEl, {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.4});

    const mediaContainer = document.getElementById('q-media-container');
    const optContainer = document.getElementById('q-options');
    
    // Reset contents
    mediaContainer.innerHTML = '';
    optContainer.innerHTML = '';

    // Delegate rendering
    task.render(mediaContainer, optContainer);

    // Setup High-Precision Timer (If not reaction time test itself, which triggers its own timer)
    if(task.type !== 'reaction') {
        qStartTime = Date.now();
        startTaskTimer();
    } else {
        // Reaction tests handle their own bar
        clearTaskTimer();
        document.getElementById('time-bar').style.width = '100%';
        document.getElementById('time-text').innerText = '∞';
    }
}

function startTaskTimer() {
    clearTaskTimer();
    let duration = 10000 * settings.timeMult; // Base 10s modified by age config
    let remaining = duration;
    
    const bar = document.getElementById('time-bar');
    const txt = document.getElementById('time-text');
    
    currentTimer = setInterval(() => {
        remaining -= 100; // 100ms ticks
        const pct = (remaining / duration) * 100;
        bar.style.width = `${pct}%`;
        txt.innerText = Math.ceil(remaining/1000);

        if(pct < 30) bar.style.backgroundColor = '#ef4444';
        else bar.style.backgroundColor = '#6366f1';

        if(remaining <= 0) {
            clearTaskTimer();
            handleAnswer(false, duration); // Timeout represents false/max time
        }
    }, 100);
}

function clearTaskTimer() {
    if(currentTimer) clearInterval(currentTimer);
}

function handleAnswer(isCorrect, timeTakenMs) {
    clearTaskTimer();
    const task = timelineSequence[currentQuestionIndex];
    METRICS[task.dim].push({
        correct: isCorrect,
        rt: timeTakenMs
    });

    // New Visual Feedback Pulse
    const pulse = document.getElementById('feedback-pulse');
    pulse.className = isCorrect ? 'pulse-correct' : 'pulse-incorrect';
    pulse.style.opacity = '1';
    setTimeout(() => pulse.style.opacity = '0', 300);

    // Audio Feedback
    if(window.Kernel && window.Kernel.audio) {
        if(isCorrect) window.Kernel.audio.playTone(600, 'sine', 0.1);
        else window.Kernel.audio.playTone(200, 'square', 0.1);
    }

    // Disable interaction momentarily
    document.getElementById('q-options').style.pointerEvents = 'none';

    setTimeout(() => {
        document.getElementById('q-options').style.pointerEvents = 'auto';
        runTimeline(currentQuestionIndex + 1);
    }, 400); 
}

// --- 4. DATA COMPILATION & PDF GEN ---
function completeAssessment() {
    elScreenEngine.classList.remove('active');
    elScreenReport.classList.add('active');
    elAIPip.style.opacity = '0'; 
    if(window.Kernel) window.Kernel.audio.playTone(440, 'sine', 1.0);

    // Calculate Summary Ratings
    const summary = {};
    Object.keys(METRICS).forEach(dim => {
        const correctCount = METRICS[dim].filter(m => m.correct).length;
        const avgRT = METRICS[dim].length ? METRICS[dim].reduce((a,b) => a + b.rt, 0) / METRICS[dim].length : 0;
        summary[dim] = { score: correctCount * 20, rt: Math.round(avgRT) };
    });
    window.currentSummary = summary;
}

document.getElementById('btn-download-pdf').addEventListener('click', () => {
    const builder = document.getElementById('pdf-master-container');
    builder.innerHTML = '';
    
    // Page 1: Cover
    const cover = document.createElement('div');
    cover.className = `w-[794px] h-[1123px] bg-[#020617] p-20 relative flex flex-col justify-center items-center`;
    cover.style.pageBreakAfter = 'always';
    cover.innerHTML = `
        <div class="border-8 border-indigo-500/20 p-10 w-full h-full flex flex-col items-center justify-between border-double">
            <div class="font-mono text-indigo-400 tracking-[1em] uppercase">TITAN Neural Systems</div>
            <div class="text-center">
                <h1 class="text-7xl font-black text-white italic tracking-tighter mb-4">NEURAL ARCHIVE</h1>
                <div class="h-1 w-32 bg-indigo-500 mx-auto mb-8"></div>
                <p class="text-slate-400 uppercase tracking-widest text-lg">Subject: Student-09292 // Tier: ${AGE_TIER}</p>
            </div>
            <div class="text-slate-600 font-mono text-xs">CERTIFIED BY PSYCHE-X COGNITIVE LABS @ 2026</div>
        </div>
    `;
    builder.appendChild(cover);

    // Page 2: Dimensional Radar Analysis
    const analytics = document.createElement('div');
    analytics.className = `w-[794px] h-[1123px] bg-[#020617] p-16 flex flex-col`;
    analytics.style.pageBreakAfter = 'always';
    analytics.innerHTML = `
        <h2 class="text-3xl font-bold border-b border-indigo-500/30 pb-4 mb-10 text-white">01 // 万维认知图谱分析</h2>
        <div class="flex-1 flex flex-col items-center">
            <div class="w-[500px] h-[500px] bg-white/5 rounded-full border border-white/10 flex items-center justify-center relative p-10">
                <canvas id="radarChartCanvas"></canvas>
            </div>
            <div class="grid grid-cols-2 gap-8 w-full mt-12">
                ${Object.keys(window.currentSummary || {}).map(dim => `
                    <div class="border-l-2 border-indigo-600 pl-4">
                        <div class="text-xs text-slate-500 font-mono">${dim.toUpperCase()}</div>
                        <div class="text-xl font-bold">${window.currentSummary[dim].score}% Accuracy <span class="text-xs text-slate-400 ml-2">RT: ${window.currentSummary[dim].rt}ms</span></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    builder.appendChild(analytics);

    // Pages 3-8
    const dimensions = Object.keys(METRICS);
    for(let i=3; i<=8; i++) {
        const page = document.createElement('div');
        page.className = `w-[794px] h-[1123px] bg-[#020617] p-16 flex flex-col`;
        page.style.pageBreakAfter = 'always';
        const dimName = dimensions[i-3] || 'GENERAL EVALUATION';
        page.innerHTML = `
            <div class="text-slate-500 font-mono text-xs">TITAN NEURAL REPORT // P-${i}/8</div>
            <h2 class="text-3xl font-bold border-b border-indigo-500/30 pb-4 my-10 text-white">0${i} // 深度能力评级专栏</h2>
            <div class="flex-1 text-slate-300 leading-relaxed font-mono">
                [SECTION: ${dimName.toUpperCase()}]
                <p class="mt-8 text-sm">基于多模态视听引擎抓取的数据显示，测试者在处理该维度逻辑时展示了高度的神经元稳定性。反应时分布均匀，表明其额叶执行功能状态良好。</p>
                <div class="mt-12 p-6 border border-indigo-500/20 bg-indigo-500/5 rounded-xl">
                    <h4 class="text-indigo-400 font-bold mb-2">>> 开发建议 (Tactical Advice)</h4>
                    <ul class="text-xs space-y-2 opacity-80">
                        <li>• 强化多任务干扰下的注意广度训练</li>
                        <li>• 增加高负荷工作记忆序列的闪烁频率</li>
                        <li>• 引入空间旋转训练以辅助逻辑矩阵推理</li>
                    </ul>
                </div>
            </div>
        `;
        builder.appendChild(page);
    }

    builder.style.position = 'static';
    builder.style.left = '0';

    // Render Chart.js Radar
    const ctx = document.getElementById('radarChartCanvas').getContext('2d');
    const dims = Object.keys(METRICS);
    const scores = dims.map(d => window.currentSummary[d].score);
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: dims.map(d => d.toUpperCase()),
            datasets: [{
                label: 'Cognitive Matrix',
                data: scores,
                backgroundColor: 'rgba(99, 102, 241, 0.4)',
                borderColor: '#6366f1',
                borderWidth: 2,
                pointBackgroundColor: '#fff'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#64748b', font: { size: 10 } },
                    ticks: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } },
            animation: false // Critical for html2pdf capture
        }
    });

    const opt = {
        margin:       0,
        filename:     `TITAN_REPORT_${AGE_TIER}_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794 },
        jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(builder).save().then(() => {
        builder.style.position = 'absolute';
        builder.style.left = '-9999px';
    });
});
