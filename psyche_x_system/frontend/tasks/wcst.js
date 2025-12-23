/**
 * PROTOCOL: WISCONSIN CARD SORTING TEST (WCST)
 * Standard: Berg (1948), Heaton (1981)
 * Domain: Executive Function, Cognitive Flexibility, Set-Shifting
 */

const WCST_PROTOCOL = {
    metadata: {
        name: "Wisconsin Executive Function",
        version: "Clinical 1.0",
        standard: "Heaton-E"
    },
    timeline: [
        {
            type: "INSTRUCTION",
            instructions: `
                <h2 class="text-2xl font-bold text-white mb-4">Executive Function Assessment</h2>
                <p class="text-gray-300 mb-4">You will see a card at the bottom of the screen.</p>
                <p class="text-gray-300 mb-4">Match it to one of the four key cards at the top.</p>
                <p class="text-gray-300 mb-6 font-bold text-yellow-400">The rules for matching will CHANGE without warning.</p>
                <p class="text-sm text-gray-500">Press 1, 2, 3, or 4 to select.</p>
            `
        },
        {
            type: "TEST_BLOCK",
            trials: [] // Populated below
        }
    ]
};

// --- WCST LOGIC GENERATOR ---
// Shapes: 0=Circle, 1=Triangle, 2=Star, 3=Cross
// Colors: 0=Red, 1=Green, 2=Blue, 3=Yellow
// Numbers: 1, 2, 3, 4

const SHAPES = ['●', '▲', '★', '✚'];
const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];
const C_NAMES = ['Red', 'Green', 'Blue', 'Yellow'];

// Key Cards (Fixed Standard)
// 1 Red Triangle, 2 Green Stars, 3 Yellow Crosses, 4 Blue Circles (Example variant)
const KEYS = [
    { count: 1, color: 0, shape: 1 },
    { count: 2, color: 1, shape: 2 },
    { count: 3, color: 3, shape: 3 },
    { count: 4, color: 2, shape: 0 }
];

// Generate 64 standard trials
for (let i = 0; i < 64; i++) {
    WCST_PROTOCOL.timeline[1].trials.push({
        // Random probe card
        probe: {
            count: Math.floor(Math.random() * 4) + 1,
            color: Math.floor(Math.random() * 4),
            shape: Math.floor(Math.random() * 4)
        },
        keys: KEYS,
        validKeys: ['1', '2', '3', '4']
    });
}

// RENDERER EXTENSION
// We inject a custom renderer into our engine for this specific task
PsychEngine.prototype.renderWCST = function (params) {

    const renderCard = (card, i) => {
        let shapesHTML = '';
        for (let j = 0; j < card.count; j++) shapesHTML += card.shape !== undefined ? SHAPES[card.shape] : '?';
        const color = card.color !== undefined ? COLORS[card.color] : '#fff';

        return `
            <div class="w-full aspect-[2/3] bg-white border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg transform transition-all ${i !== undefined ? 'hover:scale-105 hover:border-blue-500' : ''}">
                <div class="text-4xl font-bold" style="color: ${color}; line-height: 1;">${shapesHTML}</div>
                ${i !== undefined ? `<div class="absolute top-2 left-2 text-xs text-gray-400 font-mono">${i + 1}</div>` : ''}
            </div>
        `;
    };

    return `
        <div class="h-full flex flex-col items-center justify-center max-w-4xl mx-auto p-4">
            
            <!-- KEY CARDS -->
            <div class="grid grid-cols-4 gap-4 w-full mb-16 opacity-90">
                ${params.keys.map((k, i) => renderCard(k, i)).join('')}
            </div>

            <!-- PROBE CARD -->
            <div class="w-32 animate-slide-up">
                ${renderCard(params.probe)}
            </div>

            <div class="mt-8 text-gray-500 font-mono text-sm">SORT CARD [1-4]</div>
        </div>
    `;
};

// Override RunTrial for WCST dynamic Rule Logic
PsychEngine.prototype.runTrialWCST = async function (type, params) {
    // Current Secret Rule (State held in closure/engine level for session)
    if (!this.wcstState) {
        this.wcstState = {
            rule: 'COLOR', // Start with Color
            streak: 0,
            trials: 0
        };
    }

    this.display.innerHTML = this.renderWCST(params);

    const t0 = performance.now();

    return new Promise(resolve => {
        const handler = async (e) => {
            if (params.validKeys.includes(e.key)) {
                document.removeEventListener('keydown', handler);

                const choiceIdx = parseInt(e.key) - 1;
                const choice = params.keys[choiceIdx]; // The key card user chose
                const probe = params.probe;

                // Check Matches
                const matchColor = choice.color === probe.color;
                const matchShape = choice.shape === probe.shape;
                const matchCount = choice.count === probe.count;

                // Determine Correctness based on Rule
                let isCorrect = false;
                if (this.wcstState.rule === 'COLOR' && matchColor) isCorrect = true;
                if (this.wcstState.rule === 'SHAPE' && matchShape) isCorrect = true;
                if (this.wcstState.rule === 'COUNT' && matchCount) isCorrect = true;

                // FEEDBACK
                const fedHTML = isCorrect
                    ? `<div class="text-6xl text-green-500 font-bold animate-bounce">CORRECT</div>`
                    : `<div class="text-6xl text-red-500 font-bold animate-shake">WRONG</div>`;

                // Show feedback overlay
                const overlay = document.createElement('div');
                overlay.className = "absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50";
                overlay.innerHTML = fedHTML;
                this.display.appendChild(overlay);

                // Update Logic (The "Wisconsin" part)
                if (isCorrect) this.wcstState.streak++;
                else this.wcstState.streak = 0;

                // Shift rule after 5 correct
                if (this.wcstState.streak >= 5) {
                    const rules = ['COLOR', 'SHAPE', 'COUNT'];
                    const currentIdx = rules.indexOf(this.wcstState.rule);
                    this.wcstState.rule = rules[(currentIdx + 1) % 3];
                    this.wcstState.streak = 0;
                    console.log('>>> RULE SHIFTED TO:', this.wcstState.rule);
                }

                await this.wait(800); // Feedback duration

                resolve({
                    rt: performance.now() - t0,
                    key: e.key,
                    correct: isCorrect,
                    rule_active: this.wcstState.rule
                });
            }
        };
        document.addEventListener('keydown', handler);
    });
};
