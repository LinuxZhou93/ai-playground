
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn, exec } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const PIN = Math.floor(1000 + Math.random() * 9000); 
console.log('-------------------------------------------');
console.log(`[Antigravity Remote Bridge 2.5]`);
console.log(`PIN ACCESS CODE: ${PIN}`);
console.log('-------------------------------------------');

io.on('connection', (socket) => {
    let isAuthenticated = false;

    socket.on('auth', (inputPin) => {
        if (parseInt(inputPin) === PIN) {
            isAuthenticated = true;
            socket.emit('auth_success', true);
            socket.emit('output', '[System] Connected. Mode: UI Injection Active.\n');
        } else {
            socket.emit('auth_error', 'Invalid PIN');
        }
    });

    socket.on('command', (data) => {
        if (!isAuthenticated) return;

        const { text, mode } = data;
        const input = text.trim();
        
        if (mode === 'chat') {
            handleAssistantMode(input, socket);
        } else {
            handleTerminalMode(input, socket);
        }
    });
});

function handleAssistantMode(input, socket) {
    const lowerInput = input.toLowerCase();

    // 1. 特殊指令：获取最近会话
    if (lowerInput.includes('最近') && (lowerInput.includes('会话') || lowerInput.includes('对话'))) {
        fetchRecentSessions(socket);
        return;
    }

    // 2. 核心功能：UI 注入
    socket.emit('output', `[Action] Injecting text to Mac UI: "${input}"...`);
    
    // 调用 AppleScript 模拟物理输入
    const scriptPath = path.join(__dirname, 'inject_input.applescript');
    exec(`osascript "${scriptPath}" "${input.replace(/"/g, '\\"')}"`, (err) => {
        if (err) {
            socket.emit('output', `[ERR] UI Injection failed: ${err.message}\n`);
        } else {
            socket.emit('output', `[Success] Text sent to Frontend. Check your Mac.\n`);
        }
    });
}

function handleTerminalMode(input, socket) {
    if (['清屏', 'clear', 'cls'].includes(input.toLowerCase())) {
        socket.emit('clear_terminal');
        return;
    }

    const process = spawn(input, { shell: true, cwd: '/Users/zhoulin/Desktop/github/ai-playground' });

    process.stdout.on('data', (data) => socket.emit('output', data.toString()));
    process.stderr.on('data', (data) => socket.emit('output', `[ERR] ${data.toString()}`));
    process.on('close', (code) => socket.emit('output', `\n[Process exited with code ${code}]\n`));
}

function fetchRecentSessions(socket) {
    socket.emit('output', '[System] 正在调取最近 10 次会话概要...\n');
    const brainPath = '/Users/zhoulin/.gemini/antigravity/brain';
    
    try {
        const dirs = fs.readdirSync(brainPath)
            .filter(f => fs.statSync(path.join(brainPath, f)).isDirectory())
            .map(d => ({
                id: d,
                mtime: fs.statSync(path.join(brainPath, d)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime)
            .slice(0, 10);

        if (dirs.length === 0) {
            socket.emit('output', '未找到历史会话记录。\n');
            return;
        }

        dirs.forEach((dir, i) => {
            socket.emit('output', `[${i+1}] ID: ${dir.id} (${dir.mtime.toLocaleString()})\n`);
        });
        socket.emit('output', '\n以上为最近会话列表。你可以通过具体 ID 深入查询内容。\n');
    } catch (e) {
        socket.emit('output', `[ERR] 无法获取会话: ${e.message}\n`);
    }
}

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    startLogWatcher();
});

// 日志同步引擎
function startLogWatcher() {
    const brainPath = '/Users/zhoulin/.gemini/antigravity/brain';
    console.log('[System] Log Sync Engine started.');

    let lastSession = null;
    let lastSize = 0;

    setInterval(() => {
        try {
            const dirs = fs.readdirSync(brainPath)
                .filter(f => fs.statSync(path.join(brainPath, f)).isDirectory())
                .map(d => ({
                    id: d,
                    mtime: fs.statSync(path.join(brainPath, d)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);

            if (dirs.length > 0) {
                const latest = path.join(brainPath, dirs[0].id, '.system_generated/logs/overview.txt');
                
                if (latest !== lastSession) {
                    lastSession = latest;
                    lastSize = 0;
                }

                if (fs.existsSync(latest)) {
                    const stats = fs.statSync(latest);
                    if (stats.size > lastSize) {
                        const stream = fs.createReadStream(latest, { start: lastSize });
                        stream.on('data', (chunk) => {
                            const newText = chunk.toString();
                            // 只推送 AI 响应部分或新日志行
                            io.emit('output', `[Sync] ${newText}`);
                        });
                        lastSize = stats.size;
                    }
                }
            }
        } catch (e) {
            // 静默处理由于动态生成导致的路径暂时不存在
        }
    }, 2000); // 每 2 秒同步一次
}
