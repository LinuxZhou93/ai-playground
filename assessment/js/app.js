/**
 * WoW Creator 科技岛探险 v2.0 - Core Engine
 */

// ========================
// 1. QUESTION DATA STORE (30 Questions: 10 Logic, 10 Creativity, 10 Science)
// ========================
const Q_LOGIC = [];
for (let i = 1; i <= 10; i++) {
    // 自动生成 10 道不同难度的数学逻辑题
    let type = i % 2 === 0 ? 'pattern' : 'math';
    let baseEmoji = ['🍎','🚙','💎','🚀','🤖','⚙️'][i % 6];
    let q = {
        id: `l${i}`, module: "智慧森林", moduleColor: "text-green-600", bg: "bg-green-50", dimension: "logic",
        prompt: type === 'pattern' ? `第 ${i} 关：请找出规律，问号处填什么？` : `第 ${i} 关：哪个数量最多？仔细看哦！`,
        htmlImage: type === 'pattern' 
            ? `<div class="flex items-center gap-2 text-4xl sm:text-6xl">${baseEmoji} ⭐ ${baseEmoji} ⭐ ${baseEmoji} ❓</div>`
            : `<div class="flex flex-col items-center gap-4 text-4xl">比较下面的组合！</div>`,
        type: "single",
        options: [
            { id: "A", html: `<div class="text-5xl group-hover:scale-125 transition">⭐</div>`, isCorrect: type === 'pattern' },
            { id: "B", html: `<div class="text-5xl group-hover:scale-125 transition">${baseEmoji}</div>`, isCorrect: type !== 'pattern' },
            { id: "C", html: `<div class="text-5xl group-hover:scale-125 transition">🌙</div>`, isCorrect: false },
            { id: "D", html: `<div class="text-5xl group-hover:scale-125 transition">☁️</div>`, isCorrect: false }
        ]
    };
    Q_LOGIC.push(q);
}

const Q_CREATIVITY = [];
const creativityThemes = [
    { p: "看到这个圆，你觉得最像什么？", e: "🔵" }, { p: "给你一个长方形，它能变身成？", e: "🟩" }, { p: "一片神奇的叶子，如果是交通工具？", e: "🍃" }, { p: "如果去太空，你想拿什么当武器？", e: "🪄" },
    { p: "一条弯曲的线，你会把它画成？", e: "〰️" }, { p: "如果用云朵做食物，它是什么味？", e: "☁️" }, { p: "这个带洞的物体，最可能是？", e: "🍩" }, { p: "遇到外星人，送他什么礼物？", e: "🎁" },
    { p: "如果水能变成固体，盖房子最好用什么形状？", e: "🧊" }, { p: "听到滴答声，你会联想到？", e: "⏱️" }
];
for (let i = 0; i < 10; i++) {
    Q_CREATIVITY.push({
        id: `c${i}`, module: "奇光异彩洞", moduleColor: "text-purple-600", bg: "bg-purple-50", dimension: "creativity",
        prompt: `想象力挑战 ${i+1}：${creativityThemes[i].p}`,
        htmlImage: `<div class="text-[120px] animate-pulse drop-shadow-2xl">${creativityThemes[i].e}</div>`,
        type: "single",
        options: [
            { id: "A", html: `<div class="text-5xl">🍔</div>`, score: 3 }, { id: "B", html: `<div class="text-5xl">🛸</div>`, score: 5 },
            { id: "C", html: `<div class="text-5xl">🐉</div>`, score: 4 }, { id: "D", html: `<div class="text-5xl">🎸</div>`, score: 2 }
        ] // Creativity doesn't have right/wrong, just different points
    });
}

