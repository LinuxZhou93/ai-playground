require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const conf = fs.readFileSync('assets/js/supabase-config.js', 'utf8');
const keyMatch = conf.match(/key:\s*'([^']+)'/);
if (keyMatch) {
  const supabase = createClient(SUPABASE_URL, keyMatch[1]);
  async function test() {
      const { data, error } = await supabase.from('profiles').select('*').eq('username', '13699466775');
      console.log("Profiles:", data);
  }
  test();
}
