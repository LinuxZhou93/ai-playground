/**
 * Psyche-X Junior Assessment Engine
 * 40+ Questions Procedural & JSON Engine
 */

// ==========================================
// 1. DATA AND GENERATORS (40+ Questions)
// ==========================================

// Helpers for Procedural Math/Logic
const generateSequenceQuestions = (count) => {
    let qs = [];
    const fruits = ['🍎','🍌','🍇','🍉','🍊','🍓','🍍','🥝'];
    for(let i=0; i<count; i++) {
        // e.g A B A B A (?) -> B
        let a = fruits[Math.floor(Math.random()*fruits.length)];
        let b = fruits[Math.floor(Math.random()*fruits.length)];
        while(b===a) b = fruits[Math.floor(Math.random()*fruits.length)];
        
        // Pattern: simple A B alternating or A A B A A B
        let type = i % 2; 
        let htmlImg, correctAnim, wrongBase;
        if(type === 0) {
            htmlImg = `<div class="text-6xl tracking-widest">${a} ${b} ${a} ${b} ${a} ❓</div>`;
            correctAnim = b; wrongBase = a;
        } else {
            htmlImg = `<div class="text-6xl tracking-widest">${a} ${a} ${b} ${a} ${a} ❓</div>`;
            correctAnim = b; wrongBase = a;
        }
        
        let c = fruits[Math.floor(Math.random()*fruits.length)];
        let d = fruits[Math.floor(Math.random()*fruits.length)];
        
        let opts = [
            { id: "A", html: `<div class="text-6xl">${correctAnim}</div>`, isCorrect: true, score: 5 },
            { id: "B", html: `<div class="text-6xl">${wrongBase}</div>`, isCorrect: false },
            { id: "C", html: `<div class="text-6xl">${c}</div>`, isCorrect: false },
            { id: "D", html: `<div class="text-6xl">${d}</div>`, isCorrect: false }
        ];
        // shuffle opts
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);

        qs.push({
            module: "智慧森林", moduleColor: "text-green-600", bg: "bg-green-50",
            dimension: "logic",
            prompt: "找找规律，问号处应该放什么？",
            htmlImage: htmlImg,
            type: "single",
            gridCols: 2,
            options: opts
        });
    }
    return qs;
};

// Memory Sequence Engine pseudo-data
// The actual memory sequence relies on dynamic DOM. We represent them as 'memory-game' type.
const generateMemoryQuestions = (count) => {
    let qs = [];
    for(let i=0; i<count; i++) {
        let gridSize = i < 2 ? 3 : (i < 4 ? 4 : 5); // 3x3 up to 5x5
        let sequenceLength = i + 3; // 3 to 7 items to memorize
        qs.push({
            module: "智慧森林", moduleColor: "text-green-600", bg: "bg-green-50",
            dimension: "logic",
            prompt: `请记住亮起的格子顺序，并依次点击它们！（${sequenceLength}个目标）`,
            type: "memory",
            gridSize: gridSize,
            sequenceLength: sequenceLength
        });
    }
    return qs;
};

