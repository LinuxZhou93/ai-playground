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
        console.log('SubscriptionManager: Initializing...');

        // 1. Check Config
        if (typeof SUPABASE_CONFIG === 'undefined') {
            console.warn('⚠️ Supabase Config Missing');
            alert('系统配置加载失败 (Config Missing)');
            return;
        }

        // 2. Init Client (Safe Check)
        try {
            if (typeof supabase === 'undefined') {
                console.error('CRITICAL: Supabase SDK not loaded.');
                this.client = null;
                // Don't return, keep the object alive so UI doesn't crash
            } else {
                this.client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
            }
        } catch (e) {
            console.error("Supabase init failed:", e);
        }

        // 3. Check Session (Only if client exists)
        if (this.client) {
            try {
                const { data: { session } } = await this.client.auth.getSession();
                if (session) {
                    console.log('User logged in:', session.user);
                    this.user = session.user;
                    await this.fetchProfile();
                } else {
                    console.log('No active session');
                }
            } catch (e) {
                console.error("Error checking session:", e);
            }
        } else {
            console.warn('Skipping session check (No Client)');
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
                // First Time User: Initialize DB
                console.log('New User Detected: Initializing Data...');
                await this.initNewUser();

                // Fallback Mock while initializing
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

    initNewUser: async function () {
        if (!this.user) return;
        const uEmail = this.user.email;
        const uName = this.user.user_metadata.username || uEmail.split('@')[0];

        // 1. Init Profile
        await this.client.from('profiles').upsert({
            id: this.user.id,
            username: uName,
            updated_at: new Date()
        });

        // 2. Init Dashboard Data (For Admin Panel Visibility)
        await this.client.from('user_dashboard_data').upsert({
            username: uEmail, // Using Email as PK for dashboard table as per schema
            is_logged_in: true,
            prog_self: 10,  // Default starter values
            prog_basic: 5,
            mod_launch: true
        });
        console.log('User Data Initialized in DB');
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
        // Auto-detect phone number or pure username
        const email = this.smartFormatEmail(username);
        console.log(`Attempting login with: ${email}`);

        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log('Login Success, persisting session:', data.user.email);
            localStorage.setItem('current_user_email', data.user.email);

            alert('🎉 登录成功！');
            this.hideAuthModal();
            window.location.reload();
        } catch (e) {
            console.error(e);
            let msg = e.message;
            if (msg.includes("Invalid login credentials")) msg = "账号或密码错误";
            if (msg.includes("Email not confirmed")) msg = "请前往邮箱确认验证链接，或联系管理员关闭邮箱验证。";
            alert('登录失败: ' + msg);
        }
    },

    handleRegister: async function (username, password) {
        const email = this.smartFormatEmail(username);
        console.log(`Attempting register with: ${email}`);

        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { username: username } // Store original username/phone
                }
            });

            if (error) throw error;

            // Check if session exists (Auto Confirm ON) or not (Email Confirm ON)
            if (data.session) {
                alert('🎉 注册成功并已登录！');
                this.toggleAuthMode(); // Close modal or switch mode
            } else {
                alert('✅ 注册申请已提交！\n\n如果Supabase开启了邮箱验证，请查收邮件。\n如果没有开启，请直接尝试登录。');
                // Switch to login mode
                this.toggleAuthMode();
            }
        } catch (e) {
            console.error(e);
            alert('注册失败: ' + e.message);
        }
    },

    // Helper: Turn Phone/Username into Email
    smartFormatEmail: function (input) {
        input = input.trim();
        // If already email, return as is
        if (input.includes('@')) return input;

        // If pure numbers (Phone), append phone domain
        if (/^\d+$/.test(input)) {
            return `${input}@phone.ai-playground.com`;
        }

        // If regular username, append default domain
        return `${input}@ai-playground.com`;
    },

    handleLogout: async function () {
        const { error } = await this.client.auth.signOut();
        if (error) console.error('Logout error:', error);

        localStorage.removeItem('current_user_email');
        localStorage.removeItem('dify_conversation_id');

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
            // Override: Force expiry to 2026-12-31 as requested
            currentExpiry = new Date('2026-12-31T23:59:59');

            // Old Logic kept for reference:
            /*
            if (this.profile && this.profile.expiry_date) {
                const existing = new Date(this.profile.expiry_date);
                if (existing > new Date()) currentExpiry = existing;
            }
            const duration = voucher.duration_months || 12;
            currentExpiry.setMonth(currentExpiry.getMonth() + duration);
            */

            // 3. Update User Profile
            // Handle case where profile might indicate success but return no data
            const { error: pError } = await this.client
                .from('profiles')
                .upsert({
                    id: this.user.id,
                    expiry_date: currentExpiry.toISOString(),
                    username: this.profile?.username || this.user.email.split('@')[0]
                }); // Use upsert to create if missing

            if (pError) throw new Error('更新用户档案失败: ' + pError.message);

            // 4. Update Voucher Status
            const { error: vUpdateError } = await this.client
                .from('vouchers')
                .update({ status: 'used', used_by: this.user.id })
                .eq('id', voucher.id);

            if (vUpdateError) throw new Error('核销卡密失败(RLS): ' + vUpdateError.message);

            alert('🎉 充值成功！\n会员有效期至: ' + currentExpiry.toLocaleDateString());

            // Refresh
            await this.fetchProfile();
            window.location.reload();

        } catch (e) {
            console.error('Redeem Error:', e);
            alert('❌ 兑换失败: ' + e.message + '\n\n(请检查Supabase的RLS策略是否允许用户更新vouchers表)');
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
        if (!this.client) {
            alert('错误：无法连接到登录服务 (Supabase SDK Failed)。\n请尝试刷新页面或检查网络。');
            return;
        }

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
window.SubscriptionManager = SubscriptionManager;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Ready, initializing SubscriptionManager...');
        SubscriptionManager.init();
    });
}
