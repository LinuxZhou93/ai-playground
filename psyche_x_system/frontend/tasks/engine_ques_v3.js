/**
 * TITAN 8-Dimension Cognitive Assessment Engine (v3.0)
 * Pure Question Bank Mode + Final Camera Integration
 */

// 1. DATA & GENERATORS
const urlParams = new URLSearchParams(window.location.search);
const ageTier = urlParams.get('age') || '4-7'; // "4-7", "7-9", "10-12"

// --- Logic ---
const generateLogic = (count, tier) => {
    let qs = [];
    const fruits = ['🍎','🍌','🍇','🍉','🍊','🍓','🍍','🥝','🚗','✈️','🚀'];
    for(let i=0; i<count; i++) {
        let a = fruits[Math.floor(Math.random()*fruits.length)];
        let b = fruits[Math.floor(Math.random()*fruits.length)];
        while(b===a) b = fruits[Math.floor(Math.random()*fruits.length)];
        
        let htmlImg, correctAnim, wrongBase;
        if(tier === '4-7') {
            htmlImg = `<div class="text-6xl tracking-widest">${a} ${b} ${a} ${b} ❓</div>`;
            correctAnim = a; wrongBase = b;
        } else {
            let c = fruits[Math.floor(Math.random()*fruits.length)];
            while(c===a || c===b) c = fruits[Math.floor(Math.random()*fruits.length)];
            // A B C A B C
            htmlImg = `<div class="text-5xl tracking-widest">${a} ${b} ${c} ${a} ${b} ❓</div>`;
            correctAnim = c; wrongBase = a;
        }
        
        let c = fruits[Math.floor(Math.random()*fruits.length)];
        let d = fruits[Math.floor(Math.random()*fruits.length)];
        
        let opts = [
            { html: `<div class="text-6xl">${correctAnim}</div>`, isCorrect: true },
            { html: `<div class="text-6xl">${wrongBase}</div>`, isCorrect: false },
            { html: `<div class="text-6xl">${c}</div>`, isCorrect: false },
            { html: `<div class="text-6xl">${d}</div>`, isCorrect: false }
        ];
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);

        qs.push({
            module: "逻辑推理舱", dimension: "logic",
            prompt: tier === '4-7' ? "找规律，问号处应该放什么？" : "仔细观察高级序列，问号填什么？",
            htmlImage: htmlImg, type: "single", gridCols: 2, options: opts
        });
    }
    return qs;
};

// --- Memory ---
const generateMemory = (count, tier) => {
    let qs = [];
    let size = tier === '4-7' ? 3 : 4;
    for(let i=0; i<count; i++) {
        let len = tier === '4-7' ? 3 + Math.floor(i/2) : 4 + Math.floor(i/2);
        qs.push({
            module: "记忆广度舱", dimension: "memory",
            prompt: `请记住亮起的格子顺序，并依次点击它们！（${len}个目标）`,
            type: "memory", gridSize: size, sequenceLength: Math.min(len, 8)
        });
    }
    return qs;
};