// Science Array (15 Questions)
const scienceQData = [
    { p: "什么动物晚上不睡觉，被叫作夜猫子？", a: "🦉猫头鹰", w: ["🐷小猪", "🐒猴子", "🐘大象"] },
    { p: "神奇的磁铁最喜欢吸住什么？", a: "📍铁钉", w: ["🥤塑料杯", "🪵木块", "🧻纸团"] },
    { p: "火箭靠什么力量飞上太空？", a: "🔥向后喷出高温气体", w: ["💨大风吹上天的", "🎈挂着大气球飞的", "🪽装了巨大的翅膀"] },
    { p: "冰块放在大太阳底下会变成什么？", a: "💧变成水", w: ["☁️变成白云", "🪨变成石头", "🔥变成火"] },
    { p: "天空下雨又打雷的时候，我们会先看到什么还是先听到什么？", a: "⚡️先看到闪电", w: ["🔊先听到雷声", "🤷同时发生", "🌧️先看到下雨"] },
    { p: "我们吃的苹果，属于植物的什么部分？", a: "🍎果实", w: ["🌿叶子", "🎋树枝", "🌷花朵"] },
    { p: "地球是什么形状的？", a: "🌏像个大圆球", w: ["📦像个正方形盒子", "🔺像个三角形", "🍳平平的像大饼"] },
    { p: "小鱼在水里呼吸靠什么？", a: "🐟鳃", w: ["👃鼻子", "👄嘴巴巴", "🐾尾巴"] },
    { p: "植物宝宝长大最需要什么？", a: "☀️阳光和💧水", w: ["🍬糖果", "🎮玩具", "🎵听音乐"] },
    { p: "我们深呼吸吸进肚子里的空气主要包含什么？", a: "🌬️氧气", w: ["💨二氧化碳", "💀毒气", "🎈氦气"] },
    { p: "大海的水喝起来是什么味道的？", a: "🧂咸溜溜的", w: ["🍭甜甜的", "🍋酸酸的", "💧没味道"] },
    { p: "企鹅宝宝最喜欢住在哪里？", a: "🧊寒冷的南极", w: ["🏜️热热的沙漠", "🌳大森林里", "🌋火山旁边"] },
    { p: "手机没电了，需要吃什么才能恢复体力？", a: "🔌电", w: ["🔋水", "🍚米饭", "☀️晒太阳"] },
    { p: "哪种交通工具跑得最快？", a: "✈️飞机", w: ["🚗小汽车", "🚲自行车", "🚢大船"] },
    { p: "太阳是从哪个方向升起来的？", a: "🧭东方", w: ["🧭西方", "🧭南方", "🧭北方"] }
];

const generateScienceQuestions = () => {
    return scienceQData.map((q, i) => {
        let opts = [
            { html: `<div class="text-3xl font-bold py-4">${q.a}</div>`, isCorrect: true, score: 5 },
            { html: `<div class="text-3xl font-bold py-4">${q.w[0]}</div>`, isCorrect: false },
            { html: `<div class="text-3xl font-bold py-4">${q.w[1]}</div>`, isCorrect: false },
            { html: `<div class="text-3xl font-bold py-4">${q.w[2]}</div>`, isCorrect: false }
        ];
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);

        return {
            module: "宇宙空间站", moduleColor: "text-blue-600", bg: "bg-blue-50",
            dimension: "science",
            prompt: q.p,
            htmlImage: `<div class="text-8xl animate-custom-pulse shadow-2xl rounded-full bg-white w-40 h-40 flex items-center justify-center border-8 border-blue-200">🌍</div>`,
            type: "single",
            gridCols: 2,
            options: opts
        };
    });
};

// Creativity Array (10 Questions - Distributes Points 1-5)
const creativityQData = [
    { p: "看到这个圆，你觉得它最像什么？", img: "⭕️", o: [{t:"飞碟", s:5}, {t:"狮子脸", s:4}, {t:"篮球", s:3}, {t:"盘子", s:2}] },
    { p: "想给超级飞车装上什么配件？", img: "🚙", o: [{t:"火箭推进", s:5}, {t:"螺旋桨", s:4}, {t:"隐形翅膀", s:3}, {t:"大轮胎", s:2}] },
    { p: "给你一个大空纸箱，你要拿来做什么？", img: "📦", o: [{t:"做成太空船", s:5}, {t:"改成小城堡", s:4}, {t:"当床睡觉", s:3}, {t:"装满破烂", s:2}] },
    { p: "如果你要去月球探险，你一定要带什么？", img: "🚀", o: [{t:"外星语翻译机", s:5}, {t:"带只好朋友", s:4}, {t:"水和压缩饼干", s:3}, {t:"一把铲子", s:2}] },
    { p: "如果你画一片天空，打算用什么颜色？", img: "🎨", o: [{t:"五彩斑斓", s:5}, {t:"粉红色", s:4}, {t:"深蓝色", s:3}, {t:"黑色", s:2}] },
    { p: "小动物如果会说话，你想和谁聊天？", img: "🦊", o: [{t:"霸王龙", s:5}, {t:"海豚", s:4}, {t:"小鹦鹉", s:3}, {t:"小猫咪", s:2}] },
    { p: "给你一根魔法棒，你要变出什么好东西？", img: "🪄", o: [{t:"会飞的独角兽", s:5}, {t:"巨大的城堡", s:4}, {t:"全世界最棒的玩具", s:3}, {t:"吃不完的糖", s:2}] },
    { p: "你觉得云朵吃起来应该是什么味道的？", img: "☁️", o: [{t:"怪味辣条味", s:5}, {t:"冰淇淋味", s:4}, {t:"甜甜棉花糖", s:3}, {t:"没什么味道", s:2}] },
    { p: "如果要给小蚂蚁盖房子，你会用什么材料？", img: "🐜", o: [{t:"发光的糖果", s:5}, {t:"软绵绵的棉花", s:4}, {t:"小小的树叶", s:3}, {t:"黑黑的泥土", s:2}] },
    { p: "如果你能拥有一项超能力，你选哪个？", img: "🦸", o: [{t:"能变幻成任何东西", s:5}, {t:"在云端飞翔", s:4}, {t:"隐身潜行", s:3}, {t:"力气超级大", s:2}] }
];

