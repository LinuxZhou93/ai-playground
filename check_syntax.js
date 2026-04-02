const fs = require('fs');
try {
  const content = fs.readFileSync('public/psyche_x_system/frontend/camp_report.html', 'utf8');
  const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const code = match[1];
    try {
      new Function(code);
    } catch(e) {
      console.error("SYNTAX ERROR IN SCRIPT BLOCK:", e);
    }
  }
} catch(e) {
  console.error(e);
}
