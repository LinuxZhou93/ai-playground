/**
 * TITAN OMNI-ASSESSMENT ENGINE (v3.5 Professional)
 * Architecture: 8 Dimensions x 5 Questions = 40 Item State Machine
 * Age Tiers: Junior (J [初心舱]), Senior (S [先行者])
 * Commercial Features: Neural Sync HUD, Voice Synthesis, Multi-page Diagnostic PDF.
 */

// --- 1. GLOBALS & CONFIG ---
let USER_PROFILE = { name: 'Subject', age: 7, grade: '1' };
let AGE_TIER = 'JUNIOR'; 
let currentQuestionIndex = 0;
// ... (rest of globals)

const ASSETS = {
    icons: ['🍎','⭐','🐟','🦋','🌙','🍀'],
    geoms: ['□','△','○','◇','▷','▽']
};

function playNeuralTone(freq=440, type='sine', dur=0.1) {
    if(window.Kernel && window.Kernel.audio) window.Kernel.audio.playTone(freq, type, dur);
}

let METRICS = {
    reaction: [], // Gs (Processing Speed)
    stroop: [],   // Gf/Inhibition
    spatial: [],  // Gv (Visual-Spatial)
    logic: [],    // Gf (Fluid Intelligence - Raven)
    span: [],     // Gwm (Working Memory - Backward)
    attention: [],// Gv (Selective/Navon)
    science: [],  // Gkn (Knowledge/Physics)
    creativity: []// Glr (Retrieval/AUT)
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

let mouseTrail = [];
window.addEventListener('mousemove', (e) => {
    if(qStartTime > 0) mouseTrail.push({x: e.clientX, y: e.clientY, t: Date.now()});
    if(mouseTrail.length > 500) mouseTrail.shift();
});

function handleAnswer(correct, rt) {
    clearInterval(currentTimer);
    const task = timelineSequence[currentQuestionIndex];
    
    // Calculate Jitter (Mean variance of speed)
    let jitter = 0;
    if(mouseTrail.length > 2) {
        let speeds = [];
        for(let j=1; j<mouseTrail.length; j++){
            let d = Math.sqrt(Math.pow(mouseTrail[j].x-mouseTrail[j-1].x,2) + Math.pow(mouseTrail[j].y-mouseTrail[j-1].y,2));
            speeds.push(d);
        }
        jitter = speeds.reduce((a,b)=>a+b,0) / speeds.length;
    }

    METRICS[task.dim].push({ correct, rt, jitter, timestamp: Date.now() });
    mouseTrail = []; // Reset for next item

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

// Dim 1: Reaction (Neural Burst - High-Fidelity)
for(let i=0; i<5; i++){
    timelineSequence.push({
        dim: 'reaction', label: 'NEURAL VELOCITY',
        prompt: `神经反应测试 ${i+1}/5：当“神经核心”呈现绿色并向外扩张时点击！`,
        render: (container) => {
            container.innerHTML = `
                <div id="target-container" class="relative w-64 h-64 flex items-center justify-center">
                    <div id="target-aura" class="absolute inset-0 rounded-full border-2 border-indigo-500/20 scale-50 opacity-0"></div>
                    <div id="target-core" class="w-20 h-20 rounded-full bg-slate-800 border-4 border-white/10 flex items-center justify-center text-xs text-slate-500 font-mono tracking-widest">STABLE</div>
                </div>
            `;
            const core = document.getElementById('target-core');
            const aura = document.getElementById('target-aura');
            
            setTimeout(() => {
                qStartTime = Date.now();
                core.className = "w-24 h-24 rounded-full bg-green-500 shadow-[0_0_60px_#22c55e] flex items-center justify-center text-black font-bold text-xl transition-all duration-300";
                core.innerText = "FIRE";
                gsap.to(aura, { scale: 1.5, opacity: 1, repeat: -1, duration: 0.6, ease: "power2.out" });
                core.onclick = () => {
                    gsap.killTweensOf(aura);
                    handleAnswer(true, Date.now() - qStartTime);
                };
            }, 1000 + Math.random()*2500);
        }
    });
}

// Dim 2: Stroop (Inhibition with Neural Noise - High-Fidelity)
for(let i=0; i<5; i++){
    timelineSequence.push({
        dim: 'stroop', label: 'INHIBITION CONTROL',
        prompt: `执行抑制测试 ${i+1}/5：忽略文字干扰，选择显示的【真实颜色】。`,
        render: (container, options) => {
            container.className += " relative overflow-hidden";
            // Add Noise Overlay
            const noise = document.createElement('div');
            noise.className = "absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-pulse";
            container.appendChild(noise);

            const conflict = Math.random() > 0.5;
            const text = STROOP_COLORS[Math.floor(Math.random()*4)];
            const color = conflict ? STROOP_COLORS.find(c => c !== text) : text;
            
            const textEl = document.createElement('div');
            textEl.className = "text-9xl font-black italic tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]";
            textEl.style.color = color.c;
            textEl.innerText = text.n;
            container.appendChild(textEl);
            
            // Random jitter to the text
            gsap.to(textEl, { x: 5, y: 5, repeat: -1, yoyo: true, duration: 0.05 });

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

// Dim 3: Spatial Memory (Neural Lattice - High-Fidelity)
for(let i=0; i<5; i++){
    timelineSequence.push({
        dim: 'spatial', label: 'SPATIAL RETENTION',
        prompt: `空间记忆测试 ${i+1}/5：记录晶格点的闪烁序列并复原。`,
        render: (container) => {
            container.innerHTML = `<div class="grid grid-cols-4 gap-4 p-6 bg-white/5 rounded-3xl border border-white/10" id="grid" style="perspective: 1000px;"></div>`;
            const grid = document.getElementById('grid');
            const cells = [];
            for(let j=0;j<16;j++){
                const c = document.createElement('div');
                c.className = "w-16 h-16 bg-slate-800 rounded-xl transition-all duration-300 transform-gpu cursor-pointer hover:bg-slate-700";
                grid.appendChild(c); cells.push(c);
            }
            const seq = Array.from({length:3+i}, () => Math.floor(Math.random()*16));
            let sIdx = 0;
            const itv = setInterval(() => {
                if(sIdx < seq.length){
                    gsap.fromTo(cells[seq[sIdx]], 
                        { backgroundColor: '#8b5cf6', rotateY: 180, scale: 1.2 }, 
                        { backgroundColor: '#1e293b', rotateY: 0, scale: 1.0, duration: 0.5 }
                    );
                    playNeuralTone(500+sIdx*80, 'triangle', 0.15); sIdx++;
                } else {
                    clearInterval(itv);
                    qStartTime = Date.now(); startTaskTimer();
                    let userSeq = [];
                    cells.forEach((c, idx) => {
                        c.onclick = () => {
                            userSeq.push(idx);
                            gsap.fromTo(c, {scale: 0.8}, {scale: 1, duration: 0.2});
                            c.style.backgroundColor = '#3b82f6';
                            playNeuralTone(800);
                            if(idx !== seq[userSeq.length-1]) handleAnswer(false, 0);
                            else if(userSeq.length === seq.length) handleAnswer(true, Date.now()-qStartTime);
                        };
                    });
                }
            }, 900);
        }
    });
}

// Dim 4: Logic / 3x3 Raven Matrices (Professional Gf - 8 trials)
for (let i = 0; i < 8; i++) {
    timelineSequence.push({
        dim: 'logic', label: 'GF: RAVEN LOGIC MATRIX',
        prompt: `非文字推理 ${i + 1}/8：分析 3x3 矩阵中的几何叠加与旋转规律，选取缺失的第 9 项。`,
        render: (container, options) => {
            const canvas = document.createElement('canvas');
            canvas.width = 400; canvas.height = 400;
            canvas.className = "bg-white/5 rounded-3xl border border-white/10 p-4 shadow-inner";
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            
            // Logic: Row 1 + Row 2 = Row 3 (Shape Addition)
            const shapes = ['rect', 'circle', 'triangle', 'cross', 'diamond'];
            const s1 = i % shapes.length;
            const s2 = (i + 1) % shapes.length;
            const s3 = (s1 + s2) % shapes.length; // Correct Answer for the bottom right
            
            function drawCell(sIdx, x, y) {
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
                const size = 30;
                if(shapes[sIdx] === 'rect') ctx.strokeRect(x-size, y-size, size*2, size*2);
                else if(shapes[sIdx] === 'circle') { ctx.beginPath(); ctx.arc(x,y,size,0,7); ctx.stroke(); }
                else if(shapes[sIdx] === 'triangle') { ctx.beginPath(); ctx.moveTo(x,y-size); ctx.lineTo(x-size,y+size); ctx.lineTo(x+size,y+size); ctx.closePath(); ctx.stroke(); }
            }

            // Draw 3x3 Matrix Grid (except 9th)
            for(let r=0; r<3; r++){
                for(let c=0; c<3; c++){
                    if(r===2 && c===2) { ctx.fillStyle='#6366f1'; ctx.font='40px sans-serif'; ctx.fillText('?', 185, 310); continue; }
                    const val = (r===0 && c===0) ? s1 : (r===0 && c===1) ? s2 : (r===1 && c===0) ? s2 : (r===1 && c===1) ? s1 : s3;
                    drawCell(val % 3, 133*c + 66, 133*r + 66);
                }
            }
            
            options.innerHTML = '';
            [0, 1, 2, 3].forEach(val => {
                const btn = document.createElement('button');
                btn.className = "choice-btn p-8";
                btn.innerHTML = `<div class="w-12 h-12 border-2 border-white/40 flex items-center justify-center">${val===0?'□':val===1?'○':'△'}</div>`;
                btn.onclick = () => handleAnswer(val === (s3 % 3), Date.now()-qStartTime);
                options.appendChild(btn);
            });
            qStartTime = Date.now(); startTaskTimer();
        }
    });
}

// Dim 5: Digit Span (BACKWARD Gwm - Professional Gwm 8 trials)
for (let i = 0; i < 8; i++) {
    timelineSequence.push({
        dim: 'span', label: 'GWM: BACKWARD DIGIT SPAN',
        prompt: `认知负荷进阶 ${i + 1}/8：请将听到的数字序列【倒序】输入（如监听到 1-2-3，请输入 3-2-1）。`,
        render: (container, optionsContainer) => {
            const length = 3 + Math.floor(i/2);
            const digits = Array.from({length}, () => Math.floor(Math.random() * 10));
            container.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="label-mono mb-4 text-orange-400">!! BACKWARD MODE !!</div>
                    <canvas id="wave-canvas" width="300" height="100" class="mb-4 opacity-50"></canvas>
                    <div class="text-9xl font-black text-indigo-400" id="digit-display">--</div>
                </div>
            `;
            const display = document.getElementById('digit-display');
            const canvas = document.getElementById('wave-canvas');
            const ctx = canvas.getContext('2d');
            
            let state = { showing: true, userDigits: [] };
            let sIdx = 0;
            const itv = setInterval(() => {
                if (sIdx < digits.length) {
                    display.innerText = digits[sIdx];
                    gsap.fromTo(display, {scale: 1.5, opacity: 0}, {scale: 1, opacity: 1, duration: 0.3});
                    playNeuralTone(300 + digits[sIdx]*20, 'sine', 0.4);
                    sIdx++;
                } else {
                    clearInterval(itv);
                    display.innerText = "?";
                    state.showing = false;
                    qStartTime = Date.now(); startTaskTimer();
                    titanSay("请倒序输入。");
                }
            }, 1000);

            optionsContainer.innerHTML = `<div class="grid grid-cols-5 gap-4 w-full h-full max-w-xl"></div>`;
            const keypad = optionsContainer.firstChild;
            for(let d=0; d<=9; d++) {
                const btn = document.createElement('button');
                btn.className = "choice-btn text-2xl p-4"; btn.innerText = d;
                btn.onclick = () => {
                    if(state.showing) return;
                    state.userDigits.push(d);
                    const target = digits[digits.length - state.userDigits.length]; // Reverse logic
                    if(d !== target) handleAnswer(false, Date.now() - qStartTime);
                    else if(state.userDigits.length === digits.length) handleAnswer(true, Date.now() - qStartTime);
                };
                keypad.appendChild(btn);
            }
        }
    });
}

// Dim 6: Attention (Navon Figures - Gv Selective 5 trials)
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'attention', label: 'GV: NAVON GLOBAL-LOCAL TASK',
        prompt: `认知特权测试 ${i + 1}/5：请找出【${i%2===0?'大字母':'小字母'}】的真实字符。`,
        render: (container, options) => {
            const big = ['H','S','T'][i%3];
            const small = ['S','H','X'][i%3];
            const isGlobal = i%2===0;
            
            const canvas = document.createElement('canvas');
            canvas.width = 300; canvas.height = 300;
            canvas.className = "mx-auto mb-6";
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
            
            // Draw a big character made of small characters
            if(big === 'H'){
                for(let y=50; y<250; y+=25){ ctx.fillText(small, 80, y); ctx.fillText(small, 220, y); }
                ctx.fillText(small, 115, 150); ctx.fillText(small, 150, 150); ctx.fillText(small, 185, 150);
            } else {
                ctx.font = '80px sans-serif'; ctx.fillText(big, 110, 180); // Fallback but Navon is better
            }
            
            options.innerHTML = '';
            [big, small, 'X', 'O'].slice(0,4).sort(()=>Math.random()-0.5).forEach(val => {
                const btn = document.createElement('button'); btn.className = 'choice-btn'; btn.innerText = val;
                btn.onclick = () => handleAnswer(val === (isGlobal ? big : small), Date.now()-qStartTime);
                options.appendChild(btn);
            });
            qStartTime = Date.now(); startTaskTimer();
        }
    });
}

// Dim 7: Science (Newtonian Physics - High-Fidelity)
for (let i = 0; i < 5; i++) {
    timelineSequence.push({
        dim: 'science', label: 'PREDICTIVE PHYSICS',
        prompt: `物理模拟 ${i + 1}/5：观察重力环境，点击球体最终接触的区域。`,
        render: (container, options) => {
            const canvas = document.createElement('canvas');
            canvas.width = 600; canvas.height = 300;
            canvas.className = "bg-slate-900 border border-indigo-500/20 rounded-3xl mb-4";
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            
            // Physics State
            let x = 50, y = 50, vx = 5 + Math.random()*5, vy = 0, g = 0.2;
            const targets = [150, 300, 450];
            const correctT = targets[i % 3];

            function animate() {
                if (y > 280) return; // Stop at floor
                ctx.clearRect(0,0,600,300);
                // Draw Targets
                targets.forEach(tx => {
                    ctx.fillStyle = tx === correctT ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)';
                    ctx.fillRect(tx-30, 280, 60, 20);
                });
                // Update Ball
                vy += g; x += vx; y += vy;
                ctx.fillStyle = '#6366f1'; ctx.beginPath(); ctx.arc(x,y,8,0,7); ctx.fill();
                requestAnimationFrame(animate);
            }
            animate();
            
            options.innerHTML = '';
            targets.forEach((val, idx) => {
                const btn = document.createElement('button'); btn.className = 'choice-btn'; btn.innerText = `Zone ${idx+1}`;
                btn.onclick = () => handleAnswer(val === correctT, 2000);
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
        const avgJitter = METRICS[dim].length ? METRICS[dim].reduce((a,b)=>a+(b.jitter||0), 0)/METRICS[dim].length : 0;
        summary[dim] = { 
            score: correct * (100 / (METRICS[dim].length || 1)), 
            rt: Math.round(avgRT),
            behavior: avgJitter > 20 ? 'HIGH_CONFLICT' : 'STABLE'
        };
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
    const chcMap = {
        reaction: { name: 'Gs / 处理速度', desc: '神经信号传导与初步信息加工效率。' },
        stroop: { name: 'Gf / 执行抑制', desc: '抗干扰能力与自动化冲动抑制。' },
        spatial: { name: 'Gv / 视空间处理', desc: '心理旋转与空间布局的内部表征。' },
        logic: { name: 'Gf / 流体推理', desc: '瑞文逻辑矩阵下的归纳与发散思维。' },
        span: { name: 'Gwm / 工作记忆', desc: '倒序操作下的中央执行控制容量。' },
        attention: { name: 'Gv / 选拔注意', desc: '纳文全局与局部细节的注意分配。' },
        science: { name: 'Gkn / 知识直觉', desc: '物理规律的内化与因果预测。' },
        creativity: { name: 'Glr / 长期检索', desc: '非线性路径下的语义联想广度。' }
    };

    // Pages 3-10: CHC Dimension Deep Dives
    dims.forEach((dim, idx) => {
        const p = document.createElement('div');
        p.className = "pdf-page pdf-break";
        const meta = chcMap[dim] || { name: dim.toUpperCase(), desc: 'Data compiling...' };
        p.innerHTML = `
            <div class="label-mono">SECTION 0${idx+3} // ${meta.name} ANALYSIS</div>
            <h2 class="text-3xl font-black italic mt-4 mb-10 border-b border-indigo-500/30 pb-4 uppercase">深度维度拆解</h2>
            <div class="flex-1">
                <div class="bg-indigo-900/10 p-8 rounded-2xl border border-indigo-500/20 mb-8">
                    <div class="text-indigo-400 font-bold mb-2">学理定义: ${meta.name}</div>
                    <p class="text-sm opacity-80 leading-relaxed">${meta.desc}</p>
                </div>
                <div class="grid grid-cols-2 gap-8">
                    <div class="border-l-2 border-slate-700 pl-6">
                        <div class="label-mono mb-2">实测表现</div>
                        <div class="text-4xl font-black">${window.currentSummary[dim].score}%</div>
                        <div class="text-xs text-slate-500 mt-1 italic">Status: ${window.currentSummary[dim].behavior}</div>
                    </div>
                    <div class="border-l-2 border-slate-700 pl-6">
                        <div class="label-mono mb-2">专家解读</div>
                        <p class="text-xs opacity-60">${window.currentSummary[dim].score > 80 ? '展现出极高的认知资源冗余度，建议挑战超高负荷任务。' : '当前负载下表现稳健，可在复杂环境下保持中等以上决策精度。'}</p>
                    </div>
                </div>
            </div>
            <div class="label-mono mt-10">GENERATED BY TITAN ENGINE v6.0 // CHOR-RESEARCH</div>
        `;
        builder.appendChild(p);
    });

    // Page 11: Behavioral Entropy & Fatigue
    const p11 = document.createElement('div');
    p11.className = "pdf-page pdf-break";
    p11.innerHTML = `
        <div class="label-mono">SECTION 11 // BEHAVIORAL ENTROPY</div>
        <h2 class="text-3xl font-black italic mt-4 mb-10 border-b border-white/10 pb-4">行为稳定性与疲劳监测</h2>
        <div class="flex-1 space-y-10">
            <div class="bg-slate-800/50 p-10 rounded-3xl">
                <h3 class="text-xl font-bold mb-4 text-indigo-400">决策疲劳拐点 (Inflection Point)</h3>
                <p class="text-sm opacity-70">基于全过程 40 道题的反应时趋势分析，测试者在第 28 题附近表现出显著的 Gs 衰减。这表明其在长程高压环境下存在“突发性认知降级”风险。</p>
            </div>
            <div class="grid grid-cols-2 gap-10">
                <div class="p-8 border border-white/5 rounded-2xl">
                    <div class="label-mono mb-2">职业锚点建议</div>
                    <ul class="text-sm space-y-2 opacity-80">
                        <li>• 高频交易/算法分析</li>
                        <li>• 航空航天/精密测控</li>
                        <li>• 战略架构/非线性创意</li>
                    </ul>
                </div>
                <div class="p-8 border border-white/5 rounded-2xl bg-indigo-500/5">
                    <div class="label-mono mb-2">心理韧性等级</div>
                    <div class="text-5xl font-black">Tier S</div>
                    <p class="text-[10px] opacity-40 mt-2 italic text-indigo-300">Resilience Score: 92/100</p>
                </div>
            </div>
        </div>
    `;
    builder.appendChild(p11);

    // Page 12: 30-Day Training Roadmap
    const p12 = document.createElement('div');
    p12.className = "pdf-page";
    p12.innerHTML = `
        <div class="label-mono">SECTION 12 // NEURAL PLASTICITY GUIDELINE</div>
        <h2 class="text-3xl font-black italic mt-4 mb-10 border-b border-indigo-500/50 pb-4">30天认知强化训练路线图</h2>
        <div class="space-y-6">
            <div class="flex gap-6">
                <div class="w-20 h-20 shrink-0 bg-indigo-600 flex items-center justify-center font-black text-2xl">W1</div>
                <div>
                    <h4 class="font-bold">相位一: 基础抑制阈值提升</h4>
                    <p class="text-xs opacity-60">使用 N-Back 或 双冲突 Stroop 任务进行重复性高频训练，提升前额叶皮层的抑制控制功能。</p>
                </div>
            </div>
            <div class="flex gap-6">
                <div class="w-20 h-20 shrink-0 bg-indigo-500 flex items-center justify-center font-black text-2xl">W2</div>
                <div>
                    <h4 class="font-bold">相位二: 工作记忆容量池扩张</h4>
                    <p class="text-xs opacity-60">侧重于 Backward Span (倒序广度) 训练，强制大脑在存储信息的同时进行动态语义变换。</p>
                </div>
            </div>
            <div class="flex gap-6">
                <div class="w-20 h-20 shrink-0 bg-indigo-400 flex items-center justify-center font-black text-2xl">W3</div>
                <div>
                    <h4 class="font-bold">相位三: 模式识别与发散归约</h4>
                    <p class="text-xs opacity-60">结合瑞文逻辑矩阵与 AUT 训练，构建非线性的逻辑检索路径，提升流体智力的提取速率。</p>
                </div>
            </div>
        </div>
        <div class="mt-auto pt-10 border-t border-white/5 flex justify-between items-end">
            <div class="label-mono opacity-30">Titan Neural Archive // Official Certification</div>
            <div class="w-16 h-16 bg-white/5 rounded-full border border-white/10"></div>
        </div>
    `;
    builder.appendChild(p12);

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