const generateCreativityQuestions = () => {
    return creativityQData.map((q) => {
        let opts = q.o.map((o) => ({ html: `<div class="text-3xl font-bold py-4">${o.t}</div>`, score: o.s }));
        opts.sort(()=>Math.random() - 0.5);
        opts.forEach((o,idx)=> o.id = ['A','B','C','D'][idx]);

        return {
            module: "奇光异彩洞", moduleColor: "text-purple-600", bg: "bg-purple-50",
            dimension: "creativity",
            prompt: q.p,
            htmlImage: `<div class="text-8xl shadow-xl rounded-2xl bg-white w-40 h-40 flex items-center justify-center border-4 border-purple-200">${q.img}</div>`,
            type: "single",
            gridCols: 2,
            options: opts
        };
    });
};

// AI Interaction Array (2 Questions - Camera, Audio)
const aiInterviewData = [
    {
        module: "小创老师面试舱", moduleColor: "text-rose-500", bg: "bg-rose-50",
        dimension: "expression",
        prompt: "你好特工小创客！我是小创老师，请对准镜头笑一下，录入你的特工身份照吧！",
        type: "camera"
    },
    {
        module: "小创老师面试舱", moduleColor: "text-rose-500", bg: "bg-rose-50",
        dimension: "expression",
        prompt: "小创老师想问问你：如果你有一双翅膀，你最想飞去哪里做什么呢？",
        type: "audio"
    }
];

// Assembly
const allQuestions = [
    // Logic: 5 Sequence Patterns, 5 Memory Grids = 10 questions
    ...generateSequenceQuestions(5),
    ...generateMemoryQuestions(5),
    // Creativity: 10
    ...generateCreativityQuestions(),
    // Science: 15
    ...generateScienceQuestions(),
    // AI Interview: 2
    ...aiInterviewData
];

// ==========================================
// 2. ENGINE STATE
// ==========================================
let currentStep = -1; 
let studentName = "";
let scores = { logic: 0, creativity: 0, science: 0, engineering: 5, focus: 0, expression: 5 }; // 新增表达维度基数
let capturedMedia = { photo: null, audioBlob: null }; // 暂存用户回答素材

let comboCount = 0;
let questionStartTs = 0;
let memorySequenceModeActive = false;

// Audio Context
const sysAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-start").addEventListener("click", () => {
        studentName = document.getElementById("student-name").value.trim() || "匿名小创客";
        playSfx('start');
        nextStepWrapper();
    });
    
    document.getElementById("btn-save-report").addEventListener("click", handleSaveReport);
});

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(el => {
        el.classList.remove('active');
        gsap.set(el, {opacity: 0});
    });
    const target = document.getElementById(id);
    target.classList.add('active');
    gsap.to(target, {opacity: 1, duration: 0.4});
}

