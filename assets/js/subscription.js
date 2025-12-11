// Subscription Manager - Supabase Edition
const SubscriptionManager = {
    client: null,
    user: null,
    profile: null,

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
            // Assume supabase global is available from CDN
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

        // 5. Auth State Listener
        this.client.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth State Change:', event);
            if (event === 'SIGNED_IN' && session) {
                this.user = session.user;
                await this.fetchProfile();
                // Close modal if open
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

            // If no profile exists (should be handled by trigger, but just in case)
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

            // Dispatch event for other components (like Launchpad)
            const status = this.getSubscriptionStatus();
            window.dispatchEvent(new CustomEvent('subscription_updated', {
                detail: status
            }));

            // Should also persist to local storage for other synchronous checks if needed, 
            // but relying on memory state is safer for Single Page App feel.

        } catch (e) {
            console.error('Profile fetch unexpected error:', e);
        }
    },

    // --- UI Updates ---

    updateDockAuthButton: function (isLoggedIn) {
        const btn = document.getElementById('auth-btn'); // For index.html
        // Also check if we are on profile page, maybe we want to update header? 
        // But mainly this is for the dock button.

        // If btn not found, try finding by ID or class used in Launchpad/Dock
        // The dock button was <a href="..." id="auth-btn">...</a> or similar
        // Let's try to find it generically if id is missing or different
        const dockBtn = document.getElementById('launchpad-personal-center') || document.querySelector('a[href*="profile.html"]');

        if (dockBtn) {
            // It's already linking to profile, so we just leave it unless we want to change icon
            // But if it's the specific auth button we added:
            // logic here depends on how index.html dock is structured. 
        }

        // Specifically for the header/dock login button created in previous steps
        const specificAuthBtn = document.getElementById('auth-btn');
        if (specificAuthBtn) {
            if (isLoggedIn) {
                specificAuthBtn.href = 'profile.html';
                specificAuthBtn.innerHTML = `<span class="slot-icon">👤</span><span class="slot-label">个人中心</span>`;
                specificAuthBtn.onclick = null; // Remove binding
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
        // Only run on profile page
        if (!document.getElementById('user-name-display')) return;

        const status = this.getSubscriptionStatus();
        const username = this.profile?.username || this.user?.user_metadata?.username || '用户';

        // Update Text
        document.getElementById('user-name-display').textContent = username;
        document.getElementById('user-role-display').textContent = status.isVIP ? 'VIP会员' : '普通用户';

        const validUntil = status.expiryDate ? new Date(status.expiryDate).toLocaleDateString() : '未开通';
        const expiryDisplay = document.getElementById('user-expiry-display');
        if (expiryDisplay) expiryDisplay.textContent = validUntil;

        // Update Visuals
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
        console.log(`Attempting login for ${email}`);

        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }
            alert('登录成功！');

        } catch (e) {
            console.error(e);
            alert('登录失败: ' + e.message);
        }
    },

    handleRegister: async function (username, password) {
        const email = this.usernameToEmail(username);
        console.log(`Attempting register for ${email}`);

        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username // Metadata for profile trigger
                    }
                }
            });

            if (error) throw error;

            alert('注册成功！请直接登录。');
            this.toggleAuthMode(); // Switch back to login

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

        if (!code) {
            alert('请输入卡密');
            return;
        }

        if (!this.user) {
            alert('请先登录');
            return;
        }

        try {
            // 1. Check Voucher
            const { data: voucher, error: vError } = await this.client
                .from('vouchers')
                .select('*')
                .eq('code', code)
                .single();

            if (vError || !voucher) {
                throw new Error('卡密无效');
            }

            if (voucher.status === 'used') {
                throw new Error('此卡密已被使用');
            }

            // 2. Calculate New Expiry
            let currentExpiry = new Date();
            // If user already has valid expiry in future, extend from there
            if (this.profile && this.profile.expiry_date) {
                const existing = new Date(this.profile.expiry_date);
                if (existing > new Date()) currentExpiry = existing;
            }

            // Add months (default 12)
            const duration = voucher.duration_months || 12;
            currentExpiry.setMonth(currentExpiry.getMonth() + duration);

            // 3. Update Voucher Status (Mark as used)
            // Note: Optimistic update or transaction would be better, but keeping simple
            const { error: updateVError } = await this.client
                .from('vouchers')
                .update({
                    status: 'used',
                    used_by: this.user.id
                })
                .eq('id', voucher.id);

            if (updateVError) throw new Error('核销失败，请重试');

            // 4. Update Profile
            const { error: updatePError } = await this.client
                .from('profiles')
                .update({
                    expiry_date: currentExpiry.toISOString()
                })
                .eq('id', this.user.id);

            if (updatePError) throw new Error('更新会员状态失败');

            alert(`充值成功！您的会员已延长至 ${currentExpiry.toLocaleDateString()}`);

            // Refresh local state
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

    usernameToEmail: function (username) {
        // Helper to fake emails for simple usernames
        if (username.includes('@')) return username;
        return `${username}@ai-playground.com`;
    },

    // --- UI Interactions ---

    showAuthModal: function () {
        // Create modal if it doesn't exist (or just assume it is in HTML)
        let modal = document.getElementById('auth-modal');
        if (!modal) {
            console.log('Creating auth modal...');
            this.createAuthModalHTML();
            modal = document.getElementById('auth-modal');
        }
        modal.style.display = 'flex';
        // Ensure default is login
        if (modal.getAttribute('data-mode') === 'register') {
            this.toggleAuthMode();
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
            // Switch to RegisterMode
            modal.setAttribute('data-mode', 'register');
            if (title) title.textContent = '注册账号';
            if (submitBtn) submitBtn.textContent = '注册';
            if (switchText) switchText.innerHTML = '已有账号？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">去登录</a>';
        } else {
            // Switch to LoginMode
            modal.setAttribute('data-mode', 'login');
            if (title) title.textContent = '账号登录';
            if (submitBtn) submitBtn.textContent = '登录';
            if (switchText) switchText.innerHTML = '没有账号？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">去注册</a>';
        }
    },

    createAuthModalHTML: function () {
        // Fallback if modal not present in HTML
        const div = document.createElement('div');
        div.id = 'auth-modal';
        div.className = 'auth-modal';
        div.style.display = 'none'; // hidden by default
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

        // Re-bind events since we just added elements
        this.bindEvents();
    },

    bindEvents: function () {
        // Modal Close
        const closeBtn = document.querySelector('.auth-close');
        if (closeBtn) closeBtn.onclick = () => this.hideAuthModal();

        // Auth Form Submit
        const submitBtn = document.querySelector('.auth-submit-btn');

        if (submitBtn) {
            // Remove old listeners using clone or just reassignment
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

        // Global Paywall / Lock intercept (optional, if using old logic)
        // Leaving this out for now to focus on Login/Profile flow
    }
};

// Auto Init
document.addEventListener('DOMContentLoaded', () => {
    SubscriptionManager.init();
});