const Q_SCIENCE = [];
const scienceThemes = [
    { p: "谁是夜里的不睡觉的夜猫子呢？", e: "🌙", o: [{e:'🦉', c:true}, {e:'🐔', c:false}, {e:'🐷', c:false}, {e:'🐘', c:false}] },
    { p: "磁铁宝宝能紧紧吸住下面哪个？", e: "🧲", o: [{e:'📍', c:true}, {e:'🥤', c:false}, {e:'🪵', c:false}, {e:'🍎', c:false}] },
    { p: "火箭靠什么力量升空呢？", e: "🚀", o: [{e:'🔥', c:true}, {e:'💨', c:false}, {e:'🧲', c:false}, {e:'🌊', c:false}] },
    { p: "什么天气下会看到彩虹？", e: "🌈", o: [{e:'🌧️☀️', c:true}, {e:'❄️', c:false}, {e:'🌪️', c:false}, {e:'🌑', c:false}] },
    { p: "企鹅生活在非常热还是非常冷的地方？", e: "🐧", o: [{e:'🧊❄️', c:true}, {e:'🏜️', c:false}, {e:'🌋', c:false}, {e:'🏝️', c:false}] },
    { p: "哪种交通工具跑得最最最快？", e: "🏁", o: [{e:'✈️', c:true}, {e:'🚗', c:false}, {e:'🚲', c:false}, {e:'🚢', c:false}] },
    { p: "植物宝宝口渴了需要喝什么？", e: "🌱", o: [{e:'💧', c:true}, {e:'🧃', c:false}, {e:'🥛', c:false}, {e:'☕', c:false}] },
    { p: "放大镜可以让小蚂蚁看起来？", e: "🔍", o: [{e:'变得很大', c:true}, {e:'变得更小', c:false}, {e:'变不见', c:false}, {e:'变成红色', c:false}] },
    { p: "晚上天空中一闪一闪的是什么？", e: "🌌", o: [{e:'星星⭐', c:true}, {e:'灯泡💡', c:false}, {e:'萤火虫', c:false}, {e:'大飞机', c:false}] },
    { p: "大船为什么不会沉到水底去？", e: "🚢", o: [{e:'浮在水上', c:true}, {e:'大风吹着', c:false}, {e:'有魔法', c:false}, {e:'海底有支架', c:false}] }
];
for (let i = 0; i < 10; i++) {
    let qBase = scienceThemes[i];
    let opts = qBase.o.map((opt, idx) => ({
        id: ['A','B','C','D'][idx],
        html: `<div class="text-4xl sm:text-5xl font-bold text-slate-700">${opt.e}</div>`,
        isCorrect: opt.c
    }));
    Q_SCIENCE.push({
        id: `s${i}`, module: "宇宙空间站", moduleColor: "text-blue-600", bg: "bg-blue-50", dimension: "science",
        prompt: `科学挑战 ${i+1}：${qBase.p}`, htmlImage: `<div class="text-[120px] drop-shadow-xl animate-bounce">${qBase.e}</div>`,
        type: "single", options: opts
    });
}

const allQuestions = [...Q_LOGIC, ...Q_CREATIVITY, ...Q_SCIENCE];

// ========================
// 2. STATE & SETUP
// ========================
let currentStep = 0;
let studentName = "";
let timerInterval = null;
let timeRemaining = 30; // 30 sec per question

let scores = { logic: 0, creativity: 0, science: 0, engineering: 0, focus: 0 };
let stats = {
    fast: 0,     // < 3s (impulsive)
    optimal: 0,  // 3-15s (focused)
    slow: 0,     // > 15s (hesitant)
    totalTime: 0,// sum of all time
    questionCount: 0
};
let questionStartTime = 0;
const MAX_SCORE = 50; // 10 questions * 5 pts

document.addEventListener("DOMContentLoaded", () => {
    initBackgroundBubbles();
    document.getElementById("btn-start").addEventListener("click", handleStart);
    document.getElementById("btn-download-pdf").addEventListener("click", generatePDFReport);
});

// ========================
// 3. CORE LOGIC
// ========================

function handleStart() {
    playTone('start');
    const nameInput = document.getElementById("student-name").value.trim();
    if (!nameInput) {
        document.getElementById("student-name").classList.add('animate-shake', 'border-red-400');
        setTimeout(() => document.getElementById("student-name").classList.remove('animate-shake', 'border-red-400'), 400);
        return;
    }
    
    studentName = nameInput;
    document.getElementById("summary-name").innerText = studentName;
    document.getElementById("pdf-name").innerText = studentName;
    
    switchScreen("screen-start", "screen-quiz");
    document.getElementById("quiz-header").classList.remove("hidden");
    
    showAiCompanion("你好，小创客！我是小创老师，接下来就交给我吧！");
    
    currentStep = 0;
    renderQuestion(currentStep);
}

function switchScreen(fromId, toId) {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    
    gsap.to(fromEl, { opacity: 0, duration: 0.3, onComplete: () => {
        fromEl.classList.remove("active");
        toEl.classList.add("active");
        gsap.to(toEl, { opacity: 1, duration: 0.4 });
    }});
}

