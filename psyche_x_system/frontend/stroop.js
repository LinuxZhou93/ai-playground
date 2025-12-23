const StroopGame = {
    // 基础配置
    colors: [
        { name: '红', code: 'red', key: 'r', class: 'text-red' },
        { name: '绿', code: 'green', key: 'g', class: 'text-green' },
        { name: '蓝', code: 'blue', key: 'b', class: 'text-blue' },
        { name: '黄', code: 'yellow', key: 'y', class: 'text-yellow' }
    ],
    config: {
        trials: 20,
        interTrialInterval: 800, // 试炼间隔 ms
    },

    // 状态
    state: {
        currentTrial: 0,
        score: 0,
        history: [], // { type: 'congruent'|'incongruent', rt: 123, correct: true }
        startTime: 0,
        isWaitingInput: false,
        currentStimulus: null
    },

    init: function () {
        document.addEventListener('keydown', this.handleInput.bind(this));
    },

    start: function () {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-ui').style.display = 'flex';
        this.nextTrial();
    },

    generateStimulus: function () {
        // 50% 概率是一致的 (红字红颜色)，50% 是冲突的 (红字绿颜色)
        const isCongruent = Math.random() > 0.5;
        const textIdx = Math.floor(Math.random() * 4);
        const colorIdx = isCongruent ? textIdx : (textIdx + 1 + Math.floor(Math.random() * 3)) % 4;

        return {
            text: this.colors[textIdx].name,
            colorClass: this.colors[colorIdx].class,
            correctKey: this.colors[colorIdx].key,
            type: isCongruent ? 'congruent' : 'incongruent'
        };
    },

    nextTrial: function () {
        if (this.state.currentTrial >= this.config.trials) {
            this.endGame();
            return;
        }

        this.state.currentTrial++;
        document.getElementById('trial-count').innerText = `${this.state.currentTrial}/${this.config.trials}`;

        // 清空当前显示
        const stimEl = document.getElementById('stimulus');
        stimEl.style.opacity = '0';
        stimEl.innerText = '';
        stimEl.className = '';

        setTimeout(() => {
            const stim = this.generateStimulus();
            this.state.currentStimulus = stim;

            stimEl.innerText = stim.text;
            stimEl.className = stim.colorClass;
            stimEl.style.opacity = '1';

            this.state.startTime = performance.now();
            this.state.isWaitingInput = true;
        }, this.config.interTrialInterval);
    },

    handleInput: function (e) {
        if (!this.state.isWaitingInput) return;

        const key = e.key.toLowerCase();
        if (['r', 'g', 'b', 'y'].includes(key)) {
            this.visualFeedback(key);

            const rt = performance.now() - this.state.startTime;
            const isCorrect = (key === this.state.currentStimulus.correctKey);

            this.state.isWaitingInput = false;

            // 记录数据
            this.state.history.push({
                type: this.state.currentStimulus.type,
                rt: rt,
                correct: isCorrect
            });

            if (isCorrect) this.state.score += 10;
            document.getElementById('score-display').innerText = this.state.score;

            this.nextTrial();
        }
    },

    visualFeedback: function (key) {
        const btn = document.getElementById(`key-${key}`);
        if (btn) {
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 100);
        }
    },

    endGame: function () {
        document.getElementById('game-ui').style.display = 'none';
        document.getElementById('result-screen').style.display = 'flex';
        this.calculateMetrics();
    },

    calculateMetrics: function () {
        const congruentTrials = this.state.history.filter(t => t.type === 'congruent' && t.correct);
        const incongruentTrials = this.state.history.filter(t => t.type === 'incongruent' && t.correct);

        const avgRT = trials => trials.length > 0 ? trials.reduce((a, b) => a + b.rt, 0) / trials.length : 0;

        const rtCon = avgRT(congruentTrials);
        const rtInc = avgRT(incongruentTrials);
        const interference = rtInc - rtCon;

        document.getElementById('res-congruent').innerText = rtCon.toFixed(0) + ' ms';
        document.getElementById('res-incongruent').innerText = rtInc.toFixed(0) + ' ms';
        const intDisplay = document.getElementById('res-interference');
        intDisplay.innerText = interference.toFixed(0) + ' ms';

        // 简单的颜色判断
        if (interference < 50) intDisplay.style.color = '#22c55e'; // Green
        else if (interference < 150) intDisplay.style.color = '#eab308'; // Yellow
        else intDisplay.style.color = '#ef4444'; // Red
    }
};

StroopGame.init();
