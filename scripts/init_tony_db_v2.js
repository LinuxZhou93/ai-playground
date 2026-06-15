const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function init() {
  console.log("🚀 Testing connection...");
  
  // 无法直接运行 SQL，但我们可以尝试触发一个 RPC 或者检查表
  const { data, error } = await supabase.from('tony_skills').select('count', { count: 'exact', head: true });
  
  if (error && error.code === 'PGRST204') {
    console.error("❌ Table 'tony_skills' still missing.");
    console.log("💡 由于 Supabase 安全限制，DDL 建表必须在 Dashboard 手动运行一次。");
  } else if (error) {
    console.error("❌ DB Error:", error.message);
  } else {
    console.log("✅ Table exists!");
  }
}

init();
