const SubscriptionManager = (() => {
    // 1. Mock Database (Simulating Backend)
    // Format: { username: "...", password: "...", expiry: "YYYY-MM-DD" }
    const MOCK_DB = [
        { username: "admin", password: "123", expiry: "2099-12-31" },
        { username: "student01", password: "abc", expiry: "2026-12-31" },
        { username: "expired_user", password: "123", expiry: "2023-01-01" } // For testing expiry
    ];

    // 2. Free Pages Configuration
    const FREE_PAGES = [
        'blog.html',              // 教育日志
        'post-4.html',            // 培养图谱
        'post-6.html',            // 课程地图
        'competition-atlas.html', // 竞赛地图
        'subject-synergy.html',   // 学科协同
        'wiki.html',              // 知识库
        'forum.html',             // 论坛
        'index.html',             // 首页
        '#'
    ];

    // 3. State Management
    let currentUser = null;

    function init() {
        // Load from localStorage
        const storedUser = localStorage.getItem('vip_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (checkExpiry(user.expiry)) {
                    currentUser = user;
                    console.log(`Subscription: Welcome back, ${user.username}. Valid until ${user.expiry}`);
                } else {
                    console.warn("Subscription: Session expired.");
                    localStorage.removeItem('vip_user'); // Clear invalid session
                }
            } catch (e) {
                console.error("Subscription: Auth Check Error", e);
            }
        }

        createPaywallHTML();
        attachGlobalListeners();
        updateUI(); // Initial UI update (locks)
    }

    // Helper: Check if date is valid (Current Date <= Expiry Date)
    function checkExpiry(expiryDateStr) {
        const today = new Date();
        const expiry = new Date(expiryDateStr);
        // Reset hours to compare dates only roughly
        today.setHours(0, 0, 0, 0);
        return today <= expiry;
    }

    function isPremium(link) {
        if (!link || link === '#' || link.startsWith('javascript:')) return false;
        return !FREE_PAGES.some(page => link.endsWith(page));
    }

    function checkAccess(e, link) {
        if (currentUser) return true; // Logged in & Valid

        if (isPremium(link)) {
            e.preventDefault();
            e.stopPropagation();
            showPaywall();
            return false;
        }
        return true;
    }

    function createPaywallHTML() {
        if (document.getElementById('paywallOverlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'paywall-overlay';
        overlay.id = 'paywallOverlay';
        overlay.innerHTML = `
            <div class="paywall-card">
                <div class="paywall-close" onclick="SubscriptionManager.closePaywall()">×</div>
                <div class="paywall-icon">🔐</div>
                <h2 class="paywall-title">会员登录</h2>
                <p class="paywall-desc">请输入您的会员账号以解锁高级功能<br>默认演示账号: student01 / abc</p>
                
                <div class="paywall-input-group">
                    <label class="paywall-label">ACCOUNT /账号</label>
                    <input type="text" id="subUser" class="paywall-input" placeholder="输入账号">
                </div>

                <div class="paywall-input-group">
                    <label class="paywall-label">PASSWORD /密码</label>
                    <input type="password" id="subPass" class="paywall-input" placeholder="输入密码">
                </div>

                <div id="subError" class="paywall-error"></div>

                <button class="paywall-btn" onclick="SubscriptionManager.attemptLogin()">立即登录</button>
                
                <div class="auth-footer">
                    如需获取账号，请联系管理员或您的导师
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function showPaywall() {
        const overlay = document.getElementById('paywallOverlay');
        if (overlay) {
            overlay.classList.add('active');
            // Clear inputs
            document.getElementById('subUser').value = '';
            document.getElementById('subPass').value = '';
            document.getElementById('subError').style.display = 'none';
        }
    }

    function closePaywall() {
        const overlay = document.getElementById('paywallOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    function attemptLogin() {
        const userIn = document.getElementById('subUser').value.trim();
        const passIn = document.getElementById('subPass').value.trim();
        const errorDiv = document.getElementById('subError');
        const btn = document.querySelector('.paywall-btn');

        errorDiv.style.display = 'none';

        if (!userIn || !passIn) {
            showError('请输入完整的账号和密码');
            return;
        }

        btn.innerHTML = '验证中... 🔄';

        // Simulate Network Delay
        setTimeout(() => {
            // 1. Find User
            const userRecord = MOCK_DB.find(u => u.username === userIn && u.password === passIn);

            if (!userRecord) {
                showError('账号或密码错误');
                btn.innerHTML = '立即登录';
                return;
            }

            // 2. Check Expiry
            if (!checkExpiry(userRecord.expiry)) {
                showError(`会员已过期 (有效期至 ${userRecord.expiry})`);
                btn.innerHTML = '立即登录';
                return;
            }

            // 3. Success
            currentUser = userRecord;
            localStorage.setItem('vip_user', JSON.stringify(currentUser));

            btn.innerHTML = '验证成功！🎉';
            btn.style.background = '#22c55e';

            setTimeout(() => {
                closePaywall();
                updateUI(); // Unlock interface
                location.reload(); // Hard refresh to apply all states
            }, 800);

        }, 800);
    }

    function showError(msg) {
        const errorDiv = document.getElementById('subError');
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';

        // Shake animation
        const card = document.querySelector('.paywall-card');
        card.style.transform = 'translateX(10px)';
        setTimeout(() => card.style.transform = 'translateX(-10px)', 100);
        setTimeout(() => card.style.transform = 'translateX(0)', 200);
    }

    function updateUI() {
        // Trigger Launchpad Re-render if available
        if (typeof Launchpad !== 'undefined' && Launchpad.init) {
            // In a perfect world we would have a re-render method exposed.
            // For now, reload handles it.
        }
    }

    function attachGlobalListeners() {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
                    checkAccess(e, href);
                }
            }
        }, true);
    }

    // --- Admin Tools (For Console Use) ---
    function generateUser(username, password, monthsValidity = 12) {
        const date = new Date();
        date.setMonth(date.getMonth() + monthsValidity);
        const expiryStr = date.toISOString().split('T')[0];

        const newUser = {
            username: username,
            password: password,
            expiry: expiryStr
        };

        console.log("✅ New User Generated (Copy relevant JSON to MOCK_DB):");
        console.log(JSON.stringify(newUser, null, 2));
        return newUser;
    }

    return {
        init,
        isPremium,
        checkAccess,
        showPaywall,
        closePaywall,
        attemptLogin,
        isSubscribed: () => !!currentUser,
        // Admin Tool Exposed
        Admin: {
            generateUser
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    SubscriptionManager.init();
});
