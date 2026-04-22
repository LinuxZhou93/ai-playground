import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://backgrace.com/v1',
});

// 整夜突击全站优化清单 (Wave 3 - 顶级商业级 UI)
const TARGET_FILES = [
  'app/futureclass/dashboard/page.tsx',
  'app/futureclass/dashboard/DiagnosisBoard.tsx',
  'app/futureclass/courses/page.tsx',
  'app/futureclass/classes/page.tsx',
  'app/futureclass/students/page.tsx',
  'app/futureclass/finance/page.tsx',
  'app/futureclass/attendance/page.tsx',
  'app/futureclass/settings/page.tsx',
  'app/futureclass/students/[id]/page.tsx',
  'components/erp/sidebar.tsx',
  'components/erp/command-palette.tsx',
  'components/erp/page-transition.tsx',
  'components/erp/skeleton-card.tsx',
  'components/erp/animated-number.tsx',
  'app/futureclass/layout.tsx',
];

function extractCodeBlock(text) {
  const codeBlockRegex = /```(?:tsx|typescript|javascript|js|jsx)?\n([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);
  return match ? match[1] : null;
}

async function log(msg) {
  const timestamp = new Date().toISOString();
  const logStr = `[${timestamp}] ${msg}\n`;
  console.log(logStr.trim());
  fs.appendFileSync(path.join(__dirname, '.agent', 'auto_evolution.log'), logStr);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function evolveFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    await log(`❌ 文件不存在: ${filePath}`);
    return false;
  }

  const code = fs.readFileSync(fullPath, 'utf8');
  await log(`🤖 正在用大模型分析并优化: ${filePath}...`);

  const prompt = `
你是一个世界顶级的 SaaS ERP 前端架构师 (极度擅长 Next.js 15, Tailwind CSS, Framer Motion)。
请对以下代码进行高级 UI/UX 重构与极客级优化：
1. **视觉跃升 (Stripe/Linear 风格)**: 增加极简的玻璃拟物化 (glassmorphism) 效果，增强 hover 时的暗黑模糊投影，使用更具高级感的色系 (slate/zinc)。
2. **渐进式动画**: 为列表或卡片元素补充适当的 Framer Motion 或 CSS transition 动画。
3. **极致体验**: 检查现有组件结构，如果代码包含统计数字或列表，请使用极简的高级样式呈现。
4. **精益代码**: 保持所有既有业务逻辑、import 路径结构和状态管理完全不变，**只进行样式与组件表现层级的升级**。
5. **防御性重构**: 不要删除核心逻辑！

**注意**: 你只能输出一个包含完整修改后代码的 Markdown 代码块（如 \`\`\`tsx 开头），绝对不允许缩略（不要写 "..."），必须是能直接拿去覆盖源文件的完整代码。如果代码太长必须耐心生成完整。

下面是被优化的源代码：
\`\`\`tsx
${code}
\`\`\`
`.trim();

  try {
    // 使用 Backgrace 中转站实际可用的模型名（已通过 /v1/models 验证）
    const MODEL = 'gemini-3-flash';
    await log(`  -> 使用模型 [${MODEL}] 请求 API...`);
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a master Next.js Developer. Output the COMPLETE file, never truncate with "..." or comments like "rest of code". Every single line must be present.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 16000,
    });

    const reply = completion.choices[0].message.content;
    const newCode = extractCodeBlock(reply);

    if (newCode && newCode.length > code.length * 0.5) {
      // 备份原文件
      const backupDir = path.join(__dirname, '.agent', 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const backupName = filePath.replace(/\//g, '_') + `.${Date.now()}.bak`;
      fs.writeFileSync(path.join(backupDir, backupName), code, 'utf8');
      
      fs.writeFileSync(fullPath, newCode, 'utf8');
      await log(`✅ 优化成功并已覆写 (${newCode.length} chars, 备份已创建): ${filePath}`);
      return true;
    } else {
      await log(`⚠️ 大模型返回的代码不完整 (${newCode?.length || 0} chars vs 原始 ${code.length} chars)，放弃覆写。`);
      return false;
    }
  } catch (error) {
    await log(`❌ 调用错误: ${error.message}`);
    return false;
  }
}

async function startEvolutionLoop() {
  await log('');
  await log('='.repeat(60));
  await log('🚀 TITAN AUTO-EVOLUTION ENGINE v3 — NIGHT MODE');
  await log(`🎯 目标：循环遍历全站 ${TARGET_FILES.length} 个核心页面/组件，执行顶级商业化重构！`);
  await log('='.repeat(60));

  let round = 0;
  
  // 死循环执行，利用日期或强制终端打断来停止
  // 预计运行至次日早晨 8 点 (相当于未来 7 个小时)
  const END_TIME = new Date();
  END_TIME.setHours(8, 0, 0, 0);
  if (END_TIME < new Date()) END_TIME.setDate(END_TIME.getDate() + 1);

  await log(`⏰ 计划持续运行至：${END_TIME.toLocaleString()}`);

  while (new Date() < END_TIME) {
    await log(`\n📦 开始新一轮全站扫描...`);
    for (let f = 0; f < TARGET_FILES.length; f++) {
      if (new Date() >= END_TIME) break;
      
      round++;
      await log(`\n🔄 [Round ${round}] - ${new Date().toLocaleTimeString()}`);
      await evolveFile(TARGET_FILES[f]);

      await log(`🧊 冷却 60 秒以防触发 API 限流...`);
      await sleep(60000); // 防限流冷却机制
    }
  }

  await log(`\n🎉 通宵进化 (${round} 轮) 已全部完成！指挥官早上好！`);
}

startEvolutionLoop();