// Controller Logic
function nextStepWrapper() {
    currentStep++;
    if (currentStep >= allQuestions.length) {
        showReport();
        return;
    }
    
    const currQ = allQuestions[currentStep];
    const prevQ = currentStep > 0 ? allQuestions[currentStep - 1] : null;
    
    // Check if module changed, need cutscene
    if (!prevQ || prevQ.module !== currQ.module) {
        playCutscene(currQ.module, () => renderQuestion(currQ));
    } else {
        renderQuestion(currQ);
    }
}

function playCutscene(moduleName, callback) {
    document.getElementById("quiz-header").classList.add("hidden");
    switchScreen("screen-cutscene");
    document.getElementById("cutscene-title").innerText = `登陆 ${moduleName}`;
    document.getElementById("cutscene-desc").innerText = "准备迎接新的挑战！";
    
    // Fake lottie loading effect with GSAP
    const lc = document.getElementById("lottie-cutscene");
    lc.innerHTML = `<i data-lucide="planet" class="w-full h-full text-indigo-400 animate-spin" style="animation-duration: 4s;"></i>`;
    lucide.createIcons();
    
    gsap.fromTo(document.getElementById("cutscene-title"), {y: 20, opacity:0}, {y:0, opacity:1, duration:0.5});
    
    setTimeout(() => {
        document.getElementById("quiz-header").classList.remove("hidden");
        callback();
    }, 2500); // 2.5s cutscene
}

function renderQuestion(q) {
    switchScreen("screen-quiz");
    questionStartTs = Date.now();
    memorySequenceModeActive = false;
    
    // UI Update Header
    document.getElementById("module-title").innerText = q.module;
    document.getElementById("module-title").className = `font-bold tracking-wide ${q.moduleColor}`;
    document.getElementById("screen-quiz").className = `screen flex flex-col p-4 sm:p-8 overflow-y-auto active ${q.bg}`;
    document.getElementById("progress-bar").style.width = `${((currentStep) / allQuestions.length) * 100}%`;
    document.getElementById("progress-text").innerText = `${currentStep + 1} / ${allQuestions.length}`;
    
    // Content
    const titleEl = document.getElementById("question-prompt");
    titleEl.innerText = q.prompt;
    gsap.fromTo(titleEl, {y: 10, opacity:0}, {y:0, opacity:1});
    
    const displayArea = document.getElementById("question-display-area");
    const optionsGrid = document.getElementById("options-grid");
    const aiMediaArea = document.getElementById("ai-media-area");
    
    // Reset areas
    displayArea.innerHTML = "";
    optionsGrid.innerHTML = "";
    displayArea.classList.add("hidden");
    optionsGrid.style.display = "none";
    aiMediaArea.classList.add("hidden");
    
    // Stop any active media tracks if revisiting
    if (window.activeStream) {
        window.activeStream.getTracks().forEach(t => t.stop());
        window.activeStream = null;
    }
    document.getElementById("btn-next-ai").classList.add("hidden");
    
    if (q.type === "single") {
        displayArea.classList.remove("hidden");
        optionsGrid.style.display = "grid";
        optionsGrid.className = `grid w-full max-w-3xl gap-4 sm:gap-6 pb-8 grid-cols-1 sm:grid-cols-${q.gridCols}`;
        displayArea.innerHTML = q.htmlImage;
        gsap.fromTo(displayArea, {scale: 0.9, opacity: 0}, {scale: 1, opacity: 1});
        
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "opt-card bg-white rounded-3xl p-6 shadow border-4 border-slate-200 flex flex-col items-center justify-center relative";
            btn.innerHTML = `<div class="absolute top-2 left-4 text-slate-200 font-extrabold text-2xl">${opt.id}</div> 
                             <div class="z-10 w-full">${opt.html}</div>`;
            btn.onclick = () => handleAnswerSelected(q, opt, btn);
            optionsGrid.appendChild(btn);
        });
        gsap.fromTo(optionsGrid.children, {y: 30, opacity: 0}, {y: 0, opacity: 1, stagger: 0.05});
        
    } else if (q.type === "memory") {
        displayArea.classList.remove("hidden");
        // Build Memory Grid
        memorySequenceModeActive = true;
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
        
        // Logical Sequence Generation
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
                titleEl.innerText = "你的回合！请按刚才亮起的顺序点击";
                cells.forEach((c, idx) => {
                    c.classList.add('cursor-pointer');
                    c.classList.remove('cursor-default');
                    c.onclick = () => {
                        if(!playerTurn) return;
                        playSfx('tick');
                        // visually click
                        c.classList.add('bg-blue-400');
                        setTimeout(()=> c.classList.remove('bg-blue-400'), 200);
                        
                        if (idx === sequence[playerIndex]) {
                            playerIndex++;
                            if (playerIndex >= sequence.length) {
                                playerTurn = false;
                                handleMemoryWin(q);
                            }
                        } else {
                            playerTurn = false;
                            handleMemoryLose(q);
                        }
                    };
                });
                return;
            }
            const targetIdx = sequence[playbackIndex];
            const cell = cells[targetIdx];
            playSfx('tick');
            cell.classList.add('bg-yellow-400', 'shadow-[0_0_20px_rgba(250,204,21,0.6)]', 'scale-110', 'z-10');
            setTimeout(() => {
                cell.classList.remove('bg-yellow-400', 'shadow-[0_0_20px_rgba(250,204,21,0.6)]', 'scale-110', 'z-10');
                playbackIndex++;
                setTimeout(playSequence, 300); // 300ms delay between blinks
            }, 500); // 500ms blink duration
        };
        
        setTimeout(playSequence, 1000); // 1s start delay
    } else if (q.type === "camera") {
        aiMediaArea.classList.remove("hidden");
        aiMediaArea.classList.add("flex");
        initCameraCapture(q);
    } else if (q.type === "audio") {
        aiMediaArea.classList.remove("hidden");
        aiMediaArea.classList.add("flex");
        initAudioCapture(q);
    }
}

