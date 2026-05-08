/**
 * NEURAL SHELL KERNEL (v1.0 Standard Edition)
 * A unified UI/UX layer for the Tech-Virtue Cultivation System.
 * Injected globally to provide high-fidelity navigation and growth tracking.
 */

const NeuralShell = {
    config: {
        theme: 'MIT_LAB',
        autoInject: true,
        subject: document.title.split('|')[0].trim() || 'TITAN Archipelago'
    },

    init: function() {
        console.log(`[NEURAL SHELL] Initializing Hub: ${this.config.subject}`);
        this.injectStyles();
        // this.renderDock(); // 移除重叠的多余 Dock 栏
        this.renderNeuralBar();
        this.applyAtmosphere();
    },

    injectStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --titan-cyan: #00f0ff;
                --titan-indigo: #6366f1;
                --titan-dark: #020617;
            }
            .neural-glass {
                background: rgba(15, 23, 42, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            }
            #neural-dock {
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                height: 64px; padding: 0 24px; display: flex; align-items: center; gap: 20px;
                border-radius: 32px; z-index: 10000; transition: 0.3s;
            }
            #neural-dock:hover { transform: translateX(-50%) translateY(-5px); border-color: var(--titan-cyan); }
            
            .dock-btn { 
                width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
                background: rgba(255,255,255,0.05); border-radius: 50%; cursor: pointer; color: white;
                transition: 0.2s; font-size: 18px; text-decoration: none;
            }
            .dock-btn:hover { background: var(--titan-cyan); color: black; transform: scale(1.1); }

            #neural-trace-bar {
                position: fixed; left: 0; top: 100px; width: 4px; height: 300px;
                background: linear-gradient(to bottom, var(--titan-cyan), transparent);
                z-index: 9999; border-radius: 0 4px 4px 0;
            }
            .trace-label {
                position: absolute; left: 10px; top: 0; font-family: monospace; font-size: 10px;
                color: var(--titan-cyan); writing-mode: vertical-lr; text-transform: uppercase;
                letter-spacing: 2px; opacity: 0.6;
            }
        `;
        document.head.appendChild(style);
    },

    renderDock: function() {
        const dock = document.createElement('div');
        dock.id = 'neural-dock';
        dock.className = 'neural-glass';
        dock.innerHTML = `
            <a href="index.html" class="dock-btn" title="Cognitive Hub">🏠</a>
            <a href="psyche_x_system/frontend/tasks/omni_assessment.html" class="dock-btn" title="Omni Assessment">⚡</a>
            <div class="h-8 w-[1px] bg-white/10 mx-2"></div>
            <a href="profile.html" class="dock-btn" title="Neural Profile">👤</a>
            <div class="ml-4 flex flex-col">
                <span class="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Current Sector</span>
                <span class="text-xs font-black text-white italic tracking-tighter">${this.config.subject}</span>
            </div>
        `;
        document.body.appendChild(dock);
    },

    renderNeuralBar: function() {
        const bar = document.createElement('div');
        bar.id = 'neural-trace-bar';
        bar.innerHTML = `<div class="trace-label">Neural Plasticity // Connecting...</div>`;
        document.body.appendChild(bar);
    },

    applyAtmosphere: function() {
        // High-fidelity background pulse
        document.body.style.backgroundColor = '#020617';
        document.body.style.transition = 'background 2s ease';
    }
};

document.addEventListener('DOMContentLoaded', () => NeuralShell.init());
