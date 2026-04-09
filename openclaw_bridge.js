const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// 你的飞书应用凭证 (需要替换这部分的 Encrypt Key 和 Verification Token)
// 在飞书开发者后台 -> 事件订阅 页面可以找到这俩
const FEISHU_VERIFICATION_TOKEN = 'your_verification_token_here'; 
const FEISHU_ENCRYPT_KEY = 'your_encrypt_key_here'; // 如果开启了加密才需要

// 端口
const PORT = 3000;

// GET 健康检查 - 浏览器直接访问时返回状态
app.get('/webhook/feishu', (req, res) => {
    res.json({ status: 'alive', service: 'OpenClaw Bridge', time: new Date().toISOString() });
});

app.post('/webhook/feishu', (req, res) => {
    const body = req.body;

    // 1. 飞书挑战字校验 (Challenge) - 首次绑定 URL 时必须
    //    自建应用无条件通过，直接回传 challenge
    if (body.type === 'url_verification') {
        console.log("✅ 飞书 Webhook Challenge 验证通过！");
        return res.json({ challenge: body.challenge });
    }

    // 2. 接收消息事件 (Event: im.message.receive_v1)
    if (body.header && body.header.event_type === 'im.message.receive_v1') {
        const event = body.event;
        const msgType = event.message.message_type; // text, audio, image etc.

        if (msgType === 'text') {
            // 解析用户发送的文本内容
            let contentObj = JSON.parse(event.message.content);
            let userText = contentObj.text.trim();
            console.log(`\n📨 收到来自飞书的指令: ${userText}`);

            // 🌟 核心连接点：召唤本地 Antigravity (Unit 3) 🌟
            // 将来自手机的信息通过本地终端指令传递给本机 AI 引擎
            console.log(`🚀 正在唤醒 Unit 3 (Antigravity) 处理任务...`);
            
            // 注意：这里用你实际唤醒 Unit 3 / AI 代理的命令行替换
            // 假设本地启动指令是: antigravity --task "指令内容"
            const command = `echo "Received via Feishu: ${userText}" >> /tmp/feishu_openclaw.log`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`💥 执行失败: ${error}`);
                    return;
                }
                console.log(`✅ Unit 3 执行完毕。`);
                
                // --- 这里下一步是调用 HTTP POST /im/v1/messages 将结果发回手机飞书 ---
                // (由于需要复杂的鉴权换取 tenant_access_token，此处略作简化，实际环境中应向原 Sender 发送消息)
            });
        }
        return res.status(200).send("success");
    }

    res.status(200).send("ignored");
});

app.listen(PORT, () => {
    console.log(`========== OpenClaw 桥接中心 ==========`);
    console.log(`[+] Webhook 监听已启动: http://localhost:${PORT}/webhook/feishu`);
    console.log(`[+] 请使用 ngrok 将此端口映射到公网: ngrok http ${PORT}`);
    console.log(`=======================================`);
});
