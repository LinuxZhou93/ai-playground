const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://znmbkxmnwuurzhevfxtq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g');

async function main() {
  const { error } = await supabase.from('stages').upsert({
    id: 'test_123',
    name: 'test',
    author_id: 'anonymous',
    is_public: true
  });
  console.log("Error:", error);
}
main();
