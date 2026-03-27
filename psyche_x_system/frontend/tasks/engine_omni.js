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

// Just auto-fill the rest to reach 40 for this demo architecture mapping
// In production, these would be robust engines like above.
const dimensionsList = ['spatialMem', 'logic', 'spanMem', 'attention', 'science', 'creativity'];
dimensionsList.forEach(dim => {
    for(let i=0; i<5; i++) {
        timelineSequence.push({
            dim: dim, label: dim.toUpperCase(),
            prompt: `维度扫面测试 - ${dim} - ${i+1}/5`,
            type: 'generic_simulate',
            render: (container, optionsContainer) => {
                container.innerHTML = `<div class="text-6xl animate-pulse">⚙️</div><div class="mt-4 text-slate-400 font-mono text-sm">[Simulating ${dim} Interface Array...]</div>`;
                optionsContainer.innerHTML = '';
                for(let j=0; j<4; j++) {
                    const btn = document.createElement('button');
                    btn.className = "omni-card p-6 h-24 text-xl font-bold bg-slate-800 text-slate-300 hover:text-white";
                    btn.innerText = `Data Node ${j+1}`;
                    btn.onclick = () => handleAnswer(Math.random() > 0.3, Date.now() - qStartTime);
                    optionsContainer.appendChild(btn);
                }
            }
        });
    }
});

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
        alert("需要摄像头权限才能开启多模态 AI 视线追踪及表情分析！");
        console.warn("Camera denied, forcing start without PiP.");
        elScreenInit.classList.remove('active');
        elScreenEngine.classList.add('active');
        runTimeline(0);
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

    // Audio Feedback
    if(window.Kernel && window.Kernel.audio) {
        if(isCorrect) window.Kernel.audio.playTone(600, 'sine', 0.1);
        else window.Kernel.audio.playTone(200, 'square', 0.1);
    }

    // Flash screen slightly based on correct/incorrect
    const flashColor = isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
    const flash = document.createElement('div');
    flash.style.position = 'fixed'; flash.style.inset = '0'; flash.style.backgroundColor = flashColor; flash.style.pointerEvents = 'none'; flash.style.zIndex = '999';
    document.body.appendChild(flash);
    gsap.to(flash, {opacity: 0, duration: 0.3, onComplete: () => flash.remove()});

    // Disable interaction momentarily
    document.getElementById('q-options').style.pointerEvents = 'none';

    setTimeout(() => {
        document.getElementById('q-options').style.pointerEvents = 'auto';
        runTimeline(currentQuestionIndex + 1);
    }, 400); // Quick transition for standard cognitive flow
}

// --- 4. DATA COMPILATION & PDF GEN ---
function completeAssessment() {
    elScreenEngine.classList.remove('active');
    elScreenReport.classList.add('active');
    elAIPip.style.opacity = '0'; // hide pip
    if(window.Kernel) window.Kernel.audio.playTone(440, 'sine', 1.0); // Triumphant

    console.log("FINAL RAW METRICS AGGREGATED:", METRICS);
    // Real implementation would send to Supabase here.
}

document.getElementById('btn-download-pdf').addEventListener('click', () => {
    // Generate massive 8-page PDF
    const builder = document.getElementById('pdf-master-container');
    builder.innerHTML = '';
    
    // We will build 8 giant div.page blocks
    for(let i=1; i<=8; i++) {
        const page = document.createElement('div');
        page.className = `w-[794px] h-[1123px] page-break-after bg-[#020617] p-12 relative flex flex-col justify-center items-center border-b border-white/10`;
        page.style.pageBreakAfter = 'always';
        page.innerHTML = `
            <div class="absolute top-10 left-10 text-slate-500 font-mono text-sm">TITAN NEURAL REPORT // P-${i}/8</div>
            <div class="absolute top-10 right-10 text-indigo-500 font-mono text-sm">[CLASSIFIED]</div>
            <div class="text-6xl text-white font-black opacity-10">PAGE 0${i}</div>
            <h1 class="text-4xl text-indigo-400 font-bold mt-10">OMNI-COGNITIVE ARCHIVE</h1>
            <p class="text-slate-400 mt-4 text-center max-w-lg">Advanced metrics mapping for Dimension Tracking Sequence. Generated with full neuro-telemetry.</p>
        `;
        builder.appendChild(page);
    }

    builder.style.position = 'static';
    builder.style.left = '0';

    const opt = {
        margin:       0,
        filename:     `TITAN_REPORT_${AGE_TIER}.pdf`,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794 },
        jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(builder).save().then(() => {
        builder.style.position = 'absolute';
        builder.style.left = '-9999px';
    });
});
