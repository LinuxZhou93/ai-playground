const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://znmbkxmnwuurzhevfxtq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU3OTUwNCwiZXhwIjoyMDgwMTU1NTA0fQ.SepE180KhI9MhSr1HjBZYbxoCgQk219yXxKCJMcWBW8');
supabase.rpc('exec_sql', { sql: 'SELECT 1;' }).then(console.log).catch(console.error);
