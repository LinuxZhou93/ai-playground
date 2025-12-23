/**
 * Psyche-X Kernel
 * Handles global state, audio feedback, and system events.
 */

class Kernel {
    constructor() {
        this.state = {
            user: 'XG',
            level: 1,
            cognitiveLoad: 0,
            activeModule: null
        };
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.init();
    }

    init() {
        console.log("Psyche-X Kernel Initialized");
        this.loadState();
    }

    loadState() {
        const saved = localStorage.getItem('psyche_state');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }

    saveState() {
        localStorage.setItem('psyche_state', JSON.stringify(this.state));
    }

    playTone(freq = 440, type = 'sine', duration = 0.1) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }
}

const sys = new Kernel();
