// Subscription Manager - Supabase Edition (Clean Version v3.0)
const SubscriptionManager = {
    client: null,
    user: null,
    profile: null,
    isReady: false,

    // Free Access Configuration (Always accessible even without login/VIP)
    FREE_PAGES: [
        'blog.html', 'post-4.html', 'post-6.html', 'competition-atlas.html',
        'subject-synergy.html', 'wiki.html', 'forum.html', 'index.html', 'profile.html',
        'english.html', 'design.html', 'ai-art.html', 'music.html', 'fintech.html',
        'course-rocketry.html', 'course-openclaw.html', 'psyche_x_system/index.html', 'psyche_x_system/hub.html', '#', '/'
    ],

    init: async function () {
        console.log('SubscriptionManager: Initializing...');

        // 1. Check Config
        if (typeof SUPABASE_CONFIG === 'undefined') {
            console.warn('⚠️ Supabase Config Missing');
            return;
        }

        // 2. Init Client
        try {
            if (typeof supabase === 'undefined') {
                console.error('CRITICAL: Supabase SDK not loaded.');
            } else {
                this.client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
            }
        } catch (e) {
            console.error("Supabase init failed:", e);
        }

        // 3. Check Session
        if (this.client) {
            try {
                const { data: { session } } = await this.client.auth.getSession();
                if (session) {
                    console.log('User logged in:', session.user);
                    this.user = session.user;
                    await this.fetchProfile();
                }
            } catch (e) {
                console.error("Error checking session:", e);
            }

            // 4. Auth State Listener
            this.client.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth State Change:', event);
                if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
                    this.user = session.user;
                    await this.fetchProfile();
                    this.hideAuthModal();
                } else if (event === 'SIGNED_OUT') {
                    this.user = null;
                    this.profile = null;
                    this.updateUI();
                    this.updateDockAuthButton(false);
                    if (window.location.pathname.includes('profile.html')) {
                        window.location.href = 'index.html';
                    }
                }
            });
        }

        // 5. Bind Events & Global Interceptors
        this.bindEvents();
        this.bindGlobalPaywall();

        // 6. Check Page Access (URL Protection)
        this.checkPageAccess();

        console.log('SubscriptionManager: Ready');
        this.isReady = true;
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
                console.log('New User Detected: Initializing Data...');
                await this.initNewUser();
                // Data will be re-fetched or set locally
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

        } catch (e) {
            console.error('Profile fetch unexpected error:', e);
        }
    },

    initNewUser: async function () {
        if (!this.user) return;
        const uEmail = this.user.email;
        const uName = this.user.user_metadata.username || uEmail.split('@')[0];

        // REMOVED: No more default VIP for new users. They must use a voucher.
        const defaultExpiry = null; 

        try {
            // 1. Init Profile
            const { error: pError } = await this.client.from('profiles').upsert({
                id: this.user.id,
                username: uName,
                expiry_date: defaultExpiry, 
                updated_at: new Date()
            });
            if (pError) throw pError;

            // 2. Init Dashboard Data
            const { error: dError } = await this.client.from('user_dashboard_data').upsert({
                username: uEmail,
                is_logged_in: true,
                prog_self: 10,
                prog_basic: 5,
                mod_launch: true
            });
            if (dError) throw dError;

            console.log('User Data Initialized in DB (Standard User)');
            
            this.profile = { username: uName, expiry_date: defaultExpiry };
            
        } catch (err) {
            console.error('initNewUser failed:', err);
        }
    },

    // --- UI Updates ---

    updateDockAuthButton: function (isLoggedIn) {
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

    // --- Page Level Protection ---

    checkPageAccess: function () {
        if (typeof window === 'undefined') return;

        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);

        if (!page || page === '/' || page === 'index.html') return;
        if (this.FREE_PAGES.some(p => p === page || path.endsWith(p))) return;

        // Strict Protection: Use localStorage for immediate bounce
        const hasLocalCreds = localStorage.getItem('current_user_email') ||
            localStorage.getItem('sb-' + SUPABASE_CONFIG.url.split('//')[1].split('.')[0] + '-auth-token');

        if (!hasLocalCreds) {
            console.warn('⛔ Access Denied: No credentials found.');
            document.body.style.display = 'none';
            alert('🔒 会员专享页面\n\n请先登录以验证您的会员身份。');
            window.location.href = 'index.html';
        }
    },

    // --- Actions ---

    handleLogin: async function (username, password) {
        const email = this.smartFormatEmail(username);
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            localStorage.setItem('current_user_email', data.user.email);
            alert('🎉 登录成功！');
            this.hideAuthModal();
            window.location.reload();
        } catch (e) {
            console.error(e);
            let msg = e.message;
            if (msg.includes("Invalid login credentials")) msg = "账号或密码错误";
            alert('登录失败: ' + msg);
        }
    },

    handleRegister: async function (username, password) {
        // VALIDATION: Must be email or 11-digit phone number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
        const isPhone = /^\d{11}$/.test(username);

        if (!isEmail && !isPhone) {
            alert('⚠️ 注册失败：请使用有效的手机号（11位数字）或电子邮箱进行注册。');
            return;
        }

        const email = this.smartFormatEmail(username);
        console.log(`Attempting register with: ${email}`);

        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { username: username }
                }
            });

            if (error) throw error;

            if (data.session) {
                alert('🎉 注册成功并已登录！所有模块已解锁服务。');
                localStorage.setItem('current_user_email', data.user.email);
                window.location.reload();
            } else {
                alert('✅ 注册申请已提交！\n\n请确认您的注册信息或联系管理员人工审核。');
                this.toggleAuthMode();
            }
        } catch (e) {
            console.error(e);
            alert('注册失败: ' + e.message);
        }
    },

    smartFormatEmail: function (input) {
        input = input.trim();
        if (input.includes('@')) return input;
        if (/^\d+$/.test(input)) {
            return `${input}@phone.ai-playground.com`;
        }
        return `${input}@ai-playground.com`;
    },

    handleLogout: async function () {
        if (this.client) await this.client.auth.signOut();
        localStorage.removeItem('current_user_email');
        alert('已退出登录');
        window.location.href = 'index.html';
    },

    redeemVoucher: async function () {
        const codeInput = document.getElementById('voucher-code');
        const rawCode = codeInput.value.trim();
        const code = rawCode.toUpperCase(); // Normalize for safety

        if (!code) { alert('请输入卡密'); return; }
        if (!this.user) { alert('请先登录'); return; }

        console.log(`Checking Voucher: ${code}...`);

        try {
            // 1. Fetch Voucher (Case insensitive comparison already handled by .toUpperCase())
            const { data: voucher, error: vError } = await this.client
                .from('vouchers')
                .select('*')
                .eq('code', code)
                .single();

            if (vError) {
                console.error('Database query error:', vError);
                throw new Error('卡密无效（未在数据库中找到）');
            }
            if (!voucher) throw new Error('卡密无效');
            if (voucher.status === 'used') throw new Error('此卡密已被使用');

            // 2. Calculate New Expiry (Force to 2026-12-31 as default, or extend)
            let currentExpiry = new Date();
            if (this.profile && this.profile.expiry_date) {
                const existing = new Date(this.profile.expiry_date);
                if (existing > new Date()) currentExpiry = existing;
            }
            const duration = voucher.duration_months || 12;
            currentExpiry.setMonth(currentExpiry.getMonth() + duration);

            // 3. Update User Profile
            const { error: pError } = await this.client
                .from('profiles')
                .upsert({
                    id: this.user.id,
                    expiry_date: currentExpiry.toISOString(),
                    username: this.profile?.username || this.user.email.split('@')[0],
                    updated_at: new Date()
                });

            if (pError) throw new Error('更新会员期限出错: ' + pError.message);

            // 4. Update Voucher Status
            const { error: vUpdateError } = await this.client
                .from('vouchers')
                .update({ status: 'used', used_by: this.user.id })
                .eq('id', voucher.id);

            if (vUpdateError) {
                console.warn('Voucher mark as used failed (probably RLS), but profile updated.');
                // We keep going if profile updated, but ideally vouchers table should be writeable
            }

            alert('🎉 充值成功！\n您的会员有效期已延长至: ' + currentExpiry.toLocaleDateString());
            window.location.reload();

        } catch (e) {
            console.error('Redeem Error:', e);
            alert('❌ 兑换失败: ' + e.message);
        }
    },

    // --- Access Control Helpers ---

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

    isPremium: function (link) {
        if (!link) return false;
        const cleanLink = link.split('?')[0].split('#')[0];
        const fileName = cleanLink.substring(cleanLink.lastIndexOf('/') + 1);
        if (fileName === '' || fileName === 'index.html' || fileName === '/') return false;
        if (!this.FREE_PAGES) return true;
        return !this.FREE_PAGES.some(page => fileName === page || link.endsWith(page));
    },

    isSubscribed: function () {
        if (!this.user) return false; 
        const status = this.getSubscriptionStatus();
        return status.isVIP;
    },

    checkAccess: function (e, link) {
        if (!this.isReady) return true; // Fail open during init
        if (this.isSubscribed()) return true;
        if (!this.isPremium(link)) return true;

        e.preventDefault();
        e.stopPropagation();
        this.showPaywall();
        return false;
    },

    // --- UI Interactions ---

    showPaywall: function () {
        this.showAuthModal();
        const modal = document.getElementById('auth-modal');
        if (modal) {
            const title = modal.querySelector('h2');
            if (title) title.innerHTML = '🔒 会员专享中心<br><small style="font-size:12px; color:#ff8c94; font-weight:normal;">联系客服(微信: 13699466775) 限时领取季度激活码</small>';
        }
    },

    showAuthModal: function () {
        let modal = document.getElementById('auth-modal');
        if (!modal) {
            this.createAuthModalHTML();
            modal = document.getElementById('auth-modal');
        }
        modal.style.display = 'flex';
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
            if (title) title.innerHTML = '注册账号';
            if (submitBtn) submitBtn.textContent = '注册';
            if (switchText) switchText.innerHTML = '已有账号？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">去登录</a>';
        } else {
            modal.setAttribute('data-mode', 'login');
            if (title) title.innerHTML = '账号登录';
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
            <div style="background: rgba(255,140,148,0.1); border: 1px dashed #ff8c94; padding: 10px; border-radius: 10px; margin-bottom: 20px; font-size: 13px; color: #ff8c94; text-align: center;">
                🎁 提示：联系客服获取激活码<br><b>微信：13699466775</b>
            </div>
            <form class="auth-form">
                <input type="text" class="auth-input" placeholder="输入手机号或邮箱" required>
                <input type="password" class="auth-input" placeholder="输入密码" required>
                <button type="submit" class="auth-submit-btn">确认</button>
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
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('mailto')) return;
                this.checkAccess(e, href);
            }
        }, true);
    }
};

window.SubscriptionManager = SubscriptionManager;
document.addEventListener('DOMContentLoaded', () => SubscriptionManager.init());
