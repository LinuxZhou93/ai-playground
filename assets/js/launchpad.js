const Launchpad = (() => {
    // Configuration
    const APPS_PER_PAGE = 20; // 5 cols x 4 rows

    // App Data (Mirroring the dock + some extras for demo)
    const apps = [
        { name: '教育日志', icon: '📝', link: 'blog.html', color: '#fff' },
        { name: '培养图谱', icon: '🗺️', link: 'post-4.html', color: '#fff' },
        { name: '课程地图', icon: '🧭', link: 'post-6.html', color: '#fff' },
        { name: '竞赛地图', icon: '🏆', link: 'competition-atlas.html', color: '#fbbf24' },
        { name: '认知系统', icon: '🧠', link: 'post-5.html', color: '#fff' },
        { name: '学科协同', icon: '🧬', link: 'subject-synergy.html', color: '#fff' },
        { name: '玩中学习', icon: '🎮', link: 'games.html', color: 'var(--mc-green)' },
        { name: '知识库', icon: '📖', link: 'wiki.html', color: '#fff' }, // SVG simplified to char for config
        { name: '天文宇宙', icon: '🪐', link: 'astronomy.html', color: '#bc13fe' },
        { name: '读书观影', icon: '📚', link: 'library.html', color: '#ec4899' },
        { name: '论坛', icon: '💬', link: 'forum.html', color: '#06b6d4' },
        { name: '编程', icon: '🎨', link: 'coding.html', color: '#FFAB19' },
        { name: '无人机', icon: '🚁', link: 'drone.html', color: '#0ea5e9' },
        // Demo apps to show pagination
        { name: '设置', icon: '⚙️', link: '#', color: '#999' },
        { name: '计算器', icon: '🔢', link: '#', color: '#orange' },
        { name: '日历', icon: '📅', link: '#', color: '#red' },
        { name: '相册', icon: '🖼️', link: '#', color: '#fff' },
        { name: '邮件', icon: '✉️', link: '#', color: '#blue' },
        { name: '地图', icon: '📍', link: '#', color: '#green' },
        { name: '天气', icon: '☀️', link: '#', color: '#blue' },
        { name: '时钟', icon: '⏰', link: '#', color: '#black' },
        { name: '备忘录', icon: '📝', link: '#', color: '#yellow' },
        { name: '提醒事项', icon: '✅', link: '#', color: '#orange' },
        { name: '股市', icon: '📈', link: '#', color: '#black' },
        { name: '家庭', icon: '🏠', link: '#', color: '#orange' },
    ];

    let currentPage = 0;
    const totalPages = Math.ceil(apps.length / APPS_PER_PAGE);

    function init() {
        const overlay = document.createElement('div');
        overlay.className = 'launchpad-overlay';
        overlay.id = 'launchpadOverlay';

        // Search Bar (Visual only)
        const search = document.createElement('div');
        search.className = 'lp-search-bar';
        search.textContent = '搜索 科技宝箱';
        overlay.appendChild(search);

        // Pages Container
        const pagesContainer = document.createElement('div');
        pagesContainer.className = 'launchpad-pages-container';
        pagesContainer.id = 'lpPages';

        // Generate Pages
        for (let i = 0; i < totalPages; i++) {
            const page = document.createElement('div');
            page.className = 'launchpad-page';

            const start = i * APPS_PER_PAGE;
            const end = start + APPS_PER_PAGE;
            const pageApps = apps.slice(start, end);

            pageApps.forEach((app, index) => {
                const item = document.createElement('a');
                item.href = app.link;
                item.className = 'lp-app-item';
                item.style.animationDelay = `${index * 50}ms`; // Stagger animation

                // Style fix for SVG or Emoji
                let iconContent = app.icon;

                item.innerHTML = `
                    <div class="lp-app-icon" style="color: ${app.color}">${iconContent}</div>
                    <span class="lp-app-label">${app.name}</span>
                `;

                // If it's a dummy link, prevent default
                if (app.link === '#') {
                    item.addEventListener('click', (e) => e.preventDefault());
                }

                page.appendChild(item);
            });

            pagesContainer.appendChild(page);
        }

        overlay.appendChild(pagesContainer);

        // Pagination Dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'lp-pagination';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('div');
            dot.className = `lp-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(dot);
        }
        overlay.appendChild(dotsContainer);

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target === pagesContainer) {
                close();
            }
        });

        // Swipe support (simple)
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
            if (touchEndX < touchStartX - 50) {
                // Swipe Left -> Next Page
                if (currentPage < totalPages - 1) goToPage(currentPage + 1);
            }
            if (touchEndX > touchStartX + 50) {
                // Swipe Right -> Prev Page
                if (currentPage > 0) goToPage(currentPage - 1);
            }
        }

        document.body.appendChild(overlay);
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
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling bg
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
    Launchpad.init();

    // Attach to button
    const btn = document.getElementById('launchpadBtn');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            Launchpad.open();
        });
    }
});