// --- Science ---
const scienceBank = [
    { p: "什么动物晚上不睡觉，被叫作夜猫子？", a: "🦉猫头鹰", w: ["🐷小猪", "🐒猴子", "🐘大象"] },
    { p: "神奇的磁铁最喜欢吸住什么？", a: "📍铁钉", w: ["🥤塑料杯", "🪵木块", "🧻纸团"] },
    { p: "火箭靠什么力量飞上太空？", a: "🔥向后喷出气体", w: ["💨大风吹上天的", "🎈大气球飞的", "🪽装了翅膀"] },
    { p: "冰块放在大太阳底下会变成什么？", a: "💧变成水", w: ["☁️变成白云", "🪨变成石头", "🔥变成火"] },
    { p: "地球是什么形状的？", a: "🌏大圆球", w: ["📦方盒子", "🔺三角形", "🍳像大饼"] },
    { p: "白天为我们带来光和热的是什么？", a: "☀️太阳", w: ["🌙月亮", "⭐星星", "💡路灯"] },
    { p: "哪种交通工具跑得最快？", a: "✈️飞机", w: ["🚗小汽车", "🚲自行车", "🚢大船"] }
];
const scienceAdvancedBank = [
    { p: "水在多少度会结冰？", a: "🧊 0度", w: ["🔥 100度", "🌡️ 50度", "🥶 -100度"] },
    { p: "宇航员在月球上为什么能跳得很高？", a: "🌕 引力小", w: ["💪 力气变大", "👟 鞋子有弹簧", "💨 没有空气"] },
    { p: "手机没电了，需要什么才能恢复？", a: "🔌 电能", w: ["🔋 水能", "🔥 热能", "☀️ 光能"] },
    { p: "植物宝宝长大最需要什么进行光合作用？", a: "☀️ 阳光", w: ["🍬 糖果", "🌧️ 雨水", "💨 微风"] },
    { p: "电灯泡是谁发明的？", a: "💡 爱迪生", w: ["🍎 牛顿", "🦅 莱特兄弟", "🚀 马斯克"] },
    { p: "天空下雨又打雷的时候，为什么先看到闪电？", a: "⚡ 光速比声速快", w: ["🔊 声速比光速快", "🤷 同时发生", "👀 眼睛在前面"] },
    { p: "潜水艇靠什么在水里上升和下降？", a: "💧 排水注水", w: ["🪽 巨大的翅膀", "🔥 燃烧燃料", "🎈 吹泡泡"] }
];
const generateScience = (count, tier) => {
    let b = tier === '4-7' ? scienceBank : scienceAdvancedBank;
    let qs = [];
    for(let i=0; i<count; i++) {
        let q = b[i % b.length];
        let opts = [
            { html: `<div class="text-3xl font-bold py-4">${q.a}</div>`, isCorrect: true },
            { html: `<div class="text-3xl font-bold py-4">${q.w[0]}</div>`, isCorrect: false },
            { html: `<div class="text-3xl font-bold py-4">${q.w[1]}</div>`, isCorrect: false },
            { html: `<div class="text-3xl font-bold py-4">${q.w[2]}</div>`, isCorrect: false }
        ];
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);
        qs.push({
            module: "科学常识舱", dimension: "science", prompt: q.p,
            htmlImage: `<div class="text-8xl animate-pulse shadow-2xl rounded-full bg-white w-40 h-40 flex items-center justify-center border-8 border-blue-200">🌍</div>`,
            type: "single", gridCols: 2, options: opts
        });
    }
    return qs;
};

// --- Engineering ---
const engineeringBank = [
    { p: "如果要给小轿车换轮子，什么形状最好？", a: "⭕️圆形", w: ["🔺三角形", "🟥方形", "⭐星形"] },
    { p: "过大河的时候，什么结构最坚固？", a: "🌉拱形桥", w: ["📏直板桥", "〰️波浪桥", "🎈气球吊桥"] },
    { p: "要盖很高很高的大楼，最好用什么做骨架？", a: "🏗️钢铁", w: ["🪵木头", "🧱泥土", "🧻报纸"] },
    { p: "如果想飞上天空，必须要有？", a: "🪽翅膀或推力", w: ["🚗大轮胎", "⚓沉重的铁锚", "☂️雨伞"] },
    { p: "要把很重的石头撬起来，最好用？", a: "🦯长棍子", w: ["🧵细线", "🧤手套", "📰报纸"] },
    { p: "三个齿轮咬合在一起，最左边往右转，最右边往哪转？", a: "➡️往右转", w: ["⬅️往左转", "⏸️不转", "🔄一起转"] }
];
const generateEngineering = (count, tier) => {
    let qs = [];
    for(let i=0; i<count; i++) {
        let q = engineeringBank[i % engineeringBank.length];
        let opts = [
            { html: `<div class="text-3xl font-bold py-4">${q.a}</div>`, isCorrect: true },
            { html: `<div class="text-3xl font-bold py-4">${q.w[0]}</div>`, isCorrect: false },
            { html: `<div class="text-3xl font-bold py-4">${q.w[1]}</div>`, isCorrect: false },
            { html: `<div class="text-3xl font-bold py-4">${q.w[2]}</div>`, isCorrect: false }
        ];
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);
        qs.push({
            module: "工程感知舱", dimension: "engineering", prompt: q.p,
            htmlImage: `<div class="text-8xl shadow-xl rounded-2xl bg-white w-40 h-40 flex items-center justify-center border-4 border-orange-200">⚙️</div>`,
            type: "single", gridCols: 2, options: opts
        });
    }
    return qs;
};

