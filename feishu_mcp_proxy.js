const { spawn } = require('child_process');

// 确认底层 MCP 服务器路径
const command = '/Users/zhoulin/.gemini/antigravity/node_modules/.bin/feishu-mcp';
const args = ['--log-level', 'none', '--enabled-modules', 'document', '--use-stdio']; // 强制使用 stdio 模式，彻底避免端口冲突


const child = spawn(command, args, {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'] // 完全控制 stdin, stdout, stderr
});

// 1. 无损管道：将客户端指令传给底层
process.stdin.pipe(child.stdin);

// 2. 核心修复：纯净流转发
// 之前的逐行判断容易断流。现在我们只处理真正的 JSON 片段输出。
child.stdout.on('data', (data) => {
  // 直接透传，但需要确保不被脚本自身的 console.log 污染
  process.stdout.write(data);
});

// 3. 错误分流：将所有非 JSON 输出（日志/报错）打印到 stderr，防止污染主通讯频道
child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('exit', (code) => {
  if (code !== 0) {
    process.stderr.write(`[ERROR] Feishu MCP process exited with code ${code}\n`);
  }
  process.exit(code);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

