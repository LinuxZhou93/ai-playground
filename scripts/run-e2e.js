const { spawn } = require('child_process');

const child = spawn('pnpm', ['playwright', 'test', 'e2e/tests/labs.spec.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3002' }
});

child.on('exit', (code) => {
  process.exit(code);
});