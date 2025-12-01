// Supabase Client Initialization
// TODO: Replace these with your actual Project URL and Anon Key from Supabase Dashboard

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

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

    const { data, error } = await supabase
        .from('leaderboard')
        .insert([
            { game_id: gameId, player_name: playerName, score: score }
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