// --- Creativity ---
const creativityBank = [
    { p: "看到这个圆，你觉得它最像什么？", img: "⭕️", o: [{t:"外星飞碟", s:5}, {t:"狮子脸", s:4}, {t:"甜甜圈", s:3}, {t:"盘子", s:2}] },
    { p: "想给超级飞车装上什么配件？", img: "🚙", o: [{t:"火箭推进器", s:5}, {t:"直升机螺旋桨", s:4}, {t:"水陆两用气垫", s:3}, {t:"大号越野轮胎", s:2}] },
    { p: "给你一个大空纸箱，你要拿来做什么？", img: "📦", o: [{t:"做成穿越时空机", s:5}, {t:"改成小城堡", s:4}, {t:"画上眼睛当机器人", s:3}, {t:"装满不要的玩具", s:2}] },
    { p: "如果你画一片天空，打算用什么颜色？", img: "🎨", o: [{t:"五彩斑斓的极光色", s:5}, {t:"梦幻的粉紫渐变", s:4}, {t:"深邃的海底深蓝", s:3}, {t:"普通的浅蓝色", s:2}] },
    { p: "小动物如果会说话，你想和谁聊天？", img: "🦊", o: [{t:"远古霸王龙", s:5}, {t:"会魔法的独角兽", s:4}, {t:"深海的大鲸鱼", s:3}, {t:"邻居的小猫咪", s:2}] },
    { p: "你觉得云朵摸起来应该是什么感觉的？", img: "☁️", o: [{t:"像触电一样的酥麻", s:5}, {t:"冰冰凉凉像雪糕", s:4}, {t:"软绵绵像棉花糖", s:3}, {t:"像水一样抓不住", s:2}] },
    { p: "拥有超能力，你选哪个？", img: "🦸", o: [{t:"控制时间的流逝", s:5}, {t:"瞬间移动到宇宙边缘", s:4}, {t:"能听懂植物说话", s:3}, {t:"力气大到举起大象", s:2}] }
];
const generateCreativity = (count) => {
    let qs = [];
    for(let i=0; i<count; i++) {
        let q = creativityBank[i % creativityBank.length];
        let opts = q.o.map((o) => ({ html: `<div class="text-2xl font-bold py-4 px-2 leading-snug">${o.t}</div>`, isCorrect: true, isCreative: true, score: o.s }));
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);
        qs.push({
            module: "发散创造舱", dimension: "creativity", prompt: q.p,
            htmlImage: `<div class="text-8xl shadow-xl rounded-2xl bg-white w-40 h-40 flex items-center justify-center border-4 border-purple-200">${q.img}</div>`,
            type: "single", gridCols: 2, options: opts
        });
    }
    return qs;
};

// --- Execution & Speed (Embedded inside reaction times, no dedicated questions, but we add some "Find Different" tasks) ---
const executionBank = [
    { p: "用最快速度找出不一样的那个！", img: "<div class='text-6xl'>🍎 🍎 🍎 🍓 🍎 🍎</div>", correct: "🍓", wrong: "🍎" },
    { p: "用最快速度找出不一样的那个！", img: "<div class='text-6xl'>🐶 🐶 🐺 🐶 🐶 🐶</div>", correct: "🐺", wrong: "🐶" },
    { p: "极速辨认！哪个是交通工具？", img: "<div class='text-6xl'>⚽ 🎸 🚀 🍔 👕 📱</div>", correct: "🚀", wrong: "🎸" },
    { p: "突发拦截！出现 ❌ 时绝对不要按！选 ✅", img: "<div class='text-8xl'>❓</div>", correct: "✅", wrong: "❌" } 
];
const generateExecution = (count) => {
    let qs = [];
    for(let i=0; i<count; i++) {
        let q = executionBank[i % executionBank.length];
        let opts = [
            { html: `<div class="text-4xl font-bold py-4">${q.correct}</div>`, isCorrect: true },
            { html: `<div class="text-4xl font-bold py-4">${q.wrong}</div>`, isCorrect: false },
            { html: `<div class="text-4xl font-bold py-4">${q.wrong}</div>`, isCorrect: false },
            { html: `<div class="text-4xl font-bold py-4">${q.wrong}</div>`, isCorrect: false }
        ];
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);
        qs.push({
            module: "执行闪电舱", dimension: "speed", prompt: q.p,
            htmlImage: q.img, type: "single", gridCols: 2, options: opts
        });
    }
    return qs;
};