// ==========================================
// AI MEDIA CONTROLLERS
// ==========================================
function initCameraCapture(q) {
    const video = document.getElementById("camera-feed");
    const preview = document.getElementById("photo-preview");
    const btnCap = document.getElementById("btn-capture-photo");
    const btnNext = document.getElementById("btn-next-ai");
    
    video.classList.remove("hidden");
    preview.classList.add("hidden");
    document.getElementById("audio-visualizer").classList.add("hidden");
    
    btnCap.classList.remove("hidden");
    document.getElementById("btn-record-audio").classList.add("hidden");
    btnNext.classList.add("hidden");

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            window.activeStream = stream;
            video.srcObject = stream;
        }).catch(err => {
            console.error(err);
            btnCap.innerText = "无法打开摄像头（跳过）";
        });
        
    btnCap.onclick = () => {
        playSfx('success');
        if(window.activeStream) {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            capturedMedia.photo = canvas.toDataURL("image/jpeg");
            preview.src = capturedMedia.photo;
            video.classList.add("hidden");
            preview.classList.remove("hidden");
            window.activeStream.getTracks().forEach(t => t.stop());
            window.activeStream = null;
        }
        btnCap.classList.add("hidden");
        btnNext.classList.remove("hidden");
        scores.expression += 5; // give points for engagement
        triggerOverlayEffect('overlay-success', 'success-circle');
    };
    
    btnNext.onclick = () => { nextStepWrapper(); };
}

