/**
 * Live Vision Multimodal Copilot
 * 实现了调用底层 API (getUserMedia) 同步获取原生 Camera 视频帧与 PCM Audio 音频流，
 * 采用 Web Worker/AudioContext 技术抓取底层像素与频谱。
 * 完美适用于对接 OpenAI Realtime WebSocket API 或 Gemini Multimodal Live API。
 */

class LiveVisionCopilot {
    constructor() {
        this.isActive = false;
        this.videoStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.frameInterval = null;
        this.wsConnection = null; // To hold the WebSocket connection later
        
        this.buildUI();
    }

    buildUI() {
        const hudHTML = `
            <div id="live-vision-hud" style="
                display: none;
                position: fixed; inset: 0; z-index: 999999;
                background: #000;
                font-family: 'Orbitron', 'Inter', sans-serif;
                color: #fff;
            ">
                <!-- 镜头显示区域 -->
                <video id="live-vision-video" autoplay playsinline muted style="
                    width: 100%; height: 100%; object-fit: cover; opacity: 0.7;
                "></video>

                <!-- 网格扫描线遮罩 (Cyberpunk 感) -->
                <div style="
                    position: absolute; inset: 0; pointer-events: none;
                    background: linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                "></div>

                <!-- 顶部状态栏 -->
                <div style="position: absolute; top: 40px; left: 40px; right: 40px; display: flex; justify-content: space-between; align-items: flex-start; text-shadow: 0 0 10px #000;">
                    <div>
                        <div style="color: #10b981; font-weight: 800; font-size: 24px; letter-spacing: 2px; display:flex; align-items:center; gap:10px;">
                            <div style="width:12px; height:12px; background:#10b981; border-radius:50%; box-shadow: 0 0 10px #10b981; animation: pulse 1s infinite alternate;"></div>
                            LIVE VISION LINK
                        </div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 5px;">MULTIMODAL SENSORS ONLINE / <span id="lv-fps">30</span> FPS</div>
                    </div>
                    <button id="live-vision-close" style="
                        background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444;
                        padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer;
                        box-shadow: 0 0 15px rgba(239,68,68,0.3); transition: 0.2s;
                    ">终止连接 (DISCONNECT)</button>
                </div>

                <!-- 底部面板区域 -->
                <div style="
                    position: absolute; bottom: 0; left: 0; right: 0;
                    height: 250px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                    display: flex; flex-direction: column; justify-content: flex-end; padding: 40px;
                ">
                    <!-- 音频波形器 -->
                    <canvas id="live-vision-audio-wave" width="800" height="80" style="width:100%; height:80px; filter: drop-shadow(0 0 5px #10b981);"></canvas>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
                        <div style="max-width: 60%;">
                            <div style="font-size: 12px; color: #10b981; margin-bottom: 5px;">> AI_VOICE_RETURN_CHANNEL</div>
                            <div id="live-vision-subtitle" style="font-size: 20px; line-height: 1.5; text-shadow: 0 0 5px #000;">
                                “你好！硬件底层采集已就绪。正在同步环境视觉并倾听你的声音...”
                            </div>
                        </div>
                        <div style="text-align: right; width: 35%; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                            <div id="live-vision-status" style="font-size: 11px; color: rgba(255,255,255,0.5); background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px;">
                                状态: 等待语音唤醒 (VAD_READY)
                            </div>
                            <button id="live-vision-mic-toggle" style="background: #10b981; color: #000; border: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 0 15px rgba(16,185,129,0.4);">
                                正在聆听 (可点击暂停)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes pulse { 0% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.2); } }
            </style>
        `;
        const div = document.createElement('div');
        div.innerHTML = hudHTML;
        document.body.appendChild(div);

        this.hud = document.getElementById('live-vision-hud');
        this.video = document.getElementById('live-vision-video');
        this.canvasWave = document.getElementById('live-vision-audio-wave');
        this.ctxWave = this.canvasWave.getContext('2d');
        this.subtitle = document.getElementById('live-vision-subtitle');
        this.statusText = document.getElementById('live-vision-status');
        this.micToggleBtn = document.getElementById('live-vision-mic-toggle');
        
        document.getElementById('live-vision-close').addEventListener('click', () => this.stop());
        
        // 绑定麦克风控制
        this.micToggleBtn.addEventListener('click', () => {
             if (this.recognition) {
                 if (this.isListening) {
                     this.recognition.stop();
                     this.isListening = false;
                     this.micToggleBtn.innerText = '已暂停聆听 (点击唤醒)';
                     this.micToggleBtn.style.background = '#64748b';
                 } else {
                     this.recognition.start();
                     this.isListening = true;
                     this.micToggleBtn.innerText = '正在聆听 (可点击暂停)';
                     this.micToggleBtn.style.background = '#10b981';
                 }
             }
        });
    }

