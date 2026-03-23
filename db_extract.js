
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const TEST_USER_IDS = [
    "53b84d78-d394-4628-95f5-6333506b9ec1", // testuser_1774166017163
    "6e36e49c-0473-4e8a-b284-8dcfc71a4271", // test_ai_1234@ai.com
    "5f61476f-edae-4589-8d07-9d23b772f75d", // 18800001111
    "b70a232e-8cd5-4ed4-b84a-65c5e40fc83e", // 13689098765
    "05a6d6ef-39e6-4f1d-a2df-ef54027337d9", // 13499999999
    "3ac8bb52-2f23-40b9-85a2-7eba056ba7bd"  // 123456
];

async function runTask() {
    try {
        console.log('--- [1] Deleting Test Accounts ---');
        for (const id of TEST_USER_IDS) {
            // First profiles
            await supabase.from('profiles').delete().eq('id', id);
            // Then auth (with auth.admin)
            const { error: aError } = await supabase.auth.admin.deleteUser(id);
            if (aError) console.warn(`Auth deletion failed for ${id}:`, aError.message);
            else console.log(`Successfully deleted auth user ${id}`);
        }

        console.log('\n--- [2] Fetching All Data ---');
        const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        const { data: dashboard } = await supabase.from('user_dashboard_data').select('*');
        const { data: chats } = await supabase.from('ai_chat_sessions').select('*');

        console.log('--- OUTPUT_START ---');
        console.log('PROFILES:', JSON.stringify(profiles || []));
        console.log('DASHBOARD:', JSON.stringify(dashboard || []));
        console.log('CHATS:', JSON.stringify(chats || []));
        console.log('--- OUTPUT_END ---');
    } catch (e) {
        console.error('FATAL:', e);
    }
}

runTask();
