/**
 * Vercel 构建前置环境预检脚本
 * 用于在构建阶段提供友好的人性化中文提示
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

console.log('\x1b[36m%s\x1b[0m', '🔍 [环境预检] 正在检查 Vercel 部署环境...');

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  警告：检测到项目缺失以下关键环境变量：');
  missingVars.forEach(v => {
    console.log('\x1b[31m%s\x1b[0m', `   - ${v}`);
  });
  
  console.log('\n\x1b[32m%s\x1b[0m', '💡 [解决方案]');
  console.log('请前往 Vercel 控制台 -> Project Settings -> Environment Variables 填入上述变量的值。');
  console.log('虽然代码已针对此情况做了“静默降级”处理以允许构建通过，但页面功能可能会受限。');
  console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------\n');
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ [环境预检] 所有关键变量已就绪。');
}

// 即使缺失变量我们也不退出，因为我们已经做了代码层面的 Mock 降级
process.exit(0);
