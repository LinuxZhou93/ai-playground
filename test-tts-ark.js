const fs = require('fs');
const https = require('https');

async function testArkTTS() {
    const token = "e_t1R3UXzl-qvSTrFdEgh0-NFhjN5p7z";
    const text = "测试一下火山引擎语音合成。";

    // Try Bytedance Ark endpoint
    try {
        const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: "ep-20240521-12345", // We need a valid endpoint ID usually, but maybe it falls back or the token is bound? We will see. To be safe we will just pass a generic or maybe we don't know the EP.
                input: text,
                voice: "zh_child_feifei_moon_bigtts"
            })
        });
        
        console.log('Ark Status:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('Ark TTS Success!');
        } else {
            const resultText = await response.text();
            console.log('Ark Error text:', resultText);
        }
    } catch (e) {
        console.error('Ark fetch error:', e);
    }
}

testArkTTS();
