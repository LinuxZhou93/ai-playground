/**
 * AUTH SYSTEM MANAGER
 * Simulates a robust authentication and subscription backend.
 * Features: Login, Registration, Subscription Tiers, Session Persistence.
 */

class AuthManager {
    constructor() {
        this.dbKey = 'psyche_x_users_v1';
        this.sessionKey = 'psyche_x_session_v1';
        this.licenseKey = 'psyche_x_licenses_v1';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.dbKey)) {
            // Seed with a default user
            const defaultUsers = [
                {
                    id: 'usr_001',
                    email: 'admin@psychex.com',
                    password: 'admin', // In real app, this would be hashed
                    username: 'XG-001',
                    tier: 'ELITE',
                    expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 99)).toISOString(),
                    avatar: 'https://cdn.usegalileo.ai/sdxl10/681758c0-56cc-4c07-88fa-bce034079435.png'
                }
            ];
            localStorage.setItem(this.dbKey, JSON.stringify(defaultUsers));
        }
        if (!localStorage.getItem(this.licenseKey)) {
            localStorage.setItem(this.licenseKey, JSON.stringify([]));
        }
    }

    // --- ACTIONS ---

    async login(email, password) {
        if (window.DataClient) {
            const res = await window.DataClient.login(email, password);
            if (res.success) {
                this.setSession(res.user);
            }
            return res;
        }
        return this.loginLocal(email, password);
    }

    async register(email, password, username) {
        if (window.DataClient) {
            const res = await window.DataClient.register(email, password, username);
            if (res.success && res.user) {
                this.setSession(res.user);
            }
            return res;
        }
        return this.registerLocal(email, password, username);
    }

    loginLocal(email, password) {
        const users = JSON.parse(localStorage.getItem(this.dbKey));
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.setSession(user);
            return { success: true, user };
        } else {
            return { success: false, message: 'Invalid credentials' };
        }
    }

    registerLocal(email, password, username) {
        const users = JSON.parse(localStorage.getItem(this.dbKey));
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'User already exists' };
        }

        const newUser = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            email,
            password,
            username: username || email.split('@')[0],
            tier: 'FREE',
            expiry: null,
            avatar: null
        };

        users.push(newUser);
        localStorage.setItem(this.dbKey, JSON.stringify(users));
        this.setSession(newUser);
        return { success: true, user: newUser };
    }

    logout() {
        if (window.DataClient) window.DataClient.logout();
        localStorage.removeItem(this.sessionKey);
        window.location.href = 'login.html';
    }

    // --- LICENSE MANAGEMENT ---

    async generateLicense(type, count = 1) {
        if (window.DataClient) return await window.DataClient.generateLicense(type, count);
        return this.generateLicenseLocal(type, count);
    }

    generateLicenseLocal(type, count = 1) {
        let licenses = JSON.parse(localStorage.getItem(this.licenseKey) || '[]');
        const newCodes = [];
        for (let i = 0; i < count; i++) {
            const code = `PX-${type.toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            newCodes.push({ code, type, status: 'Active', created: new Date().toISOString() });
        }
        licenses = [...newCodes, ...licenses]; // Add to top
        localStorage.setItem(this.licenseKey, JSON.stringify(licenses));
        return newCodes;
    }

    async getLicenses() {
        if (window.DataClient) return await window.DataClient.getLicenses();
        return this.getLicensesLocal();
    }

    getLicensesLocal() {
        return JSON.parse(localStorage.getItem(this.licenseKey) || '[]');
    }

    async redeemLicense(code) {
        if (window.DataClient) {
            const session = this.getSession(); // Use getSession to ensure it's up-to-date
            const userId = session ? session.id : null;
            if (!userId) return { success: false, message: 'Login Required' };

            const res = await window.DataClient.redeemLicense(code, userId);
            if (res.success && res.tier) {
                // Update local session
                session.tier = res.tier;
                this.setSession(session); // Use setSession to update localStorage
            }
            return res;
        }
        return this.redeemLicenseLocal(code);
    }

    redeemLicenseLocal(code) {
        const stored = localStorage.getItem(this.licenseKey);
        const licenses = stored ? JSON.parse(stored) : [];
        const idx = licenses.findIndex(l => l.code === code && l.status === 'Active');

        if (idx === -1) return { success: false, message: 'Invalid or Used Code' };

        const license = licenses[idx];
        const session = this.getSession(); // Get current session

        if (!session) return { success: false, message: 'Please Login First' };

        // Apply Upgrade
        let plan = 'MONTHLY';
        if (license.type.includes('YEAR')) plan = 'YEARLY';
        else if (license.type.includes('SEMI')) plan = 'SEMI';

        this.upgradeSubscription(plan); // This updates the session and user record

        // Mark Used
        licenses[idx].status = 'Redeemed by ' + session.username;
        licenses[idx].usedAt = new Date().toISOString();
        localStorage.setItem(this.licenseKey, JSON.stringify(licenses));

        return { success: true, plan };
    }

    // --- SUBSCRIPTION ---

    upgradeSubscription(plan) {
        const user = this.getSession();
        if (!user) return false;

        // Plan: 'MONTHLY' | 'SEMI' | 'YEARLY'
        const duration = plan === 'MONTHLY' ? 1 : (plan === 'SEMI' ? 6 : 12);

        const now = new Date();
        const expiry = new Date(now.setMonth(now.getMonth() + duration));

        user.tier = 'PRO'; // Or 'ELITE' for Yearly
        if (plan === 'YEARLY') user.tier = 'ELITE';

        user.expiry = expiry.toISOString();

        this.updateUserRecord(user);
        this.setSession(user);
        return true;
    }

    getPlanDetails(tier) {
        if (tier === 'ELITE') return { name: 'ELITE RESEARCHER', color: 'text-purple-400', badge: 'ELITE' };
        if (tier === 'PRO') return { name: 'PRO RESEARCHER', color: 'text-blue-400', badge: 'PRO' };
        return { name: 'NOVICE SUBJECT', color: 'text-gray-400', badge: 'FREE' };
    }

    // --- SESSION UTILS ---

    setSession(user) {
        // Don't store password in session
        const { password, ...safeUser } = user;
        localStorage.setItem(this.sessionKey, JSON.stringify(safeUser));
    }

    getSession() {
        return JSON.parse(localStorage.getItem(this.sessionKey));
    }

    updateUserRecord(updatedUser) {
        const users = JSON.parse(localStorage.getItem(this.dbKey));
        const idx = users.findIndex(u => u.id === updatedUser.id);
        if (idx !== -1) {
            // Merge but keep password from DB if not provided
            updatedUser.password = users[idx].password;
            users[idx] = updatedUser;
            localStorage.setItem(this.dbKey, JSON.stringify(users));
        }
    }

    requireAuth() {
        const session = this.getSession();
        if (!session) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        return session;
    }
}

window.AuthManager = new AuthManager();
