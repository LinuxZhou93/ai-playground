const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
(async () => {
    const tts = new MsEdgeTTS();
    await tts.setMetadata("zh-CN-XiaoxiaoNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const readable = tts.toStream("你好，这是一个测试");
    const chunks = [];
    readable.on("data", (data) => chunks.push(data));
    readable.on("close", () => {
        console.log("Done! Length:", Buffer.concat(chunks).length);
    });
})();
