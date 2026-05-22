/**
 * Supabase Configuration Shell
 * The actual keys are fetched dynamically from /api/server-providers during SubscriptionManager.init()
 * to prevent public exposure in static source files.
 */
window.SUPABASE_CONFIG = {
    url: '',
    key: ''
};

console.log('ℹ️ Supabase Config Shell Initialized');
