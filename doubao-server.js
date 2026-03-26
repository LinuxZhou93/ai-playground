const express = require('express');
const cors = require('cors');
const aws4 = require('aws4');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ 服务器绝密配置 (绝不能出现在前端 JS 中)
const APP_ID = '4780476544'; 
const ACCESS_KEY = 'e_t1R3UXzI-qvSTrFdEgh0-NFhjN5p7z';
const SECRET_KEY = 'bOZ-NC-raInT7RrQDLxuMI2Sbq6glQhm';

app.post('/api/tts', (req, res) => {
    const { text, voice } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    // 豆包 V3 API 的精确请求体
    const payload = JSON.stringify({
        app: { 
            appid: APP_ID, 
            token: ACCESS_KEY, // V3 原版协议规范
            cluster: 'volcano_tts'
        },
        user: { uid: 'titan_frontend_user' },
        audio: { 
            voice_type: voice || 'saturn_zh_female_cancan_tob', 
            encoding: 'mp3', 
            speed_ratio: 1.0, 
            volume_ratio: 1.0, 
            pitch_ratio: 1.0 
        },
        request: { 
            reqid: require('crypto').randomUUID(), 
            text: text, 
            text_type: 'plain', 
            operation: 'query' 
        }
    });

    // 构造请求头，注意这完全避开了明文发送 Secret Key
    const opts = {
        host: 'openspeech.bytedance.com',
        path: '/api/v3/tts/unidirectional',
        service: 'tts',          // 火山引擎底层的 AWS V4 签名的 Service 标识
        region: 'cn-north-1',    // 火山通用 Region
        method: 'POST',
        headers: {
            'X-Api-App-Key': APP_ID, 
            'X-Api-Access-Key': ACCESS_KEY,
            'X-Api-Resource-Id': 'seed-tts-2.0', // 严格服从官方文档
            'Content-Type': 'application/json'
        },
        body: payload
    };

    // 🌶️ 核心魔法：使用 Amazon AWS 的签名算法（火山引擎100%兼容此算法）对请求进行高强度加密哈希
    // 这个动作绝对不能在浏览器做
    aws4.sign(opts, { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY });

    // 发起安全加密请求向火山引擎
    const volcanoReq = https.request(opts, (volcanoRes) => {
        const contentType = volcanoRes.headers['content-type'] || '';
        
        // 如果是 JSON，大概率是 3001 / 401 报错
        if (contentType.includes('json')) {
            let errorData = '';
            volcanoRes.on('data', chunk => errorData += chunk);
            volcanoRes.on('end', () => {
                console.error("❌ 火山接口报错:", errorData);
                res.status(500).json({ error: 'Volcengine Billing API Error', details: JSON.parse(errorData || '{}') });
            });
            return;
        }

        // 如果是音频流，直接把音频 Buffer 流式转发回前端网页
        res.setHeader('Content-Type', contentType);
        volcanoRes.pipe(res);
    });

    volcanoReq.on('error', (err) => {
        console.error("请求火山网络超时:", err);
        res.status(500).json({ error: err.message });
    });

    volcanoReq.write(payload);
    volcanoReq.end();
});

const PORT = 3005;
app.listen(PORT, () => {
    console.log(`🚀 [神级后端代理启动成功] - 正在监听: http://localhost:${PORT}`);
    console.log(`🎙️ 豆包 V3 加密引擎就绪!`);
    console.log(`   AppID: ${APP_ID}`);
    console.log(`   Resource-Id: seed-tts-2.0`);
});
