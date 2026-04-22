const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.zFvIqK04-eD7A5nB760x0M-z9H8ZpXhL7aI0vG20X6A';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function test() {
    // try inserting with SERVICE_KEY to make sure table structure is correct
    const { data, error } = await supabase.from('ai_chat_logs').insert({
        user_id: null,
        role: 'user',
        content: 'test service key',
        metadata: {}
    }).select();
    if (error) console.error("Service Key Error:", error.message);
    else console.log("Service Key Success:", data);
}
test();
