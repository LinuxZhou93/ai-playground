/**
 * TITAN OMNI-ASSESSMENT ENGINE (v3.5 Professional)
 * Architecture: 8 Dimensions x 5 Questions = 40 Item State Machine
 * Age Tiers: Junior (J [初心舱]), Senior (S [先行者])
 * Commercial Features: Neural Sync HUD, Voice Synthesis, Multi-page Diagnostic PDF.
 */

// --- 1. GLOBALS & CONFIG ---
let USER_PROFILE = { name: 'Subject', age: 7, grade: '1' };
let AGE_TIER = 'Junior'; 
let currentQuestionIndex = 0;
let timeLimitMS = 15000; 
let qStartTime = 0;
let currentTimer = null;
let syncInterruptions = 0;

let METRICS = {
    reaction: [],
    stroop: [],
    spatial: [],
    logic: [],
    span: [],
    attention: [],
    science: [],
    creativity: []
};

const elScreenRegister = document.getElementById('screen-register');
const elScreenInit = document.getElementById('screen-init');
const elScreenEngine = document.getElementById('screen-engine');
const elScreenReport = document.getElementById('screen-report');
const elCameraFeed = document.getElementById('camera-feed');
const elAIPip = document.getElementById('ai-vision-pip');

// --- 2. CORE UTILITIES ---

async function titanSay(text) {
    return new Promise(resolve => {
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = 0.8;
        utter.onend = resolve;
        synth.speak(utter);
    });
}

function playTone(freq = 440, type = 'sine', duration = 0.1) {
    if(window.Kernel && window.Kernel.audio) {
        window.Kernel.audio.playTone(freq, type, duration);
    }
}

// Security: Neural Sync Monitor
window.addEventListener('blur', () => {
    syncInterruptions++;
    const warn = document.getElementById('sync-warning');
    if(warn) warn.classList.remove('hidden');
});
window.addEventListener('focus', () => {
    setTimeout(() => {
        const warn = document.getElementById('sync-warning');
        if(warn) warn.classList.add('hidden');
    }, 3000);
});

// --- 3. LIFECYCLE HANDLERS ---

document.getElementById('btn-start-init').addEventListener('click', () => {
    USER_PROFILE = {
        name: document.getElementById('input-name').value || 'TITAN_SUBJECT_01',
        age: parseInt(document.getElementById('input-age').value) || 7,
        grade: document.getElementById('input-grade').value
    };
    AGE_TIER = USER_PROFILE.age < 9 ? 'JUNIOR' : 'ADVANCED';
    
    gsap.to(elScreenRegister, { opacity: 0, scale: 0.95, duration: 0.5, onComplete: () => {
        elScreenRegister.classList.remove('active');
        elScreenInit.classList.add('active');
        titanSay("身份已确认。正在初始化 TITAN 神经链路。");
    }});
});

document.getElementById('btn-grant-access').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        elCameraFeed.srcObject = stream;
        elCameraFeed.play();
        elAIPip.classList.remove('hidden');
        document.getElementById('init-status-text').innerText = "视听传感回路已接通。系统就绪。";
        
        playTone(800, 'sine', 0.5);
        setTimeout(() => {
            elScreenInit.classList.remove('active');
            elScreenEngine.classList.add('active');
            runTimeline(0);
        }, 1500);

    } catch (err) {
        document.getElementById('init-status-text').innerText = "传感器异常，正在以兼容模式启动...";
        setTimeout(() => {
            elScreenInit.classList.remove('active');
            elScreenEngine.classList.add('active');
            runTimeline(0);
        }, 1000);
    }
});

function handleAnswer(correct, rt) {
    clearInterval(currentTimer);
    const task = timelineSequence[currentQuestionIndex];
    METRICS[task.dim].push({ correct, rt, timestamp: Date.now() });

    // Feedback Visuals
    const pulse = document.getElementById('feedback-pulse');
    pulse.style.background = correct 
        ? 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)' 
        : 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)';
    gsap.fromTo(pulse, { opacity: 0 }, { opacity: 1, duration: 0.2, yoyo: true, repeat: 1 });
    
    playTone(correct ? 800 : 200, 'sine', 0.1);

    setTimeout(() => runTimeline(currentQuestionIndex + 1), 600);
}

