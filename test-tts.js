const fs = require('fs');
const https = require('https');

async function testTTS() {
    const appId = "4780476544";
    const token = "e_t1R3UXzl-qvSTrFdEgh0-NFhjN5p7z";
    const reqid = 'req-srv-' + Date.now() + Math.random().toString().slice(2,8);
    const text = "测试一下火山引擎语音合成。";

    const payload = JSON.stringify({
        app: {
            appid: appId,
            token: token,
            cluster: "volcano_tts"
        },
        user: { uid: "titan_student" },
        audio: {
            voice_type: "zh_child_feifei_moon_bigtts",
            encoding: "mp3",
            speed_ratio: 1.0,
            volume_ratio: 1.0,
            pitch_ratio: 1.0
        },
        request: {
            reqid: reqid,
            text: text,
            text_type: "plain",
            operation: "query"
        }
    });

    try {
        const response = await fetch('https://openspeech.bytedance.com/api/v1/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer; ${token}`
            },
            body: payload
        });
        
        console.log('Status:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Result code:', result.code);
            console.log('Result message:', result.message);
            if (result.code === 3000) {
                console.log('TTS Success, audio length:', result.data.length);
            }
        } else {
            const text = await response.text();
            console.log('Error text:', text);
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testTTS();
