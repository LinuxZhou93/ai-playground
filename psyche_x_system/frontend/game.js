const Game = {
            apiBase: "http://127.0.0.1:8000",
            nLevel: 2,
            trials: 20,
            duration: 2500, // slower for dual task
            letters: ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'],

            // State
            isRunning: false,
            score: 0,
            currentTrial: 0,
            stream: [],
            userId: null,

            // Input State (per trial)
            inputState: {
                posInput: false,
                audioInput: false,
                posMatch: false,
                audioMatch: false
            },

            // Performance Tracking
            recentPerformance: [],
            maxLevel: 5,
            minLevel: 1,

            // --- AUDIO SYSTEM ---
            speak: function (char) {
                if (!window.speechSynthesis) return;
                const u = new SpeechSynthesisUtterance(char);
                u.rate = 1.2;
                u.pitch = 1.0;
                u.lang = 'en-US';
                window.speechSynthesis.speak(u);
            },

            // --- CORE LOGIC ---
            init: async function () {
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance("System Initialized");
                    u.volume = 0.5;
                    window.speechSynthesis.speak(u);
                }

                const name = document.getElementById('agent-name').value;
                const btn = document.querySelector('#login-panel button');
                btn.innerText = "INITIALIZING CORE...";

                try {
                    // Register
                    const res = await fetch(`${this.apiBase}/users/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: name + "_" + Math.floor(Math.random() * 9999),
                            email: `${name.toLowerCase()}@psyche.io`,
                            password: "pwd"
                        })
                    });
                    const data = await res.json();
                    this.userId = data.id || 1;

                    document.getElementById('login-panel').classList.add('hidden');
                    document.getElementById('game-ui').classList.remove('hidden');

                    this.speak("");
                    this.start();
                } catch (e) {
                    console.warn("Offline", e);
                    document.getElementById('login-panel').classList.add('hidden');
                    document.getElementById('game-ui').classList.remove('hidden');
                    this.userId = 999;
                    this.start();
                }
            },

            start: function () {
                this.isRunning = true;
                this.score = 0;
                this.currentTrial = 0;

                const controlsDiv = document.querySelector('.controls');
                controlsDiv.innerHTML = `
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div class="key-hint"><div>A</div>POSITION MATCH</div>
                    <div class="key-hint"><div>L</div>AUDIO MATCH</div>
                </div>
            `;

                this.generateStream();
                this.updateHUD();
                this.loop();

                window.onkeydown = (e) => {
                    if (!this.isRunning) return;
                    const code = e.code;
                    if (code === 'KeyA') this.registerInput('position');
                    if (code === 'KeyL') this.registerInput('audio');
                };
            },

            generateStream: function () {
                this.stream = [];
                for (let i = 0; i < this.trials; i++) {
                    let pos = Math.floor(Math.random() * 9);
                    let charIndex = Math.floor(Math.random() * this.letters.length);

                    if (i >= this.nLevel) {
                        if (Math.random() < 0.3) pos = this.stream[i - this.nLevel].pos;
                        if (Math.random() < 0.3) charIndex = this.stream[i - this.nLevel].charIndex;
                    }

                    this.stream.push({
                        pos: pos,
                        charIndex: charIndex,
                        char: this.letters[charIndex]
                    });
                }
            },

            loop: function () {
                if (!this.isRunning) return;
                if (this.currentTrial >= this.trials) {
                    this.end();
                    return;
                }

                this.inputState = { posInput: false, audioInput: false, posMatch: false, audioMatch: false };
                this.clearFeedback();

                const trial = this.stream[this.currentTrial];

                if (this.currentTrial >= this.nLevel) {
                    const prev = this.stream[this.currentTrial - this.nLevel];
                    if (trial.pos === prev.pos) this.inputState.posMatch = true;
                    if (trial.charIndex === prev.charIndex) this.inputState.audioMatch = true;
                }

                this.activateCell(trial.pos);
                this.speak(trial.char);

                setTimeout(() => {
                    this.deactivateCell(trial.pos);
                    this.evaluateTrial();
                    setTimeout(() => {
                        this.currentTrial++;
                        this.updateHUD();
                        this.loop();
                    }, 500);
                }, 2000);
            },

            registerInput: function (type) {
                if (type === 'position' && !this.inputState.posInput) {
                    this.inputState.posInput = true;
                    this.showFeedback("POS LOGGED", "blue");
                }
                if (type === 'audio' && !this.inputState.audioInput) {
                    this.inputState.audioInput = true;
                    this.showFeedback("AUDIO LOGGED", "purple");
                }
            },

            evaluateTrial: function () {
                let correct = 0;
                let total = 0;

                if (this.inputState.posMatch) {
                    total++;
                    if (this.inputState.posInput) { this.score += 10; correct++; }
                    else this.score -= 5;
                } else {
                    if (this.inputState.posInput) this.score -= 5;
                }

                if (this.inputState.audioMatch) {
                    total++;
                    if (this.inputState.audioInput) { this.score += 10; correct++; }
                    else this.score -= 5;
                } else {
                    if (this.inputState.audioInput) this.score -= 5;
                }

                // Track Performance
                if (total > 0) {
                    this.recentPerformance.push(correct / total);
                    if (this.recentPerformance.length > 5) this.recentPerformance.shift();
                }

                // Adaptive Difficulty (every 5 trials)
                if (this.currentTrial > 0 && this.currentTrial % 5 === 0) {
                    this.adaptiveLevel();
                }
            },

            adaptiveLevel: function () {
                if (this.recentPerformance.length < 3) return;
                const avg = this.recentPerformance.reduce((a, b) => a + b, 0) / this.recentPerformance.length;

                if (avg > 0.8 && this.nLevel < this.maxLevel) {
                    this.nLevel++;
                    this.showFeedback(`LEVEL UP: ${this.nLevel}-BACK`, "#0f0");
                    document.querySelector('.hud-top .stat-box:last-child .value').innerText = `${this.nLevel}-Level`;
                } else if (avg < 0.5 && this.nLevel > this.minLevel) {
                    this.nLevel--;
                    this.showFeedback(`LEVEL DOWN: ${this.nLevel}-BACK`, "orange");
                    document.querySelector('.hud-top .stat-box:last-child .value').innerText = `${this.nLevel}-Level`;
                }
            },

            activateCell: function (idx) { document.getElementById('c' + idx).classList.add('active'); },
            deactivateCell: function (idx) { document.getElementById('c' + idx).classList.remove('active'); },

            showFeedback: function (text, color) {
                const el = document.getElementById('feedback');
                el.innerText = text;
                el.style.color = color || "white";
                el.style.opacity = 1;
            },

            clearFeedback: function () {
                document.getElementById('feedback').style.opacity = 0;
            },

            updateHUD: function () { document.getElementById('score').innerText = this.score; },

            end: function () {
                this.isRunning = false;
                document.getElementById('game-ui').classList.add('hidden');
                document.getElementById('results-panel').classList.remove('hidden');
                document.getElementById('final-score').innerText = this.score;
                window.onkeydown = null;
            },

            upload: async function () {
                const btn = document.getElementById('btn-upload');
                btn.innerText = "UPLOADING...";

                const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                try {
                    const res = await fetch(`${this.apiBase}/exam/submit?user_id=${this.userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            task_type: "dual-n-back",
                            raw_data: {
                                score: this.score,
                                trials: [],
                                session_id: sessionId,
                                adaptive_level_start: 2,
                                adaptive_level_end: this.nLevel
                            }
                        })
                    });

                    if (res.ok) {
                        btn.innerText = "UPLOAD SUCCESS";
                        btn.style.background = "#0f0";
                        this.renderChart();
                    } else { throw new Error("API Error"); }
                } catch (e) {
                    btn.innerText = "FAILED";
                    btn.style.background = "red";
                    console.error(e);
                }
            },

            renderChart: async function () {
                try {
                    const res = await fetch(`${this.apiBase}/users/${this.userId}/stats`);
                    const data = await res.json();

                    const ctx = document.getElementById('grade-chart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: data.labels,
                            datasets: [{
                                label: 'Working Memory (Gwm)',
                                data: data.gwm,
                                borderColor: '#00f3ff',
                                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                                tension: 0.4,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { beginAtZero: true, grid: { color: '#333' } },
                                x: { grid: { color: '#333' } }
                            }
                        }
                    });
                } catch (e) { console.error("Chart Error", e); }
            },

            showReport: async function () {
                try {
                    const res = await fetch(`${this.apiBase}/users/${this.userId}/report`);
                    const data = await res.json();

                    if (data.report.status !== 'success') {
                        alert(data.report.message || '数据不足，无法生成报告');
                        return;
                    }

                    const report = data.report;

                    // Update Summary
                    document.getElementById('report-summary').innerText = report.summary;

                    // Render Radar Chart
                    this.renderRadarChart(report.scores);

                    // Render Grades
                    const gradesDiv = document.getElementById('grades-display');
                    gradesDiv.innerHTML = '';
                    const dimNames = { Gf: '流体智力', Gwm: '工作记忆', Att: '执行功能', Meta: '元认知', Res: '心理韧性' };
                    for (let [dim, grade] of Object.entries(report.grades)) {
                        const gradeColor = { A: '#0f0', B: '#0ff', C: '#ff0', D: '#f80', E: '#f00' }[grade];
                        gradesDiv.innerHTML += `
                            <div style="margin: 10px; text-align: center;">
                                <div style="font-size: 2rem; color: ${gradeColor}; font-weight: bold;">${grade}</div>
                                <div style="font-size: 0.8rem;">${dimNames[dim]}</div>
                            </div>
                        `;
                    }

                    // Render Recommendations
                    const recDiv = document.getElementById('recommendations');
                    recDiv.innerHTML = '<h3 style="color: var(--primary);">📋 个性化建议</h3>';
                    for (let [dim, rec] of Object.entries(report.recommendations)) {
                        recDiv.innerHTML += `<p><strong>${dimNames[dim]}:</strong> ${rec}</p>`;
                    }

                    // Switch Panel
                    document.getElementById('results-panel').classList.add('hidden');
                    document.getElementById('report-panel').classList.remove('hidden');

                } catch (e) {
                    console.error('Report Error', e);
                    alert('报告生成失败，请稍后重试');
                }
            },

            renderRadarChart: function (scores) {
                const ctx = document.getElementById('radar-chart').getContext('2d');
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['流体智力', '工作记忆', '执行功能', '元认知', '心理韧性'],
                        datasets: [{
                            label: '认知能力',
                            data: [scores.Gf, scores.Gwm, scores.Att, scores.Meta, scores.Res],
                            borderColor: '#00f3ff',
                            backgroundColor: 'rgba(0, 243, 255, 0.2)',
                            pointBackgroundColor: '#00f3ff',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#00f3ff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { color: '#666', backdropColor: 'transparent' },
                                grid: { color: '#333' },
                                pointLabels: { color: '#00f3ff', font: { size: 12 } }
                            }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            },

            backToResults: function () {
                document.getElementById('report-panel').classList.add('hidden');
                document.getElementById('results-panel').classList.remove('hidden');
            }
        };