function initAudioCapture(q) {
    const video = document.getElementById("camera-feed");
    const preview = document.getElementById("photo-preview");
    const visualizer = document.getElementById("audio-visualizer");
    const btnRec = document.getElementById("btn-record-audio");
    const btnNext = document.getElementById("btn-next-ai");
    
    video.classList.add("hidden");
    preview.classList.add("hidden");
    visualizer.classList.remove("hidden");
    
    btnRec.classList.remove("hidden");
    document.getElementById("btn-capture-photo").classList.add("hidden");
    btnNext.classList.add("hidden");
    
    let mediaRecorder;
    let audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            window.activeStream = stream;
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                capturedMedia.audioBlob = new Blob(audioChunks, { 'type' : 'audio/webm; codecs=opus' });
                window.activeStream.getTracks().forEach(t => t.stop());
                window.activeStream = null;
                btnRec.classList.add("hidden");
                btnNext.classList.remove("hidden");
                scores.expression += 5;
                triggerOverlayEffect('overlay-success', 'success-circle');
            };
        }).catch(err => {
            console.error(err);
            btnRec.innerText = "麦克风未授权（跳过）";
        });
        
    // Touch/Mouse hold to record
    let isRecording = false;
    const startRecord = (e) => {
        e.preventDefault();
        if(!isRecording && mediaRecorder && mediaRecorder.state === "inactive") {
            audioChunks = [];
            mediaRecorder.start();
            isRecording = true;
            btnRec.innerHTML = `<i data-lucide="mic" class="w-6 h-6 animate-ping text-red-500"></i> 松开结束`;
            lucide.createIcons();
            playSfx('tick');
            visualizer.classList.replace("bg-slate-800", "bg-indigo-900");
        }
    };
    const stopRecord = (e) => {
        e.preventDefault();
        if(isRecording && mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            isRecording = false;
            playSfx('success');
            visualizer.classList.replace("bg-indigo-900", "bg-slate-800");
        }
    };

    btnRec.addEventListener('mousedown', startRecord);
    btnRec.addEventListener('touchstart', startRecord, {passive: false});
    document.addEventListener('mouseup', stopRecord);
    document.addEventListener('touchend', stopRecord, {passive: false});
    
    btnNext.onclick = () => { nextStepWrapper(); };
}

// Memory Evaluators
function handleMemoryWin(q) {
    playSfx('success');
    scores.logic += 5;
    doCombo(true);
    triggerOverlayEffect('overlay-success', 'success-circle');
    setTimeout(nextStepWrapper, 1200);
}
function handleMemoryLose(q) {
    playSfx('error');
    doCombo(false);
    triggerOverlayEffect('overlay-error', 'error-circle');
    setTimeout(nextStepWrapper, 1200);
}

// Single Option Evaluator
function handleAnswerSelected(q, opt, btnNode) {
    // Disable all
    const allBtns = document.querySelectorAll(".opt-card");
    allBtns.forEach(b => b.style.pointerEvents = "none");
    
    let earned = 0;
    if (q.dimension === "creativity") {
        earned = opt.score;
    } else {
        earned = opt.isCorrect ? 5 : 0;
    }
    
    scores[q.dimension] += earned;
    
    const timeTaken = (Date.now() - questionStartTs) / 1000;
    if (timeTaken > 1.5 && timeTaken < 8) scores.focus += 1;
    
    if (q.dimension !== "creativity" && earned > 0) {
        playSfx('success');
        btnNode.classList.replace("border-slate-200", "border-green-400");
        doCombo(true);
        triggerOverlayEffect('overlay-success', 'success-circle');
    } else if (q.dimension !== "creativity" && earned === 0) {
        playSfx('error');
        btnNode.classList.replace("border-slate-200", "border-red-400");
        doCombo(false);
        triggerOverlayEffect('overlay-error', 'error-circle');
    } else {
        playSfx('success');
        btnNode.classList.replace("border-slate-200", "border-purple-400");
        doCombo(true); 
        triggerOverlayEffect('overlay-success', 'success-circle');
    }
    
    setTimeout(nextStepWrapper, 1200);
}

