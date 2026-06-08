const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/lab_report/generate',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('--- API Response Code:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('--- API Response JSON:', JSON.stringify(parsed, null, 2));
      if (parsed.success) {
         console.log('🎉 测试成功！接口生成成功，并已存入 Supabase，ID为:', parsed.id);
      } else {
         console.error('❌ 测试失败，错误信息:', parsed);
      }
    } catch(e) {
      console.error('❌ 解析 JSON 失败，原始数据:', data);
    }
  });
});

req.on('error', err => {
  console.error('❌ 网络错误，无法连接到开发服务器:', err.message);
});

req.write(JSON.stringify({
    student_id: "WOW-LAB-TEST",
    student_name: "测试学员小明",
    camp_name: "成电创客wowcreator社区实验室 (测试数据)",
    focus_score: 95, dexterity_score: 88, logic_score: 90, resilience_score: 75,
    self_management_score: 80, social_score: 85, creativity_score: 95, collaboration_score: 90,
    highlights: "在今天的连杆拼装测试中展现出极佳的动手能力，并成功编写了避障逻辑。",
    potential_improvements: "面对多重嵌套循环时有些思维混乱，建议加强系统化算法学习。"
}));
req.end();
