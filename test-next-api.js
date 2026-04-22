const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/camp_report/generate',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('API Result:', data));
});
req.write(JSON.stringify({
    student_id: "test",
    student_name: "test",
    focus_score: 80, dexterity_score: 80, logic_score: 80, resilience_score: 80,
    self_management_score: 80, social_score: 80, creativity_score: 80, collaboration_score: 80,
    highlights: "test", potential_improvements: "test"
}));
req.end();
