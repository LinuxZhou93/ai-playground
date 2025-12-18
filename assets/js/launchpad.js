window.Launchpad = (() => {
    // Configuration
    function getAppsPerPage() {
        return window.innerWidth < 768 ? 9 : 10; // Reduced to force pagination (Mobile 3x3, Desktop 2x5)
    }

    // App Data (Real apps only)
    const apps = [
        { name: '金融科技', icon: '💰', link: 'fintech.html', color: '#fbbf24' },
        { name: '音频科技', icon: '🎵', link: 'music.html', color: '#22d3ee' },
        { name: 'AI 艺术', icon: '🎨', link: 'ai-art.html', color: '#FF00E5' },
        { name: '科技英语', icon: '🚀', link: 'english.html', color: '#00F5FF' },
        { name: '设计空间', icon: '🎨', link: 'design.html', color: '#7000FF' },
        { name: '个人中心', icon: '👤', link: 'profile.html', color: 'var(--mc-cyan)' },
        { name: '培养图谱', icon: '🗺️', link: 'post-4.html', color: '#fff' },
        { name: '课程地图', icon: '🧭', link: 'post-6.html', color: '#fff' },
        { name: '竞赛地图', icon: '🏆', link: 'competition-atlas.html', color: '#fbbf24' },
        { name: '认知系统', icon: '🧠', link: 'post-5.html', color: '#fff' },
        { name: '生命科学', icon: '🧬', link: 'life_hub.html', color: '#d946ef' },
        { name: '玩中学习', icon: '🎮', link: 'games.html', color: 'var(--mc-green)' },
        { name: '知识库', icon: '📖', link: 'wiki.html', color: '#fff' },
        { name: '天文宇宙', icon: '🪐', link: 'astronomy.html', color: '#bc13fe' },
        { name: '恐龙世界', icon: '🦖', link: 'dino.html', color: '#4ade80' },
        { name: '深海探索', icon: '🦑', link: 'ocean.html', color: '#00f0ff' }, // New Ocean
        { name: '地球科学', icon: '🌏', link: 'earth.html', color: '#06b6d4' },
        { name: '读书观影', icon: '📚', link: 'library.html', color: '#ec4899' },
        { name: '论坛', icon: '💬', link: 'forum.html', color: '#06b6d4' },
        { name: '编程', icon: '🎨', link: 'coding.html', color: '#FFAB19' },
        { name: '无人机', icon: '🚁', link: 'drone.html', color: '#0ea5e9' },
        { name: '实验', icon: '⚗️', link: 'labs.html', color: '#00f3ff' },
        { name: '3D打印', icon: '🖨️', link: '3d-print.html', color: '#FF2D55' },
        { name: '学习', icon: '🚀', link: 'learn.html', color: '#8B5CF6' },
        { name: '电子电路', icon: '🔌', link: 'subject.html?topic=circuits', color: '#00FF9D' },
        { name: '人工智能', icon: '🤖', link: 'subject.html?topic=ai', color: '#d946ef' },
        { name: '我的世界', icon: '⛏️', link: 'minecraft.html', color: 'var(--mc-green)' },
        { name: '教育日志', icon: '📝', link: 'blog.html', color: '#fff' }
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

        // --- NEW: Navigation Arrows ---
        const prevBtn = document.createElement('div');
        prevBtn.className = 'lp-nav-btn lp-prev';
        prevBtn.innerHTML = '‹';
        prevBtn.onclick = (e) => { e.stopPropagation(); if (currentPage > 0) goToPage(currentPage - 1); };
        overlay.appendChild(prevBtn);

        const nextBtn = document.createElement('div');
        nextBtn.className = 'lp-nav-btn lp-next';
        nextBtn.innerHTML = '›';
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            const dots = document.querySelectorAll('.lp-dot');
            if (currentPage < dots.length - 1) goToPage(currentPage + 1);
        };
        overlay.appendChild(nextBtn);

        // Helper to update arrow visibility
        window.updateArrowState = function (page, total) {
            prevBtn.style.opacity = page === 0 ? '0' : '1';
            prevBtn.style.pointerEvents = page === 0 ? 'none' : 'auto';
            nextBtn.style.opacity = page >= total - 1 ? '0' : '1';
            nextBtn.style.pointerEvents = page >= total - 1 ? 'none' : 'auto';
        };

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

        // Listen for Subscription Updates (e.g. after login/load)
        window.addEventListener('subscription_updated', () => {
            console.log('Launchpad: Subscription updated, refreshing icons...');
            renderPages();
            updateDock(); // Sync bottom dock
        });

        // Initial Dock Sync
        setTimeout(updateDock, 500);
    }

    function updateDock() {
        if (typeof SubscriptionManager === 'undefined') return;

        const dockItems = document.querySelectorAll('.dock-icon-box');
        dockItems.forEach(item => {
            // 1. Identify Target Link
            // Most items use onclick="location.href='...'"
            const onclickStr = item.getAttribute('onclick');
            if (!onclickStr || !onclickStr.includes('location.href')) return;

            // Extract 'page.html' from string "location.href='page.html'"
            const match = onclickStr.match(/['"]([^'"]+)['"]/);
            if (!match) return;
            const link = match[1];

            // 2. Check Permission
            // Using same logic as renderPages
            let isLocked = false;

            // Check Free List
            const isAlwaysFree = SubscriptionManager.FREE_PAGES.some(p => link.includes(p));

            if (!isAlwaysFree) {
                let isSubscribed = SubscriptionManager.isSubscribed && SubscriptionManager.isSubscribed();

                // Fallback LocalStorage Check (Same as renderPages)
                if (!isSubscribed) {
                    try {
                        const dashData = JSON.parse(localStorage.getItem('local_dashboard_data') || '{}');
                        if (dashData && dashData.username) isSubscribed = true;
                    } catch (e) { }
                }

                if (!isSubscribed) isLocked = true;
            }

            // 3. Update UI
            // Remove existing lock overlay if any
            const existingLock = item.querySelector('.dock-lock-overlay');
            if (existingLock) existingLock.remove();

            if (isLocked) {
                // Add Visual Lock
                item.classList.add('dock-locked');
                item.style.opacity = '0.5';
                item.style.position = 'relative'; // Ensure relative for absolute lock

                const lock = document.createElement('div');
                lock.className = 'dock-lock-overlay';
                lock.innerHTML = '🔒';
                lock.style.position = 'absolute';
                lock.style.top = '-5px';
                lock.style.right = '-5px';
                lock.style.fontSize = '12px';
                lock.style.background = '#000';
                lock.style.borderRadius = '50%';
                lock.style.width = '16px';
                lock.style.height = '16px';
                lock.style.display = 'flex';
                lock.style.alignItems = 'center';
                lock.style.justifyContent = 'center';
                lock.style.border = '1px solid #333';
                item.appendChild(lock);

                // Override Click
                item.dataset.originalClick = onclickStr;
                item.removeAttribute('onclick'); // Kill original
                item.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Shake
                    item.style.transform = 'translateX(5px)';
                    setTimeout(() => item.style.transform = 'translateX(-5px)', 50);
                    setTimeout(() => item.style.transform = 'none', 150);

                    if (typeof SubscriptionManager.showPaywall === 'function') {
                        SubscriptionManager.showPaywall();
                    }
                };
            } else {
                // Unlock
                item.classList.remove('dock-locked');
                item.style.opacity = '1';

                // Restore Click if it was locked
                if (item.dataset.originalClick) {
                    item.setAttribute('onclick', item.dataset.originalClick);
                    item.onclick = null; // Remove JS override handler so attribute takes over
                    delete item.dataset.originalClick;
                }
            }
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
                const appLink = document.createElement('a');
                appLink.className = 'lp-app-item';
                appLink.href = app.link;
                // Add staggered animation delay
                appLink.style.animationDelay = `${index * 50}ms`;

                // --- SUBSCRIPTION CHECK LOGIC ---
                let isLocked = false;

                // 1. Safe List Check (Check if link is in FREE_PAGES)
                const isAlwaysFree = (SubscriptionManager && SubscriptionManager.FREE_PAGES)
                    ? SubscriptionManager.FREE_PAGES.some(p => app.link.includes(p))
                    : false;

                if (!isAlwaysFree) {
                    // It's a premium page, we need to check auth

                    // A. Check SubscriptionManager Runtime State
                    let isSubscribed = false;
                    if (typeof SubscriptionManager !== 'undefined') {
                        isSubscribed = SubscriptionManager.isSubscribed && SubscriptionManager.isSubscribed();
                    }

                    // B. Fallback: Check LocalStorage (Fast Path)
                    if (!isSubscribed) {
                        try {
                            const cached = JSON.parse(localStorage.getItem('sb-fcdqsoroqvocybcaxnvu-auth-token'));
                            if (cached && cached.user) isSubscribed = true; // Rudimentary check: has user = maybe premium?

                            // Better: Check local dashboard data which drives the UI sidebar
                            const dashData = JSON.parse(localStorage.getItem('local_dashboard_data') || '{}');
                            if (dashData && dashData.username) isSubscribed = true; // Trusted local user
                        } catch (e) { }
                    }

                    // C. Final Decision
                    if (!isSubscribed) {
                        isLocked = true;
                    }
                }

                // Override Link if Locked
                if (isLocked) {
                    appLink.classList.add('locked');
                    appLink.href = 'javascript:void(0)';
                    appLink.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Simple Shake Animation
                        const box = appLink.querySelector('.lp-app-icon-box');
                        if (box) {
                            box.style.transform = 'translateX(5px)';
                            setTimeout(() => box.style.transform = 'translateX(-5px)', 50);
                            setTimeout(() => box.style.transform = 'translateX(5px)', 100);
                            setTimeout(() => box.style.transform = 'none', 150);
                        }
                        // Optional: Show Toast "Please Subscribe"
                        if (typeof showToast === 'function') showToast('请解锁会员以访问此功能');
                    };
                }

                // --- NEW HTML STRUCTURE (Glass Style) ---
                const iconBox = document.createElement('div');
                iconBox.className = 'lp-app-icon-box';
                iconBox.innerHTML = app.icon;
                // Use app color for subtle glow/border if needed
                if (app.color && app.color !== '#fff') {
                    iconBox.style.boxShadow = `0 4px 15px ${app.color}40`; // 40 = 25% alpha
                }

                const label = document.createElement('div');
                label.className = 'lp-app-text';
                label.innerText = app.name;

                appLink.appendChild(iconBox);
                appLink.appendChild(label);
                page.appendChild(appLink);
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
            if (window.updateArrowState) window.updateArrowState(0, totalPages);
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

        // Update Arrows
        if (window.updateArrowState) window.updateArrowState(n, dots.length);
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
        if (window.Launchpad) {
            window.Launchpad.init();
            console.log('Launchpad: Initialized');
        }

        const btn = document.getElementById('launchpadBtn');
        if (btn) {
            console.log('Launchpad: Button found, attaching listener');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Launchpad: Button clicked');
                if (window.Launchpad) window.Launchpad.open();
            });
            // Force verify click (optional, for debugging)
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.Launchpad) window.Launchpad.open();
            };
        } else {
            console.log('Launchpad: Button lookup skipped (using global toggle)');
        }
    } catch (e) {
        console.error('Launchpad: Error during init', e);
    }
});
