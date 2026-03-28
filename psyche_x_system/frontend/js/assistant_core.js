/**
 * TITAN NEURAL CORE v1.0 (The Assistant Machine)
 * Handles: Real-time Audio Visuals, Neural Pulse, and Contextual Coaching.
 */

class TitanCore {
    constructor() {
        this.status = 'IDLE';
        this.container = null;
        this.init();
    }

    init() {
        // Create the Floating HUD
        const hud = document.createElement('div');
        hud.id = 'titan-hud';
        hud.className = 'fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3 pointer-events-none transition-all duration-500 transform translate-y-10 opacity-0';
        hud.innerHTML = `
            <div id="titan-pulse-container" class="w-24 h-24 rounded-full bg-indigo-600/10 border-2 border-indigo-500/30 flex items-center justify-center relative pointer-events-auto cursor-pointer shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                <div id="titan-aura" class="absolute inset-0 rounded-full border border-indigo-400/40 animate-ping"></div>
                <div id="titan-visualizer" class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    <div id="wave-bar-1" class="w-1 h-8 bg-white/40 rounded-full mx-0.5 animate-bounce" style="animation-delay: 0.1s"></div>
                    <div id="wave-bar-2" class="w-1 h-12 bg-white/60 rounded-full mx-0.5 animate-bounce" style="animation-delay: 0.2s"></div>
                    <div id="wave-bar-3" class="w-1 h-6 bg-white/40 rounded-full mx-0.5 animate-bounce" style="animation-delay: 0.3s"></div>
                </div>
            </div>
            <div id="titan-briefing" class="glass-card p-4 max-w-xs border-indigo-500/30 text-[11px] font-mono leading-relaxed transform origin-bottom-right scale-90 translate-x-4 opacity-0 transition-all duration-500">
                <div class="text-indigo-400 font-bold mb-1 tracking-tighter uppercase">Titan Assistant // Core Briefing</div>
                <div id="titan-msg" class="text-slate-300">正在同步您的神经链路数据... 所有实时监测模块已就绪。</div>
            </div>
        `;
        document.body.appendChild(hud);
        this.container = hud;
        this.briefing = document.getElementById('titan-briefing');
        this.msg = document.getElementById('titan-msg');

        // Reveal animations
        setTimeout(() => {
            hud.classList.remove('translate-y-10', 'opacity-0');
            this.revealBriefing("欢迎回来，研究员。发现 3 个神经连接薄弱点，建议今日开启 Gf 专项训练。");
        }, 2000);

        // Hover events
        const pulse = document.getElementById('titan-pulse-container');
        pulse.onmouseenter = () => this.revealBriefing();
        pulse.onmouseleave = () => this.hideBriefing();
        pulse.onclick = () => this.sayStatusreport();
    }

    revealBriefing(customMsg) {
        if(customMsg) this.msg.innerText = customMsg;
        this.briefing.classList.remove('scale-90', 'translate-x-4', 'opacity-0');
    }

    hideBriefing() {
        this.briefing.classList.add('scale-90', 'translate-x-4', 'opacity-0');
    }

    sayStatusreport() {
        const report = "当前系统稳定。CHC 认知链条完整度为 82%。Logic 维度已进入精英阶梯。";
        this.revealBriefing(report);
        if(window.speechSynthesis) {
            const utter = new SpeechSynthesisUtterance(report);
            utter.rate = 1.1; utter.pitch = 0.9;
            window.speechSynthesis.speak(utter);
        }
    }
}

window.TitanAssistant = new TitanCore();