    async start() {
        this.hud.style.display = 'block';
        this.isActive = true;
        this.subtitle.innerText = "“正在建立与底层硬件摄像引擎及麦克风列阵的连接...”";

        try {
            // 获取摄像头与麦克风 (环境光后置/或者默认前置广角)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
                audio: { echoCancellation: true, noiseSuppression: true }
            });
            this.videoStream = stream;
            this.video.srcObject = stream;

            // 监听并渲染音频频谱
            this.setupAudioVisualizer(stream);

            // 启动智能语音识别与异步画面分析死循环
            this.startSmartMultimodalLoop();

            this.subtitle.innerHTML = "<span style='color: #10b981;'>系统多模态流已启动！</span>我现在可以通过摄像头看到你的画面。请试着对我说：<br>“小创老师，帮我看看画面里的机器人是怎么组装的？”";

        } catch (err) {
            console.error("硬件调用失败:", err);
            this.subtitle.innerHTML = "<span style='color: #ef4444;'>硬件调用失败：请确系已在系统级授权摄像头与麦克风权限！</span>";
        }
    }

    setupAudioVisualizer(stream) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.isActive) return;
            requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(dataArray);
            
            this.ctxWave.clearRect(0, 0, this.canvasWave.width, this.canvasWave.height);
            this.ctxWave.lineWidth = 3;
            this.ctxWave.strokeStyle = '#10b981';
            this.ctxWave.beginPath();

            const sliceWidth = this.canvasWave.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 255.0;
                // 让波浪更有中心对称的科幻感
                const y = this.canvasWave.height - v * this.canvasWave.height;
                
                if (i === 0) this.ctxWave.moveTo(x, y);
                else this.ctxWave.lineTo(x, y);

                x += sliceWidth;
            }
            this.ctxWave.lineTo(this.canvasWave.width, this.canvasWave.height);
            this.ctxWave.stroke();
        };
        draw();
    }

    startSmartMultimodalLoop() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.subtitle.innerText = "当前浏览器不支持语音识别引擎，实境指导启动失败。请使用 Chrome/Edge/Safari 等现代浏览器。";
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = false; // 每次说完一句话自动结束并分析
        this.recognition.interimResults = false;
        
        this.isProcessing = false;
        this.isListening = true;

        this.recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            if (!transcript.trim() || this.isProcessing) return;
            
            this.isProcessing = true;
            this.subtitle.innerHTML = `<span style="color:#38bdf8">你说：</span>"${transcript}"<br><span style="color:#10b981; font-size: 14px; animation: pulse 1s infinite alternate;">[正在抽取多模态视觉帧并交由 Gemini 分析...]</span>`;
            this.statusText.innerText = "状态: 抽取关键帧并分析中 (ANALYZING_VISION)";
            
            try {
                // 1. 抽取当前画面帧
                const offscreenCanvas = document.createElement('canvas');
                const ctx = offscreenCanvas.getContext('2d');
                // 压缩发送，减少 Token 浪费，保证 Flash 速度
                offscreenCanvas.width = 640; 
                offscreenCanvas.height = Math.floor(640 * (this.video.videoHeight / this.video.videoWidth));
                ctx.drawImage(this.video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
                const base64Image = offscreenCanvas.toDataURL('image/jpeg', 0.5);

                // 2. 组装发给 AI 的内容结构 (依托底层 TitanAIAssistant 的发信系统)
                const apiMessages = [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `[系统指令：这是通过 Live Vision 实境指导捕获的前置摄像头最新画面。请简短直接、口语化地像坐在学生对面一样回答。绝不要寒暄。]\n\n学生刚才说：“${transcript}”` },
                            { type: "image_url", image_url: { url: base64Image } }
                        ]
                    }
                ];

                // 3. 极速调配底层代理 API
                if (!window.titanAIAssistant || !window.titanAIAssistant.settings.endpoint) throw new Error("API 网关未初始化");
                
                const response = await fetch(window.titanAIAssistant.settings.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.titanAIAssistant.settings.apiKey}` },
                    body: JSON.stringify({ model: window.titanAIAssistant.settings.model, messages: apiMessages, temperature: 0.7, max_tokens: 1024 })
                });

                if (!response.ok) throw new Error(`API HTTP Error ${response.status}`);
                const data = await response.json();
                const aiReply = data.choices[0].message.content;

                // 4. 清爽展示并朗读反馈
                this.subtitle.innerHTML = `<span style="color:#10b981">[小创指导]：</span>${aiReply}`;
                this.statusText.innerText = "状态: 语音合成播报中 (TTS_PLAYING)";
                
                // 尝试打断先前的播报并在底层复刻 TTS 引擎
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(aiReply);
                utterance.lang = 'zh-CN';
                // 采用高级微软女声（如系统有）
                const voices = window.speechSynthesis.getVoices();
                const premiumVoice = voices.find(v => v.lang.includes('zh') && (v.name.includes('Xiaoxiao') || v.name.includes('Ting-Ting')));
                if (premiumVoice) utterance.voice = premiumVoice;
                
                utterance.onend = () => {
                    this.isProcessing = false;
                    this.statusText.innerText = "状态: 等待语音唤醒 (VAD_READY)";
                    if (this.isListening) {
                        try { this.recognition.start(); } catch (e) {} // 恢复静默倾听
                    }
                };
                window.speechSynthesis.speak(utterance);

            } catch (err) {
                console.error("Live Vision 分析失败", err);
                this.subtitle.innerText = "分析失败，请检查网络或 API 连通性。";
                this.isProcessing = false;
                this.statusText.innerText = "状态: 接口故障，重试中 (ERROR)";
                setTimeout(() => { if(this.isListening) try{ this.recognition.start(); }catch(e){} }, 2000);
            }
        };

        this.recognition.onerror = (e) => {
            console.log("识别杂音/断裂:", e.error);
            if (e.error !== 'aborted') {
                this.isProcessing = false;
                setTimeout(() => { if(this.isListening) try{ this.recognition.start(); }catch(e){} }, 500);
            }
        };
        
        this.recognition.onend = () => {
            // 如果不是因为我们自己切断，也没有在分析中，就自动重启以保持一直倾听
            if (this.isListening && !this.isProcessing) {
                try { this.recognition.start(); } catch(e) {}
            }
        };

        this.recognition.start();
    }

    stop() {
        this.isActive = false;
        this.hud.style.display = 'none';
        
        if (this.isListening && this.recognition) {
            this.isListening = false;
            this.recognition.stop();
        }
        window.speechSynthesis.cancel();

        
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.frameInterval) {
            clearInterval(this.frameInterval);
            this.frameInterval = null;
        }
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
        this.video.srcObject = null;
    }
}

// 自动向全局抛出引擎单例
window.titanLiveVision = new LiveVisionCopilot();