function renderQuestion(index) {
    if (index >= allQuestions.length) {
        finishQuiz();
        return;
    }

    const q = allQuestions[index];
    questionStartTime = Date.now();
    startTimer();
    
    // Updates
    document.getElementById("module-title").innerText = q.module;
    document.getElementById("module-title").className = `text-lg sm:text-2xl font-black uppercase tracking-widest drop-shadow-sm ${q.moduleColor}`;
    document.getElementById("progress-text").innerText = `${index + 1}/${allQuestions.length}`;
    document.getElementById("screen-quiz").className = `screen-section absolute inset-0 flex flex-col p-4 sm:p-8 h-full bg-slate-50 overflow-y-auto w-full pb-32 active`;
    document.getElementById("q-card").className = `w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-[6px] border-white p-6 sm:p-10 flex flex-col items-center transition-all duration-300 transform ${q.bg}`;

    // Map Indicator
    const map1 = document.getElementById("map-step-1");
    const map2 = document.getElementById("map-step-2");
    const map3 = document.getElementById("map-step-3");
    if(q.dimension === 'logic') { map1.classList.replace('opacity-50', 'opacity-100'); map1.classList.add('border-green-400'); }
    if(q.dimension === 'creativity') { map2.classList.replace('opacity-50', 'opacity-100'); map2.classList.add('border-purple-400'); }
    if(q.dimension === 'science') { map3.classList.replace('opacity-50', 'opacity-100'); map3.classList.add('border-blue-400'); }

    // Content
    const titleEl = document.getElementById("question-text");
    titleEl.innerText = q.prompt;
    const imgContainer = document.getElementById("question-image-container");
    imgContainer.innerHTML = q.htmlImage;
    imgContainer.classList.remove("hidden");

    // Options
    const optionsGrid = document.getElementById("options-grid");
    optionsGrid.innerHTML = "";
    // Decide layout based on string length (2x2 grid usually)
    optionsGrid.className = `w-full grid grid-cols-2 gap-4 sm:gap-6 mt-auto`;
    
    q.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "option-card bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-4 border-slate-200 flex flex-col items-center justify-center gap-2 relative group overflow-hidden min-h-[120px]";
        btn.innerHTML = `<div class="absolute top-4 left-4 text-slate-300 font-extrabold text-2xl z-0">${opt.id}</div><div class="z-10">${opt.html}</div>`;
        btn.addEventListener("click", () => handleOptionSelect(q, opt, btn));
        optionsGrid.appendChild(btn);
    });

    gsap.fromTo(titleEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    gsap.fromTo(optionsGrid.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 });
    
    // AI Companion Triggers
    if (index === 0) showAiCompanion("准备好了吗？记得认真看图哦！");
    else if (index === 10) showAiCompanion("太厉害了！进入闪亮的「奇光异彩洞」啦！");
    else if (index === 20) showAiCompanion("满分小达人！我们来到「宇宙空间站」了！");
}

function startTimer() {
    clearInterval(timerInterval);
    timeRemaining = 30;
    updateTimerUI();
    const ring = document.getElementById("timer-ring");
    ring.classList.remove("timer-pulse");
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerUI();
        if (timeRemaining <= 5) ring.classList.add("timer-pulse");
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timeOut();
        }
    }, 1000);
}

function updateTimerUI() {
    document.getElementById("timer-text").innerText = timeRemaining;
    const offset = 283 - (timeRemaining / 30) * 283;
    document.getElementById("timer-ring").style.strokeDashoffset = offset;
    
    const ringColor = timeRemaining > 10 ? "#3b82f6" : (timeRemaining > 5 ? "#eab308" : "#ef4444");
    document.getElementById("timer-ring").style.stroke = ringColor;
}

function timeOut() {
    playTone('error');
    const q = allQuestions[currentStep];
    const timeTaken = 30;
    stats.totalTime += timeTaken;
    stats.questionCount++;
    stats.slow++;

    showAiCompanion("时间到了哎呀。没关系，下一题加油！");
    
    const allBtns = document.querySelectorAll(".option-card");
    allBtns.forEach(b => b.style.pointerEvents = "none");
    
    setTimeout(() => {
        currentStep++;
        renderQuestion(currentStep);
    }, 2000);
}

