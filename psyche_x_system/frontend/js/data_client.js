
/**
 * PSYCHE-X Data Client
 * Adapts DataManager to use Supabase if available, falling back to LocalStorage
 */

const SUPABASE_URL = 'https://mucdbfmxweuminwljlyr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Y2RiZm14d2V1bWlud2xqbHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Njc1NzAsImV4cCI6MjA4MTA0MzU3MH0.ZCtS-EwjKGaiMgXfHUvuES_zjbUSuWICkZwlTeZO0P0';

class DataClient {
    constructor() {
        this.supabase = null;
        this.useCloud = false;

        if (window.supabase) {
            try {
                // Check if user has replaced placeholders
                if (!SUPABASE_URL.includes('YOUR_SUPABASE')) {
                    this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                    this.useCloud = true;
                    console.log('[DataClient] Connected to Supabase Cloud');
                } else {
                    console.warn('[DataClient] Supabase credentials not configured. Using LocalStorage.');
                }
            } catch (e) {
                console.error('[DataClient] Supabase Init Error', e);
            }
        }

        // Fallback Local Storage Key
        this.localKey = 'psyche_x_db_v1';
    }

    // --- AUTH PROXY ---

    async register(email, password, username) {
        if (!this.useCloud) {
            return window.AuthManager.registerLocal(email, password, username);
        }

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        if (error) return { success: false, message: error.message };
        return { success: true, user: data.user };
    }

    async login(email, password) {
        if (!this.useCloud) {
            return window.AuthManager.loginLocal(email, password);
        }

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return { success: false, message: error.message };

        // Fetch Profile details (Tier coverage)
        const { data: profile } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return { success: true, user: { ...data.user, ...profile } };
    }

    async logout() {
        if (this.useCloud) await this.supabase.auth.signOut();
        // Local logic handled by AuthManager wrapper
    }

    // --- DATA METHODS ---

    async submitResult(record) {
        // record: { title, domain, score, metrics }

        if (this.useCloud) {
            const user = (await this.supabase.auth.getUser()).data.user;
            if (user) {
                const { error } = await this.supabase
                    .from('game_results')
                    .insert({
                        user_id: user.id,
                        game_title: record.title,
                        game_domain: record.domain,
                        score: record.score,
                        metrics: record.metrics
                    });
                if (error) console.error("Upload failed", error);
            }
        }

        // Always save local cache for offline/instant access
        this.saveLocal(record);
        return record;
    }

    async getHistory() {
        if (this.useCloud) {
            const { data, error } = await this.supabase
                .from('game_results')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Map to local format
                return data.map(d => ({
                    ...d,
                    timestamp: d.created_at,
                    title: d.game_title,
                    domain: d.game_domain
                }));
            }
        }
        return this.getLocal();
    }

    // --- LOCAL FALLBACKS ---
    getLocal() { return JSON.parse(localStorage.getItem(this.localKey) || '[]'); }

    saveLocal(record) {
        const history = this.getLocal();
        // Add ID and Timestamp if missing (for local consistency)
        record.id = record.id || 'LOC-' + Date.now();
        record.timestamp = new Date().toISOString();
        history.unshift(record);
        localStorage.setItem(this.localKey, JSON.stringify(history));
    }

    // --- LICENSE METHODS ---
    async getLicenses() {
        if (this.useCloud) {
            const { data, error } = await this.supabase
                .from('licenses')
                .select('*')
                .order('created_at', { ascending: false });
            return error ? [] : data;
        }
        return this.getLicensesLocal();
    }

    async generateLicense(type, count) {
        const newCodes = [];
        for (let i = 0; i < count; i++) {
            newCodes.push({
                code: `PX-${type.toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                plan_type: type,
                status: 'Active'
            });
        }

        if (this.useCloud) {
            // Try inserting. Note: Will fail if RLS policy for INSERT is missing.
            const { error } = await this.supabase.from('licenses').insert(newCodes);
            if (error) {
                console.warn("Cloud License Gen Failed (Likely Permission). Falling back to local.", error);
                const local = this.getLicensesLocal();
                localStorage.setItem('psyche_x_licenses_v1', JSON.stringify([...newCodes, ...local]));
            }
        } else {
            const local = this.getLicensesLocal();
            localStorage.setItem('psyche_x_licenses_v1', JSON.stringify([...newCodes, ...local]));
        }
        return newCodes;
    }

    async redeemLicense(code, userId) {
        if (this.useCloud) {
            // 1. Check if valid
            const { data, error } = await this.supabase
                .from('licenses')
                .select('*')
                .eq('code', code)
                .eq('status', 'Active')
                .single();

            if (error || !data) return { success: false, message: 'Invalid Code' };

            // 2. Consume (Update status)
            const { error: updateErr } = await this.supabase
                .from('licenses')
                .update({ status: 'Redeemed', redeemed_by: userId, redeemed_at: new Date().toISOString() })
                .eq('code', code);

            if (updateErr) return { success: false, message: updateErr.message };

            // 3. Update User Profile Tier
            let newTier = 'PRO';
            if (data.plan_type.includes('YEAR')) newTier = 'ELITE';
            else if (data.plan_type.includes('SEMI')) newTier = 'PRO';

            await this.supabase.from('profiles').update({ tier: newTier }).eq('id', userId);

            return { success: true, plan: data.plan_type, tier: newTier };
        }
        // Local Fallback
        return window.AuthManager ? window.AuthManager.redeemLicenseLocal(code) : { success: false };
    }

    getLicensesLocal() { return JSON.parse(localStorage.getItem('psyche_x_licenses_v1') || '[]'); }
}

window.DataClient = new DataClient();
