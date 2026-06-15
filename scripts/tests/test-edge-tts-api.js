const fs = require('fs');

(async () => {
    console.log("Testing Edge TTS endpoint on localhost:3000...");
    try {
        const response = await fetch('http://localhost:3000/api/edge-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: "小朋友们，大家好！我是晓晓老师，很高兴来到未来课堂。",
                voice: "zh-CN-XiaoxiaoNeural"
            })
        });

        if (!response.ok) {
            console.error("API returned error status:", response.status, response.statusText);
            const errBody = await response.text();
            console.error(errBody);
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync('/tmp/test-edge-tts.mp3', buffer);
        console.log(`Success! Audio saved to /tmp/test-edge-tts.mp3 (${buffer.length} bytes).`);
        console.log("You can listen to it by clicking or playing it from the file system.");
    } catch (error) {
        console.error("Error connecting to API:", error.message);
    }
})();