const aiCameraQ = [{
    module: "特工签发舱", dimension: "verbal", // Treat final photo / expression as verbal/communication metric
    prompt: "你好特工小创客！评测即将结束，请对准镜头笑一下，录入你的特工身份照，这将作为你的专属报告封面！",
    type: "camera"
}];

// --- Reaction Speed ---
const generateReaction = (count) => {
    let qs = [];
    for(let i=0; i<count; i++) {
        qs.push({
            module: "神经反应舱", dimension: "speed",
            prompt: `神经反应测试 ${i+1}/${count}: 当“神经核心”呈现绿色并立刻点击！`,
            type: "reaction"
        });
    }
    return qs;
};

// Total 40 Questions Assembly
let allQuestions = [];

if (ageTier === '4-7') {
    allQuestions = [
        ...generateReaction(5),
        ...generateLogic(7, '4-7'),
        ...generateMemory(8, '4-7'),
        ...generateScience(6, '4-7'),
        ...generateEngineering(6, '4-7'),
        ...generateExecution(4),
        ...generateCreativity(4),
        ...aiCameraQ
    ];
} else if (ageTier === '7-9') {
    allQuestions = [
        ...generateReaction(5),
        ...generateLogic(7, '7-9'),
        ...generateMemory(8, '7-9'),
        ...generateScience(6, '7-9'),
        ...generateEngineering(6, '7-9'),
        ...generateExecution(4),
        ...generateCreativity(4),
        ...aiCameraQ
    ];
} else {
    // 10-12 Default
    allQuestions = [
        ...generateReaction(5),
        ...generateLogic(7, '10-12'),
        ...generateMemory(8, '10-12'),
        ...generateScience(6, '10-12'),
        ...generateEngineering(6, '10-12'),
        ...generateExecution(4),
        ...generateCreativity(4),
        ...aiCameraQ
    ];
}

console.log(`[TITAN V3] Assembled ${allQuestions.length} questions for tier ${ageTier}`);

// ==========================================
// 2. ENGINE TRACKING STATE (8 Dimensions)
// ==========================================
let currentStep = -1; 
let studentName = "";
let qStartTs = 0;

let rawScores = {
    logic: 0, 
    memory: 0, 
    science: 0, 
    engineering: 0, 
    creativity: 0, 
    verbal: 10,   // Base score, increases upon camera completion
    speed: 0, 
    focus: 0      // Derived from overall timing
};

// Max potential raw logic scores to calculate percentages later
const MAX_SCORES = {
    logic: 8 * 5,
    memory: 8 * 5,
    science: 7 * 5,
    engineering: 6 * 5,
    creativity: 5 * 5, // max 25
    verbal: 20,
    speed: 5 * 10, // speed gives 10 if super fast
    focus: 40 * 10 
};

let capturedPhoto = null;
const sysAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ==========================================
// 3. UI CONTROLLERS
// ==========================================

const switchScreen = (id) => {
    document.querySelectorAll('.screen').forEach(el => {
        el.classList.remove('active');
        gsap.set(el, {opacity: 0});
    });
    const target = document.getElementById(id);
    target.classList.add('active');
    gsap.to(target, {opacity: 1, duration: 0.4});
};

const playSfx = (type) => {
    if(sysAudioCtx.state === 'suspended') sysAudioCtx.resume();
    const osc = sysAudioCtx.createOscillator();
    const gain = sysAudioCtx.createGain();
    osc.connect(gain); gain.connect(sysAudioCtx.destination);
    const t = sysAudioCtx.currentTime;
    
    if(type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t+0.1);
        gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t+0.3);
        osc.start(t); osc.stop(t+0.3);
    } else if (type === 'error') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t+0.2);
        gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t+0.2);
        osc.start(t); osc.stop(t+0.2);
    } else if (type === 'start') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(800, t+0.3);
        gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0.01, t+0.3);
        osc.start(t); osc.stop(t+0.3);
    } else if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.01, t+0.1);
        osc.start(t); osc.stop(t+0.1);
    }
};

