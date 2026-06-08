const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function analyzeLogs() {
    console.log("🔍 Fetching Recent AI Chat Logs for Analysis...");
    
    const { data: logs, error } = await supabase
        .from('ai_chat_logs')
        .select(`
            id,
            user_id,
            role,
            content,
            metadata,
            created_at,
            profiles ( nickname, email )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("❌ Error fetching logs:", error.message);
        // Let's fallback if the join fails (maybe no fk on profiles)
        const { data: rawLogs, error: rawError } = await supabase
            .from('ai_chat_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
        if (rawError) {
             console.error("❌ Fallback Error:", rawError.message);
             return;
        }
        printLogs(rawLogs);
        return;
    }

    printLogs(logs);
}

function printLogs(logs) {
    if (!logs || logs.length === 0) {
        console.log("⚠️ No chat logs found in the database yet.");
        return;
    }

    console.log(`✅ successfully retrieved ${logs.length} records.`);
    console.log("-------------------------------------------------");
    
    logs.forEach((log) => {
        let userDisplay = log.user_id ? log.user_id : 'Anonymous';
        if (log.profiles && log.profiles.nickname) {
            userDisplay = `${log.profiles.nickname} (${log.profiles.email || userDisplay})`;
        }
        
        console.log(`[${new Date(log.created_at).toLocaleString('zh-CN')}] User: ${userDisplay}`);
        console.log(`  Role: ${log.role}`);
        
        // Truncate long content
        let contentStr = log.content ? log.content.substring(0, 100).replace(/\n/g, '\\n') : '[Empty]';
        if (log.content && log.content.length > 100) contentStr += '...';
        
        console.log(`  Content: ${contentStr}`);
        console.log(`  Metadata: ${JSON.stringify(log.metadata)}`);
        console.log("-------------------------------------------------");
    });
}

analyzeLogs();