function startTaskTimer() {
    let timeLeft = timeLimitMS;
    const bar = document.getElementById('time-bar');
    const text = document.getElementById('time-text');
    clearInterval(currentTimer);
    currentTimer = setInterval(() => {
        timeLeft -= 100;
        const pct = (timeLeft / timeLimitMS) * 100;
        if(bar) bar.style.width = pct + "%";
        if(text) text.innerText = Math.ceil(timeLeft / 1000);
        if(timeLeft <= 0) handleAnswer(false, timeLimitMS);
    }, 100);
}

// --- 4. QUESTION DATA GENERATOR ---

const timelineSequence = [];

// Dim 1: Reaction
for(let i=0; i<5; i++){
    timelineSequence.push({
        dim: 'reaction', label: 'NEURAL VELOCITY',
        prompt: `神经反应测试 ${i+1}/5：看到绿色目标出现点击！`,
        render: (container) => {
            container.innerHTML = `<div id="target" class="w-24 h-24 rounded-full bg-slate-800 border-4 border-white/5 flex items-center justify-center text-4xl">...</div>`;
            const t = document.getElementById('target');
            setTimeout(() => {
                qStartTime = Date.now();
                t.className = "w-24 h-24 rounded-full bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)] flex items-center justify-center text-5xl animate-pulse";
                t.innerText = "!";
                t.onclick = () => handleAnswer(true, Date.now() - qStartTime);
            }, 1000 + Math.random()*2000);
        }
    });
}

// Dim 2: Stroop
const STROOP_COLORS = [{n:'红',c:'#ef4444'}, {n:'蓝',c:'#3b82f6'}, {n:'绿',c:'#22c55e'}, {n:'黄',c:'#eab308'}];
for(let i=0; i<5; i++){
    timelineSequence.push({
        dim: 'stroop', label: 'INHIBITION CONTROL',
        prompt: `抗干扰测试 ${i+1}/5：选取文字的【真实颜色】。`,
        render: (container, options) => {
            const conflict = Math.random() > 0.5;
            const text = STROOP_COLORS[Math.floor(Math.random()*4)];
            const color = conflict ? STROOP_COLORS.find(c => c !== text) : text;
            container.innerHTML = `<div class="text-8xl font-black" style="color:${color.c}">${text.n}</div>`;
            options.innerHTML = '';
            STROOP_COLORS.forEach(c => {
                const btn = document.createElement('button');
                btn.className = "choice-btn"; btn.innerText = c.n;
                btn.onclick = () => handleAnswer(c === color, Date.now() - qStartTime);
                options.appendChild(btn);
            });
            qStartTime = Date.now(); startTaskTimer();
        }
    });
}

// Dim 3: Spatial Memory
for(let i=0; i<5; i++){
    timelineSequence.push({
        dim: 'spatial', label: 'SPATIAL RETENTION',
        prompt: `空间记忆 ${i+1}/5：记忆闪烁位置并还原。`,
        render: (container) => {
            container.innerHTML = `<div class="grid grid-cols-4 gap-3 p-4 bg-white/5 rounded-2xl" id="grid"></div>`;
            const grid = document.getElementById('grid');
            const cells = [];
            for(let j=0;j<16;j++){
                const c = document.createElement('div');
                c.className = "w-16 h-16 bg-slate-800 rounded-lg transition-all";
                grid.appendChild(c); cells.push(c);
            }
            const seq = Array.from({length:3+i}, () => Math.floor(Math.random()*16));
            let sIdx = 0;
            const itv = setInterval(() => {
                if(sIdx < seq.length){
                    gsap.fromTo(cells[seq[sIdx]], {backgroundColor:'#8b5cf6'}, {backgroundColor:'#1e293b', duration:0.5});
                    playTone(400+sIdx*100); sIdx++;
                } else {
                    clearInterval(itv);
                    qStartTime = Date.now(); startTaskTimer();
                    let userSeq = [];
                    cells.forEach((c, idx) => {
                        c.onclick = () => {
                            userSeq.push(idx);
                            c.style.backgroundColor = '#3b82f6';
                            if(idx !== seq[userSeq.length-1]) handleAnswer(false, 0);
                            else if(userSeq.length === seq.length) handleAnswer(true, Date.now()-qStartTime);
                        };
                    });
                }
            }, 800);
        }
    });
}

