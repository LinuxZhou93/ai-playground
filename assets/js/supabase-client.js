// Supabase Client Initialization
// TODO: Replace these with your actual Project URL and Anon Key from Supabase Dashboard

const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

// Check if Supabase is loaded and keys are configured
let supabase;
const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && SUPABASE_KEY !== 'YOUR_SUPABASE_ANON_KEY';

if (typeof createClient !== 'undefined' && isSupabaseConfigured) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized');
    } catch (e) {
        console.error('Supabase initialization failed:', e);
    }
} else {
    console.warn('Supabase SDK not loaded or keys not configured. Using localStorage fallback.');
}

// --- Authentication Functions ---

async function signUp(email, password) {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });
    return { data, error };
}

async function signIn(email, password) {
    if (!supabase) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    return { data, error };
}

async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    return { error };
}

async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

function onAuthStateChange(callback) {
    if (!supabase) return;
    supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// --- Leaderboard Functions ---

// Helper function to upload score
async function uploadScore(gameId, playerName, score) {
    // Fallback to localStorage if Supabase is not configured
    if (!supabase) {
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

    const { data, error } = await supabase
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
    if (!supabase) {
        console.log('Fetching leaderboard from localStorage (Offline Mode)');
        const localData = JSON.parse(localStorage.getItem('local_leaderboard') || '[]');
        return localData
            .filter(item => item.game_id === gameId)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    const { data, error } = await supabase
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
