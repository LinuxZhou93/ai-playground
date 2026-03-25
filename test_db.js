const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const html = fs.readFileSync('/Users/zhoulin/Desktop/github/ai-playground/assets/js/supabase-config.js', 'utf8');
const matchUrl = html.match(/url:\s*'([^']+)'/);
const matchKey = html.match(/key:\s*'([^']+)'/);
if (matchUrl && matchKey) {
  const supabase = createClient(matchUrl[1], matchKey[1]);
  supabase.from('user_dashboard_data').select('*').limit(5).then(res => console.log(JSON.stringify(res.data, null, 2)));
}
