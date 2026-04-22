
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function listTables() {
    // There is no public RPC for listing tables without DB permissions, but we can try to query some likely suspect tables
    const potentialTables = ['ai_chat_sessions', 'messages', 'chat_history', 'chat_logs', 'game_results', 'user_dashboard_data'];
    for (const table of potentialTables) {
        const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error) console.log(`Table '${table}' exists. Count: ${count}`);
    }
}

listTables();
