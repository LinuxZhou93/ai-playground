// Supabase Client Initialization
const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

// Check if Supabase is loaded and keys are configured
let _supabase;

// Function to initialize Supabase client (Lazy Init)
function initSupabase() {
    if (_supabase) return _supabase;

    // Try to get createClient from global window.supabase (CDN)
    if (window.supabase && window.supabase.createClient) {
        try {
            _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Supabase client initialized successfully');
            return _supabase;
        } catch (e) {
            console.error('❌ Supabase initialization failed:', e);
            return null;
        }
    } else {
        console.error('❌ window.supabase is not available. CDN script might not be loaded.');
        return null;
    }
}

// Initialize immediately
initSupabase();


// --- Auth Helpers ---

async function getCurrentUser() {
    if (!_supabase) return null;
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return null;

    // Fetch Profile
    const user = {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        avatar_url: session.user.user_metadata?.avatar_url
    };

    try {
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
            Object.assign(user, profile);
        }
    } catch (e) {
        // Profile might not exist yet
    }

    return user;
}

// Email & Password Sign Up
async function signUp(email, password) {
    if (!_supabase) return { error: { message: "Supabase not initialized" } };
    const { data, error } = await _supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

// Email & Password Sign In
async function signIn(email, password) {
    if (!_supabase) return { error: { message: "Supabase not initialized" } };
    const { data, error } = await _supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

// GitHub OAuth Login
async function signInWithGitHub() {
    if (!_supabase) return { error: { message: "Supabase not initialized" } };
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'github',
    });
    return { data, error };
}

// Sign Out
async function signOut() {
    if (!_supabase) return { error: { message: "Supabase not initialized" } };
    const { error } = await _supabase.auth.signOut();
    if (!error) window.location.reload();
    return { error };
}

// Listen for Auth State Changes
function onAuthStateChange(callback) {
    if (!_supabase) return;
    return _supabase.auth.onAuthStateChange(async (event, session) => {
        if (callback) callback(event, session);
    });
}

// --- Data Helpers ---

// Export for usage in modules if needed, or stick to window global
window._supabase = _supabase;
window.SupabaseClient = {
    client: _supabase,
    init: initSupabase,
    getCurrentUser,
    signUp,
    signIn,
    signInWithGitHub,
    signOut,
    onAuthStateChange
};

// Also expose individual functions strictly to window if needed by some inline scripts
window.signUp = signUp;
window.signIn = signIn;
window.signInWithGitHub = signInWithGitHub;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
window.onAuthStateChange = onAuthStateChange;
