const { spawn } = require('child_process');

const command = '/Users/zhoulin/.gemini/antigravity/node_modules/.bin/feishu-mcp';
const args = ['--log-level', 'none', '--enabled-modules', 'document', '--stdio'];

const child = spawn(command, args, {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

process.stdin.pipe(child.stdin);

let buffer = '';
child.stdout.on('data', (data) => {
  buffer += data.toString();
  let lines = buffer.split('\n');
  buffer = lines.pop();

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    // 核心过滤：只有以 { 开头的行（认为是 JSON）才转发到 stdout
    if (line.startsWith('{')) {
      process.stdout.write(line + '\n');
    } else {
      // 杂质输出全部丢进 stderr，不影响 MCP 通讯
      process.stderr.write(`[Filtered Noise] ${line}\n`);
    }
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
