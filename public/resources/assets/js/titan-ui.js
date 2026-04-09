
/**
 * TITAN NEXUS - COMPONENT SYSTEM v1.0
 * 统一渲染导航栏、页脚和通用UI组件
 */

const TitanUI = {
    // 1. Render Navbar
    initNavbar: function (activeTitle = 'TITAN NEXUS') {
        const navHTML = `
        <nav class="sticky top-0 z-50 glass-panel border-b border-b-white/10 mb-10 w-full">
            <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                <!-- Logo Area -->
                <div class="flex items-center gap-3">
                    <a href="index.html" class="group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:border-cyan-400 transition-colors">
                        <span class="text-xl group-hover:scale-110 transition-transform">🧬</span>
                        <div class="absolute inset-0 rounded-full bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </a>
                    <div class="flex flex-col">
                        <span class="font-display font-bold text-xl tracking-widest uppercase text-white leading-none">
                            TITAN<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">NEXUS</span>
                        </span>
                        <span class="text-[10px] text-slate-400 tracking-[0.2em] font-mono mt-1">${activeTitle}</span>
                    </div>
                </div>

                <!-- Desktop Nav -->
                <div class="hidden md:flex items-center gap-8">
                    <a href="index.html" class="nav-link text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">首页 Home</a>
                    <a href="index.html#launchpad" onclick="if(window.toggleLaunchpad) { window.toggleLaunchpad(); return false; }" class="nav-link text-xs font-bold text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-colors cursor-pointer">科技宝箱 Apps</a>
                    <a href="profile.html" class="nav-link text-xs font-bold text-slate-400 hover:text-fuchsia-400 uppercase tracking-widest transition-colors">个人中心 Profile</a>
                </div>

                <!-- Mobile Menu (Placeholder) -->
                <div class="md:hidden text-2xl text-white cursor-pointer">≡</div>
            </div>
        </nav>`;

        // Insert at top of body
        const container = document.createElement('div');
        container.innerHTML = navHTML;
        document.body.prepend(container);
    },

    // 2. Render Footer
    initFooter: function () {
        const footerHTML = `
        <footer class="border-t border-white/10 bg-black/40 backdrop-blur-md py-12 mt-20">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <div class="flex justify-center items-center gap-2 mb-4 opacity-50">
                    <span class="text-2xl">⚡</span>
                    <span class="font-display font-bold tracking-widest">NEXUS SYSTEM</span>
                </div>
                <p class="text-slate-500 text-xs font-mono tracking-wider">
                    FUTURE AI PROJECT &copy; 2025 <br>
                    DESIGNED FOR THE NEXT GENERATION OF INNOVATORS
                </p>
            </div>
        </footer>`;

        document.body.insertAdjacentHTML('beforeend', footerHTML);
    },

    // 3. Setup Common Styles (Fonts, Global CSS) if missing
    injectStyles: function () {
        if (!document.getElementById('titan-global-css')) {
            const style = document.createElement('style');
            style.id = 'titan-global-css';
            style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Rajdhani:wght@400;500;700&family=Share+Tech+Mono&display=swap');
                
                body { font-family: 'Inter', sans-serif; background: #0f0518; color: #fff; }
                .font-display { font-family: 'Rajdhani', sans-serif; }
                .font-mono { font-family: 'Share Tech Mono', monospace; }
                
                .glass-panel {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                .glass-panel:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.3);
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// Auto-init if configured
// document.addEventListener('DOMContentLoaded', () => TitanUI.initNavbar());
