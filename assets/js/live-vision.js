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

            // 初始化 MediaRecorder 用于真实音频截取
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) this.audioChunks.push(e.data);
            };
            this.mediaRecorder.onstop = () => this.processAudioAndVision();

            // 监听并渲染音频频谱的同时执行静音侦测 (VAD)
            this.setupAudioVisualizerAndVAD(stream);

            this.subtitle.innerHTML = "<span style='color: #10b981;'>系统多模态流已全量接管！</span><br>我现在能够直接<b>听见</b>并<b>看见</b>了。请直接对着麦克风说话，停顿后我会自动作答！";

        } catch (err) {
            console.error("硬件调用失败:", err);
            this.subtitle.innerHTML = "<span style='color: #ef4444;'>硬件调用失败：请确系已在系统级授权摄像头与麦克风权限！</span>";
        }
    }

    setupAudioVisualizerAndVAD(stream) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // VAD 状态机
        this.isSpeaking = false;
        this.silenceTimer = null;
        this.isProcessing = false;
        this.isListening = true; // 由底部按钮控制

        const draw = () => {
            if (!this.isActive) return;
            requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(dataArray);
            
            // 计算当前帧环境音量
            let sum = 0;
            for(let i=0; i<bufferLength; i++) sum += dataArray[i];
            const avgVolume = sum / bufferLength;

            // --- VAD 核心逻辑 (性能优化版) ---
            const VAD_THRESHOLD = 12; // 降低阈值，捕捉更微弱的耳语
            const SILENCE_MS = 800;    // 停顿 800ms 即触发，向豆包/ChatGPT 响应对标

            if (this.isListening && !this.isProcessing) {
                if (avgVolume > VAD_THRESHOLD) { 
                    // 阈值：检测到明显的说话声音
                    if (!this.isSpeaking) {
                        this.isSpeaking = true;
                        this.audioChunks = [];
                        if (this.mediaRecorder.state === 'inactive') this.mediaRecorder.start();
                        this.statusText.innerText = "状态: 接收语音流中... (RECORDING)";
                    }
                    if (this.silenceTimer) {
                        clearTimeout(this.silenceTimer); // 打断静音计时
                        this.silenceTimer = null;
                    }
                } else {
                    // 声音低于阈值，进入静音判定
                    if (this.isSpeaking && !this.silenceTimer) {
                        this.silenceTimer = setTimeout(() => {
                            if (this.isSpeaking) {
                                this.isSpeaking = false;
                                if (this.mediaRecorder.state === 'recording') this.mediaRecorder.stop(); // 停止录音，触发分析
                            }
                        }, SILENCE_MS); 
                    }
                }
            }
            
            // --- UI 渲染 ---
            this.ctxWave.clearRect(0, 0, this.canvasWave.width, this.canvasWave.height);
            this.ctxWave.lineWidth = this.isSpeaking ? 5 : 2;
            this.ctxWave.strokeStyle = this.isSpeaking ? '#ef4444' : '#10b981';
            this.ctxWave.beginPath();

            const sliceWidth = this.canvasWave.width * 1.0 / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 255.0;
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

    async processAudioAndVision() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.subtitle.innerHTML = `<span style="color:#38bdf8; animation: pulse 1s infinite alternate;">[正在抽取音视频流交由大模型核心阵列分析...]</span>`;
        this.statusText.innerText = "状态: 多模态融合推理中 (REASONING)";

        try {
            // 1. 获取刚刚说话的音频流 Blob 并转为 Base64
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            await new Promise(resolve => reader.onloadend = resolve);
            const base64Audio = reader.result.split(',')[1];
            const cleanMimeType = audioBlob.type.split(';')[0] || 'audio/webm';

            // 2. 抽取当前画面视觉帧
            const offscreenCanvas = document.createElement('canvas');
            const ctx = offscreenCanvas.getContext('2d');
            offscreenCanvas.width = 640; 
            offscreenCanvas.height = Math.floor(640 * (this.video.videoHeight / this.video.videoWidth));
            ctx.drawImage(this.video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const base64Image = offscreenCanvas.toDataURL('image/jpeg', 0.5);

            // 3. 构建多模态联合发包数据格式 (复用 TitanAIAssistant 的统一防穿透算法池)
            if (!window.titanAIAssistant || !window.titanAIAssistant.settings.endpoint) {
                throw new Error("Titan AI 核心组件尚未初始化，请稍后刷新重试。");
            }

            const systemText = "系统指令约束：这是一次实时多模态对讲。请仔细聆听附带的语音文件（这是学生刚才说的话）。然后用你的‘眼睛’查看附带照片（实物/摄像头画面）。联合音频的意思和画面的内容，像真人老师一样直接回答，务必口语化并且简短精悍、一针见血。严禁输出任何 Markdown，给我干脆的声音播报用文本。";
            
            const apiMessages = [
                window.titanAIAssistant._buildMultimodalMessage(
                    systemText,
                    [base64Image],
                    { data: base64Audio, type: cleanMimeType }
                )
            ];
            
            const response = await fetch(window.titanAIAssistant.settings.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.titanAIAssistant.settings.apiKey}` },
                body: JSON.stringify({ 
                    model: 'gemini-3-flash-preview', 
                    messages: apiMessages, 
                    temperature: 0.7, 
                    max_tokens: 1024 
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMsg = errorData.error?.message || `状态异常 ${response.status}`;
                if (response.status === 429) {
                     errorMsg = '当前链路负载较高，请稍等片刻后重试。'; // 针对用户的友好话术
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            const aiReply = data.choices[0].message.content;

            // 4. 清爽展示并调起大声朗读
            this.subtitle.innerHTML = `<span style="color:#10b981">[小创指导]：</span>${aiReply}`;
            this.statusText.innerText = "状态: 语音合成播报中 (TTS_PLAYING)";
            
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(aiReply);
            utterance.lang = 'zh-CN';
            const voices = window.speechSynthesis.getVoices();
            const premiumVoice = voices.find(v => v.lang.includes('zh') && (v.name.includes('Xiaoxiao') || v.name.includes('Ting-Ting')));
            if (premiumVoice) utterance.voice = premiumVoice;
            
            utterance.onend = () => {
                this.isProcessing = false;
                this.statusText.innerText = "状态: 等待语音唤醒 (VAD_READY)";
            };
            window.speechSynthesis.speak(utterance);

        } catch (err) {
            console.error("Live Vision 分析失败", err);
            this.subtitle.innerHTML = `<span style="color:#ef4444;">推流或服务受阻：</span>${err.message}`;
            this.isProcessing = false;
            this.statusText.innerText = "状态: 等待语音唤醒 (ERROR)";
        }
    }

    stop() {
        this.isActive = false;
        this.hud.style.display = 'none';
        
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
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
