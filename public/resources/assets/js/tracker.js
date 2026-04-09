
/**
 * TITAN TRACKER v1.0
 * Frontend telemetry system for "Future AI" platform.
 * Automatically syncs learning activities to Supabase via 'user_dashboard_data'.
 */

const Tracker = (() => {
    // Configuration
    const CONFIG = {
        TOAST_DURATION: 3000,
        POINTS_PER_ACTION: 2, // Percentage increment per action
        MAX_SCORE: 100
    };

    // State
    let _supabaseParams = { url: null, key: null };
    let _currentUser = null;
    let _dashboardData = null; // Cache

    /**
     * 1. Initialize Connection
     * Try to get credentials from local storage (set by login or admin panel bridge)
     */
    function init() {
        // Try to get auth from localStorage standard keys
        try {
            // Check 'sb-fcdqsoroqvocybcaxnvu-auth-token' (Supabase Auth default)
            const sbSession = JSON.parse(localStorage.getItem('sb-fcdqsoroqvocybcaxnvu-auth-token'));
            if (sbSession && sbSession.user) {
                _currentUser = sbSession.user.email;
            } else {
                // Fallback: Check custom 'current_user_email' set by our simple login
                _currentUser = localStorage.getItem('current_user_email');
            }

            // Get API creds (often stored by admin.html bridge or hardcoded in config - trying bridge first)
            // Get API creds (Priority: Bridge -> Global Config)
            _supabaseParams.url = localStorage.getItem('s_url'); // Bridge from admin
            _supabaseParams.key = localStorage.getItem('s_key'); // Bridge from admin

            if ((!_supabaseParams.url || !_supabaseParams.key) && window.SUPABASE_CONFIG) {
                _supabaseParams.url = window.SUPABASE_CONFIG.url;
                _supabaseParams.key = window.SUPABASE_CONFIG.key;
            }

            if (!_currentUser) console.warn("Tracker: Generic Guest Mode (No User)");
            if (!_supabaseParams.url) console.warn("Tracker: Offline Mode (No API URL)");

            // Load initial state if possible
            if (_currentUser && _supabaseParams.url) {
                fetchDashboardData();
            }

        } catch (e) {
            console.error("Tracker Init Error", e);
        }
    }

    /**
     * Fetch current user stats to work with
     */
    async function fetchDashboardData() {
        if (!_supabaseParams.url || !_supabaseParams.key || !_currentUser) return;

        try {
            const res = await fetch(`${_supabaseParams.url}/rest/v1/user_dashboard_data?username=eq.${_currentUser}&select=*`, {
                headers: { 'apikey': _supabaseParams.key, 'Authorization': 'Bearer ' + _supabaseParams.key }
            });
            const rows = await res.json();
            if (rows.length > 0) {
                _dashboardData = rows[0];
                console.log("Tracker: Stats Loaded", _dashboardData);
            }
        } catch (e) { console.error("Tracker: Fetch Failed", e); }
    }

    /**
     * 2. Log Activity
     * @param {string} category - 'ai', 'life', 'earth', 'circuits'
     * @param {string} action - 'start_experiment', 'complete_quiz'
     */
    async function log(category, action = 'start_experiment') {
        const isGuest = !_currentUser || _currentUser === 'null';
        console.log(`Tracker: Logging ${category} -> ${action} (Guest: ${isGuest})`);

        // 1. Show UI Feedback immediately
        showToast(category, isGuest);

        // If Guest, do NOTHING else (do not update stats, do not sync)
        if (isGuest) return;

        // 2. Update Local State (Optimistic UI) - ONLY FOR MEMBERS
        if (!_dashboardData) _dashboardData = {}; // Init empty if missing

        // Map category to DB column
        let column = 'prog_subject'; // Default
        if (category === 'ai' || category === 'circuits' || category === 'code') column = 'prog_tech';
        if (category === 'life' || category === 'earth' || category === 'dino') column = 'prog_subject';

        // Increment
        let currentVal = _dashboardData[column] || 0;
        let newVal = Math.min(currentVal + CONFIG.POINTS_PER_ACTION, CONFIG.MAX_SCORE);

        _dashboardData[column] = newVal; // Update cache

        // 3. Sync to Cloud
        if (_supabaseParams.url && _supabaseParams.key) {
            try {
                // Construct PATCH payload
                let payload = {};
                payload[column] = newVal;

                await fetch(`${_supabaseParams.url}/rest/v1/user_dashboard_data?username=eq.${_currentUser}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': _supabaseParams.key,
                        'Authorization': 'Bearer ' + _supabaseParams.key,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                console.log("Tracker: Cloud Synced", column, newVal);
            } catch (e) {
                console.warn("Tracker: Cloud Sync Fail, using Local Storage fallback");
                saveToLocalFallback();
            }
        } else {
            saveToLocalFallback();
        }
    }

    function saveToLocalFallback() {
        // Just save to local storage so profile.html can read it even if offline
        // profile.html reads 'local_dashboard_data'
        localStorage.setItem('local_dashboard_data', JSON.stringify(_dashboardData));
        console.log("Tracker: Saved to LocalBridge");
    }

    /**
     * 3. Visual Feedback (Toast)
     */
    function showToast(category, isGuest) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-24 right-6 glass-panel border p-4 rounded-lg shadow-lg z-[100] flex items-center gap-3 animate-slide-in';

        // Style based on Membership
        if (isGuest) {
            toast.style.background = 'rgba(30, 41, 59, 0.9)'; // Dark slate
            toast.style.borderColor = '#94a3b8'; // Grey border
        } else {
            toast.style.background = 'rgba(0,0,0,0.8)'; // Standard Premium
            toast.style.borderColor = 'rgba(6, 182, 212, 0.5)'; // Cyan
        }

        toast.style.backdropFilter = 'blur(10px)';
        toast.style.animation = 'slideIn 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards';

        // Icon Map
        const icons = { 'ai': '🤖', 'life': '🧬', 'earth': '🌏', 'circuits': '🔌', 'dino': '🦖' };

        // Message Content
        if (isGuest) {
            toast.innerHTML = `
                <div class="text-2xl opacity-50">${icons[category] || '🎓'}</div>
                <div>
                    <div class="font-bold text-slate-400 text-sm">GUEST MODE</div>
                    <div class="text-slate-500 text-xs font-mono">Progress NOT Saved</div>
                </div>
            `;
        } else {
            toast.innerHTML = `
                <div class="text-2xl">${icons[category] || '🎓'}</div>
                <div>
                    <div class="font-bold text-white text-sm">EXPERIENCE GAINED</div>
                    <div class="text-cyan-400 text-xs font-mono">+${CONFIG.POINTS_PER_ACTION}% Mastery (Cloud Sync)</div>
                </div>
            `;
        }

        document.body.appendChild(toast);

        // Inject Styles if needed
        if (!document.getElementById('tracker-css')) {
            const style = document.createElement('style');
            style.id = 'tracker-css';
            style.textContent = `
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => toast.remove(), CONFIG.TOAST_DURATION);
    }

    // Auto-Init on Load
    init();

    return {
        log
    };
})();
