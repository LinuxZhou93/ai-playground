/**
 * TITAN OS - VFX ENGINE v1.0
 * Handles high-fidelity animations, particle systems, and evolution events.
 */

window.VFXEngine = (() => {
    let scanline = null;
    let overlay = null;

    function init() {
        if (!document.querySelector('.hologram-scanline')) {
            scanline = document.createElement('div');
            scanline.className = 'hologram-scanline';
            document.body.appendChild(scanline);
        }
        if (!document.querySelector('.orientation-overlay')) {
            overlay = document.createElement('div');
            overlay.className = 'orientation-overlay';
            document.body.appendChild(overlay);
        }

        // 监听演化信号
        window.addEventListener('titan_evolution_trigger', (e) => {
            if (e.detail && e.detail.isEvolved) {
                playEvolutionSequence();
            }
        });

        // 监听对话画像更新时的微反馈
        window.addEventListener('titan_onboarding_step', () => {
            triggerMicroFlash();
        });

        // 初始状态检测
        if (window.TitanEvolutionEngine && window.TitanEvolutionEngine.isNewbie()) {
            setOrientationMode(true);
        }
    }

    function setOrientationMode(active) {
        const dock = document.querySelector('.dock-bar');
        if (active) {
            if (dock) dock.classList.add('orientation-mode');
            if (overlay) overlay.style.display = 'block';
        } else {
            if (dock) dock.classList.remove('orientation-mode');
            if (overlay) overlay.style.display = 'none';
        }
    }

    function triggerMicroFlash() {
        if (!overlay) return;
        overlay.animate([
            { opacity: 0.1, boxShadow: 'inset 0 0 50px rgba(0, 240, 255, 0.1)' },
            { opacity: 0.4, boxShadow: 'inset 0 0 200px rgba(0, 240, 255, 0.4)' },
            { opacity: 0.1, boxShadow: 'inset 0 0 50px rgba(0, 240, 255, 0.1)' }
        ], { duration: 500, easing: 'ease-out' });
    }

    async function playEvolutionSequence() {
        console.log('🌌 VFX: Starting Evolution Sequence...');
        
        // 1. 全屏闪烁
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed; inset:0; background:#fff; z-index:9999; opacity:0; pointer-events:none;';
        document.body.appendChild(flash);
        
        await flash.animate([
            { opacity: 0 }, { opacity: 0.8 }, { opacity: 0 }
        ], { duration: 800, easing: 'ease-out' }).finished;
        
        // 2. 移除新手层
        setOrientationMode(false);
        
        // 3. 在 Launchpad 区域产生大量粒子
        const launchpad = document.getElementById('launchpadOverlay');
        if (launchpad && launchpad.classList.contains('active')) {
            const rect = launchpad.getBoundingClientRect();
            for (let i = 0; i < 50; i++) {
                createParticle(rect.left + rect.width/2, rect.top + rect.height/2);
            }
        }

        flash.remove();
    }

    function createParticle(x, y) {
        const p = document.createElement('div');
        p.className = 'evolution-particle';
        const color = Math.random() > 0.5 ? '#00f0ff' : '#7000ff';
        p.style.backgroundColor = color;
        p.style.boxShadow = `0 0 10px ${color}`;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        
        document.body.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 10;
        const dx = Math.cos(angle) * velocity * 20;
        const dy = Math.sin(angle) * velocity * 20;
        
        p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 1000,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).finished.then(() => p.remove());
    }

    return { init, setOrientationMode, playEvolutionSequence };
})();

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.VFXEngine.init());
} else {
    window.VFXEngine.init();
}
