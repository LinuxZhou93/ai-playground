
// Logic Matrix Game Engine
// Generates algorithmic Raven's-like matrix problems

let currentLevel = 1;
let score = 0;
let problemCount = 0;
const MAX_PROBLEMS = 10;
let startTime;
let currentProblem = null;

const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
const COLORS = ['color-1', 'color-2', 'color-3'];
const FILLS = ['none', 'fill-1', 'fill-2', 'fill-3'];

// --- Shape Generators ---
function getSvgShape(type, colorClass, fillClass) {
    let d = '';
    const size = 60; // Base size for path scaling
    const c = 50;    // Center percent

    // Simple path definitions (normalized roughly to 0-100 viewBox)
    if (type === 'circle') d = `M${c},${c} m-${size / 2},0 a${size / 2},${size / 2} 0 1,0 ${size},0 a${size / 2},${size / 2} 0 1,0 -${size},0`;
    if (type === 'square') d = `M${c - size / 2},${c - size / 2} h${size} v${size} h-${size} z`;
    if (type === 'triangle') d = `M${c},${c - size / 2} L${c + size / 2},${c + size / 2} H${c - size / 2} z`;
    if (type === 'diamond') d = `M${c},${c - size / 2 - 10} L${c + size / 2 + 10},${c} L${c},${c + size / 2 + 10} L${c - size / 2 - 10},${c} z`;

    return `<svg viewBox="0 0 100 100" class="shape-svg ${colorClass} ${fillClass}"><path d="${d}" /></svg>`;
}

// --- Problem Logic ---
// We use simple progressive rules:
// Level 1: Shape constant, Color progress (Rotate)
// Level 2: Shape progress (Rotate), Color constant
// Level 3: XOR logic or Addition (A + B = C) -> Complex, simulating simple rotation for now

function generateProblem(level) {
    // 3x3 Grid
    // Rules operate on ROWS.
    // Example Rule: Shift/Rotate

    // Setup Pattern
    const patternType = Math.random() > 0.5 ? 'rotate_color' : 'rotate_shape';

    const gridData = [];

    // Base Attributes for Row 1, Col 1
    let baseShapeIdx = Math.floor(Math.random() * SHAPES.length);
    let baseColorIdx = Math.floor(Math.random() * COLORS.length);

    // Generate 3x3
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            let sIdx = baseShapeIdx;
            let cIdx = baseColorIdx;

            // Apply Rules
            if (patternType === 'rotate_shape') {
                // Row 1: 0,1,2. Row 2: 1,2,0. Row 3: 2,0,1
                sIdx = (baseShapeIdx + c + r) % SHAPES.length;
                cIdx = (baseColorIdx + r) % COLORS.length; // Constant color per row variation
            } else {
                // Rotate Color
                sIdx = (baseShapeIdx + r) % SHAPES.length;
                cIdx = (baseColorIdx + c + r) % COLORS.length;
            }

            row.push({
                shape: SHAPES[sIdx],
                color: COLORS[cIdx],
                fill: 'none' // Keep it simple for now
            });
        }
        gridData.push(row);
    }

    // The missing piece is at [2][2] (Bottom Right)
    const answer = gridData[2][2];
    gridData[2][2] = null; // Hide it

    // Generate Distractors
    const options = [answer]; // Correct answer
    while (options.length < 4) {
        // Random distractor
        const dist = {
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            fill: 'none'
        };
        // Ensure unique looking option
        if (!options.some(o => o.shape === dist.shape && o.color === dist.color)) {
            options.push(dist);
        }
    }

    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    const correctIndex = shuffledOptions.indexOf(answer);

    return {
        grid: gridData,
        options: shuffledOptions,
        correctIndex: correctIndex
    };
}

// --- UI Rendering ---
function renderGame(problem) {
    const gridEl = document.getElementById('matrix-grid');
    gridEl.innerHTML = '';

    // Render 3x3 Grid
    problem.grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            const div = document.createElement('div');
            div.className = 'matrix-cell rounded-xl bg-gray-800 aspect-square flex items-center justify-center overflow-hidden';

            if (cell === null) {
                div.classList.add('border-dashed', 'border-purple-500/50', 'bg-gray-900/50');
                div.innerHTML = '<span class="text-4xl text-purple-500 font-bold">?</span>';
            } else {
                div.innerHTML = getSvgShape(cell.shape, cell.color, cell.fill);
            }
            gridEl.appendChild(div);
        });
    });

    // Render Options
    const optsEl = document.getElementById('options-grid');
    optsEl.innerHTML = '';
    problem.options.forEach((opt, idx) => {
        const div = document.createElement('div');
        div.className = 'option-card bg-gray-800 rounded-xl aspect-square flex items-center justify-center p-4';
        div.innerHTML = getSvgShape(opt.shape, opt.color, opt.fill);
        div.onclick = () => handleAnswer(idx);
        optsEl.appendChild(div);
    });
}

// --- Game Control ---

function startGame() {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    startTime = Date.now();
    startTimer();
    nextLevel();
}

function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const s = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${m}:${s}`;
    }, 1000);
}

function nextLevel() {
    if (problemCount >= MAX_PROBLEMS) {
        endGame();
        return;
    }

    problemCount++;
    currentLevel = Math.ceil(problemCount / 3);
    document.getElementById('level-indicator').innerText = currentLevel;

    currentProblem = generateProblem(currentLevel);
    renderGame(currentProblem);
}

function handleAnswer(idx) {
    if (idx === currentProblem.correctIndex) {
        score++;
        // Visual feedback could go here
    }
    nextLevel();
}

function endGame() {
    const modal = document.getElementById('results-modal');
    document.getElementById('result-score').innerText = `${score}/${MAX_PROBLEMS}`;
    document.getElementById('result-level').innerText = currentLevel;
    modal.classList.remove('hidden');

    // TODO: Submit to backend
}
