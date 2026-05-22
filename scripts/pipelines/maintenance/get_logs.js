const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://znmbkxmnwuurzhevfxtq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8');

async function run() {
    const { data: logs } = await supabase.from('ai_chat_logs').select('role, content').order('created_at', { ascending: false }).limit(20);
    logs.reverse().forEach(log => {
        let text = log.content.replace(/\n/g, ' ').substring(0, 150);
        console.log(`[${log.role.toUpperCase()}] ${text}`);
    });
}
run();
