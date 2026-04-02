
// Spatial Grid Game Engine
// Corsi Block-Tapping Task Implementation

const GRID_SIZE = 5; // 5x5 grid
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

let sequence = [];
let userSequence = [];
let currentSpan = 3; // Starting sequence length
let lives = 2; // Lives per span level
let score = 0;
let isInputBlocked = true;

// DOM Elements
const gridEl = document.getElementById('spatial-grid');
const instructEl = document.getElementById('instruction-text');
const spanInd = document.getElementById('length-indicator');
const scoreInd = document.getElementById('score-indicator');

// Initialize Grid
function initGrid() {
    gridEl.innerHTML = '';
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        cell.onclick = () => handleCellClick(i);
        gridEl.appendChild(cell);
    }
}

function startGame() {
    document.getElementById('intro-screen').classList.add('hidden');
    initGrid();
    startLevel();
}

function startLevel() {
    spanInd.innerText = currentSpan;
    scoreInd.innerText = score;
    userSequence = [];
    generateSequence();
    playSequence();
}

function generateSequence() {
    sequence = [];
    let last = -1;
    for (let i = 0; i < currentSpan; i++) {
        let next;
        do {
            next = Math.floor(Math.random() * TOTAL_CELLS);
        } while (next === last); // Avoid immediate repeat for clarity
        sequence.push(next);
        last = next;
    }
}

async function playSequence() {
    isInputBlocked = true;
    instructEl.innerText = "Memorize...";
    instructEl.className = "text-xl font-medium text-cyan-400"; // Active color

    // Clear Score classes
    document.querySelectorAll('.grid-cell').forEach(c => {
        c.classList.remove('user-correct', 'user-wrong');
    });

    await new Promise(r => setTimeout(r, 800)); // Initial pause

    for (let i = 0; i < sequence.length; i++) {
        const cellIndex = sequence[i];
        const cell = gridEl.children[cellIndex];

        // Flash
        cell.classList.add('active');
        // Tone (Optional)
        // playTone(400 + (cellIndex * 20)); 

        await new Promise(r => setTimeout(r, 600)); // Lit duration
        cell.classList.remove('active');
        await new Promise(r => setTimeout(r, 200)); // Gap
    }

    instructEl.innerText = "Recall!";
    instructEl.className = "text-xl font-bold text-white animate-pulse";
    isInputBlocked = false;
}

function handleCellClick(index) {
    if (isInputBlocked) return;

    userSequence.push(index);
    const step = userSequence.length - 1;
    const cell = gridEl.children[index];

    // Immediate Feedback
    if (userSequence[step] === sequence[step]) {
        // Correct tap
        cell.classList.add('user-correct');
        setTimeout(() => cell.classList.remove('user-correct'), 300);

        // Sequence Complete
        if (userSequence.length === sequence.length) {
            handleSuccess();
        }
    } else {
        // Wrong tap
        cell.classList.add('user-wrong');
        handleFailure();
    }
}

function handleSuccess() {
    isInputBlocked = true;
    score += currentSpan * 10;
    instructEl.innerText = "Perfect!";
    instructEl.className = "text-xl font-bold text-green-400";

    // Increase difficulty every 2 successes or just increase span now?
    // Aggressive progression
    currentSpan++;
    lives = 2; // Reset lives on level up? Or keep cumulative?
    // Let's reset lives to 2 for the new level to be fair

    setTimeout(startLevel, 1000);
}

function handleFailure() {
    isInputBlocked = true;
    lives--;
    instructEl.innerText = "Incorrect sequence";
    instructEl.className = "text-xl font-bold text-red-400";

    // Show correct pattern? Maybe too confusing. Just flash red.

    if (lives > 0) {
        // Retry same span, new sequence
        setTimeout(() => {
            instructEl.innerText = `Retrying Length ${currentSpan}...`;
            setTimeout(startLevel, 1000);
        }, 1000);
    } else {
        // Game Over
        setTimeout(endGame, 1000);
    }
}

function endGame() {
    const modal = document.getElementById('results-modal');
    // Result is max span (currentSpan - 1 because we failed current)
    // But if we failed the *first* try of currentSpan, maybe we never mastered it.
    // Let's assume result is currentSpan if we got at least 1 right, else currentSpan-1.
    // Simplified: Show Score.
    document.getElementById('result-span').innerText = currentSpan > 3 ? currentSpan - 1 : 3;
    modal.classList.remove('hidden');

    // TODO: Send to backend
}
