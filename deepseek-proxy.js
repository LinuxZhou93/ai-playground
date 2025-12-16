// DeepSeek API 代理服务器
// 解决浏览器 CORS 跨域问题

const http = require('http');
const https = require('https');

const PORT = 3000;
const DEEPSEEK_API = 'api.deepseek.com';
const API_KEY = 'sk-abb5d221fe624678ad545f2469b66419';

const server = http.createServer((req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const options = {
                hostname: DEEPSEEK_API,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            const proxyReq = https.request(options, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            });

            proxyReq.on('error', (error) => {
                console.error('代理请求错误:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ error: error.message }));
            });

            proxyReq.write(body);
            proxyReq.end();
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🚀 DeepSeek 代理服务器运行在 http://localhost:${PORT}`);
    console.log(`📡 API 端点: http://localhost:${PORT}/v1/chat/completions`);
    console.log(`🔑 使用 API Key: ${API_KEY.substring(0, 10)}...`);
    console.log('\n✅ 现在可以在 course.html 中使用此代理');
});
