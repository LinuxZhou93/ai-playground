const AdminPanel = {
    client: null,

    init: async function () {
        // 1. Check for Service Key in Session Storage
        const serviceKey = sessionStorage.getItem('supabase_service_key');

        if (!serviceKey) {
            this.showKeyModal();
        } else {
            this.initClient(serviceKey);
        }
    },

    initClient: function (key) {
        try {
            // Create client with explicit config to persist session in memory only for admin safety if needed,
            // but here we just need a client that uses the service key.
            // Note: Service Key bypasses RLS.
            if (typeof supabase === 'undefined') {
                console.error("Supabase SDK missing");
                return;
            }

            this.client = supabase.createClient(SUPABASE_CONFIG.url, key);

            // Hide modal if open
            document.getElementById('key-modal').classList.add('hidden');
            document.getElementById('dashboard-app').classList.remove('hidden');

            // Load Initial Data
            this.loadDashboard();
        } catch (e) {
            alert("Invalid Key or Config");
            this.showKeyModal();
        }
    },

    saveKey: function () {
        const input = document.getElementById('admin-key-input');
        const key = input.value.trim();
        if (key.length > 20) {
            sessionStorage.setItem('supabase_service_key', key);
            this.initClient(key);
        } else {
            alert("Pre-check: Key looks too short");
        }
    },

    // --- Data Loaders ---

    loadDashboard: async function () {
        this.renderUsers();
        this.renderStats();
    },

    renderStats: async function () {
        // Simple counts
        const { count: userCount } = await this.client.from('profiles').select('*', { count: 'exact', head: true });
        const { count: voucherCount } = await this.client.from('vouchers').select('*', { count: 'exact', head: true });

        // Count VIPs (client side calculation for demo, ideally SQL count or distinct query)
        const { data: profiles } = await this.client.from('profiles').select('expiry_date');
        const vips = profiles ? profiles.filter(p => new Date(p.expiry_date) > new Date()).length : 0;

        document.getElementById('stat-total-users').innerText = userCount || 0;
        document.getElementById('stat-vip-users').innerText = vips;
        document.getElementById('stat-vouchers').innerText = voucherCount || 0;
    },

    renderUsers: async function () {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

        const { data: users, error } = await this.client
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            alert('Error loading users: ' + error.message);
            return;
        }

        tbody.innerHTML = users.map(user => {
            const isVIP = user.expiry_date && new Date(user.expiry_date) > new Date();
            return `
            <tr>
                <td>
                    <div style="font-weight:bold;">${user.username || 'No Name'}</div>
                    <div style="font-size:0.8em; color:#666;">${user.id.slice(0, 8)}...</div>
                </td>
                <td>
                    <span class="badge ${isVIP ? 'badge-vip' : 'badge-normal'}">
                        ${isVIP ? 'VIP' : 'Normal'}
                    </span>
                </td>
                <td>${user.expiry_date ? new Date(user.expiry_date).toLocaleDateString() : 'Never'}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="AdminPanel.addTime('${user.id}', 1)">+1 Month</button>
                    <button class="btn btn-sm btn-danger" onclick="AdminPanel.resetUser('${user.id}')">Reset</button>
                </td>
            </tr>
            `;
        }).join('');
    },

    loadVouchers: async function () {
        // Switch View
        this.toggleView('vouchers');

        const tbody = document.getElementById('vouchers-table-body');
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

        const { data: vouchers, error } = await this.client
            .from('vouchers')
            .select('*')
            .order('created_at', { ascending: false });

        tbody.innerHTML = vouchers.map(v => `
            <tr>
                <td style="font-family:monospace; font-weight:bold; letter-spacing:1px;">${v.code}</td>
                <td>${v.duration_months} Months</td>
                <td>
                    <span class="badge ${v.status === 'active' ? 'badge-active' : 'badge-used'}">
                        ${v.status}
                    </span>
                </td>
                <td>${v.used_by ? 'User ID: ' + v.used_by.slice(0, 8) : '-'}</td>
            </tr>
        `).join('');
    },

    // --- Actions ---

    addTime: async function (userId, months) {
        if (!confirm(`Add ${months} month(s) to user?`)) return;

        // 1. Get current expiry
        const { data: profile } = await this.client.from('profiles').select('expiry_date').eq('id', userId).single();

        let newDate = new Date();
        if (profile.expiry_date && new Date(profile.expiry_date) > new Date()) {
            newDate = new Date(profile.expiry_date);
        }

        newDate.setMonth(newDate.getMonth() + months);

        const { error } = await this.client
            .from('profiles')
            .update({ expiry_date: newDate.toISOString() })
            .eq('id', userId);

        if (!error) {
            alert('Updated!');
            this.renderUsers();
            this.renderStats();
        } else {
            alert('Failed: ' + error.message);
        }
    },

    resetUser: async function (userId) {
        if (!confirm(`Reset this user to non-VIP?`)) return;
        const { error } = await this.client
            .from('profiles')
            .update({ expiry_date: null })
            .eq('id', userId);

        if (!error) this.renderUsers();
    },

    generateVouchers: function () {
        this.showGenerateModal();
    },

    showGenerateModal: function () {
        document.getElementById('generate-modal').classList.remove('hidden');
    },

    closeGenerateModal: function () {
        document.getElementById('generate-modal').classList.add('hidden');
    },

    confirmGenerate: async function () {
        const input = document.getElementById('voucher-count-input');
        const count = parseInt(input.value) || 5;

        // Visual Feedback
        const confirmBtn = document.querySelector('#generate-modal button:last-child');
        const originalText = confirmBtn.innerText;
        confirmBtn.innerText = 'Minting...';
        confirmBtn.disabled = true;

        // Generate array
        const vouchers = [];
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (let i = 0; i < count; i++) {
            let codePart = "";
            for (let j = 0; j < 12; j++) {
                codePart += chars.charAt(Math.floor(Math.random() * chars.length));
                if ((j + 1) % 4 === 0 && j < 11) codePart += "-";
            }
            vouchers.push({
                code: 'VIP-365D-' + codePart,
                duration_months: 12,
                status: 'active'
            });
        }

        const { data, error } = await this.client.from('vouchers').insert(vouchers).select();

        // Restore UI
        confirmBtn.innerText = originalText;
        confirmBtn.disabled = false;
        this.closeGenerateModal();

        if (error) {
            alert('Error generating: ' + error.message);
        } else {
            // alert(`Success! Generated ${data.length} codes.`); // Optional: remove alert for smoother flow
            this.loadVouchers();
            this.renderStats();
        }
    },

    // --- UI Helpers ---

    toggleView: function (viewName) {
        document.querySelectorAll('.data-panel').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        if (viewName === 'users') {
            document.getElementById('users-panel').classList.remove('hidden');
            document.getElementById('nav-users').classList.add('active');
            this.renderUsers();
        } else if (viewName === 'vouchers') {
            document.getElementById('vouchers-panel').classList.remove('hidden');
            document.getElementById('nav-vouchers').classList.add('active');
        }
    },

    showKeyModal: function () {
        document.getElementById('key-modal').classList.remove('hidden');
        document.getElementById('dashboard-app').classList.add('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminPanel.init();
});
