require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const conf = fs.readFileSync('assets/js/supabase-config.js', 'utf8');
const keyMatch = conf.match(/key:\s*'([^']+)'/);
if (keyMatch) {
  const supabase = createClient(SUPABASE_URL, keyMatch[1]);
  async function test() {
      const { data, error } = await supabase.from('student_learning_logs').insert({
          module_name: 'TEST API',
          action_type: 'TEST_INSERT',
          action_value: 'SUCCESS'
      });
      console.log("Insert result:", { data, error });

      const { data: fetchD, error: fetchE } = await supabase.from('student_learning_logs').select('*');
      console.log("Fetch result (expect empty for anon if RLS select is blocked):", { data: fetchD, error: fetchE });
  }
  test();
}