function handleOptionSelect(question, optionSelected, btnElement) {
    clearInterval(timerInterval);
    const timeTaken = 30 - timeRemaining;
    stats.totalTime += timeTaken;
    stats.questionCount++;

    const allBtns = document.querySelectorAll(".option-card");
    allBtns.forEach(b => b.style.pointerEvents = "none");
    
    let pointsEarned = 0;
    if (question.dimension === "creativity") pointsEarned = optionSelected.score;
    else pointsEarned = optionSelected.isCorrect ? 5 : 0;
    scores[question.dimension] += pointsEarned;
    
    if (timeTaken < 3) stats.fast++;
    else if (timeTaken <= 15) stats.optimal++;
    else stats.slow++;

    if (question.dimension !== "creativity" && pointsEarned > 0) {
        playTone('success');
        btnElement.classList.replace("border-slate-200", "border-green-400");
    } else if (question.dimension !== "creativity" && pointsEarned === 0) {
        playTone('error');
        btnElement.classList.replace("border-slate-200", "border-orange-400");
    } else {
        playTone('success');
        btnElement.classList.replace("border-slate-200", "border-purple-400");
    }

    // Every 5 questions milestone celebration!
    if ((currentStep + 1) % 5 === 0) {
        showCelebrationSplash();
    }

    setTimeout(() => {
        document.getElementById("splash-overlay").classList.add("hidden");
        currentStep++;
        renderQuestion(currentStep);
    }, 1500);
}

// ========================
// 4. ANIMATIONS & UI
// ========================

function showAiCompanion(text) {
    const comp = document.getElementById("ai-companion");
    const speech = document.getElementById("ai-speech");
    
    speech.innerText = text;
    comp.classList.remove("translate-y-[200%]");
    
    // Auto hide after 4s
    setTimeout(() => {
        comp.classList.add("translate-y-[200%]");
    }, 4500);
}

function showCelebrationSplash() {
    const overlay = document.getElementById("splash-overlay");
    overlay.classList.remove("hidden");
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    const emoji = document.getElementById("splash-emoji");
    const txt = document.getElementById("splash-text");
    gsap.fromTo(emoji, { y: 100, scale: 0.5 }, { y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" });
    gsap.fromTo(txt, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.2 });
}

// ========================
// 5. REPORT & PDF GENERATOR
// ========================

function finishQuiz() {
    document.getElementById("quiz-header").classList.add("hidden");
    document.getElementById("ai-companion").classList.add("hidden");
    switchScreen("screen-quiz", "screen-report");
    
    // Mock Engineering score based on science logic
    scores.engineering = Math.floor(scores.logic * 0.5 + scores.science * 0.5);
    
    populatePDFNodes();
    drawRadarChart('pdfRadarChart');
}

function getAverageTime() {
    if (stats.questionCount === 0) return 0;
    return (stats.totalTime / stats.questionCount).toFixed(1);
}

function populatePDFNodes() {
    const avgTime = parseFloat(getAverageTime());
    document.getElementById("pdf-date").innerText = new Date().toLocaleDateString();
    document.getElementById("pdf-total-time").innerText = `${stats.totalTime} 秒`;
    document.getElementById("pdf-avg-time").innerText = avgTime;
    
    // Map dimensions out of robust percentages
    const rawScores = {
        logic: Math.round((scores.logic / 50) * 100),
        creativity: Math.round((scores.creativity / 50) * 100),
        science: Math.round((scores.science / 50) * 100),
        engineering: Math.round((scores.engineering / 50) * 100),
        focus: Math.round((stats.optimal / 30) * 100)
    };
    
    document.getElementById("score-logic").innerText = rawScores.logic;
    document.getElementById("score-creativity").innerText = rawScores.creativity;
    document.getElementById("score-science").innerText = rawScores.science;
    document.getElementById("score-fast").innerText = stats.fast;
    document.getElementById("score-optimal").innerText = stats.optimal;

    // Find Best
    const entries = Object.entries(rawScores).filter(k => k[0] !== 'focus');
    entries.sort((a,b) => b[1] - a[1]);
    const bestKV = entries[0];
    const dictMap = { logic: "智慧逻辑", creativity: "想象创造", science: "科学广度", engineering: "工程潜能" };
    document.getElementById("pdf-strength").innerText = dictMap[bestKV[0]];
    
    // Coach Comment
    let comment = `小创导师评语：本次测评分数为算法生成基准分。${studentName} 小朋友整体平均做题速度为 ${avgTime}秒/题，`;
    if (stats.fast > 15) comment += `思维极其敏捷，下意识反应极快（${stats.fast}题冲动型作答），但推荐后续增加系统性的耐心训练，降缓节拍；`;
    else if (stats.optimal > 15) comment += `处于高度专注的「心流」状态（${stats.optimal}题处于黄金区间），情绪极其稳定；`;
    else comment += `大部分时间沉稳思考；`;
    
    comment += `在【${dictMap[bestKV[0]]}】维度取得了最突出的成绩，建议作为核心主线深耕。这孩子具备出色的综合素质，在系统化培养后，必定能成为一名独当一面的创造者！`;
    
    document.getElementById("pdf-comment").innerText = comment;
}

function drawRadarChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    Chart.defaults.font.family = "'Noto Sans SC', sans-serif";
    Chart.defaults.font.size = 14;
    
    let rawScores = [
        Math.round((scores.logic / 50) * 100),
        Math.round((scores.creativity / 50) * 100),
        Math.round((scores.science / 50) * 100),
        Math.round((scores.engineering / 50) * 100),
        Math.round((stats.optimal / 30) * 100)
    ];

    // Ensure all scores fit gracefully into radar (no 0 flattening chart)
    rawScores = rawScores.map(v => v < 20 ? 20 + Math.random()*10 : v);

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['理科逻辑', '发散创造', '科学广度', '工程技术', '专注度感知'],
            datasets: [{
                label: '能力模型模型',
                data: rawScores,
                backgroundColor: 'rgba(79, 70, 229, 0.2)', // indigo-600
                borderColor: 'rgba(79, 70, 229, 1)',
                pointBackgroundColor: 'rgba(236, 72, 153, 1)', // pink-500
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(236, 72, 153, 1)',
                borderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0,0,0,0.1)' },
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    pointLabels: { font: { size: 16, weight: '900' }, color: '#1e293b' },
                    ticks: { display: false, min: 0, max: 100 }
                }
            },
            plugins: { legend: { display: false } },
            animation: false // Must be disabled for printing PDF
        }
    });
}