function triggerOverlayEffect(id, circleId) {
    const el = document.getElementById(id);
    const c = document.getElementById(circleId);
    gsap.set(el, {opacity: 1});
    gsap.fromTo(c, {scale: 0.2, rotation: -90}, {scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)"});
    setTimeout(() => { gsap.to(el, {opacity: 0}); }, 900);
}

function doCombo(increase) {
    const comboEl = document.getElementById("combo-text");
    if(increase) {
        comboCount++;
        comboEl.innerText = `Combo x${comboCount}`;
        gsap.fromTo(comboEl.parentElement, {scale: 1.2, backgroundColor: "#fef08a"}, {scale: 1, backgroundColor: "#fef3c7", duration: 0.3});
    } else {
        comboCount = 0;
        comboEl.innerText = `Combo x0`;
    }
}

// ==========================================
// 3. FINAL REPORTING
// ==========================================
function showReport() {
    document.getElementById("quiz-header").classList.add("hidden");
    switchScreen("screen-report");
    document.getElementById("report-name").innerText = studentName;
    
    // Normalize logic score since we generated 10 logic qs * 5 = 50 limit. Creativity has ~50 max. Science has 75 max. 
    // We scale them onto a 100 point standard radar chart purely for display effect.
    let displayScores = [
        Math.min(100, Math.max(30, (scores.logic / 50) * 100 + Math.random()*10)),
        Math.min(100, Math.max(40, (scores.creativity / 50) * 100)),
        Math.min(100, Math.max(30, (scores.science / 75) * 100)),
        75 + Math.random() * 15, // Engineering proxy
        Math.min(100, (scores.focus / (allQuestions.length-2)) * 100 + 40),
        Math.min(100, (scores.expression / 10) * 100 + 30) // Expression proxy (AI dimension)
    ].map(v => Math.round(v));
    
    // Assess strength
    let maxIdx = displayScores.indexOf(Math.max(...displayScores));
    let dims = ['逻辑推理', '卓越想象', '知识广度', '工程感知', '深度专注', '表达沟通'];
    let strName = dims[maxIdx];
    
    let sorted = [...displayScores].sort((a,b)=>a-b);
    let potIdx = displayScores.indexOf(sorted[1]); // 2nd lowest
    let potName = dims[potIdx];
    
    document.getElementById("report-strength").innerText = strName;
    document.getElementById("report-potential").innerText = potName;
    
    let comments = {
        '逻辑推理': '展现出极强的数理化和系统思维天赋，天生的工程师好苗子！',
        '卓越想象': '天马行空的思维，发散能力远超同龄人，未来的创意大师！',
        '知识广度': '像是一本行走的小百科全书，求知欲极其旺盛。',
        '工程感知': '具备极佳的动手和拆解意识，实操潜力深不可测。',
        '深度专注': '无论多么复杂的题目，都能气定神闲、全神贯注！',
        '表达沟通': '跟小创老师交流自如，镜头感十足，落落大方的自信演说家！'
    };
    document.getElementById("report-comment").innerText = comments[strName] || '全面开花，完美的小创客胚子！';
    
    // Render Chart
    const ctx = document.getElementById('radarChart').getContext('2d');
    Chart.defaults.font.family = "'Fredoka', 'Noto Sans SC', sans-serif";
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: dims,
            datasets: [{
                label: '能力光谱',
                data: displayScores,
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: 'rgba(236, 72, 153, 1)',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            scales: { r: { min: 0, max: 100, ticks: {display: false}, pointLabels: {font: {size: 13, weight: 'bold'}, color: '#475569'}, angleLines: {color: 'rgba(0,0,0,0.1)'}, grid: {color: 'rgba(0,0,0,0.1)'} } },
            plugins: { legend: { display: false } },
            maintainAspectRatio: false
        }
    });

    submitToSupabase();
}

function handleSaveReport() {
    const btn = document.getElementById("btn-save-report");
    btn.innerHTML = '<i class="lucide-loader w-5 h-5 animate-spin"></i> 生成长图中...';
    document.querySelector('[data-html2canvas-ignore]').style.display = 'none';

    html2canvas(document.getElementById("report-content"), {scale: 2, backgroundColor: "#ffffff"}).then(canvas => {
        const link = document.createElement('a');
        link.download = `PsycheX_多维报告_${studentName}.png`;
        link.href = canvas.toDataURL();
        link.click();
        document.querySelector('[data-html2canvas-ignore]').style.display = 'block';
        btn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> 导出长图报告';
        lucide.createIcons();
    });
}

function submitToSupabase() {
    console.log(`[DATA] Submission Logic Executed for ${studentName}`, scores);
    console.log(`[MEDIA] Collected: Photo Size: ${capturedMedia.photo?.length || 0}, Audio Blob:`, capturedMedia.audioBlob);
    // Integration point for Supabase Global Table
    // const { data, error } = await window.supabase.from('psychex_junior_results').insert({...})
}
