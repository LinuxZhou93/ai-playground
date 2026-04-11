import { SBTI_DATA } from './data.js';

const { dimensionMeta, questions, dimensionOrder, typeLibrary, normalTypes, dimExplanations, specialQuestions } = SBTI_DATA;

const state = {
    screen: 'intro',
    currentIndex: 0,
    answers: {},
    visibleQuestions: [],
    radarChart: null
};

// DOM Elements
const screens = {
    intro: document.getElementById('screen-intro'),
    test: document.getElementById('screen-test'),
    result: document.getElementById('screen-result')
};

const elements = {
    btnStart: document.getElementById('btn-start'),
    btnRestart: document.getElementById('btn-restart'),
    btnShare: document.getElementById('btn-share'),
    questionContainer: document.getElementById('question-container'),
    progressBar: document.getElementById('progress-fill'),
    currentIndex: document.getElementById('current-index'),
    totalCount: document.getElementById('total-count'),
    resTypeName: document.getElementById('res-type-name'),
    resMatchBadge: document.getElementById('res-match-badge'),
    resDesc: document.getElementById('res-desc'),
    resDimList: document.getElementById('res-dim-list'),
    resModeKicker: document.getElementById('res-mode-kicker'),
    toast: document.getElementById('toast')
};

// Utils
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.toggle('active', key === screenName);
    });
    state.screen = screenName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('active');
    setTimeout(() => elements.toast.classList.remove('active'), 2000);
}

// Logic
function initTest() {
    const shuffledRegular = shuffle(questions);
    // Insert special question at random position
    const insertIndex = Math.floor(Math.random() * shuffledRegular.length);
    state.visibleQuestions = [
        ...shuffledRegular.slice(0, insertIndex),
        specialQuestions[0],
        ...shuffledRegular.slice(insertIndex)
    ];
    state.currentIndex = 0;
    state.answers = {};
    elements.totalCount.textContent = state.visibleQuestions.length;
    renderQuestion();
    showScreen('test');
}

function renderQuestion() {
    const q = state.visibleQuestions[state.currentIndex];
    
    // Update progress
    const progress = ((state.currentIndex) / state.visibleQuestions.length) * 100;
    elements.progressBar.style.width = `${progress}%`;
    elements.currentIndex.textContent = state.currentIndex + 1;

    elements.questionContainer.innerHTML = `
        <div class="question-card">
            <h2 class="question-text">${q.text}</h2>
            <div class="options-grid">
                ${q.options.map((opt, i) => `
                    <button class="option-btn" data-value="${opt.value}">
                        ${['A', 'B', 'C', 'D'][i]}. ${opt.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Add event listeners
    const buttons = elements.questionContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(q, Number(btn.dataset.value)));
    });
}

function handleAnswer(question, value) {
    state.answers[question.id] = value;

    // Logic for special drink question
    if (question.id === 'drink_gate_q1') {
        if (value === 3) {
            // Add trigger question
            const currentIdx = state.visibleQuestions.findIndex(q => q.id === 'drink_gate_q1');
            state.visibleQuestions.splice(currentIdx + 1, 0, specialQuestions[1]);
            elements.totalCount.textContent = state.visibleQuestions.length;
        }
    }

    if (state.currentIndex < state.visibleQuestions.length - 1) {
        state.currentIndex++;
        renderQuestion();
    } else {
        renderResult();
    }
}

function sumToLevel(score) {
    if (score <= 3) return 'L';
    if (score === 4) return 'M';
    return 'H';
}

function levelNum(level) {
    return { L: 1, M: 2, H: 3 }[level];
}

function parsePattern(pattern) {
    return pattern.replace(/-/g, '').split('');
}

function renderResult() {
    const rawScores = {};
    const levels = {};
    dimensionOrder.forEach(dim => { rawScores[dim] = 0; });

    // Sum scores
    questions.forEach(q => {
        if (state.answers[q.id]) {
            rawScores[q.dim] += state.answers[q.id];
        }
    });

    dimensionOrder.forEach(dim => {
        levels[dim] = sumToLevel(rawScores[dim]);
    });

    const userVector = dimensionOrder.map(dim => levelNum(levels[dim]));
    
    // Match types
    const ranked = normalTypes.map(type => {
        const vector = parsePattern(type.pattern).map(levelNum);
        let distance = 0;
        let exact = 0;
        for (let i = 0; i < vector.length; i++) {
            const diff = Math.abs(userVector[i] - vector[i]);
            distance += diff;
            if (diff === 0) exact += 1;
        }
        const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
        return { ...type, ...typeLibrary[type.code], distance, exact, similarity };
    }).sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return b.similarity - a.similarity;
    });

    const bestMatch = ranked[0];
    const isDrunk = state.answers['drink_gate_q2'] === 2;
    
    let finalType = bestMatch;
    let modeText = '你的主类型';
    let matchText = `匹配度 ${bestMatch.similarity}%`;

    if (isDrunk) {
        finalType = typeLibrary.DRUNK;
        modeText = '隐藏人格已激活';
        matchText = '匹配度 100% · 酒精异常因子已接管';
    } else if (bestMatch.similarity < 60) {
        finalType = typeLibrary.HHHH;
        modeText = '系统强制兜底';
    }

    // Update UI
    elements.resModeKicker.textContent = modeText;
    elements.resTypeName.innerHTML = `${finalType.code} <span class="cn-name">（${finalType.cn}）</span>`;
    elements.resMatchBadge.textContent = matchText;
    elements.resDesc.textContent = finalType.desc;

    // Render Dimension List
    elements.resDimList.innerHTML = dimensionOrder.map(dim => `
        <div class="dim-card">
            <div class="dim-name">${dimensionMeta[dim].name}</div>
            <div class="dim-score">${levels[dim]}</div>
        </div>
    `).join('');

    showScreen('result');
    initRadarChart(userVector);
}

function initRadarChart(vector) {
    if (state.radarChart) state.radarChart.dispose();
    state.radarChart = echarts.init(document.getElementById('radar-chart'));
    
    const option = {
        radar: {
            indicator: dimensionOrder.map(dim => ({ name: dimensionMeta[dim].name.split(' ')[0], max: 3 })),
            splitArea: { show: false },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            name: { textStyle: { color: '#94a3b8', fontSize: 10 } }
        },
        series: [{
            type: 'radar',
            data: [{
                value: vector,
                name: '人格画像',
                itemStyle: { color: '#6366f1' },
                areaStyle: { color: 'rgba(99, 102, 241, 0.4)' },
                lineStyle: { width: 2 }
            }]
        }]
    };
    state.radarChart.setOption(option);
}

async function captureResult() {
    const area = document.getElementById('capture-area');
    elements.btnShare.disabled = true;
    elements.btnShare.textContent = '生成中...';
    
    try {
        const canvas = await html2canvas(area, {
            backgroundColor: '#0f172a',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `SBTI_Result_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('生成成功！正在下载...');
    } catch (e) {
        showToast('生成失败，请截图保存。');
    } finally {
        elements.btnShare.disabled = false;
        elements.btnShare.textContent = '生成分享图片';
    }
}

// Register Listeners
elements.btnStart.addEventListener('click', initTest);
elements.btnRestart.addEventListener('click', () => showScreen('intro'));
elements.btnShare.addEventListener('click', captureResult);

// Handle window resize for chart
window.addEventListener('resize', () => {
    if (state.radarChart) state.radarChart.resize();
});