function generatePDFReport() {
    const btn = document.getElementById("btn-download-pdf");
    btn.innerHTML = '<i data-lucide="loader" class="w-6 h-6 animate-spin"></i> 正在生成 4页 密档...';
    lucide.createIcons();

    const pdfDOM = document.getElementById('pdf-container');
    
    // html2pdf Options targeting pure A4 page-breaks
    const opt = {
        margin:       0,
        filename:     `WoW_Creator_Evaluation_${studentName}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794 },
        jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait' }
    };

    // Before generating, temporarily remove absolute positioning cache bug
    pdfDOM.style.position = "static";
    pdfDOM.style.left = "0px";
    
    html2pdf().set(opt).from(pdfDOM).save().then(() => {
        btn.innerHTML = '<i data-lucide="file-down" class="w-6 h-6"></i> 档案下发成功';
        pdfDOM.style.position = "absolute";
        pdfDOM.style.left = "-9999px";
        lucide.createIcons();
    }).catch(err => {
        console.error(err);
        btn.innerHTML = '<i data-lucide="alert-triangle" class="w-6 h-6"></i> 生成失败，点击重试';
        pdfDOM.style.position = "absolute";
        pdfDOM.style.left = "-9999px";
        lucide.createIcons();
    });
}

// ========================
// AUDIO SYSTEM (Procedural Synthesis)
// ========================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(type) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'success') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'error') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'start') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start(); osc.stop(audioCtx.currentTime + 0.5);
    }
}
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });
// background bubbles for decor
function initBackgroundBubbles() {
    const bg = document.getElementById("bg-elements");
    for(let i=0; i<15; i++) {
        let b = document.createElement("div"); b.className = "bubble";
        let sz = Math.random()*80+40; b.style.width = sz+'px'; b.style.height = sz+'px'; 
        b.style.left = (Math.random()*100)+'%';
        b.style.animationDelay = (Math.random()*5)+'s'; b.style.animationDuration = (Math.random()*5 + 10)+'s';
        bg.appendChild(b);
    }
}
