const Launchpad = (() => {
    // Configuration
    function getAppsPerPage() {
        return window.innerWidth < 768 ? 12 : 20; // 12 for Mobile (3x4), 20 for Desktop (5x4)
    }

    // App Data (Real apps only)
    const apps = [
        { name: '个人中心', icon: '👤', link: 'profile.html', color: 'var(--mc-cyan)' }, // New Entry
        { name: '教育日志', icon: '📝', link: 'blog.html', color: '#fff' },
        { name: '培养图谱', icon: '🗺️', link: 'post-4.html', color: '#fff' },
        { name: '课程地图', icon: '🧭', link: 'post-6.html', color: '#fff' },
        { name: '竞赛地图', icon: '🏆', link: 'competition-atlas.html', color: '#fbbf24' },
        { name: '认知系统', icon: '🧠', link: 'post-5.html', color: '#fff' },
        { name: '学科协同', icon: '🧬', link: 'subject-synergy.html', color: '#fff' },
        { name: '玩中学习', icon: '🎮', link: 'games.html', color: 'var(--mc-green)' },
        { name: '知识库', icon: '📖', link: 'wiki.html', color: '#fff' },
        { name: '天文宇宙', icon: '🪐', link: 'astronomy.html', color: '#bc13fe' },
        { name: '读书观影', icon: '📚', link: 'library.html', color: '#ec4899' },
        { name: '论坛', icon: '💬', link: 'forum.html', color: '#06b6d4' },
        { name: '编程', icon: '🎨', link: 'coding.html', color: '#FFAB19' },
        { name: '无人机', icon: '🚁', link: 'drone.html', color: '#0ea5e9' }
    ];

    let currentPage = 0;
    let resizeTimeout;

    function init() {
        const overlay = document.createElement('div');
        overlay.className = 'launchpad-overlay';
        overlay.id = 'launchpadOverlay';

        // Search Bar (Input)
        const search = document.createElement('input');
        search.className = 'lp-search-bar';
        search.placeholder = '搜索 科技宝箱';
        search.type = 'text';

        // Search Logic
        search.addEventListener('input', (e) => {
            renderPages(e.target.value);
        });

        // Prevent click propagation to overlay (keep focus)
        search.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        overlay.appendChild(search);

        // Pages Container
        const pagesContainer = document.createElement('div');
        pagesContainer.className = 'launchpad-pages-container';
        pagesContainer.id = 'lpPages';
        overlay.appendChild(pagesContainer);

        // Pagination Dots Container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'lp-pagination';
        dotsContainer.id = 'lpDots';
        overlay.appendChild(dotsContainer);


        // Close Button (Top Right)
        const closeBtn = document.createElement('div');
        closeBtn.className = 'lp-close-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.title = '返回主页';
        closeBtn.addEventListener('click', close);
        overlay.appendChild(closeBtn);

        // Click outside to close (Enhanced)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay ||
                e.target.classList.contains('launchpad-pages-container') ||
                e.target.classList.contains('launchpad-page')) {
                close();
            }
        });

        // Swipe support and overlay attach
        setupGestures(overlay);
        document.body.appendChild(overlay);

        // Initial Render (Must be AFTER appending to body because renderPages uses getElementById)
        renderPages();

        // Resize Listener
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const search = document.querySelector('.lp-search-bar');
                renderPages(search ? search.value : '');
            }, 200);
        });
    }

    function renderPages(filterText = '') {
        const container = document.getElementById('lpPages');
        const dotsContainer = document.getElementById('lpDots');

        if (!container || !dotsContainer) {
            console.error('Launchpad: Required elements not found in DOM');
            return;
        }

        const itemsPerPage = getAppsPerPage();

        // Filter apps
        const filteredApps = apps.filter(app =>
            app.name.toLowerCase().includes(filterText.toLowerCase())
        );

        // Clear existing
        container.innerHTML = '';
        dotsContainer.innerHTML = '';
        container.style.transform = `translateX(0)`; // Reset position
        currentPage = 0;

        if (filteredApps.length === 0) {
            // No results
            const msg = document.createElement('div');
            msg.style.color = 'white';
            msg.style.marginTop = '50px';
            msg.textContent = '没有找到相关应用';
            container.appendChild(msg);
            return;
        }

        const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

        // Generate Pages
        for (let i = 0; i < totalPages; i++) {
            const page = document.createElement('div');
            page.className = 'launchpad-page';

            const start = i * itemsPerPage;
            const end = start + itemsPerPage;
            const pageApps = filteredApps.slice(start, end);

            pageApps.forEach((app, index) => {
                const item = document.createElement('a');
                item.href = app.link;
                item.className = 'lp-app-item';
                item.style.animationDelay = `${index * 30}ms`; // Faster stagger

                let iconContent = app.icon;

                // Subscription Check
                let lockBadge = '';
                if (typeof SubscriptionManager !== 'undefined' && SubscriptionManager.isPremium) {
                    const isPrem = SubscriptionManager.isPremium(app.link);
                    const isSub = SubscriptionManager.isSubscribed();
                    // console.log(`App: ${app.name}, Premium: ${isPrem}, Subbed: ${isSub}`);

                    if (isPrem && !isSub) {
                        lockBadge = '<div class="app-lock-icon">🔒</div>';
                    }
                }

                item.innerHTML = `
                    <div class="lp-app-icon" style="color: ${app.color}; position: relative;">
                        ${iconContent}
                        ${lockBadge}
                    </div>
                    <span class="lp-app-label">${app.name}</span>
                `;

                // If it's a dummy link, prevent default (for safety, though we removed them)
                if (app.link === '#') {
                    item.addEventListener('click', (e) => e.preventDefault());
                }

                page.appendChild(item);
            });

            container.appendChild(page);
        }

        // Generate Dots
        if (totalPages > 1) {
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = `lp-dot ${i === 0 ? 'active' : ''}`;
                dot.dataset.index = i; // Store page index
                dot.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent closing overlay
                    goToPage(i);
                });
                dotsContainer.appendChild(dot);
            }
        }
    }

    function setupGestures(overlay) {
        let touchStartX = 0;
        let touchEndX = 0;

        overlay.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        overlay.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const dots = document.querySelectorAll('.lp-dot');
            const totalPages = dots.length || 1; // Fallback if dots are hidden

            if (touchEndX < touchStartX - 50) {
                // Swipe Left -> Next Page
                if (currentPage < totalPages - 1) goToPage(currentPage + 1);
            }
            if (touchEndX > touchStartX + 50) {
                // Swipe Right -> Prev Page
                if (currentPage > 0) goToPage(currentPage - 1);
            }
        }
    }

    function goToPage(n) {
        currentPage = n;
        const container = document.getElementById('lpPages');
        container.style.transform = `translateX(-${n * 100}%)`;

        // Update dots
        const dots = document.querySelectorAll('.lp-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === n);
        });
    }

    function open() {
        const overlay = document.getElementById('launchpadOverlay');
        const searchInput = overlay.querySelector('.lp-search-bar');

        // Reset state
        searchInput.value = '';
        renderPages(); // Show all apps

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add minimal delay to focus search so keyboard doesn't jarringly pop on mobile immediately
        // or just personal preference. For now, let's focus it for convenience.
        setTimeout(() => searchInput.focus(), 100);
    }

    function close() {
        const overlay = document.getElementById('launchpadOverlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    return {
        init,
        open,
        close
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Launchpad: DOMContentLoaded');
    try {
        Launchpad.init();
        console.log('Launchpad: Initialized');

        const btn = document.getElementById('launchpadBtn');
        if (btn) {
            console.log('Launchpad: Button found, attaching listener');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Launchpad: Button clicked');
                Launchpad.open();
            });
            // Force verify click (optional, for debugging)
            btn.onclick = (e) => {
                e.preventDefault();
                Launchpad.open();
            };
        } else {
            console.error('Launchpad: Button NOT found');
        }
    } catch (e) {
        console.error('Launchpad: Error during init', e);
    }
});
