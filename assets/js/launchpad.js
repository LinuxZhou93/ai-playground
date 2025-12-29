window.Launchpad = (() => {
    // Configuration
    const CATEGORIES = {
        LABS: { id: 'labs', title: 'TITAN LABS / 核心实验室', icon: '⚡' },
        ACADEMIC: { id: 'academic', title: 'ACADEMIC / 国家学科中心', icon: '🏮' },
        DISCOVERY: { id: 'discovery', title: 'DISCOVERY / 探索与发现', icon: '🌏' },
        SYSTEM: { id: 'system', title: 'SYSTEM & TOOLS / 系统与规划', icon: '🛠️' }
    };

    // App Data (Full List - Ordered for DOCK)
    const apps = [
        // --- CORE SYSTEM (Items 1-7 in user order) ---
        // Note: Rocket (Launchpad) is handled specifically as it opens the overlay
        { name: '系统说明', icon: 'ℹ️', link: 'system-intro.html', color: 'var(--mc-cyan)', category: 'system' },
        { name: '个人中心', icon: '👤', link: 'profile.html', color: 'var(--mc-cyan)', category: 'system' },
        { name: '培养图谱', icon: '🗺️', link: 'post-4.html', color: '#fff', category: 'system' },
        { name: '课程地图', icon: '📚', link: 'post-6.html', color: '#fff', category: 'system' },
        { name: '竞赛地图', icon: '🏆', link: 'competition-atlas.html', color: '#fbbf24', category: 'system' },
        { name: '认知系统', icon: '🧠', link: 'post-5.html', color: '#fff', category: 'system' },
        { name: '神经进化', icon: '🧬', link: 'psyche_x_system/index.html', color: 'var(--accent)', category: 'system' },
        { name: '学习方法', icon: '🧠', link: 'study-methods.html', color: '#8b5cf6', category: 'system' },
        { name: '学习中心', icon: '🏫', link: 'learn.html', color: '#8B5CF6', category: 'system' },

        { name: '升学指南', icon: '🎓', link: 'admission-guide.html', color: '#10b981', category: 'system' },

        // --- SUBJECT MODULES (Items 8-25 in user order) ---
        { name: '源码交响中心', icon: '💻', link: 'coding.html', color: '#8B5CF6', category: 'labs' },
        { name: '计算创意工作室', icon: '🎨', link: 'ai-art.html', color: '#FF00E5', category: 'labs' },
        { name: '智电实验室', icon: '🔋', link: 'circuits.html', color: '#00FF9D', category: 'labs' },
        { name: '智造工场', icon: '🖨️', link: '3d-print.html', color: '#FF2D55', category: 'labs' },
        { name: '航天指挥中心', icon: '🛸', link: 'aerospace.html', color: '#6366f1', category: 'labs' },
        { name: '万物实验室', icon: '🧪', link: 'labs.html', color: '#00f3ff', category: 'labs' },
        { name: '寰宇观测站', icon: '🌌', link: 'astronomy.html', color: '#bc13fe', category: 'discovery' },
        { name: '生命科学', icon: '🧬', link: 'course-life.html', color: '#d946ef', category: 'discovery' },
        { name: '恐龙世界', icon: '🦖', link: 'dino.html', color: '#4ade80', category: 'discovery' },
        { name: '深海探索', icon: '🌊', link: 'ocean.html', color: '#00f0ff', category: 'discovery' },
        { name: '地球科学', icon: '🌍', link: 'earth.html', color: '#06b6d4', category: 'discovery' },
        { name: '读书观影', icon: '📖', link: 'library.html', color: '#ec4899', category: 'discovery' },
        { name: '知识库', icon: '📂', link: 'wiki.html', color: '#fff', category: 'discovery' },
        { name: '打字训练', icon: '⌨️', link: 'typing.html', color: '#fff', category: 'labs' },
        { name: '无人机战术中心', icon: '🚁', link: 'drone.html', color: '#06B6D4', category: 'labs' },
        { name: '智核研究院', icon: '🤖', link: 'ai.html', color: '#d946ef', category: 'labs' },
        { name: 'AI 音乐', icon: '🎵', link: 'music.html', color: '#ff4d4d', category: 'labs' },
        { name: '智力挑战', icon: '🧩', link: 'brain.html', color: '#10b981', category: 'labs' },
        { name: '科技英语', icon: '🔤', link: 'english.html', color: '#00F5FF', category: 'labs' },
        { name: '金融科技', icon: '💰', link: 'fintech.html', color: '#fbbf24', category: 'labs' },

        // --- ACADEMIC CENTER ---
        { name: '语文中心', icon: '🏮', link: 'chinese-hub.html', color: '#ff4d4d', category: 'academic' },
        { name: '数学中心', icon: '📐', link: 'math-hub.html', color: '#3b82f6', category: 'academic' },
        { name: '英语中心', icon: '🔤', link: 'english-hub.html', color: '#10b981', category: 'academic' },
        { name: '科学中心', icon: '🔬', link: 'science-hub.html', color: '#a855f7', category: 'academic' },
        { name: '物理中心', icon: '⚛️', link: 'physics-hub.html', color: '#3b82f6', category: 'academic' },
        { name: '化学中心', icon: '🧪', link: 'chemistry-hub.html', color: '#00f3ff', category: 'academic' },
        { name: '生物中心', icon: '🧬', link: 'biology-hub.html', color: '#4ade80', category: 'academic' },
        { name: '思政中心', icon: '🛡️', link: 'politics-hub.html', color: '#ff4d4d', category: 'academic' },
        { name: '历史中心', icon: '📜', link: 'history-hub.html', color: '#fbbf24', category: 'academic' },
        { name: '地理中心', icon: '🌍', link: 'geography-hub.html', color: '#10b981', category: 'academic' },
        { name: '信息科技中心', icon: '🖥️', link: 'infotech-hub.html', color: '#8b5cf6', category: 'academic' },
        { name: '艺术中心', icon: '🎨', link: 'arts-hub.html', color: '#f472b6', category: 'academic' },
        { name: '体育与健康', icon: '🏃', link: 'pe-hub.html', color: '#10b981', category: 'academic' },
        { name: '劳动实践中心', icon: '⚒️', link: 'labor-hub.html', color: '#f59e0b', category: 'academic' },
        { name: '通用技术中心', icon: '⚙️', link: 'tech-hub.html', color: '#3b82f6', category: 'academic' },
        { name: '全球智慧中心', icon: '🌐', link: 'international-hub.html', color: '#fbbf24', category: 'academic' },
        { name: '科技新闻', icon: '📰', link: 'news.html', color: '#00F0FF', category: 'system' },

        // --- LEGACY/OTHER (Still in Launchpad Search) ---
        { name: '军事科技', icon: '🛡️', link: 'military.html', color: '#4caf50', category: 'discovery' },
        { name: '数学视界', icon: '📐', link: 'math.html', color: '#F44336', category: 'discovery' },
        { name: '全球课堂', icon: '🌍', link: 'global-class.html', color: '#0ea5e9', category: 'discovery' },
        { name: '学科协同', icon: '🔗', link: 'subject-synergy.html', color: '#8b5cf6', category: 'discovery' },
        { name: '汽车世界', icon: '🏎️', link: 'car-world.html', color: '#f43f5e', category: 'discovery' },
        { name: 'GAIA引擎', icon: '🌍', link: 'gaia.html', color: '#4CAF50', category: 'discovery' },
        { name: 'DNA模拟', icon: '🧬', link: 'helix.html', color: '#E91E63', category: 'discovery' },
        { name: '物理仿真', icon: '⚛️', link: 'walter_fendt.html', color: '#FFC107', category: 'discovery' },
        { name: '虚拟实验(旧)', icon: '🔬', link: 'cc_vlabs.html', color: '#00BCD4', category: 'discovery' },
        { name: '智慧星图', icon: '🌌', link: 'synergy-galaxy.html', color: '#6366f1', category: 'discovery' },
        { name: '我的世界', icon: '⛏️', link: 'minecraft.html', color: 'var(--mc-green)', category: 'discovery' },
        { name: '大学先修', icon: '🎓', link: 'universities.html', color: '#f59e0b', category: 'system' },
        { name: '荣誉殿堂', icon: '🏆', link: 'trophy.html', color: '#fbbf24', category: 'system' },
        { name: '教材中心', icon: '📚', link: 'textbook.html', color: '#fff', category: 'system' },
        { name: '社区论坛', icon: '💬', link: 'forum.html', color: '#06b6d4', category: 'system' }
    ];

    function init() {
        injectStyles();

        // Prevent Duplicate
        if (document.getElementById('launchpadOverlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'launchpad-overlay custom-scroll';
        overlay.id = 'launchpadOverlay';

        // Search Bar Container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'lp-header';

        const search = document.createElement('input');
        search.className = 'lp-search-bar';
        search.placeholder = 'Search Titan OS...';
        search.type = 'text';
        search.addEventListener('input', (e) => renderPages(e.target.value));
        search.addEventListener('click', (e) => e.stopPropagation());

        searchContainer.appendChild(search);
        overlay.appendChild(searchContainer);

        // Content Container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'lp-content-container';
        contentContainer.id = 'lpContent';
        overlay.appendChild(contentContainer);

        // Close Button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'lp-close-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = close;
        overlay.appendChild(closeBtn);

        // Click outside to close
        // Click outside to close - Improved Event Handling
        overlay.addEventListener('click', (e) => {
            // Only close if clicking the backdrop itself or the header background, 
            // NOT when clicking any child content like inputs, buttons, or app icons.
            if (e.target === overlay || e.target.classList.contains('lp-header')) {
                e.stopPropagation(); // Stop bubbling
                close();
            }
        });

        document.body.appendChild(overlay);
        renderPages();

        // Listen for subscription updates
        window.addEventListener('subscription_updated', () => {
            renderPages();
            // updateDock(); // Keep locks updated but don't rebuild
        });
        // setTimeout(updateDock, 500); // Disabling dynamic dock override
    }

    function injectStyles() {
        if (document.getElementById('lp-styles')) return;
        const style = document.createElement('style');
        style.id = 'lp-styles';
        style.textContent = `
            .launchpad-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(3, 7, 18, 0.95);
                backdrop-filter: blur(20px);
                z-index: 9999;
                display: none;
                flex-direction: column;
                align-items: center;
                overflow-y: auto;
                padding-bottom: 100px;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .launchpad-overlay.active { display: flex; opacity: 1; }
            .lp-header { 
                width: 100%; display: flex; justify-content: center; 
                padding: 60px 20px 40px; position: sticky; top: 0; z-index: 10; 
                background: linear-gradient(to bottom, rgba(3, 7, 18, 1), rgba(3, 7, 18, 0)); 
            }
            .lp-search-bar {
                width: 100%; max-width: 500px; padding: 15px 25px;
                background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 50px; color: white; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;
                transition: all 0.3s;
                font-size: 16px;
            }
            .lp-search-bar:focus { 
                background: rgba(255, 255, 255, 0.1); border-color: var(--primary, #00f3ff); 
                outline: none; box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); 
            }
            
            .lp-content-container { 
                width: 100%; max-width: 1100px; padding: 0 30px; 
                display: flex; flex-direction: column; gap: 50px; 
                animation: lp-slide-up 0.5s ease-out; 
            }
            
            .lp-category-section { width: 100%; }
            .lp-category-header { 
                display: flex; align-items: center; gap: 10px; 
                border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
                padding-bottom: 15px; margin-bottom: 25px; 
            }
            .lp-category-icon { font-size: 24px; }
            .lp-category-title { 
                font-family: 'Orbitron', sans-serif; font-size: 16px; 
                color: rgba(255, 255, 255, 0.8); letter-spacing: 2px; font-weight: 700; 
            }
            
            .lp-grid { 
                display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
                gap: 20px; row-gap: 30px; 
            }
            
            .lp-app-item { 
                display: flex; flex-direction: column; align-items: center; 
                gap: 12px; text-decoration: none; transition: transform 0.2s; cursor: pointer; 
            }
            .lp-app-item:hover { transform: translateY(-5px); }
            .lp-app-item:hover .lp-app-icon-box { 
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.2); 
                border-color: white; transform: scale(1.05); 
            }
            .lp-app-icon-box {
                width: 64px; height: 64px; background: rgba(255, 255, 255, 0.05);
                border-radius: 18px; display: flex; align-items: center; justify-content: center;
                font-size: 30px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s;
                position: relative;
            }
            .lp-app-text { 
                font-size: 11px; color: rgba(255, 255, 255, 0.7); 
                text-align: center; max-width: 100px; line-height: 1.4; 
            }
            .lp-app-item:hover .lp-app-text { color: white; }
            
            .lp-close-btn { 
                position: fixed; top: 30px; right: 30px; font-size: 24px; 
                color: rgba(255, 255, 255, 0.5); cursor: pointer; 
                width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; 
                background: rgba(0, 0, 0, 0.5); border-radius: 50%; z-index: 20; transition: all 0.2s; 
            }
            .lp-close-btn:hover { color: white; background: rgba(255, 255, 255, 0.1); }

            @keyframes lp-slide-up { 
                from { opacity: 0; transform: translateY(20px); } 
                to { opacity: 1; transform: translateY(0); } 
            }
            
            .dock-locked { filter: grayscale(1); opacity: 0.6; }
            .lp-app-item.locked .lp-app-icon-box::after, .dock-locked .dock-icon-bg::after {
                content: '🔒'; position: absolute; top: -5px; right: -5px; font-size: 14px;
                background: black; border-radius: 50%; padding: 2px; border: 1px solid #333;
            }

            /* Responsive */
            @media(max-width: 768px) {
                .lp-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
                .lp-app-icon-box { width: 50px; height: 50px; font-size: 24px; border-radius: 14px; }
                .lp-search-bar { padding: 12px 20px; font-size: 14px; }
            }
        `;
        document.head.appendChild(style);
    }


    function renderPages(filterT = '') {
        const container = document.getElementById('lpContent');
        if (!container) return;

        container.innerHTML = '';
        const filterText = filterT.toLowerCase();

        // Group apps
        const groups = { labs: [], academic: [], discovery: [], system: [] };

        apps.forEach(app => {
            if (!app.name) return; // Skip invalid
            if (app.name.toLowerCase().includes(filterText) && groups[app.category]) {
                groups[app.category].push(app);
            }
        });

        console.log('Launchpad: Rendering apps...', { labs: groups.labs.length, discovery: groups.discovery.length });

        // Render Groups
        Object.keys(CATEGORIES).forEach(key => {
            const cat = CATEGORIES[key];
            const groupApps = groups[cat.id];

            if (groupApps && groupApps.length > 0) {
                const section = document.createElement('div');
                section.className = 'lp-category-section';

                // Header
                const header = document.createElement('div');
                header.className = 'lp-category-header';
                header.innerHTML = `<span class="lp-category-icon">${cat.icon}</span><span class="lp-category-title">${cat.title}</span>`;
                section.appendChild(header);

                // Grid
                const grid = document.createElement('div');
                grid.className = 'lp-grid';

                groupApps.forEach((app, i) => {
                    const item = document.createElement('a');
                    item.className = 'lp-app-item';
                    item.href = app.link || '#';
                    // Stagger animation - REMOVED 'backwards' to ensure visibility
                    item.style.animation = `lp-slide-up 0.4s ease-out ${i * 30}ms both`;

                    // Subscription Check Logic
                    let isLocked = false;
                    try {
                        // Safe check for SubscriptionManager
                        const sm = window.SubscriptionManager;
                        if (sm && sm.FREE_PAGES) {
                            const isAlwaysFree = sm.FREE_PAGES.some(p => app.link && app.link.includes(p));

                            if (!isAlwaysFree) {
                                let isSubscribed = false;
                                if (sm.isSubscribed && typeof sm.isSubscribed === 'function') {
                                    isSubscribed = sm.isSubscribed();
                                }

                                // Fallback to localStorage if SM not fully ready/sync
                                if (!isSubscribed) {
                                    const localData = localStorage.getItem('local_dashboard_data');
                                    if (localData && localData.includes('username')) isSubscribed = true;
                                }

                                if (!isSubscribed) isLocked = true;
                            }
                        }
                    } catch (e) {
                        console.warn('Launchpad: Auth check error', e);
                    }

                    if (isLocked) {
                        item.classList.add('locked');
                        item.href = 'javascript:void(0)';
                        item.onclick = (e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (window.SubscriptionManager && window.SubscriptionManager.showPaywall) {
                                window.SubscriptionManager.showPaywall();
                            } else {
                                alert('会员专享功能 (Premium Feature)');
                            }
                        };
                    }

                    // Icon
                    const iconBox = document.createElement('div');
                    iconBox.className = 'lp-app-icon-box';
                    iconBox.innerHTML = app.icon || '📦';
                    if (app.color && app.color !== '#fff') iconBox.style.boxShadow = `0 4px 15px ${app.color}30`;

                    const text = document.createElement('div');
                    text.className = 'lp-app-text';
                    text.innerText = app.name || 'App';

                    item.appendChild(iconBox);
                    item.appendChild(text);
                    grid.appendChild(item);
                });

                section.appendChild(grid);
                container.appendChild(section);
            }
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div style="color:white; text-align:center; padding:50px; opacity:0.5">No apps found</div>';
        }
    }

    function updateDock() {
        if (typeof window.SubscriptionManager === 'undefined') return;

        const dockItems = document.querySelectorAll('.dock-icon-box');
        dockItems.forEach(item => {
            const onclickStr = item.getAttribute('onclick');
            if (!onclickStr || !onclickStr.includes('location.href')) return;
            const link = onclickStr.match(/['"]([^'"]+)['"]/)?.[1];
            if (!link) return;

            let isLocked = false;
            // Check permission
            const isAlwaysFree = window.SubscriptionManager.FREE_PAGES.some(p => link.includes(p));
            if (!isAlwaysFree) {
                let isSubscribed = window.SubscriptionManager.isSubscribed && window.SubscriptionManager.isSubscribed();
                if (!isSubscribed && JSON.parse(localStorage.getItem('local_dashboard_data') || '{}').username) isSubscribed = true;
                if (!isSubscribed) isLocked = true;
            }

            const existingLock = item.querySelector('.dock-lock-overlay');
            if (existingLock) existingLock.remove();

            if (isLocked) {
                item.classList.add('dock-locked');
                item.style.opacity = '0.5';
                item.style.position = 'relative';
                const lock = document.createElement('div');
                lock.className = 'dock-lock-overlay';
                lock.innerHTML = '🔒';
                Object.assign(lock.style, { position: 'absolute', top: '-5px', right: '-5px', fontSize: '10px', background: 'black', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' });
                item.appendChild(lock);
                item.dataset.originalClick = onclickStr;
                item.removeAttribute('onclick');
                item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.SubscriptionManager.showPaywall(); };
            } else {
                item.classList.remove('dock-locked');
                item.style.opacity = '1';
                if (item.dataset.originalClick) {
                    item.setAttribute('onclick', item.dataset.originalClick);
                    item.onclick = null;
                    delete item.dataset.originalClick;
                }
            }
        });
    }

    function open() {
        const overlay = document.getElementById('launchpadOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const search = overlay.querySelector('.lp-search-bar');
                if (search) search.focus();
            }, 100);
        } else {
            console.error('Launchpad overlay Not Found');
            init(); // Try to recover
            open();
        }
    }

    function close() {
        const overlay = document.getElementById('launchpadOverlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function initDock(containerSelector) {
        const dock = document.querySelector(containerSelector);
        if (!dock) return;

        // Keep the first element (The Launchpad Rocket Button) and remove the rest
        // assuming the first one is the "Start" button.
        // If we want to be safer, we can look for the specific ID.
        const launchpadBtn = document.getElementById('newLaunchpadEntry');
        dock.innerHTML = ''; // Clear all
        if (launchpadBtn) dock.appendChild(launchpadBtn); // Put the rocket back

        // Ensure overflow is correct for scrolling
        dock.style.justifyContent = 'flex-start'; // Align left so scrolling works naturally

        apps.forEach((app, i) => {
            const item = document.createElement('div');
            item.className = 'dock-icon-box';
            item.style.minWidth = '60px'; // Fix width for scrolling

            // Staggered Fade In Animation
            item.style.opacity = '0';
            item.style.animation = `dockFadeIn 0.5s forwards ${i * 20}ms`;

            // Special Styling for System Intro
            if (app.name === '系统说明') {
                item.style.borderColor = 'var(--secondary)';
                item.style.background = 'rgba(112, 0, 255, 0.1)';
                item.style.boxShadow = '0 0 15px rgba(112, 0, 255, 0.3)';
            }

            // Click Handler
            item.onclick = function () {
                window.location.href = app.link;
            };

            // Icon Background
            const iconBg = document.createElement('div');
            iconBg.className = 'dock-icon-bg';
            iconBg.innerHTML = app.icon;

            // Add subtle glow based on app color
            if (app.color && app.color !== '#fff') {
                iconBg.style.textShadow = `0 0 10px ${app.color}`;
            }
            item.appendChild(iconBg);

            // Label
            const label = document.createElement('div');
            label.className = 'dock-label';
            label.innerText = app.name;
            if (app.name === '系统说明') {
                label.style.color = 'var(--secondary)';
                label.style.fontWeight = 'bold';
            }
            item.appendChild(label);

            dock.appendChild(item);
        });

        // Add animation keyframes if not exists
        if (!document.getElementById('dock-anim-style')) {
            const style = document.createElement('style');
            style.id = 'dock-anim-style';
            style.innerHTML = `@keyframes dockFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
            document.head.appendChild(style);
        }

        // Re-run lock logic
        setTimeout(updateDock, 100);
    }

    return { init, open, close, updateDock, initDock };
})();

// Auto-init for reliability
if (typeof window !== 'undefined' && window.Launchpad) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.Launchpad.init());
    } else {
        window.Launchpad.init();
    }
}
