const https = require('https');

async function testProductionTTS() {
    console.log("🚀 [测试阶段 1] 开始模拟液态课堂场景，向云端生成引流...");
    
    // 我们从客户端发起请求，完全不传 key，测试服务端是否能用硬编码的豆包专属配置兜底成功。
    const payload = JSON.stringify({
        text: "各位同学大家好，我是课堂助教。如果您能听到我的声音，说明豆包大模型的专用语音合成已经彻底打通！",
        audioId: "test_scene_audio_001",
        ttsProviderId: "volcengine-tts",
        ttsVoice: "BV700_V2_streaming", // 我们测试一下刚才写死的灿灿2.0双端大模型音色
        ttsSpeed: 1.0,
        // 这里不传 apiKey 或 baseUrl，测试服务器能否自动使用我们在 provider-config.ts 和 settings.ts 注入的豆包专属凭证!!!
    });

    try {
        const response = await fetch('https://ai-playground-xi-three.vercel.app/api/generate/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 模拟客户端 origin 以便绕过 CORS (如果有的话)
                'Origin': 'https://ai-playground-xi-three.vercel.app'
            },
            body: payload
        });
        
        console.log(`🌐 [测试阶段 2] 云端响应状态码: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log(`✅ [测试阶段 3] 测试圆满成功！`);
            console.log(`🎵 [声音数据] 格式: ${data.format}`);
            console.log(`📦 [Base64长度] 字节数: ${data.base64 ? data.base64.length : 0} (证明核心音频数据回传正常)`);
        } else {
            console.error(`❌ [测试阶段 3] 测试失败，错误信息:`, data);
        }
    } catch (e) {
        console.error('💣 [致命错误] 请求过程发生异常:', e);
    }
}

testProductionTTS();
