
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function runReport() {
    try {
        console.log('--- [1] Fetching Profiles ---');
        const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
        if (pError) throw pError;

        console.log('--- [2] Fetching Chat Sessions ---');
        const { data: chats, error: cError } = await supabase.from('ai_chat_sessions').select('*');
        if (cError) throw cError;

        console.log('--- [3] Fetching Activity Tracking ---');
        const { data: tracker, error: tError } = await supabase.from('user_dashboard_data').select('*');
        if (tError) {
             console.warn('Table user_dashboard_data might be missing or empty:', tError.message);
        }

        console.log('--- REPORT_DATA_START ---');
        console.log('PROFILES:', JSON.stringify(profiles || []));
        console.log('CHATS:', JSON.stringify(chats || []));
        console.log('TRACKER:', JSON.stringify(tracker || []));
        console.log('--- REPORT_DATA_END ---');
    } catch (e) {
        console.error('FATAL:', e);
    }
}

runReport();
