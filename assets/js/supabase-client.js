// Supabase Client Initialization
// TODO: Replace these with your actual Project URL and Anon Key from Supabase Dashboard

const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

// Check if Supabase is loaded and keys are configured
let _supabase;
const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && SUPABASE_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// Function to initialize Supabase client (Lazy Init)
function initSupabase() {
    if (_supabase) return true;

    if (!isSupabaseConfigured) {
        console.warn('Supabase keys not configured.');
        return false;
    }

    // Try to get createClient from global window.supabase (CDN)
    if (window.supabase && window.supabase.createClient) {
        try {
            _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase client initialized successfully via Lazy Init');
            return true;
        } catch (e) {
            console.error('Supabase initialization failed:', e);
            return false;
        }
    } else {
        console.error('window.supabase is not available. CDN script might not be loaded.');
        return false;
    }
}

// Try to initialize immediately
initSupabase();

// --- Authentication Functions ---

async function signUp(email, password) {
    if (!initSupabase()) return { error: { message: 'Supabase not configured or SDK not loaded' } };
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
    });
    return { data, error };
}

async function signIn(email, password) {
    if (!initSupabase()) return { error: { message: 'Supabase not configured or SDK not loaded' } };
    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    return { data, error };
}

async function signOut() {
    if (!initSupabase()) return;
    const { error } = await _supabase.auth.signOut();
    return { error };
}

async function getCurrentUser() {
    if (!initSupabase()) return null;
    const { data: { user } } = await _supabase.auth.getUser();
    return user;
}

function onAuthStateChange(callback) {
    if (!initSupabase()) return;
    _supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// --- Leaderboard Functions ---

// Helper function to upload score
async function uploadScore(gameId, playerName, score) {
    // Fallback to localStorage if Supabase is not configured
    if (!initSupabase()) {
        console.log('Saving score to localStorage (Offline Mode)');
        const localData = JSON.parse(localStorage.getItem('local_leaderboard') || '[]');
        localData.push({
            game_id: gameId,
            player_name: playerName,
            score: score,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('local_leaderboard', JSON.stringify(localData));
        return;
    }

    // Check if user is logged in
    const user = await getCurrentUser();
    const userId = user ? user.id : null;
    // Use user email prefix as name if logged in and playerName not provided (though prompt logic handles this usually)

    const { data, error } = await _supabase
        .from('leaderboard')
        .insert([
            {
                game_id: gameId,
                player_name: playerName,
                score: score,
                // user_id: userId // Optional: if you add user_id column to table later
            }
        ]);

    if (error) {
        console.error('Error uploading score:', error);
    } else {
        console.log('Score uploaded successfully:', data);
    }
}

// Helper function to get leaderboard
async function getLeaderboard(gameId) {
    // Fallback to localStorage if Supabase is not configured
    if (!initSupabase()) {
        console.log('Fetching leaderboard from localStorage (Offline Mode)');
        const localData = JSON.parse(localStorage.getItem('local_leaderboard') || '[]');
        return localData
            .filter(item => item.game_id === gameId)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    const { data, error } = await _supabase
        .from('leaderboard')
        .select('*')
        .eq('game_id', gameId)
        .order('score', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
    return data;
}
