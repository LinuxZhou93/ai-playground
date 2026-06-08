const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    console.log("Testing anon insert without select...");
    const { data, error } = await supabase.from('ai_chat_logs').insert({
        user_id: null,
        role: 'user',
        content: 'test anon without select',
        metadata: {}
    });
    if(error){ console.error("Error inserting:", error.message); }
    else { console.log("Success! No RLS violation"); }
}
test();
