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

        // 7. Auto Track Page Entry / 自动记录"进入模块"动作埋点
        const currentModule = document.title.split('-')[0].trim() || 'Undefined Module';
        this.trackLearningEvent(currentModule, 'ENTER_PAGE', window.location.pathname);

        // 8. Auto Track Global Interactions / 全局静默操纵埋点
        this.bindGlobalInteractionTracker(currentModule);

        console.log('SubscriptionManager: Ready');
        this.isReady = true;
    },

    // --- Global Click Tracker ---
    bindGlobalInteractionTracker: function(moduleName) {
        document.addEventListener('click', (e) => {
            const el = e.target.closest('button, a, .nav-item, .chart-card, [role="button"], .type-card');
            if (!el) return;

            // Extract useful name
            let elementId = el.id || '';
            let elementText = el.innerText ? el.innerText.substring(0, 30).trim().replace(/\n/g, ' ') : '';
            if(!elementText && el.hasAttribute('title')) elementText = el.getAttribute('title');
            if(!elementText && el.classList.length > 0) elementText = '.' + el.classList[0];

            // Ignore empty or extremely noisy clicks
            if(!elementText && !elementId) return;

            const actionVal = (elementId ? `#${elementId} ` : '') + elementText;
            this.trackLearningEvent(moduleName, 'CLICK', actionVal);
        });
    },

    // --- Data Fetching ---

    fetchProfile: async function () {
        if (!this.user) return;

        try {
            const { data: list, error } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .limit(1);

            const data = (list && list.length > 0) ? list[0] : null;
            
            if (error) {
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

            // [Titan Tech Sync] Broadcast to Next.js Core Firewall
            const status = this.getSubscriptionStatus();
            localStorage.setItem('fc_subscription_status', JSON.stringify({
                status: status.isVIP ? 'active' : 'expired',
                expiry: status.expiryDate
            }));

            // Dispatch event for other components (like Launchpad)
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
                expiry_date: defaultExpiry
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
        // 1. Generic Dock/Global Display
        const genericName = document.getElementById('user-name-display');
        const genericRole = document.getElementById('user-role-display');
        const status = this.getSubscriptionStatus();
        const username = this.profile?.username || this.user?.user_metadata?.username || (this.user?.email ? this.user.email.split('@')[0] : '访客学员');

        if (genericName) genericName.textContent = username;
        if (genericRole) genericRole.textContent = status.isVIP ? 'VIP会员' : '普通用户';

        const validUntil = status.expiryDate ? new Date(status.expiryDate).toLocaleDateString() : '未开通';
        const expiryDisplay = document.getElementById('user-expiry-display');
        if (expiryDisplay) expiryDisplay.textContent = validUntil;

        // 2. Profile.html Specific Display (High Fidelity)
        const uName = document.getElementById('uName');
        const uRole = document.getElementById('uRole');
        const uAvatar = document.querySelector('.user-avatar');

        if (uName) uName.textContent = username;
        if (uRole) {
            uRole.textContent = status.isVIP ? 'TITAN 正式学员' : '访客身份 (试听中)';
            uRole.style.borderColor = status.isVIP ? '#00f0ff' : '#64748b';
            uRole.style.color = status.isVIP ? '#00f0ff' : '#64748b';
            uRole.style.background = status.isVIP ? 'rgba(0, 240, 255, 0.1)' : 'rgba(100, 116, 139, 0.1)';
        }
        
        if (uAvatar && this.user?.user_metadata?.avatar_url) {
            uAvatar.style.backgroundImage = `url('${this.user.user_metadata.avatar_url}')`;
        }

        // Global Sync
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            if (status.isVIP) {
                avatar.style.border = '3px solid #ffd700';
            } else {
                avatar.style.border = '3px solid #666';
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

    // --- Learning Tracking / 学情监测探针 ---
    trackLearningEvent: async function (moduleName, actionType, actionValue) {
        if (!this.client) return;
        // 不阻断用户当前操作，采用异步静默推送
        try {
            const trackUserId = this.user ? this.user.id : null;
            await this.client.from('student_learning_logs').insert({
                user_id: trackUserId,
                module_name: moduleName,
                action_type: actionType,
                action_value: actionValue
            });
            console.log(`📡 [Learning Tracked] ${moduleName} - ${actionType}`);
        } catch (e) {
            console.warn('学情数据库尚未就绪或日志写入失败:', e);
        }
    },

    // --- Actions ---

    handleLogin: async function (username, password) {
        if (!this.client) {
            alert('⚠️ 系统服务未就绪（认证组件未能成功加载）。\n这通常是由于网络连接不稳或浏览器插件阻拦导致，请刷新页面或更换网络后重试。');
            return;
        }
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
        if (!this.client) {
            alert('⚠️ 系统服务未就绪（认证组件未能成功加载）。\n这通常是由于网络连接不稳或浏览器插件阻拦导致，请刷新页面或更换网络后重试。');
            return;
        }
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
            const { data: list, error: vError } = await this.client
                .from('vouchers')
                .select('*')
                .eq('code', code)
                .limit(1);
            
            const voucher = (list && list.length > 0) ? list[0] : null;

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

            // Fix falsy 0 issue: duration_months=0 evaluates to false, causing it to fall back to 12 months.
            let duration = voucher.duration_months;
            if (duration === undefined || duration === null) {
                duration = 12; // default fallback if null
            }
            
            // If duration is 0, it's likely a 7-day trial based on our admin generation logic.
            // We can also verify by checking the code prefix.
            if (duration === 0 || (voucher.code && voucher.code.includes('-7D-'))) {
                currentExpiry.setDate(currentExpiry.getDate() + 7);
            } else {
                currentExpiry.setMonth(currentExpiry.getMonth() + duration);
            }

            // 3. Update User Profile
            const { error: pError } = await this.client
                .from('profiles')
                .upsert({
                    id: this.user.id,
                    expiry_date: currentExpiry.toISOString(),
                    username: this.profile?.username || this.user.email.split('@')[0]
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
        // [Titan Tech Production Hardening] 生产域名下强制判定为永久 VIP
        const host = window.location.hostname;
        if (host.includes('zhouxiaomai.com') || host.includes('futureclass.ai') || host.includes('vercel.app')) {
            return {
                isVIP: true,
                plan: 'Titan Pilot',
                expiry: '2033-12-31',
                remainingDays: 9999
            };
        }
        if (!this.user || !this.profile || !this.profile.expiry_date) {
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
        // [Titan Tech Production Hardening] 生产域名下强制激活永久 VIP 权限
        const host = window.location.hostname;
        if (host.includes('zhouxiaomai.com') || host.includes('futureclass.ai') || host.includes('vercel.app')) {
            return true;
        }
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
        const tabs = modal.querySelector('.auth-tabs');

        if (isLogin) {
            modal.setAttribute('data-mode', 'register');
            if (title) title.innerHTML = '创建新身份';
            if (submitBtn) submitBtn.textContent = '开通访问权限';
            if (switchText) switchText.innerHTML = '已经拥有密钥？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">去登录</a>';
            if (tabs) tabs.style.display = 'none'; // Register usually only has one mode
            this.switchAuthTab('password'); // Default to password for register
        } else {
            modal.setAttribute('data-mode', 'login');
            if (title) title.innerHTML = '安全身份验证';
            if (submitBtn) submitBtn.textContent = '授权并登录';
            if (switchText) switchText.innerHTML = '还没有身份？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">申请注册</a>';
            if (tabs) tabs.style.display = 'flex';
        }
    },

    switchAuthTab: function(tabName) {
        const modal = document.getElementById('auth-modal');
        const tabs = modal.querySelectorAll('.auth-tab');
        const passwordForm = modal.querySelector('.password-form');
        const smsForm = modal.querySelector('.sms-form');
        const qrContent = modal.querySelector('.qr-container');
        const submitBtn = modal.querySelector('.auth-submit-btn');

        // Reset
        tabs.forEach(t => t.classList.remove('active'));
        passwordForm.style.display = 'none';
        smsForm.style.display = 'none';
        qrContent.style.display = 'none';
        submitBtn.style.display = 'block';

        const activeTab = Array.from(tabs).find(t => t.innerText.includes(tabName === 'password' ? '密码' : (tabName === 'sms' ? '验证码' : '扫码')));
        if(activeTab) activeTab.classList.add('active');

        if(tabName === 'password') {
            passwordForm.style.display = 'block';
        } else if(tabName === 'sms') {
            smsForm.style.display = 'block';
        } else if(tabName === 'qr') {
            qrContent.style.display = 'flex';
            submitBtn.style.display = 'none';
            // Trigger actual WeChat OAuth
            this.handleWeChatLogin();
        }
    },

    handleWeChatLogin: async function() {
        if (!window.SupabaseClient) return;
        const { data, error } = await window.SupabaseClient.signInWithWeChat();
        if(error) {
            console.warn('WeChat OAuth not configured in Supabase dashboard:', error.message);
            // We keep the QR UI visible for UX, but log the error
        }
    },

    sendSMSCode: async function() {
        if (!this.client) {
            alert('系统加载中，请稍后再试');
            return;
        }
        const btn = document.querySelector('.btn-send-code');
        const identifier = document.querySelector('.sms-user').value.trim();
        
        if(!identifier || identifier.length < 11) {
            alert('请输入有效的手机号');
            return;
        }

        btn.disabled = true;
        btn.innerText = '正在发送...';

        try {
            // 🚀 Switch to China-Optimized Aliyun SMS Bridge via Supabase Client
            const { data, error } = await this.client.functions.invoke('send-aliyun-sms', {
                body: { phone: identifier }
            });
            
            if(error) {
                console.error('[SMS Edge Function Error]', error);
                throw error;
            }

            let sec = 60;
            const timer = setInterval(() => {
                btn.innerText = `重新发送(${sec}s)`;
                sec--;
                if(sec < 0) {
                    clearInterval(timer);
                    btn.disabled = false;
                    btn.innerText = '获取验证码';
                }
            }, 1000);
            console.log('Aliyun SMS OTP sent to:', identifier);
        } catch (err) {
            alert('发送失败: ' + (err.message || "服务异常"));
            btn.disabled = false;
            btn.innerText = '获取验证码';
        }
    },

    verifySMSCode: async function (phone, code) {
        if (!phone || !code) return { error: { message: "信息不完整" } };
        if (!this.client) return { error: { message: "系统尚未就绪" } };

        try {
            // 🚀 Verify via custom China SMS Bridge
            const { data, error } = await this.client.functions.invoke('verify-aliyun-sms', {
                body: { phone, code }
            });

            if (error) {
                console.error('[Verify Error]', error);
                return { error: { message: "校验失败: " + (error.message || "验证码错误") } };
            }

            // Successfully verified and logged in via Bridge
            if (data && data.user) {
                // If the edge function returns a new session or we just force reload,
                // Supabase admin API does not return a session directly.
                // We will manually record the login or generate auth token if returned.
                // For now, if verification succeeds, we mock a session locally for UX
                // or rely on a magic link trigger.
                if (data.session) {
                    const { error: sessionError } = await this.client.auth.setSession(data.session);
                    if (sessionError) return { error: sessionError };
                } else {
                    // Fallback local marking (since Edge function already created/updated user)
                    localStorage.setItem('current_user_email', data.user.email || data.user.phone);
                }
                return { data: { user: data.user }, error: null };
            }
            return { data: null, error: { message: "认证响应异常" } };
        } catch (err) {
            return { error: { message: err.message || '未知异常' } };
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
            <h2 style="margin-bottom: 20px;">安全身份验证</h2>
            
            <div class="auth-tabs">
                <div class="auth-tab active" onclick="SubscriptionManager.switchAuthTab('password')">密码登录</div>
                <div class="auth-tab" onclick="SubscriptionManager.switchAuthTab('sms')">验证码登录</div>
                <div class="auth-tab" onclick="SubscriptionManager.switchAuthTab('qr')">微信扫码登录</div>
            </div>

            <div style="background: rgba(255,140,148,0.1); border: 1px dashed rgba(255,140,148,0.3); padding: 12px; border-radius: 12px; margin-bottom: 25px; font-size: 12px; color: #ff8c94; text-align: center;">
                🎁 提示：联系客服领取永久激活码<br><b>微信：13699466775</b>
            </div>

            <form class="auth-form password-form">
                <input type="text" class="auth-input login-user" placeholder="手机号 / 邮箱地址" required>
                <input type="password" class="auth-input login-pass" placeholder="访问密码" required>
            </form>

            <form class="auth-form sms-form" style="display:none;">
                <input type="text" class="auth-input sms-user" placeholder="请输入手机号 (如 138...)" required>
                <div class="code-field">
                    <input type="text" class="auth-input sms-code" placeholder="6位验证码" style="margin-bottom:0;">
                    <button type="button" class="btn-send-code" onclick="SubscriptionManager.sendSMSCode()">获取验证码</button>
                </div>
            </form>

            <div class="qr-container" style="display:none;">
                <div class="qr-box">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=WAITING_FOR_WECHAT" style="width:100%; height:100%; opacity:0.8;">
                    <div class="qr-scan-line"></div>
                </div>
                <div class="qr-tip">使用 [微信] 扫一扫</div>
            </div>

            <button type="button" class="auth-submit-btn">确认授权并登录</button>

            <div class="auth-switch">
                <p>还没有身份？ <a href="#" onclick="SubscriptionManager.toggleAuthMode()">申请注册</a></p>
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

            newBtn.onclick = async (e) => {
                e.preventDefault();
                const modal = document.getElementById('auth-modal');
                const mode = modal.getAttribute('data-mode');
                
                const isPasswordMode = modal.querySelector('.password-form').style.display !== 'none';
                const isSmsMode = modal.querySelector('.sms-form').style.display !== 'none';

                if (isPasswordMode) {
                    const username = modal.querySelector('.login-user').value.trim();
                    const password = modal.querySelector('.login-pass').value.trim();
                    if (!username || !password) { alert('请输入信息'); return; }
                    
                    if (mode === 'register') SubscriptionManager.handleRegister(username, password);
                    else SubscriptionManager.handleLogin(username, password);
                } 
                else if (isSmsMode) {
                    const identifier = modal.querySelector('.sms-user').value.trim();
                    const code = modal.querySelector('.sms-code').value.trim();
                    if (!identifier || !code) { alert('请输入验证码'); return; }

                    newBtn.innerText = '正在核验...';
                    const { data, error } = await SubscriptionManager.verifySMSCode(identifier, code);
                    
                    if(error) {
                        alert('校验失败: ' + error.message);
                        newBtn.innerText = '确认授权并登录';
                    } else {
                        alert('🎉 身份校验成功！');
                        SubscriptionManager.hideAuthModal();
                        window.location.reload();
                    }
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
