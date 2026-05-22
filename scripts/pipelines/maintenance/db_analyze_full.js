
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function runAnalysis() {
    try {
        console.log('Fetching Profiles...');
        const { data: profiles } = await supabase.from('profiles').select('*');
        console.log('Profiles Count:', profiles?.length || 0);

        console.log('Fetching Dashboard Data...');
        const { data: stats } = await supabase.from('user_dashboard_data').select('*');
        console.log('Stats Count:', stats?.length || 0);

        console.log('Fetching AI Chat Sessions...');
        const { data: chats } = await supabase.from('ai_chat_sessions').select('*');
        console.log('Chats Count:', chats?.length || 0);

        // Analysis of Profiles
        console.log('--- PROFILES ANALYSIS ---');
        const userSummary = profiles.map(p => ({
            username: p.username,
            created_at: p.created_at,
            expiry_date: p.expiry_date
        }));
        console.log(JSON.stringify(userSummary));

        // Analysis of Stats
        console.log('--- DASHBOARD DATA ---');
        console.log(JSON.stringify(stats));

        // Analysis of Chats
        console.log('--- CHAT SESSIONS ---');
        console.log(JSON.stringify(chats));

    } catch (e) {
        console.error('FAIL:', e);
    }
}

runAnalysis();