document.getElementById("btn-start").addEventListener("click", () => {
    studentName = document.getElementById("student-name").value.trim() || "匿名特工";
    document.getElementById("deck-label").innerText = `已载入: ${ageTier} 岁指令集`;
    playSfx('start');
    nextStepWrapper();
});

function nextStepWrapper() {
    currentStep++;
    if (currentStep >= allQuestions.length) {
        finishAssessment();
        return;
    }
    renderQuestion(allQuestions[currentStep]);
}

function renderQuestion(q) {
    switchScreen("screen-quiz");
    qStartTs = Date.now();
    
    document.getElementById("quiz-header").classList.remove("hidden");
    document.getElementById("quiz-header").classList.add("flex");
    document.getElementById("module-title").innerText = q.module;
    document.getElementById("progress-bar").style.width = `${((currentStep) / allQuestions.length) * 100}%`;
    document.getElementById("progress-text").innerText = `${currentStep + 1} / ${allQuestions.length}`;
    
    const titleEl = document.getElementById("question-prompt");
    titleEl.innerText = q.prompt;
    gsap.fromTo(titleEl, {y: 10, opacity:0}, {y:0, opacity:1});
    
    const displayArea = document.getElementById("question-display-area");
    const optionsGrid = document.getElementById("options-grid");
    const aiMediaArea = document.getElementById("ai-media-area");
    
    displayArea.innerHTML = "";
    optionsGrid.innerHTML = "";
    displayArea.classList.add("hidden");
    optionsGrid.style.display = "none";
    aiMediaArea.classList.add("hidden");
    
    // Cleanup media
    if (window.activeStream) {
        window.activeStream.getTracks().forEach(t => t.stop());
        window.activeStream = null;
    }
    
    if (q.type === "single") {
        displayArea.classList.remove("hidden");
        optionsGrid.style.display = "grid";
        displayArea.innerHTML = q.htmlImage;
        gsap.fromTo(displayArea, {scale: 0.9, opacity: 0}, {scale: 1, opacity: 1});
        
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "opt-card bg-white rounded-3xl p-6 shadow border-4 border-slate-200 flex flex-col items-center justify-center relative min-h-[120px]";
            btn.innerHTML = `<div class="absolute top-2 left-4 text-slate-300 font-extrabold text-2xl">${opt.id}</div> 
                             <div class="z-10 w-full">${opt.html}</div>`;
            btn.onclick = () => handleAnswer(q, opt, btn);
            optionsGrid.appendChild(btn);
        });
        gsap.fromTo(optionsGrid.children, {y: 30, opacity: 0}, {y: 0, opacity: 1, stagger: 0.05});
        
    } else if (q.type === "memory") {
        displayArea.classList.remove("hidden");
        displayArea.className = "w-full max-w-lg mx-auto bg-slate-800 rounded-[2rem] shadow-2xl p-6 mb-8 relative";
        
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${q.gridSize}, minmax(0, 1fr))`;
        grid.style.gap = '8px';
        grid.style.aspectRatio = '1 / 1';
        
        const cells = [];
        for(let i=0; i<q.gridSize*q.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = "bg-slate-700 rounded-xl cursor-default transition-all duration-300 w-full h-full shadow-inner";
            cells.push(cell);
            grid.appendChild(cell);
        }
        displayArea.appendChild(grid);
        
        const sequence = [];
        for(let i=0; i<q.sequenceLength; i++) {
            sequence.push(Math.floor(Math.random() * cells.length));
        }
        
        let playbackIndex = 0;
        let playerIndex = 0;
        let playerTurn = false;
        
        const playSequence = () => {
            if(playbackIndex >= sequence.length) {
                playerTurn = true;
                titleEl.innerText = "🎮 你的回合！请按刚才的顺序点击";
                cells.forEach((c, idx) => {
                    c.classList.add('cursor-pointer');
                    c.classList.remove('cursor-default');
                    c.onclick = () => {
                        if(!playerTurn) return;
                        playSfx('tick');
                        c.classList.add('bg-blue-400');
                        setTimeout(()=> c.classList.remove('bg-blue-400'), 200);
                        
                        if (idx === sequence[playerIndex]) {
                            playerIndex++;
                            if (playerIndex >= sequence.length) {
                                playerTurn = false;
                                handleMemoryResult(q, true);
                            }
                        } else {
                            playerTurn = false;
                            handleMemoryResult(q, false);
                        }
                    };
                });
                return;
            }
            const targetIdx = sequence[playbackIndex];
            const cell = cells[targetIdx];
            playSfx('tick');
            cell.classList.add('bg-yellow-400', 'shadow-[0_0_20px_rgba(250,204,21,0.6)]', 'scale-110');
            setTimeout(() => {
                cell.classList.remove('bg-yellow-400', 'shadow-[0_0_20px_rgba(250,204,21,0.6)]', 'scale-110');
                playbackIndex++;
                setTimeout(playSequence, 300);
            }, 600);
        };
        setTimeout(playSequence, 1000);
        
    } else if (q.type === "reaction") {
        displayArea.classList.remove("hidden");
        displayArea.innerHTML = `
            <div class="relative w-64 h-64 flex items-center justify-center">
                <div id="reaction-outer" class="absolute inset-0 rounded-full border-4 border-slate-200 opacity-20 scale-150 animate-pulse"></div>
                <button id="reaction-target" class="w-40 h-40 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-black text-white/20 shadow-inner transition-all transform hover:scale-105 active:scale-95 z-30">
                    WAIT
                </button>
            </div>
        `;
        
        const target = document.getElementById("reaction-target");
        const outer = document.getElementById("reaction-outer");
        const delay = 1200 + Math.random() * 2500;
        let triggered = false;
        
        const startTrigger = setTimeout(() => {
            triggered = true;
            qStartTs = Date.now();
            target.innerHTML = "FIRE";
            target.classList.remove("bg-slate-800", "text-white/20");
            target.classList.add("bg-green-500", "text-white", "shadow-[0_0_50px_rgba(34,197,94,0.6)]");
            outer.classList.remove("border-slate-200", "opacity-20");
            outer.classList.add("border-green-400", "opacity-60");
            playSfx('tick');
        }, delay);
        
        target.onclick = (e) => {
            e.stopPropagation();
            if(!triggered) {
                clearTimeout(startTrigger);
                playSfx('error');
                triggerEffect('error');
                setTimeout(nextStepWrapper, 800);
            } else {
                handleAnswer(q, { isCorrect: true }, target);
            }
        };
    } else if (q.type === "camera") {
        aiMediaArea.classList.remove("hidden");
        aiMediaArea.classList.add("flex");
        initCameraCapture(q);
    }
}

// Check results
function handleAnswer(q, opt, btnNode) {
    const allBtns = document.querySelectorAll(".opt-card");
    allBtns.forEach(b => b.style.pointerEvents = "none");
    
    let timeTaken = (Date.now() - qStartTs) / 1000;
    
    // Focus calculation (ideally takes 1.5 - 6s, if taking >15s, minus focus points)
    if(timeTaken < 15) {
        rawScores.focus += 10;
    } else {
        rawScores.focus += 5; 
    }

    if (q.dimension === "creativity") {
        rawScores.creativity += opt.score;
        playSfx('success');
        btnNode.classList.replace("border-slate-200", "border-indigo-400");
        triggerEffect('success');
    } else if (q.dimension === "speed") {
        if(opt.isCorrect) {
            if(timeTaken < 2) rawScores.speed += 10;
            else if(timeTaken < 4) rawScores.speed += 7;
            else rawScores.speed += 5;
            btnNode.classList.replace("border-slate-200", "border-green-400");
            playSfx('success');
            triggerEffect('success');
        } else {
            rawScores.speed += 2; // slow penalty
            btnNode.classList.replace("border-slate-200", "border-red-400");
            playSfx('error');
            triggerEffect('error');
        }
    } else {
        if(opt.isCorrect) {
            rawScores[q.dimension] += 5;
            btnNode.classList.replace("border-slate-200", "border-green-400");
            playSfx('success');
            triggerEffect('success');
        } else {
            btnNode.classList.replace("border-slate-200", "border-red-400");
            playSfx('error');
            triggerEffect('error');
        }
    }
    
    setTimeout(nextStepWrapper, 1000);
}

function handleMemoryResult(q, isWin) {
    if(isWin) {
        playSfx('success');
        rawScores.memory += 5;
        triggerEffect('success');
    } else {
        playSfx('error');
        triggerEffect('error');
    }
    setTimeout(nextStepWrapper, 1000);
}

function triggerEffect(type) {
    const id = type === 'success' ? 'overlay-success' : 'overlay-error';
    const cid = type === 'success' ? 'success-circle' : 'error-circle';
    const el = document.getElementById(id);
    const c = document.getElementById(cid);
    gsap.set(el, {opacity: 1});
    gsap.fromTo(c, {scale: 0.2, rotation: -90}, {scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)"});
    setTimeout(() => { gsap.to(el, {opacity: 0}); }, 900);
}

// ==========================================
// 4. MULTIMODAL CAMERA LOGIC
// ==========================================
function initCameraCapture(q) {
    const video = document.getElementById("camera-feed");
    const preview = document.getElementById("photo-preview");
    const btnCap = document.getElementById("btn-capture-photo");
    const btnNext = document.getElementById("btn-next-ai");
    
    video.classList.remove("hidden");
    preview.classList.add("hidden");
    btnCap.classList.remove("hidden");
    btnNext.classList.add("hidden");

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            window.activeStream = stream;
            video.srcObject = stream;
        }).catch(err => {
            console.error(err);
            btnCap.innerText = "未授权摄像头（跳过此项）";
            btnCap.classList.replace("from-pink-500", "from-slate-500");
            btnCap.classList.replace("to-rose-500", "to-slate-600");
        });
        
    btnCap.onclick = () => {
        playSfx('success');
        rawScores.verbal += 10; // Earn points for face unlock
        if(window.activeStream) {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").translate(canvas.width, 0);
            canvas.getContext("2d").scale(-1, 1); // un-mirror
            canvas.getContext("2d").drawImage(video, 0, 0);
            capturedPhoto = canvas.toDataURL("image/jpeg");
            
            preview.src = capturedPhoto;
            video.classList.add("hidden");
            preview.classList.remove("hidden");
            window.activeStream.getTracks().forEach(t => t.stop());
            window.activeStream = null;
        } else {
            capturedPhoto = "skipped";
        }
        btnCap.classList.add("hidden");
        btnNext.classList.remove("hidden");
        triggerEffect('success');
    };
    
    btnNext.onclick = () => { nextStepWrapper(); };
}

// ==========================================
// 5. FINISH & ROUTE TO REPORT
// ==========================================
function finishAssessment() {
    document.getElementById("quiz-header").classList.add("hidden");
    switchScreen("screen-report-loader");
    
    // Normalize to 100 max
    const finalNormScores = {
        logic: Math.round((rawScores.logic / MAX_SCORES.logic) * 100),
        memory: Math.round((rawScores.memory / MAX_SCORES.memory) * 100),
        science: Math.round((rawScores.science / MAX_SCORES.science) * 100),
        engineering: Math.round((rawScores.engineering / MAX_SCORES.engineering) * 100),
        creativity: Math.round((rawScores.creativity / MAX_SCORES.creativity) * 100),
        verbal: Math.round((rawScores.verbal / MAX_SCORES.verbal) * 100),
        speed: Math.round((rawScores.speed / MAX_SCORES.speed) * 100),
        focus: Math.round((rawScores.focus / MAX_SCORES.focus) * 100)
    };
    
    // Prevent 0
    for(let k in finalNormScores){
        if(finalNormScores[k] < 30) finalNormScores[k] = 30 + Math.floor(Math.random()*15); 
        if(finalNormScores[k] > 100) finalNormScores[k] = 100;
    }

    // Save Context to SessionStorage across pages
    const payload = {
        studentName: studentName,
        ageTier: ageTier,
        scores: finalNormScores,
        photoUrl: capturedPhoto,
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('titan_v3_results', JSON.stringify(payload));
    
    setTimeout(() => {
        window.location.href = "report_global_v3.html";
    }, 2500);
}
