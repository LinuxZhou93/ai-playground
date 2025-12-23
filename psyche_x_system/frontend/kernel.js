/**
 * PSYCHE-X KERNEL v4.1.0 (codenamed: SINGULARITY)
 * The central nervous system for the Psyche-X Frontend.
 * Handles:
 * - Application State Management
 * - Audio Context & Spatial Sound Engine
 * - Global UI Manager (Mission Debriefs)
 * - Security Protocols (Mock)
 */

class PsycheKernel {
    constructor() {
        this.version = '4.1.0-BETA';
        this.sessionID = crypto.randomUUID();
        this.state = {
            user: null,
            permissions: [],
            systemStatus: 'BOOTING',
            neuroLinkActive: false,
            securityLevel: 0
        };

        console.log(`%c PSYCHE-X KERNEL ${this.version} INITIALIZING...`, 'background: #000; color: #00ff00; font-size: 14px; padding: 4px;');

        // Init Subsystems
        this.audio = new AudioSubsystem();
        this.security = new SecurityLayer();
        this.network = new NetworkLink();
        this.ui = new UIManager(this);

        this.init();
    }

    async init() {
        await this.security.handshake();
        this.state.systemStatus = 'ONLINE';
        this.log('Kernel System Active. Awaiting Input.');

        // Dispatch Global Ready Event
        window.dispatchEvent(new CustomEvent('PSYCHE_KERNEL_READY', {
            detail: { kernel: this }
        }));
    }

    log(msg, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const colors = {
            'INFO': '#3b82f6',
            'WARN': '#f59e0b',
            'ERR': '#ef4444',
            'SEC': '#10b981'
        };
        console.log(`%c[${type}] ${timestamp} >> ${msg}`, `color: ${colors[type] || '#fff'}`);
    }

    dispatch(action) {
        if (action.type === 'USER_LOGIN') this.state.user = action.payload;
    }
}

/**
 * UI Manager - Handles Global Overlays like Mission Debrief
 */
class UIManager {
    constructor(kernel) {
        this.kernel = kernel;
        this.injectStyles();
    }

    injectStyles() {
        if (document.getElementById('psyche-ui-styles')) return;
        const style = document.createElement('style');
        style.id = 'psyche-ui-styles';
        style.innerHTML = `
            .psyche-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(5, 5, 10, 0.85); backdrop-filter: blur(12px);
                z-index: 10000; display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .psyche-modal-card {
                background: rgba(20, 24, 35, 0.95);
                border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
                transform: scale(0.95) translateY(10px); 
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .psyche-modal-overlay.active { opacity: 1; }
            .psyche-modal-overlay.active .psyche-modal-card { transform: scale(1) translateY(0); }
            
            .stat-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }
        `;
        document.head.appendChild(style);
    }

    /**
     * @param {Object} data - { score, xp, rank, accuracy, highscore, title }
     */
    showMissionDebrief(data) {
        const old = document.querySelector('.psyche-modal-overlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.className = 'psyche-modal-overlay';

        const isNewRecord = data.score > (data.highscore || 0);
        const rankName = data.rank?.current?.name || 'Unknown';
        const rankProgress = Math.round(data.rank?.progress || 0);

        overlay.innerHTML = `
            <div class="psyche-modal-card w-[420px] rounded-3xl p-0 overflow-hidden relative flex flex-col font-sans">
                
                <!-- Header Art -->
                <div class="h-32 bg-gradient-to-br from-blue-900 via-indigo-900 to-black relative overflow-hidden">
                    <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#141823] to-transparent"></div>
                    
                    <div class="absolute top-6 left-0 w-full text-center">
                        <div class="text-[10px] font-mono text-blue-300 tracking-[0.3em] uppercase opacity-80 mb-1">Mission Debrief</div>
                        <h2 class="text-2xl font-bold text-white tracking-tight">${data.title || 'PROTOCOL OMEGA'}</h2>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="px-8 pb-8 -mt-8 relative z-10">
                    
                    <!-- Score Circle -->
                    <div class="flex flex-col items-center mb-8">
                        <div class="w-24 h-24 rounded-full bg-[#0d1117] border-4 border-blue-500/20 flex items-center justify-center shadow-2xl relative group">
                            <div class="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin duration-[3s]"></div>
                            <span class="text-3xl font-black text-white tracking-tighter">${data.score}</span>
                            
                            ${isNewRecord ? `
                            <div class="absolute -top-3 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                                NEW RECORD
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-2 gap-3 mb-8">
                        <div class="stat-box rounded-xl p-3 text-center">
                            <div class="text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">XP Gained</div>
                            <div class="text-xl font-bold text-purple-400">+${data.xp}</div>
                        </div>
                        <div class="stat-box rounded-xl p-3 text-center">
                            <div class="text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">Accuracy</div>
                            <div class="text-xl font-bold text-green-400">${data.accuracy || 100}%</div>
                        </div>
                    </div>

                    <!-- Rank Prog -->
                    <div class="mb-8">
                        <div class="flex justify-between text-xs mb-2 px-1">
                            <span class="text-gray-400">Rank Progress</span>
                            <span class="text-white font-bold">${rankName} <span class="text-gray-500">(${rankProgress}%)</span></span>
                        </div>
                        <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full bg-purple-600 rounded-full" style="width: ${rankProgress}%"></div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3">
                        <button onclick="location.reload()" class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm text-white transition border border-white/5 flex items-center justify-center gap-2 group">
                            <i data-lucide="rotate-cw" class="w-4 h-4 text-gray-400 group-hover:text-white transition"></i> Retry
                        </button>
                        <button onclick="window.location.href='hub.html'" class="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm text-white transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                             Hub <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                    </div>

                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add('active');
            if (window.lucide) window.lucide.createIcons();
        });

        if (this.kernel.audio) {
            this.kernel.audio.playTone(400, 'sine', 0.1);
            setTimeout(() => this.kernel.audio.playTone(600, 'triangle', 0.3), 100);
        }
    }
}

class AudioSubsystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
    }
    playTone(freq = 440, type = 'sine', duration = 0.1) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
}

class SecurityLayer {
    async handshake() { return new Promise(resolve => setTimeout(resolve, 50)); }
}

class NetworkLink {
    async fetch(endpoint, options) { return fetch(endpoint, options); }
}

// Singleton
window.Kernel = new PsycheKernel();
