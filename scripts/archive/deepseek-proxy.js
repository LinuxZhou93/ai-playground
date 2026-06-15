const http = require('http');
const https = require('https');

const PORT = 3000;
const DEEPSEEK_API_HOST = 'api.deepseek.com';

const server = http.createServer((clientReq, clientRes) => {
    // CORS Headers
    clientRes.setHeader('Access-Control-Allow-Origin', '*');
    clientRes.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    clientRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (clientReq.method === 'OPTIONS') {
        clientRes.writeHead(204);
        clientRes.end();
        return;
    }

    if (clientReq.url === '/v1/chat/completions' && clientReq.method === 'POST') {
        const options = {
            hostname: DEEPSEEK_API_HOST,
            path: '/chat/completions',
            method: 'POST',
            headers: {
                ...clientReq.headers,
                host: DEEPSEEK_API_HOST
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(clientRes);
        });

        proxyReq.on('error', (e) => {
            console.error('Proxy Request Error:', e);
            clientRes.writeHead(500);
            clientRes.end('Proxy Error');
        });

        clientReq.pipe(proxyReq);
    } else {
        clientRes.writeHead(404);
        clientRes.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`DeepSeek Proxy running at http://localhost:${PORT}`);
});
