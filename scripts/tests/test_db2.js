const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
  const html = fs.readFileSync('/Users/zhoulin/Desktop/github/ai-playground/assets/js/supabase-config.js', 'utf8');
  const matchUrl = html.match(/url:\s*'([^']+)'/);
  const matchKey = html.match(/key:\s*'([^']+)'/);
  if (matchUrl && matchKey) {
    const supabase = createClient(matchUrl[1], matchKey[1]);
    const res = await supabase.from('user_dashboard_data').select('*').limit(5);
    console.log("DASHBOARD DATA:", res.data);
    const profiles = await supabase.from('profiles').select('*').limit(5);
    console.log("PROFILES:", profiles.data);
  } else {
    console.log("No match");
  }
}
test();
