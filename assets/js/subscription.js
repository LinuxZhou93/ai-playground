// Subscription Manager - Supabase Edition
const SubscriptionManager = {
    client: null,
    user: null,
    profile: null,

    // Free Access Configuration
    FREE_PAGES: [
        'blog.html', 'post-4.html', 'post-6.html', 'competition-atlas.html',
        'subject-synergy.html', 'wiki.html', 'forum.html', 'index.html', 'profile.html', '#', '/'
    ],

    init: async function () {
        console.log('SubscriptionManager: Initializing Supabase...');

        // 1. Check Config
        if (typeof SUPABASE_CONFIG === 'undefined' ||
            !SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes("YOUR_SUPABASE_URL")) {
            console.warn('⚠️ Supabase config not found or invalid.');
            this.updateDockAuthButton(false);
            return;
        }

        // 2. Init Client
        try {
            if (typeof supabase === 'undefined') {
                console.error('Supabase SDK not loaded');
                return;
            }
            this.client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        } catch (e) {
            console.error("Supabase init failed:", e);
            return;
        }

        // 3. Check Session
        try {
            const { data: { session } } = await this.client.auth.getSession();

            if (session) {
                console.log('User logged in:', session.user);
                this.user = session.user;
                await this.fetchProfile();
            } else {
                console.log('No active session');
                this.updateDockAuthButton(false);
            }
        } catch (e) {
            console.error("Error checking session:", e);
        }

        // 4. Bind Events
        this.bindEvents();
        this.bindGlobalPaywall();

        // 5. Auth State Listener
        this.client.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth State Change:', event);
            if (event === 'SIGNED_IN' && session) {
                this.user = session.user;
                await this.fetchProfile();
                this.hideAuthModal();
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.profile = null;
                this.updateDockAuthButton(false);
                if (window.location.pathname.includes('profile.html')) {
                    window.location.href = 'index.html';
                }
            }
        });
    },

    // --- Data Fetching ---

    fetchProfile: async function () {
        if (!this.user) return;

        try {
            const { data, error } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
                return;
            }

            if (!data) {
                this.profile = {
                    username: this.user.user_metadata.username || this.user.email.split('@')[0],
                    expiry_date: null
                };
            } else {
                this.profile = data;
            }

            this.updateUI();
            this.updateDockAuthButton(true);

            // Dispatch event for other components
            const status = this.getSubscriptionStatus();
            window.dispatchEvent(new CustomEvent('subscription_updated', {
                detail: status
            }));

        } catch (e) {
            console.error('Profile fetch unexpected error:', e);
        }
    },

    // --- UI Updates ---

    updateDockAuthButton: function (isLoggedIn) {
        // Update the specific auth button in the header/dock if it exists
        const specificAuthBtn = document.getElementById('auth-btn');
        if (specificAuthBtn) {
            if (isLoggedIn) {
                specificAuthBtn.href = 'profile.html';
                specificAuthBtn.innerHTML = `<span class="slot-icon">👤</span><span class="slot-label">个人中心</span>`;
                specificAuthBtn.onclick = null;
            } else {
                specificAuthBtn.href = 'javascript:void(0)';
                specificAuthBtn.innerHTML = `<span class="slot-icon">🔒</span><span class="slot-label">登录/注册</span>`;
                specificAuthBtn.onclick = (e) => {
                    e.preventDefault();
                    this.showAuthModal();
                };
            }
        }
    },

    updateUI: function () {
        if (!document.getElementById('user-name-display')) return;

        const status = this.getSubscriptionStatus();
        const username = this.profile?.username || this.user?.user_metadata?.username || '用户';

        document.getElementById('user-name-display').textContent = username;
        document.getElementById('user-role-display').textContent = status.isVIP ? 'VIP会员' : '普通用户';

        const validUntil = status.expiryDate ? new Date(status.expiryDate).toLocaleDateString() : '未开通';
        const expiryDisplay = document.getElementById('user-expiry-display');
        if (expiryDisplay) expiryDisplay.textContent = validUntil;

        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            if (status.isVIP) {
                avatar.style.border = '3px solid #ffd700';
                document.getElementById('user-role-display').style.color = '#ffd700';
            } else {
                avatar.style.border = '3px solid #666';
                document.getElementById('user-role-display').style.color = '#888';
            }
        }
    },

    // --- Actions ---

    handleLogin: async function (username, password) {
        const email = this.usernameToEmail(username);
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) throw error;
            alert('登录成功！');
        } catch (e) {
            console.error(e);
            alert('登录失败: ' + e.message);
        }
    },

    handleRegister: async function (username, password) {
        const email = this.usernameToEmail(username);
        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: { data: { username: username } }
            });
            if (error) throw error;
            alert('注册成功！请直接登录。');
            this.toggleAuthMode();
        } catch (e) {
            console.error(e);
            alert('注册失败: ' + e.message);
        }
    },

    handleLogout: async function () {
        const { error } = await this.client.auth.signOut();
        if (error) console.error('Logout error:', error);
        alert('已退出登录');
        window.location.href = 'index.html';
    },

    redeemVoucher: async function () {
        const codeInput = document.getElementById('voucher-code');
        const code = codeInput.value.trim();

        if (!code) { alert('请输入卡密'); return; }
        if (!this.user) { alert('请先登录'); return; }

        try {
            const { data: voucher, error: vError } = await this.client
                .from('vouchers').select('*').eq('code', code).single();

            if (vError || !voucher) throw new Error('卡密无效');
            if (voucher.status === 'used') throw new Error('此卡密已被使用');

            let currentExpiry = new Date();
            if (this.profile && this.profile.expiry_date) {
                const existing = new Date(this.profile.expiry_date);
                if (existing > new Date()) currentExpiry = existing;
            }

            const duration = voucher.duration_months || 12;
            currentExpiry.setMonth(currentExpiry.getMonth() + duration);

            const { error: updateVError } = await this.client
                .from('vouchers').update({ status: 'used', used_by: this.user.id }).eq('id', voucher.id);

            if (updateVError) throw new Error('核销失败，请重试');

            const { error: updatePError } = await this.client
                .from('profiles').update({ expiry_date: currentExpiry.toISOString() }).eq('id', this.user.id);

            if (updatePError) throw new Error('更新会员状态失败');

            alert(`充值成功！您的会员已延长至 ${currentExpiry.toLocaleDateString()}`);
            await this.fetchProfile();
            codeInput.value = '';

        } catch (e) {
            console.error(e);
            alert(e.message);
        }
    },

    // --- Helpers ---

    getSubscriptionStatus: function () {
        if (!this.profile || !this.profile.expiry_date) {
            return { isVIP: false, expiryDate: null };
        }
        const now = new Date();
        const expiry = new Date(this.profile.expiry_date);
        return {
            isVIP: expiry > now,
            expiryDate: this.profile.expiry_date
        };
    },

    // Legacy / Shared Helpers needed by Launchpad
    isPremium: function (link) {
        if (!link) return false;
        const cleanLink = link.split('?')[0].split('#')[0];
        const fileName = cleanLink.substring(cleanLink.lastIndexOf('/') + 1);
        if (fileName === '' || fileName === 'index.html') return false;
        if (!this.FREE_PAGES) return true;
        return !this.FREE_PAGES.some(page => fileName === page || link.endsWith(page));
    },

    isSubscribed: function () {
        const status = this.getSubscriptionStatus();
        return status.isVIP;
    },

    checkAccess: function (e, link) {
        if (this.isSubscribed()) return true;
        if (!this.isPremium(link)) return true;
        e.preventDefault();
        e.stopPropagation();
        this.showPaywall();
        return false;
    },

    usernameToEmail: function (username) {
        if (username.includes('@')) return username;
        return `${username}@ai-playground.com`;
    },

    // --- UI Interactions ---

    showPaywall: function () {
        this.showAuthModal();
        const modal = document.getElementById('auth-modal');
        if (modal) {
            const title = modal.querySelector('h2');
            if (title) title.textContent = '🔒 会员专享内容';
        }
    },

    showAuthModal: function () {
        let modal = document.getElementById('auth-modal');
        if (!modal) {
            this.createAuthModalHTML();
            modal = document.getElementById('auth-modal');
        }
        modal.style.display = 'flex';
        // Reset title if it was changed by paywall
        const title = modal.querySelector('h2');
        if (modal.getAttribute('data-mode') === 'register') {
            if (title) title.textContent = '注册账号';
        } else {
            if (title) title.textContent = '账号登录';
        }
    },

    hideAuthModal: function () {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'none';
    },

    toggleAuthMode: function () {
        const modal = document.getElementById('auth-modal');
        const isLogin = modal.getAttribute('data-mode') !== 'register';
        const title = modal.querySelector('h2');
        const submitBtn = modal.querySelector('.auth-submit-btn');
        const switchText = modal.querySelector('.auth-switch p');

        if (isLogin) {
            modal.setAttribute('data-mode', 'register');
            if (title) title.textContent = '注册账号';
            if (submitBtn) submitBtn.textContent = '注册';
            if (switchText) switchText.innerHTML = '已有账号？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">去登录</a>';
        } else {
            modal.setAttribute('data-mode', 'login');
            if (title) title.textContent = '账号登录';
            if (submitBtn) submitBtn.textContent = '登录';
            if (switchText) switchText.innerHTML = '没有账号？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">去注册</a>';
        }
    },

    createAuthModalHTML: function () {
        const div = document.createElement('div');
        div.id = 'auth-modal';
        div.className = 'auth-modal';
        div.style.display = 'none';
        div.setAttribute('data-mode', 'login');
        div.innerHTML = `
        <div class="auth-box">
            <span class="auth-close" onclick="SubscriptionManager.hideAuthModal()">×</span>
            <h2>账号登录</h2>
            <form class="auth-form">
                <input type="text" class="auth-input" placeholder="输入账号" required>
                <input type="password" class="auth-input" placeholder="输入密码" required>
                <button type="submit" class="auth-submit-btn">登录</button>
            </form>
            <div class="auth-switch">
                <p>没有账号？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">去注册</a></p>
            </div>
        </div>
        `;
        document.body.appendChild(div);
        this.bindEvents();
    },

    bindEvents: function () {
        const closeBtn = document.querySelector('.auth-close');
        if (closeBtn) closeBtn.onclick = () => this.hideAuthModal();

        const submitBtn = document.querySelector('.auth-submit-btn');
        if (submitBtn) {
            // Replace to remove old listeners
            const newBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newBtn, submitBtn);

            newBtn.onclick = (e) => {
                e.preventDefault();
                const inputs = document.querySelectorAll('.auth-input');
                const username = inputs[0].value.trim();
                const password = inputs[1].value.trim();

                if (!username || !password) {
                    alert('请输入账号和密码');
                    return;
                }

                const modal = document.getElementById('auth-modal');
                const mode = modal.getAttribute('data-mode');

                if (mode === 'register') {
                    this.handleRegister(username, password);
                } else {
                    this.handleLogin(username, password);
                }
            };
        }
    },

    bindGlobalPaywall: function () {
        console.log('🛡️ Global Paywall: Active');
        // Intercept all clicks to check for premium content
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                console.log(`🖱️ Click detected on: ${href}`);

                // Allow simple anchors, javascript calls, mailto
                if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('mailto')) {
                    return;
                }

                // Check Access
                const allowed = this.checkAccess(e, href);
                if (!allowed) {
                    console.log(`🚫 Access Denied: ${href}`);
                } else {
                    console.log(`✅ Access Granted: ${href}`);
                }
            }
        }, true); // Use capture phase to ensure we catch it first
    },

    // --- Access Control Helpers ---

    isPremium: function (link) {
        if (!link) return false;

        // Normalize: remove query/hash, get path part
        // Handle absolute URLs if necessary, but mostly relative
        const cleanLink = link.split('?')[0].split('#')[0];
        const fileName = cleanLink.substring(cleanLink.lastIndexOf('/') + 1);

        console.log(`🔍 Checking access for: ${fileName}`);

        // Base Rules
        if (fileName === '' || fileName === 'index.html' || fileName === '/') return false;

        // Whitelist Check
        if (!this.FREE_PAGES) return true;

        // Check if explicitly free
        const isFree = this.FREE_PAGES.some(page => fileName === page || link.endsWith(page));

        return !isFree; // If not free, it is premium
    },

    isSubscribed: function () {
        if (!this.user) return false; // No user = Not subscribed
        const status = this.getSubscriptionStatus();
        return status.isVIP;
    },

    checkAccess: function (e, link) {
        // 1. VIP allows all
        if (this.isSubscribed()) {
            console.log('User is VIP. Access granted.');
            return true;
        }

        // 2. Free page allows all
        if (!this.isPremium(link)) {
            console.log('Page is Free. Access granted.');
            return true;
        }

        // 3. Otherwise, Block
        e.preventDefault();
        e.stopPropagation(); // Stop other listeners
        e.stopImmediatePropagation(); // REALLY stop others
        this.showPaywall();
        return false;
    },
};

// Auto Init
document.addEventListener('DOMContentLoaded', () => {
    // Explicitly expose to window to ensure Launchpad can find it
    window.SubscriptionManager = SubscriptionManager;
    SubscriptionManager.init();
});