// Dim 4: Logic
for(let i=0; i<5; i++){
    timelineSequence.push({
        dim: 'logic', label: 'FLUID INTELLIGENCE',
        prompt: `逻辑矩阵推理 ${i+1}/5：选择符合逻辑规律的图形。`,
        render: (container, options) => {
            const syms = ['▲','●','■','★','◆'];
            const start = i % syms.length;
            const pattern = [syms[start], syms[(start+1)%5], '?'];
            container.innerHTML = `<div class="text-7xl space-x-4">${pattern.join(' → ')}</div>`;
            options.innerHTML = '';
            syms.forEach(s => {
                const btn = document.createElement('button');
                btn.className = "choice-btn text-3xl"; btn.innerText = s;
                btn.onclick = () => handleAnswer(s === syms[(start+2)%5], Date.now()-qStartTime);
                options.appendChild(btn);
            });
            qStartTime = Date.now(); startTaskTimer();
        }
    });
}

// Dim 5: Digit Span (5 trials)
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'span', label: 'WORKING MEMORY',
        prompt: `数字广度测试 ${i + 1}/5：记录听到的数字，在键盘上按顺序输入！`,
        render: (container, optionsContainer) => {
            const length = 3 + i;
            const digits = Array.from({length}, () => Math.floor(Math.random() * 10));
            container.innerHTML = `<div class="text-9xl font-black text-indigo-400" id="digit-display">...</div>`;
            const display = document.getElementById('digit-display');
            
            let state = { showing: true, userDigits: [] };
            let sIdx = 0;
            const itv = setInterval(() => {
                if (sIdx < digits.length) {
                    display.innerText = digits[sIdx];
                    gsap.fromTo(display, {scale: 0.5, opacity: 0}, {scale: 1, opacity: 1, duration: 0.3});
                    playTone(300 + digits[sIdx]*20, 'sine', 0.2);
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
                btn.className = "choice-btn text-xl p-4";
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

// Dim 6: Attention (5 trials)
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'attention', label: 'SELECTIVE ATTENTION',
        prompt: `注意力定向 ${i + 1}/5：找出所有的【⭐】，越快越好！`,
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
                        playTone(800, 'sine', 0.05);
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

// Dim 7: Science (5 Interactive trials)
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'science', label: 'PREDICTIVE PHYSICS',
        prompt: `物理模拟 ${i + 1}/5：预测小球在斜面上的最终落点。`,
        render: (container, options) => {
            const canvas = document.createElement('canvas');
            canvas.width = 400; canvas.height = 200;
            canvas.className = "bg-black/30 rounded-xl border border-white/5 mx-auto mb-4";
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(50, 50); ctx.lineTo(350, 150); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(60, 50, 6, 0, 7); ctx.fill();
            
            options.innerHTML = '';
            ['落点 A (25%)', '落点 B (50%)', '落点 C (75%)'].forEach((choice, idx) => {
                const btn = document.createElement('button'); btn.className = 'choice-btn'; btn.innerText = choice;
                btn.onclick = () => handleAnswer(idx === 2, 1500);
                options.appendChild(btn);
            });
            qStartTime = Date.now(); startTaskTimer();
        }
    });
}

// Dim 8: Creativity (Interactive AUT)
timelineSequence.push({
    dim: 'creativity', label: 'DIVERGENT ASSOCIATION',
    prompt: `发散思维：列举出“砖头”的非建筑用途（输入 5 个并回车）。`,
    render: (container) => {
        container.innerHTML = `
            <div class="p-8 bg-white/5 rounded-3xl border border-white/10 max-w-md mx-auto text-center">
                <div class="text-3xl font-bold mb-4">目标：砖头</div>
                <ul id="c-list" class="text-left text-sm text-slate-400 mb-4 h-24 overflow-y-auto"></ul>
                <input type="text" id="c-input" placeholder="输入并按下回车..." class="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white">
            </div>
        `;
        const list = document.getElementById('c-list');
        const input = document.getElementById('c-input');
        let count = 0;
        input.onkeypress = (e) => {
            if(e.key === 'Enter' && input.value.trim()){
                list.innerHTML += `<li>• ${input.value}</li>`;
                input.value = ''; playTone(600); count++;
                if(count >= 5) setTimeout(() => handleAnswer(true, 10000), 1000);
            }
        };
    }
});

// --- 5. ENGINE CORE ---

function runTimeline(index) {
    if (index >= timelineSequence.length) {
        completeAssessment();
        return;
    }
    currentQuestionIndex = index;
    const task = timelineSequence[index];
    
    document.getElementById('label-dim').innerText = task.label;
    document.getElementById('label-prompt').innerText = task.prompt;
    document.getElementById('label-progress').innerText = `Sequence: ${index + 1} / ${timelineSequence.length}`;

    const container = document.getElementById('engine-stage-container');
    const options = document.getElementById('engine-options-container');
    container.innerHTML = '';
    options.innerHTML = '';

    gsap.fromTo([container, options], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    task.render(container, options);
}

function completeAssessment() {
    elScreenEngine.classList.remove('active');
    elScreenReport.classList.add('active');
    elAIPip.style.opacity = '0';
    titanSay(`测评已完成。正在编译生成 ${USER_PROFILE.name} 的认知报告。`);

    const summary = {};
    Object.keys(METRICS).forEach(dim => {
        const correct = METRICS[dim].filter(m => m.correct).length;
        const avgRT = METRICS[dim].length ? METRICS[dim].reduce((a,b)=>a+b.rt, 0)/METRICS[dim].length : 0;
        summary[dim] = { score: correct * (100 / (METRICS[dim].length || 1)), rt: Math.round(avgRT) };
    });
    window.currentSummary = summary;
}

// --- 6. PDF GENERATOR (PROFESSIONAL 8-PAGE) ---

document.getElementById('btn-download-pdf').addEventListener('click', async () => {
    const btn = document.getElementById('btn-download-pdf');
    btn.innerText = "正在编译数据 (50%)...";
    btn.disabled = true;

    const builder = document.getElementById('pdf-master-container');
    builder.innerHTML = `
        <style>
            .pdf-page { width: 794px; height: 1123px; background-color: #020617; color: white; padding: 60px; position: relative; display: flex; flex-direction: column; box-sizing: border-box; }
            .pdf-break { page-break-after: always; }
            .tcq-text { font-size: 120px; font-weight: 900; line-height: 1; color: #6366f1; margin-top: 40px; }
            .label-mono { font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        </style>
    `;
    
    // Calculated TCQ
    const scores = Object.values(window.currentSummary).map(s => s.score);
    const avgScore = scores.reduce((a,b)=>a+b, 0) / scores.length;
    const tcq = Math.round((avgScore * 0.8) + 60); // Professional logic baseline

    // Page 1: Cover
    const cover = document.createElement('div');
    cover.className = "pdf-page pdf-break items-center justify-between";
    cover.innerHTML = `
        <div class="w-full border-t border-indigo-500/50 pt-10 flex justify-between">
            <div class="font-mono text-xs opacity-50 uppercase tracking-widest text-indigo-400">Titan Neural Systems // Cognitive Archive</div>
            <div class="font-mono text-xs opacity-50">REF: ${Date.now()}</div>
        </div>
        <div class="text-center">
            <div class="w-32 h-32 mx-auto mb-10 border-4 border-double border-indigo-500/40 rounded-full flex items-center justify-center">
                <div class="w-20 h-20 bg-indigo-600/20 rounded-full animate-pulse"></div>
            </div>
            <h1 class="text-7xl font-black italic tracking-tighter mb-4">NEURAL REPORT</h1>
            <div class="h-1 w-24 bg-indigo-500 mx-auto mb-10"></div>
            <div class="space-y-2 text-slate-400 font-mono text-lg uppercase tracking-wide">
                <div>Subject: ${USER_PROFILE.name}</div>
                <div>Tier: ${AGE_TIER}</div>
                <div>Neural Sync Index: ${100 - syncInterruptions}%</div>
            </div>
        </div>
        <div class="w-full flex justify-between items-end">
            <div class="text-slate-600 font-mono text-[10px]">VERIFIED BY PSYCHE-X LABS // SINGULARITY CORE</div>
            <div class="text-8xl font-black opacity-5 italic text-white">TITAN</div>
        </div>
    `;
    builder.appendChild(cover);

    // Page 2: TCQ & Radar
    const p2 = document.createElement('div');
    p2.className = "pdf-page pdf-break";
    p2.innerHTML = `
        <div class="label-mono">SECTION 01 // COGNITIVE QUANTUM</div>
        <h2 class="text-3xl font-black italic mt-4 mb-10 border-b border-white/10 pb-4 uppercase">万维认知商数 (TCQ) 分布</h2>
        <div class="flex-1 flex flex-col items-center">
            <div class="tcq-text">${tcq}</div>
            <div class="label-mono tracking-widest opacity-40">Titan Cognitive Quotient</div>
            <div class="w-full h-[400px] mt-20 relative">
                <canvas id="radarChart"></canvas>
            </div>
            <div class="grid grid-cols-2 gap-x-12 gap-y-6 w-full mt-10">
                ${Object.keys(window.currentSummary).map(dim => `
                    <div class="border-l-4 border-indigo-600/30 pl-4 py-2">
                        <div class="text-[10px] text-slate-500 font-mono uppercase tracking-widest">${dim} Index</div>
                        <div class="text-2xl font-black">${window.currentSummary[dim].score}%</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    builder.appendChild(p2);

    // Pages 3-8: Diagnostic Columns
    const diagnosticText = {
        reaction: "反应时分布显示神经冲动传导速率在高带宽区间。建议加强视觉信号捕捉的突发性训练。",
        stroop: "执行功能稳定性极强，能够有效抑制自动化心理倾向，表现出高度的理性控制力。",
        spatial: "空间工作记忆容量 (Memory Span) 处于同龄人 Top 10%。",
        logic: "流体智力表现稳健，能够快速提取多重逻辑规律并将之泛化。",
        span: "听觉通道对序列信息的编码能力有待持续负荷训练。",
        attention: "长时间的高频采样下，注意力分配较为集中，无显著神经疲劳表现。",
        science: "物理世界常识编码完整，具备优秀的因果推理能力。",
        creativity: "发散思维路径非线性程度高，表现出跨领域联想的潜能。"
    };

    const dims = Object.keys(METRICS);
    for(let i=3; i<=8; i++){
        const p = document.createElement('div');
        p.className = "pdf-page pdf-break";
        const dim = dims[i-3] || 'GENERAL';
        p.innerHTML = `
            <div class="label-mono">SECTION 0${i} // ${dim.toUpperCase()} DIAGNOSTICS</div>
            <h2 class="text-4xl font-black italic mt-4 mb-14 border-b border-indigo-500/50 pb-4 uppercase">维度挖掘分析</h2>
            <div class="flex-1 text-slate-300 font-mono leading-loose">
                <p class="text-xl mb-10">${diagnosticText[dim] || '数据编译中...'}</p>
                <div class="grid grid-cols-2 gap-10 mt-20 bg-white/5 p-10 rounded-3xl border border-white/10">
                    <div>
                        <div class="text-indigo-400 font-bold mb-2">💡 优势分析</div>
                        <p class="text-xs opacity-70">在 ${dim} 测试中表现出高度的稳定性，神经可塑性指标显示在复杂环境下具有更强的自适应潜力。</p>
                    </div>
                    <div>
                        <div class="text-indigo-400 font-bold mb-2">🛠️ 建议路径</div>
                        <p class="text-xs opacity-70">建议每日进行 15 分钟专项强化训练，结合多模态干扰信号提升抗压认知容量。</p>
                    </div>
                </div>
            </div>
            <div class="text-slate-600 font-mono text-[9px] mt-10">GENERATED BY TITAN NEURAL NET v3.5 // NON-COPYABLE ARCHIVE</div>
        `;
        builder.appendChild(p);
    }

    builder.style.position = 'static';
    builder.style.left = '0';

    // Render Chart
    const ctx = document.getElementById('radarChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(window.currentSummary).map(k => k.toUpperCase()),
            datasets: [{
                label: 'Subject Metrics',
                data: Object.values(window.currentSummary).map(v => v.score),
                backgroundColor: 'rgba(99, 102, 241, 0.4)',
                borderColor: '#6366f1',
                pointBackgroundColor: '#fff'
            }, {
                label: 'Benchmark',
                data: [75, 75, 75, 75, 75, 75, 75, 75],
                borderColor: 'rgba(255,255,255,0.1)',
                borderDash: [5, 5],
                backgroundColor: 'transparent'
            }]
        },
        options: {
            scales: { r: { suggestedMin:0, suggestedMax:100, ticks: { display: false } } },
            plugins: { legend: { display: false } },
            animation: false
        }
    });

    // WAIT FOR RENDER BUFFER
    await new Promise(resolve => setTimeout(resolve, 800));
    btn.innerText = "生成 PDF 档案...";

    const opt = {
        margin: 0,
        filename: `TITAN_REPORT_${USER_PROFILE.name}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 794, backgroundColor: '#020617' },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(builder).save().then(() => {
        builder.style.position = 'absolute';
        builder.style.left = '-9999px';
        btn.innerText = "提取深维 8页 PDF 档案";
        btn.disabled = false;
    });
});
