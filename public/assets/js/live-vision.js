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
        this.vadReqId = null;
        this.mediaRecorder = null;
        this.audioProcessor = null;
        this.realtimeAsr = null;
        this.realtimeTurn = null;
        this.realtimeFinals = new Map();
        this.realtimeCompletedTranscripts = new Map();
        this.realtimeTurnSequence = 0;
        this.recorderPendingStop = false;
        this.recordedMimeType = 'audio/webm';
        this.audioChunks = [];
        this.turnQueue = [];
        this.pendingSpeech = null;
        this.suspendedSpeech = null;
        this.currentSpeechText = '';
        this.maxQueuedTurns = 3;
        this.currentAbortController = null;

        // 对话与异步任务必须分别编号。旧请求/旧 TTS 的回调不得覆盖新一轮状态。
        this.runId = 0;
        this.requestId = 0;
        this.speechId = 0;
        this.speechWatchdog = null;
        this.phase = 'STOPPED';

        this.isListening = false;
        this.isSpeaking = false;
        this.isCandidateRecording = false;
        this.isProcessing = false;
        this.isTtsPlaying = false;
        this.isDiscardingNextAudio = false;
        this.recordingStartedAt = 0;
        this.voiceCandidateSince = null;
        this.candidateLastVoiceAt = 0;
        this.candidateConfirmMs = 300;
        this.silenceTimer = null;
        this.maxRecordingTimer = null;

        // 自适应底噪。固定音量阈值会在不同电脑、麦克风和房间里产生大量误触。
        this.noiseFloor = 18;
        this.ttsNoiseFloor = 18;
        this.ttsStartedAt = 0;

        // 只持久化文字，不保存画面和音频 Base64，防止内存和浏览器存储膨胀。
        this.maxHistoryMessages = 24;
        this.historyStorageKey = this.getHistoryStorageKey();
        this.liveHistory = this.loadLiveHistory();
        this.liveContextMessages = [...this.liveHistory];
        // 高能力文本模型通常不接受 input_audio。把转写与推理解耦后，用户可继续沿用
        // 中转站，同时自由选择转写模型和更强的聊天/视觉模型。
        this.pipelineStorageKey = 'titan_live_vision_pipeline_v1';
        this.pipelineConfig = this.loadPipelineConfig();
        // 只读取安全元数据，不读取或保存任何密钥。用于避免把语音发往一个未配置的 ASR。
        this.asrCapabilities = null;
        this.asrCapabilitiesPromise = null;
        
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
                            <button id="live-vision-model-settings" style="background:rgba(15,23,42,.78);color:#d1fae5;border:1px solid rgba(16,185,129,.65);padding:7px 12px;border-radius:6px;cursor:pointer;font-size:11px;">
                                模型链路设置
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
        this.modelSettingsBtn = document.getElementById('live-vision-model-settings');
        
        document.getElementById('live-vision-close').addEventListener('click', () => this.stop());
        
        // 绑定麦克风控制
        this.micToggleBtn.addEventListener('click', () => {
            if (this.isListening) {
                this.pauseListening();
            } else if (this.isActive) {
                this.isListening = true;
                this.phase = 'LISTENING';
                this.micToggleBtn.innerText = '正在聆听 (可点击暂停)';
                this.micToggleBtn.style.background = '#10b981';
                this.statusText.innerText = '状态: 等待持续人声 (VAD_READY)';
            }
        });
        this.modelSettingsBtn.addEventListener('click', () => this.openPipelineSettings());
    }

    loadPipelineConfig() {
        try {
            const saved = JSON.parse(localStorage.getItem('titan_live_vision_pipeline_v1') || '{}');
            const hasExplicitPipeline = saved.mode === 'direct' || saved.mode === 'transcribe';
            return {
                // direct：沿用旧的音频多模态聊天；transcribe：兼容任意高能力文本/视觉模型。
                mode: hasExplicitPipeline ? saved.mode : 'transcribe',
                transcriptionModel: typeof saved.transcriptionModel === 'string' ? saved.transcriptionModel.trim() : 'qwen-asr',
                reasoningModel: typeof saved.reasoningModel === 'string' ? saved.reasoningModel.trim() : 'qwen-plus',
                transcriptionEndpoint: typeof saved.transcriptionEndpoint === 'string' ? saved.transcriptionEndpoint.trim() : ''
            };
        } catch (_) {
            return { mode: 'transcribe', transcriptionModel: 'qwen-asr', reasoningModel: 'qwen-plus', transcriptionEndpoint: '' };
        }
    }

    savePipelineConfig(nextConfig) {
        this.pipelineConfig = { ...this.pipelineConfig, ...nextConfig };
        localStorage.setItem(this.pipelineStorageKey, JSON.stringify(this.pipelineConfig));
    }

    openPipelineSettings() {
        const current = this.pipelineConfig || this.loadPipelineConfig();
        const useTranscription = window.confirm(
            '启用“语音转写 → 高能力推理模型”吗？\n\n确定：适合中转站提供独立转写模型（推荐）。\n取消：继续使用当前模型直接理解音频。'
        );
        if (!useTranscription) {
            this.savePipelineConfig({ mode: 'direct' });
            this.statusText.innerText = '状态: 已使用当前模型直接理解音频 (DIRECT_AUDIO)';
            return;
        }
        const transcriptionModel = window.prompt('填写语音转写服务标识（内置网关填 openai-whisper 或 qwen-asr；自定义中转站填模型名）：', current.transcriptionModel || 'openai-whisper');
        if (transcriptionModel === null) return;
        const reasoningModel = window.prompt('填写用于思考/看图的高能力模型名（留空=当前全局模型）：', current.reasoningModel || '');
        if (reasoningModel === null) return;
        const transcriptionEndpoint = window.prompt('转写接口地址（留空=本站安全网关 /api/transcription）：', current.transcriptionEndpoint || '');
        if (transcriptionEndpoint === null) return;
        this.savePipelineConfig({
            mode: 'transcribe',
            transcriptionModel: transcriptionModel.trim(),
            reasoningModel: reasoningModel.trim(),
            transcriptionEndpoint: transcriptionEndpoint.trim()
        });
        this.statusText.innerText = transcriptionModel.trim()
            ? '状态: 转写 → 高能力模型链路已启用 (PIPELINE_READY)'
            : '状态: 请补充转写模型名后再启用该链路 (PIPELINE_INCOMPLETE)';
    }

    async probeServerAsr() {
        if (this.asrCapabilities) return this.asrCapabilities;
        if (this.asrCapabilitiesPromise) return this.asrCapabilitiesPromise;
        this.asrCapabilitiesPromise = fetch('/api/server-providers')
            .then(response => response.ok ? response.json() : null)
            .then(payload => {
                const providers = payload?.data?.asr || payload?.asr || {};
                this.asrCapabilities = providers && typeof providers === 'object' ? providers : {};
                return this.asrCapabilities;
            })
            .catch(() => {
                // 能力探测失败时不阻断旧通道；仍由用户配置的外部 ASR 负责。
                this.asrCapabilities = {};
                return this.asrCapabilities;
            })
            .finally(() => { this.asrCapabilitiesPromise = null; });
        return this.asrCapabilitiesPromise;
    }

    async start() {
        if (this.isActive && (this.videoStream || this.phase === 'CONNECTING')) {
            this.hud.style.display = 'block';
            return;
        }

        const activeRunId = ++this.runId;
        this.hud.style.display = 'block';
        this.isActive = true;
        this.isListening = false;
        this.phase = 'CONNECTING';
        this.turnQueue = [];
        this.pendingSpeech = null;
        this.suspendedSpeech = null;
        this.currentSpeechText = '';
        this.isDiscardingNextAudio = false;
        this.refreshHistoryForCurrentUser();
        void this.probeServerAsr();
        this.subtitle.innerText = "“正在建立与底层硬件摄像引擎及麦克风列阵的连接...”";

        try {
            // 通过设定高帧率强制抗击相机降帧暗光策略，同时去除 environment 限制（防止苹果生态下幽灵般地去连手机热点摄像头导致严重无线掉帧）
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 },
                    frameRate: { ideal: 60, min: 30 }
                },
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // 用户可能在授权弹窗出现时已经关闭 Live Vision，旧授权结果不能重新启动会话。
            if (!this.isActive || activeRunId !== this.runId) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            this.videoStream = stream;
            this.video.srcObject = stream;

            // 只录麦克风轨。直接录整个 stream 会把 720p 视频也塞进所谓“音频包”。
            const audioOnlyStream = new MediaStream(stream.getAudioTracks());
            const mimeCandidates = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4'
            ];
            const supportedMime = typeof MediaRecorder.isTypeSupported === 'function'
                ? mimeCandidates.find(type => MediaRecorder.isTypeSupported(type))
                : null;
            const recorderOptions = supportedMime ? { mimeType: supportedMime } : undefined;
            const recorder = new MediaRecorder(audioOnlyStream, recorderOptions);
            const recorderRunId = activeRunId;
            this.mediaRecorder = recorder;
            this.recorderPendingStop = false;
            this.recordedMimeType = recorder.mimeType || supportedMime || 'audio/webm';
            this.audioChunks = [];
            recorder.ondataavailable = e => {
                if (this.mediaRecorder !== recorder || this.runId !== recorderRunId) return;
                if (e.data.size > 0) this.audioChunks.push(e.data);
            };
            recorder.onstop = () => {
                if (this.mediaRecorder !== recorder || this.runId !== recorderRunId) return;
                this.recorderPendingStop = false;
                this.processAudioAndVision();
            };
            recorder.onerror = event => {
                if (this.mediaRecorder !== recorder || this.runId !== recorderRunId) return;
                console.error('Live Vision 录音器异常。', event?.error || event);
                this.recorderPendingStop = false;
                this.audioChunks = [];
                this.isCandidateRecording = false;
                this.isSpeaking = false;
                this.voiceCandidateSince = null;
                if (this.maxRecordingTimer) {
                    clearTimeout(this.maxRecordingTimer);
                    this.maxRecordingTimer = null;
                }
                if (!this.resumeSuspendedSpeech()) {
                    this.statusText.innerText = '状态: 录音失败，请再说一次 (RECORDER_ERROR)';
                }
            };

            // 监听并渲染音频频谱的同时执行静音侦测 (VAD)
            this.setupAudioVisualizerAndVAD(stream);
            this.connectRealtimeAsr(activeRunId);

            this.isListening = true;
            this.phase = 'LISTENING';
            this.subtitle.innerHTML = "<span style='color: #10b981;'>系统多模态流已全量接管！</span><br>我现在能够直接<b>听见</b>并<b>看见</b>了。请直接对着麦克风说话，停顿后我会自动作答！";
            this.statusText.innerText = '状态: 等待持续人声 (VAD_READY)';

        } catch (err) {
            if (activeRunId !== this.runId) return;
            console.error("硬件调用失败:", err);
            this.runId++;
            if (this.videoStream) {
                this.videoStream.getTracks().forEach(track => track.stop());
                this.videoStream = null;
            }
            if (this.audioContext) {
                Promise.resolve(this.audioContext.close()).catch(() => {});
                this.audioContext = null;
            }
            this.mediaRecorder = null;
            this.video.srcObject = null;
            this.isActive = false;
            this.isListening = false;
            this.phase = 'ERROR';
            this.subtitle.textContent = `硬件调用失败 (${err.name || 'Error'}): ${err.message || '未知原因'}。请检查摄像头与麦克风权限后重试。`;
            this.statusText.innerText = '状态: 硬件连接失败 (ERROR)';
        }
    }

    connectRealtimeAsr(runId) {
        this.closeRealtimeAsr();
        if (!window.WebSocket) return;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${protocol}//${window.location.host}/api/live-asr`);
        this.realtimeAsr = { socket, ready: false, runId, pendingEvents: [] };
        socket.onopen = () => {
            if (this.realtimeAsr?.socket !== socket || this.runId !== runId) return;
            socket.send(JSON.stringify({ type: 'start', language: 'zh' }));
            for (const pending of this.realtimeAsr.pendingEvents.splice(0)) {
                socket.send(JSON.stringify(pending));
            }
        };
        socket.onmessage = event => {
            if (this.realtimeAsr?.socket !== socket || this.runId !== runId) return;
            let message;
            try { message = JSON.parse(event.data); } catch { return; }
            if (message.type === 'ready') {
                this.realtimeAsr.ready = true;
                return;
            }
            if (message.type === 'partial' && this.realtimeTurn) {
                this.realtimeTurn.partial = String(message.text || '').trim();
                if (this.realtimeTurn.partial && this.isSpeaking) {
                    this.subtitle.textContent = `> ${this.realtimeTurn.partial}`;
                    this.statusText.innerText = '状态: 实时转写中 (LIVE_ASR)';
                }
                return;
            }
            if (message.type === 'final') {
                const turnId = String(message.turnId || '');
                const text = String(message.text || '').trim();
                const waiter = this.realtimeFinals.get(turnId);
                if (waiter) {
                    this.realtimeFinals.delete(turnId);
                    waiter.resolve(text);
                } else if (turnId) {
                    this.realtimeCompletedTranscripts.set(turnId, text);
                }
                return;
            }
            if (message.type === 'error') {
                console.warn('实时 ASR 不可用，将回退到普通转写。', message.code);
                this.realtimeAsr.ready = false;
            }
        };
        socket.onerror = () => {
            if (this.realtimeAsr?.socket === socket) this.realtimeAsr.ready = false;
        };
        socket.onclose = () => {
            if (this.realtimeAsr?.socket === socket) this.realtimeAsr.ready = false;
        };
    }

    closeRealtimeAsr() {
        if (this.realtimeAsr?.socket && this.realtimeAsr.socket.readyState < 2) {
            try { this.realtimeAsr.socket.send(JSON.stringify({ type: 'close' })); } catch (_) {}
            this.realtimeAsr.socket.close();
        }
        this.realtimeAsr = null;
        this.realtimeTurn = null;
        for (const waiter of this.realtimeFinals.values()) waiter.resolve('');
        this.realtimeFinals.clear();
        this.realtimeCompletedTranscripts.clear();
    }

    beginRealtimeTurn() {
        if (!this.realtimeAsr?.socket || this.realtimeAsr.socket.readyState >= 2) return null;
        const turn = { id: `turn_${++this.realtimeTurnSequence}_${Date.now()}`, partial: '' };
        this.realtimeTurn = turn;
        return turn;
    }

    sendRealtimeEvent(event) {
        const realtime = this.realtimeAsr;
        if (!realtime?.socket || realtime.socket.readyState >= 2) return false;
        if (realtime.socket.readyState === 1) {
            realtime.socket.send(JSON.stringify(event));
            return true;
        }
        // 用户可能在 WebSocket/千问会话初始化完成前就开始说话。短暂缓存这些
        // PCM 帧与 commit，连接打开后保持原顺序补发，确保第一句话也走实时链路。
        if (realtime.pendingEvents.length < 600) realtime.pendingEvents.push(event);
        return true;
    }

    sendRealtimePcm(pcm) {
        const turn = this.realtimeTurn;
        if (!turn) return;
        const bytes = new Uint8Array(pcm);
        let binary = '';
        for (let offset = 0; offset < bytes.length; offset += 8192) {
            binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        }
        this.sendRealtimeEvent({ type: 'audio', audio: btoa(binary) });
    }

    downsamplePcm(floatSamples, sourceRate, targetRate = 16000) {
        if (!floatSamples?.length) return new ArrayBuffer(0);
        const outputLength = Math.max(1, Math.round(floatSamples.length * targetRate / sourceRate));
        const output = new Int16Array(outputLength);
        const ratio = sourceRate / targetRate;
        for (let index = 0; index < outputLength; index++) {
            const position = index * ratio;
            const left = Math.min(floatSamples.length - 1, Math.floor(position));
            const right = Math.min(floatSamples.length - 1, left + 1);
            const sample = floatSamples[left] + (floatSamples[right] - floatSamples[left]) * (position - left);
            output[index] = Math.round(Math.max(-1, Math.min(1, sample)) * 0x7fff);
        }
        return output.buffer;
    }

    commitRealtimeTurn(turn) {
        if (!turn) return;
        this.sendRealtimeEvent({ type: 'commit', turnId: turn.id });
    }

    discardRealtimeTurn() {
        this.sendRealtimeEvent({ type: 'discard' });
        this.realtimeTurn = null;
    }

    waitForRealtimeFinal(turn, timeoutMs = 2200) {
        if (!turn) return Promise.resolve('');
        if (this.realtimeCompletedTranscripts.has(turn.id)) {
            const text = this.realtimeCompletedTranscripts.get(turn.id);
            this.realtimeCompletedTranscripts.delete(turn.id);
            return Promise.resolve(text);
        }
        return new Promise(resolve => {
            const timeout = setTimeout(() => {
                this.realtimeFinals.delete(turn.id);
                resolve(String(turn.partial || '').trim());
            }, this.realtimeAsr?.ready ? timeoutMs : Math.max(timeoutMs, 7000));
            this.realtimeFinals.set(turn.id, {
                resolve: text => {
                    clearTimeout(timeout);
                    resolve(text);
                }
            });
        });
    }

    setupAudioVisualizerAndVAD(stream) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        // MediaRecorder 用于兼容性回退；此支路持续把同一支麦克风转为 16 kHz PCM 小帧。
        // 静音和候选背景声不会发给模型，避免“为了快”牺牲抗噪能力。
        if (typeof this.audioContext.createScriptProcessor === 'function') {
            this.audioProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
            const silentGain = this.audioContext.createGain();
            silentGain.gain.value = 0;
            source.connect(this.audioProcessor);
            this.audioProcessor.connect(silentGain);
            silentGain.connect(this.audioContext.destination);
            this.audioProcessor.onaudioprocess = event => {
                if (!this.isActive || !this.realtimeTurn || (!this.isCandidateRecording && !this.isSpeaking)) return;
                this.sendRealtimePcm(this.downsamplePcm(event.inputBuffer.getChannelData(0), this.audioContext.sampleRate));
            };
        }
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.72;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // VAD 状态机：所有确认时间都按毫秒计算，不再依赖屏幕 60/120Hz 刷新帧数。
        this.isSpeaking = false;
        this.silenceTimer = null;
        this.isProcessing = false;
        this.voiceCandidateSince = null;

        // 实时 ASR 已在持续接收音频；0.5 秒停顿即可提交，避免旧链路的 1.25 秒等待感。
        // 仍通过候选确认和最短录音时长过滤碰撞、键盘声等短噪声。
        const SILENCE_MS = 500;
        const NORMAL_CONFIRM_MS = 300;
        const BUSY_CONFIRM_MS = 650;
        const CANDIDATE_HANGOVER_MS = 160;
        const TTS_WARMUP_MS = 600;

        const draw = () => {
            if (!this.isActive) return;
            this.vadReqId = requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(dataArray);
            
            let wideSum = 0;
            let speechSum = 0;
            let speechBins = 0;
            const nyquist = this.audioContext.sampleRate / 2;
            const binHz = nyquist / bufferLength;

            for (let i = 1; i < bufferLength; i++) {
                const value = dataArray[i];
                wideSum += value;
                const hz = i * binHz;
                // 主要人声频段；跳过低频震动和高频电子尖峰。
                if (hz >= 180 && hz <= 4200) {
                    speechSum += value;
                    speechBins++;
                }
            }
            const avgVolume = wideSum / Math.max(1, bufferLength - 1);
            const speechVolume = speechSum / Math.max(1, speechBins);
            const now = performance.now();

            if (
                !this.isSpeaking &&
                !this.isTtsPlaying &&
                !this.isCandidateRecording &&
                this.voiceCandidateSince === null &&
                avgVolume < this.noiseFloor + 18
            ) {
                this.noiseFloor = this.noiseFloor * 0.97 + avgVolume * 0.03;
            }
            if (
                this.isTtsPlaying &&
                !this.isSpeaking &&
                !this.isCandidateRecording &&
                this.voiceCandidateSince === null
            ) {
                this.ttsNoiseFloor = this.ttsNoiseFloor * 0.9 + speechVolume * 0.1;
            }

            const baseThreshold = Math.max(32, Math.min(58, this.noiseFloor + 14));
            const ttsThreshold = Math.max(48, Math.min(76, this.ttsNoiseFloor + 16));
            const activeThreshold = this.isTtsPlaying ? ttsThreshold : baseThreshold;
            const inTtsWarmup = this.isTtsPlaying && (now - this.ttsStartedAt < TTS_WARMUP_MS);
            const hasSpeechEnergy = !inTtsWarmup &&
                speechVolume > activeThreshold &&
                speechVolume > avgVolume * 1.04;

            if (this.isListening) {
                if (this.isSpeaking) {
                    if (hasSpeechEnergy) {
                        if (this.silenceTimer) {
                            clearTimeout(this.silenceTimer);
                            this.silenceTimer = null;
                        }
                    } else if (!this.silenceTimer) {
                        this.silenceTimer = setTimeout(() => this.finishRecording(), SILENCE_MS);
                    }
                } else if (hasSpeechEnergy) {
                    const confirmMs = (this.isProcessing || this.isTtsPlaying) ? BUSY_CONFIRM_MS : NORMAL_CONFIRM_MS;
                    if (this.voiceCandidateSince === null) this.beginCandidateRecording(now, confirmMs);
                    this.candidateLastVoiceAt = now;
                    if (now - this.voiceCandidateSince >= this.candidateConfirmMs) {
                        this.confirmCandidateRecording();
                    }
                } else {
                    // 短促背景声只会清空候选，不再取消推理或播报。
                    const candidateIsHanging = this.isCandidateRecording &&
                        now - this.candidateLastVoiceAt <= CANDIDATE_HANGOVER_MS;
                    if (!candidateIsHanging) this.cancelCandidateRecording();
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

    getHistoryStorageKey() {
        const userId = window.SubscriptionManager?.user?.id || 'guest';
        return `titan_live_vision_history_v2:${userId}`;
    }

    sanitizeHistory(history) {
        if (!Array.isArray(history)) return [];
        return history
            .filter(item => (
                item &&
                (item.role === 'user' || item.role === 'assistant') &&
                typeof item.content === 'string' &&
                item.content.trim()
            ))
            .map(item => ({
                role: item.role,
                content: item.content.trim().slice(0, 2000)
            }))
            .slice(-this.maxHistoryMessages);
    }

    loadLiveHistory() {
        try {
            return this.sanitizeHistory(JSON.parse(localStorage.getItem(this.historyStorageKey) || '[]'));
        } catch (err) {
            console.warn('Live Vision 文字记忆恢复失败，使用空会话。', err);
            return [];
        }
    }

    saveLiveHistory() {
        try {
            localStorage.setItem(this.historyStorageKey, JSON.stringify(this.liveHistory));
        } catch (err) {
            console.warn('Live Vision 文字记忆保存失败。', err);
        }
    }

    refreshHistoryForCurrentUser() {
        const nextKey = this.getHistoryStorageKey();
        if (nextKey !== this.historyStorageKey) {
            this.historyStorageKey = nextKey;
            this.liveHistory = this.loadLiveHistory();
            this.liveContextMessages = [...this.liveHistory];
        }
    }

    pauseListening() {
        this.isListening = false;
        this.phase = 'PAUSED';
        this.voiceCandidateSince = null;
        this.turnQueue = [];
        this.pendingSpeech = null;
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        if (this.maxRecordingTimer) {
            clearTimeout(this.maxRecordingTimer);
            this.maxRecordingTimer = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.isDiscardingNextAudio = true;
            this.recorderPendingStop = true;
            this.mediaRecorder.stop();
        }
        this.isCandidateRecording = false;
        this.isSpeaking = false;
        this.requestId++;
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }
        this.cancelSpeechPlayback(false);
        this.isProcessing = false;
        this.micToggleBtn.innerText = '已暂停聆听 (点击唤醒)';
        this.micToggleBtn.style.background = '#64748b';
        this.statusText.innerText = '状态: 麦克风已暂停 (PAUSED)';
    }

    beginCandidateRecording(now, confirmMs = 300) {
        if (!this.mediaRecorder || this.recorderPendingStop || this.mediaRecorder.state !== 'inactive') return;
        this.voiceCandidateSince = now;
        this.candidateLastVoiceAt = now;
        this.candidateConfirmMs = confirmMs;
        this.isCandidateRecording = true;
        this.beginRealtimeTurn();
        this.audioChunks = [];
        this.recordingStartedAt = Date.now();
        this.phase = 'BARGE_CANDIDATE';
        try {
            this.recorderPendingStop = false;
            this.mediaRecorder.start();
        } catch (err) {
            console.warn('无法启动候选语音录制。', err);
            this.voiceCandidateSince = null;
            this.isCandidateRecording = false;
        }
    }

    confirmCandidateRecording() {
        if (!this.isCandidateRecording) return;
        const wasThinking = this.isProcessing && !this.isTtsPlaying;
        this.isCandidateRecording = false;
        this.voiceCandidateSince = null;
        this.candidateLastVoiceAt = 0;
        this.isSpeaking = true;

        // 先暂停旧播报，不立即销毁。新音频经模型确认是背景声时可以恢复。
        if (this.pendingSpeech) {
            this.suspendedSpeech = {
                reply: this.pendingSpeech.reply,
                runId: this.pendingSpeech.runId,
                canResume: false,
                speechToken: null
            };
            this.pendingSpeech = null;
        }
        if (this.isTtsPlaying) this.suspendSpeechPlaybackForCandidate();
        this.phase = 'RECORDING';
        if (this.maxRecordingTimer) clearTimeout(this.maxRecordingTimer);
        this.maxRecordingTimer = setTimeout(() => this.finishRecording(), 30000);
        this.statusText.innerText = wasThinking
            ? '状态: 正在听取补充，上一轮不会丢失 (QUEUED_RECORDING)'
            : '状态: 接收语音流中... (RECORDING)';
    }

    cancelCandidateRecording() {
        if (this.voiceCandidateSince === null && !this.isCandidateRecording) return;
        this.voiceCandidateSince = null;
        this.candidateLastVoiceAt = 0;
        this.discardRealtimeTurn();
        if (this.isCandidateRecording && this.mediaRecorder?.state === 'recording') {
            this.isDiscardingNextAudio = true;
            this.recorderPendingStop = true;
            this.mediaRecorder.stop();
        }
        this.isCandidateRecording = false;
        const pendingStarted = this.playPendingSpeechIfReady();
        if (!pendingStarted && !this.pendingSpeech && this.suspendedSpeech) {
            this.resumeSuspendedSpeech();
        }
        if (this.isListening && !this.isProcessing && !this.isTtsPlaying) {
            this.phase = 'LISTENING';
        }
    }

    hasUncommittedUserTurn() {
        return this.recorderPendingStop && !this.isDiscardingNextAudio;
    }

    playPendingSpeechIfReady() {
        const pending = this.pendingSpeech;
        if (!pending) return false;
        if (!this.isRequestCurrent(pending.runId, pending.requestId)) {
            this.pendingSpeech = null;
            return false;
        }
        if (
            this.isProcessing ||
            this.isCandidateRecording ||
            this.isSpeaking ||
            this.hasUncommittedUserTurn() ||
            this.turnQueue.length > 0
        ) return false;

        this.pendingSpeech = null;
        if (this.startSpeech(pending.reply, pending.runId, pending.requestId)) return true;
        this.isProcessing = false;
        return false;
    }

    finishRecording() {
        if (this.maxRecordingTimer) {
            clearTimeout(this.maxRecordingTimer);
            this.maxRecordingTimer = null;
        }
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        if (!this.isSpeaking) return;
        this.isSpeaking = false;
        this.voiceCandidateSince = null;
        const realtimeTurn = this.realtimeTurn;
        this.commitRealtimeTurn(realtimeTurn);
        if (this.mediaRecorder?.state === 'recording') {
            this.recorderPendingStop = true;
            this.mediaRecorder.stop();
        }
        this.statusText.innerText = this.isProcessing
            ? '状态: 语音已排队，等待上一轮完成 (TURN_QUEUED)'
            : '状态: 正在提交本轮语音 (COMMITTING)';
    }

    async processAudioAndVision() {
        const chunks = this.audioChunks.splice(0);
        const durationMs = Math.max(0, Date.now() - this.recordingStartedAt);
        this.recordingStartedAt = 0;

        if (this.isDiscardingNextAudio) {
            this.isDiscardingNextAudio = false;
            this.discardRealtimeTurn();
            this.playPendingSpeechIfReady();
            if (!this.pendingSpeech) this.resumeSuspendedSpeech();
            return;
        }
        if (!this.isActive || !this.isListening) return;
        if (chunks.length === 0) {
            this.resumeSuspendedSpeech();
            return;
        }

        const byteLength = chunks.reduce((sum, chunk) => sum + (chunk.size || 0), 0);
        if (durationMs < 450 || byteLength < 800) {
            this.discardRealtimeTurn();
            this.phase = this.isProcessing ? this.phase : 'LISTENING';
            this.statusText.innerText = '状态: 已过滤短促背景声 (NOISE_FILTERED)';
            this.resumeSuspendedSpeech();
            return;
        }

        const realtimeTurn = this.realtimeTurn;
        const transcript = await this.waitForRealtimeFinal(realtimeTurn);
        this.realtimeTurn = null;
        const audioBlob = new Blob(chunks, { type: this.recordedMimeType || 'audio/webm' });
        if (this.turnQueue.length >= this.maxQueuedTurns) {
            this.statusText.innerText = '状态: 语音补充过快，请稍候再说 (QUEUE_FULL)';
            return;
        }
        this.turnQueue.push({
            audioBlob,
            imageData: this.captureCurrentFrame(),
            transcript,
            capturedAt: Date.now(),
            runId: this.runId
        });
        this.drainTurnQueue();
    }

    captureCurrentFrame() {
        if (!this.video?.videoWidth || !this.video?.videoHeight) return null;
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 640;
            canvas.height = Math.max(1, Math.floor(640 * (this.video.videoHeight / this.video.videoWidth)));
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.5);
        } catch (err) {
            console.warn('Live Vision 当前画面截取失败，将仅处理语音。', err);
            return null;
        }
    }

    async prepareAudioForModel(audioBlob) {
        // 统一转成真实的 16kHz 单声道 PCM WAV，避免 Safari 的 MP4 或 WebM 字节被错误标成 WAV。
        if (!this.audioContext?.decodeAudioData || !audioBlob?.arrayBuffer) {
            throw new Error('当前浏览器无法将录音转换为模型支持的 WAV 格式。');
        }
        try {
            const encoded = await audioBlob.arrayBuffer();
            const decoded = await this.audioContext.decodeAudioData(encoded.slice(0));
            return this.encodePcmWav(decoded, 16000);
        } catch (err) {
            console.error('音频转 WAV 失败。', err);
            throw new Error('录音格式转换失败，请再说一次。');
        }
    }

    encodePcmWav(audioBuffer, targetSampleRate = 16000) {
        const sourceRate = audioBuffer.sampleRate;
        const outputLength = Math.max(1, Math.round(audioBuffer.duration * targetSampleRate));
        const channelCount = Math.max(1, audioBuffer.numberOfChannels || 1);
        const channels = Array.from({ length: channelCount }, (_, index) => audioBuffer.getChannelData(index));
        const wav = new ArrayBuffer(44 + outputLength * 2);
        const view = new DataView(wav);
        const writeAscii = (offset, text) => {
            for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
        };

        writeAscii(0, 'RIFF');
        view.setUint32(4, 36 + outputLength * 2, true);
        writeAscii(8, 'WAVE');
        writeAscii(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, targetSampleRate, true);
        view.setUint32(28, targetSampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeAscii(36, 'data');
        view.setUint32(40, outputLength * 2, true);

        const ratio = sourceRate / targetSampleRate;
        for (let i = 0; i < outputLength; i++) {
            const sourcePosition = i * ratio;
            const leftIndex = Math.min(channels[0].length - 1, Math.floor(sourcePosition));
            const rightIndex = Math.min(channels[0].length - 1, leftIndex + 1);
            const mix = sourcePosition - leftIndex;
            let sample = 0;
            for (const channel of channels) {
                sample += channel[leftIndex] * (1 - mix) + channel[rightIndex] * mix;
            }
            sample = Math.max(-1, Math.min(1, sample / channelCount));
            view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        }
        return new Blob([wav], { type: 'audio/wav' });
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = typeof reader.result === 'string' ? reader.result : '';
                resolve(result.includes(',') ? result.split(',')[1] : result);
            };
            reader.onerror = () => reject(reader.error || new Error('音频读取失败'));
            reader.readAsDataURL(blob);
        });
    }

    getTranscriptionEndpoint(chatEndpoint, configuredEndpoint = '') {
        if (configuredEndpoint) return configuredEndpoint;
        // 本站网关掌管服务器端 ASR 配置和密钥。不要从聊天地址猜测一个并不存在的音频路由。
        return '/api/transcription';
    }

    async transcribeAudio(audioBlob, core, signal) {
        const config = this.pipelineConfig || this.loadPipelineConfig();
        const endpoint = this.getTranscriptionEndpoint(core.settings.endpoint, config.transcriptionEndpoint);
        const form = new FormData();
        const usesSiteGateway = endpoint === '/api/transcription' || endpoint.endsWith('/api/transcription');
        if (usesSiteGateway) {
            const providerId = config.transcriptionModel || 'openai-whisper';
            const capabilities = await this.probeServerAsr();
            if (!capabilities[providerId]) {
                throw new Error(`服务器尚未配置可用的语音转写服务（${providerId}）。已自动保留直接音频理解作为备用通道。`);
            }
            form.append('audio', audioBlob, 'live-turn.wav');
            form.append('providerId', providerId);
            form.append('language', 'zh');
        } else {
            if (!config.transcriptionModel) throw new Error('请在“模型链路设置”中填写中转站的语音转写模型名。');
            form.append('model', config.transcriptionModel);
            form.append('file', audioBlob, 'live-turn.wav');
            form.append('language', 'zh');
            form.append('response_format', 'json');
        }
        const headers = {};
        if (core.settings.apiKey) headers.Authorization = `Bearer ${core.settings.apiKey}`;
        const response = await fetch(endpoint, { method: 'POST', headers, body: form, signal });
        if (!response.ok) {
            const detail = await response.json().catch(() => ({}));
            throw new Error(detail?.error?.message || `转写服务状态异常 ${response.status}`);
        }
        const data = await response.json();
        const transcript = typeof data?.data?.text === 'string'
            ? data.data.text.trim()
            : (typeof data?.text === 'string' ? data.text.trim() : '');
        if (!transcript) throw new Error('转写服务没有返回可用文字。');
        return transcript;
    }

    async drainTurnQueue() {
        if (this.isProcessing || !this.isActive || !this.isListening) return;
        let turn = null;
        while (this.turnQueue.length > 0 && !turn) {
            const candidate = this.turnQueue.shift();
            if (candidate?.runId === this.runId) turn = candidate;
        }
        if (!turn) return;
        this.pendingSpeech = null;

        const activeRunId = this.runId;
        const activeRequestId = ++this.requestId;
        this.isProcessing = true;
        this.phase = 'THINKING';
        this.currentAbortController = new AbortController();
        this.subtitle.textContent = '[正在结合对话记忆分析当前音视频...]';
        this.statusText.innerText = '状态: 多模态融合推理中 (REASONING)';

        let speechStarted = false;
        try {
            speechStarted = await this.processTurn(
                turn,
                activeRunId,
                activeRequestId,
                this.currentAbortController.signal
            );
        } catch (err) {
            if (err.name !== 'AbortError' && this.isRequestCurrent(activeRunId, activeRequestId)) {
                console.error('Live Vision 分析失败', err);
                this.subtitle.textContent = `推流或服务受阻：${err.message}`;
                this.statusText.innerText = '状态: 本轮处理失败，继续聆听 (ERROR)';
                speechStarted = this.resumeSuspendedSpeech(true);
                if (speechStarted) {
                    this.subtitle.textContent = '刚才的插话识别失败，先继续原回答；你可以稍后再说一次。';
                }
            }
        } finally {
            if (!this.isRequestCurrent(activeRunId, activeRequestId)) return;
            this.currentAbortController = null;
            if (!speechStarted) {
                this.isProcessing = false;
                if (this.isSpeaking) {
                    this.phase = 'RECORDING';
                } else if (this.isCandidateRecording) {
                    this.phase = 'BARGE_CANDIDATE';
                } else {
                    this.phase = 'LISTENING';
                }
                const pendingStarted = this.playPendingSpeechIfReady();
                if (!pendingStarted && this.turnQueue.length > 0) {
                    queueMicrotask(() => this.drainTurnQueue());
                }
            }
        }
    }

    isRequestCurrent(runId, requestId) {
        return this.isActive && runId === this.runId && requestId === this.requestId;
    }

    async processTurn(turn, runId, requestId, signal) {
        if (!window.titanAIAssistant?.settings?.endpoint) {
            throw new Error('Titan AI 核心组件尚未初始化，请稍后刷新重试。');
        }

        const core = window.titanAIAssistant;
        const config = this.pipelineConfig || this.loadPipelineConfig();
        const useTranscriptionPipeline = config.mode === 'transcribe';
        let currentUserMessage;
        let sourceTranscript = typeof turn.transcript === 'string' ? turn.transcript.trim() : '';
        if (sourceTranscript || useTranscriptionPipeline) {
            if (!sourceTranscript) {
                this.subtitle.textContent = '[实时转写未及时返回，正在使用兼容转写...]';
                const modelAudio = await this.prepareAudioForModel(turn.audioBlob);
                if (!this.isRequestCurrent(runId, requestId)) return false;
                sourceTranscript = await this.transcribeAudio(modelAudio, core, signal);
            } else {
                this.subtitle.textContent = '[已获得实时转写，正在生成回复...]';
            }
            if (!this.isRequestCurrent(runId, requestId)) return false;
            currentUserMessage = core._buildMultimodalMessage(
                `这是用户当前一轮实时语音的可靠转写：${sourceTranscript}\n请结合当前画面理解它。`,
                turn.imageData ? [turn.imageData] : []
            );
        } else {
            const modelAudio = await this.prepareAudioForModel(turn.audioBlob);
            if (!this.isRequestCurrent(runId, requestId)) return false;
            const base64Audio = await this.blobToBase64(modelAudio);
            if (!this.isRequestCurrent(runId, requestId)) return false;
            currentUserMessage = core._buildMultimodalMessage(
                '这是用户当前一轮实时语音。请结合当前画面理解它；若只是噪声、电视声或无法辨认的背景声音，请标记为忽略。',
                turn.imageData ? [turn.imageData] : [],
                { data: base64Audio, type: modelAudio.type || turn.audioBlob.type || this.recordedMimeType }
            );
        }
        const apiMessages = this.buildConversationMessages(currentUserMessage);
        const headers = { 'Content-Type': 'application/json' };
        if (core.settings.apiKey) headers.Authorization = `Bearer ${core.settings.apiKey}`;

        const response = await fetch(core.settings.endpoint, {
            method: 'POST',
            headers,
            signal,
            body: JSON.stringify({
                model: config.reasoningModel || core.settings.model,
                messages: apiMessages,
                temperature: 0.6,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const actualError = Array.isArray(errorData) ? errorData[0]?.error : errorData?.error;
            let errorMessage = actualError?.message || `状态异常 ${response.status}`;
            if (response.status === 429) errorMessage = `并发限制或免费额度已尽。详情: ${errorMessage}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!this.isRequestCurrent(runId, requestId)) return false;
        const payload = this.parseModelPayload(data?.choices?.[0]?.message?.content);

        if (payload.ignore || !payload.reply) {
            this.subtitle.textContent = '检测到的声音不像是面向助手的清晰语音，已忽略。';
            this.statusText.innerText = '状态: 背景声已过滤 (BACKGROUND_IGNORED)';
            if (this.resumeSuspendedSpeech(true)) {
                this.subtitle.textContent = '已过滤背景声，继续刚才的回答。';
                return true;
            }
            return false;
        }

        if (this.suspendedSpeech) this.cancelSpeechPlayback(false);

        if (!payload.transcript && sourceTranscript) payload.transcript = sourceTranscript;
        if (payload.transcript) {
            this.rememberTextTurn(payload.transcript, payload.reply);
        } else {
            this.rememberAudioTurn(currentUserMessage, payload.reply);
        }

        this.subtitle.textContent = `> ${payload.reply}`;

        // 用户已经开始补充时，保留本轮回答但不抢着播报，马上处理排队语音。
        if (this.isCandidateRecording || (this.recorderPendingStop && this.isDiscardingNextAudio)) {
            this.pendingSpeech = this.turnQueue.length === 0
                ? { reply: payload.reply, runId, requestId }
                : null;
            this.statusText.innerText = '状态: 等待确认用户是否继续说话 (BARGE_CANDIDATE)';
            return false;
        }
        if (this.isSpeaking || this.hasUncommittedUserTurn() || this.turnQueue.length > 0) {
            if (!this.suspendedSpeech) {
                this.suspendedSpeech = {
                    reply: payload.reply,
                    runId,
                    canResume: false,
                    speechToken: null
                };
            }
            this.pendingSpeech = null;
            this.statusText.innerText = '状态: 已保留上一轮回答，正在处理用户补充 (INTERRUPTED_SAVED)';
            return false;
        }

        return this.startSpeech(payload.reply, runId, requestId);
    }

    buildConversationMessages(currentUserMessage) {
        const interruptedContext = this.suspendedSpeech?.reply
            ? '\n上一轮助手回答可能尚未完整播放；若用户说“继续、刚才、那个”，请先自然承接被打断的内容，不要假设用户已经听完。'
            : '';
        const systemMessage = {
            role: 'system',
            content: `你是“科技特长生系统”的专属智能虚拟教师【小创老师】。这是连续的实时多模态对话。
请结合最近对话理解“刚才、继续、那个”等指代，不要遗忘前一轮。
当前画面只代表本轮现场，不要把旧画面当成当前画面。
如果音频只有环境噪声、电视或远处人声，或者无法听清，不要回答。
正常回答必须自然、简短、口语化，不要使用 Markdown 或项目符号。
只返回一个 JSON 对象，不要代码围栏：{"transcript":"准确的用户语音转写","reply":"给用户的口语回复","ignore":false}。
需要忽略背景声时返回：{"transcript":"","reply":"","ignore":true}。${interruptedContext}`
        };
        return [
            systemMessage,
            ...this.liveContextMessages.slice(-this.maxHistoryMessages),
            currentUserMessage
        ];
    }

    parseModelPayload(content) {
        const rawText = Array.isArray(content)
            ? content.map(part => part?.text || '').join('')
            : String(content || '');
        const trimmed = rawText.trim();
        const withoutFence = trimmed
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        const firstBrace = withoutFence.indexOf('{');
        const lastBrace = withoutFence.lastIndexOf('}');
        const jsonCandidate = firstBrace >= 0 && lastBrace > firstBrace
            ? withoutFence.slice(firstBrace, lastBrace + 1)
            : withoutFence;

        try {
            const parsed = JSON.parse(jsonCandidate);
            return {
                transcript: typeof parsed.transcript === 'string' ? parsed.transcript.trim() : '',
                reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : '',
                ignore: parsed.ignore === true
            };
        } catch (err) {
            // 兼容暂未遵循 JSON 协议的模型：回答仍可播报，当前音频只在内存里短期保留。
            return { transcript: '', reply: trimmed, ignore: !trimmed };
        }
    }

    rememberTextTurn(transcript, reply) {
        const pair = [
            { role: 'user', content: transcript.slice(0, 2000) },
            { role: 'assistant', content: reply.slice(0, 2000) }
        ];
        this.liveContextMessages = [...this.liveContextMessages, ...pair].slice(-this.maxHistoryMessages);
        this.liveHistory = [...this.liveHistory, ...pair].slice(-this.maxHistoryMessages);
        this.saveLiveHistory();
    }

    rememberAudioTurn(currentUserMessage, reply) {
        const audioOnlyMessage = {
            role: 'user',
            content: Array.isArray(currentUserMessage.content)
                ? currentUserMessage.content.filter(part => part.type === 'text' || part.type === 'input_audio')
                : currentUserMessage.content
        };
        const assistantMessage = { role: 'assistant', content: reply.slice(0, 2000) };
        // 最多保留一轮原始音频上下文；更早的 Base64 改成文字占位，避免请求体持续膨胀。
        const compactedContext = this.liveContextMessages.map(message => {
            const hasAudio = message?.role === 'user' &&
                Array.isArray(message.content) &&
                message.content.some(part => part?.type === 'input_audio');
            return hasAudio
                ? { role: 'user', content: '（较早的实时语音未返回转写，请依据后续回答延续话题。）' }
                : message;
        });
        this.liveContextMessages = [
            ...compactedContext,
            audioOnlyMessage,
            assistantMessage
        ].slice(-this.maxHistoryMessages);

        // 跨刷新只保存文字占位和助手回复；Base64 音频绝不进入 localStorage。
        this.liveHistory = [
            ...this.liveHistory,
            { role: 'user', content: '（上一轮实时语音未返回文字转写，请依据上一轮回答延续话题。）' },
            assistantMessage
        ].slice(-this.maxHistoryMessages);
        this.saveLiveHistory();
    }

    startSpeech(reply, runId, requestId) {
        if (!this.isRequestCurrent(runId, requestId) || !reply) return false;
        const speechToken = ++this.speechId;
        const pureText = reply.replace(/[*#`_~]/g, '');
        this.suspendedSpeech = null;
        this.currentSpeechText = pureText;
        this.isTtsPlaying = true;
        this.isProcessing = true;
        this.phase = 'SPEAKING';
        this.ttsStartedAt = performance.now();
        this.ttsNoiseFloor = this.noiseFloor;
        this.statusText.innerText = '状态: 语音合成播报中 (TTS_PLAYING)';
        this.armSpeechWatchdog(pureText, speechToken);

        const fallbackToBrowserTTS = () => {
            if (speechToken !== this.speechId || !this.isActive) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(pureText);
            utterance.lang = 'zh-CN';
            utterance.rate = 1.05;
            utterance.pitch = 1.1;
            const voices = window.speechSynthesis.getVoices();
            const premiumVoice = voices.find(v => v.lang.includes('zh') && (
                v.name.includes('Xiaoxiao') ||
                v.name.includes('Mei-Jia') ||
                v.name.includes('Sin-Ji') ||
                v.name.includes('Enhanced')
            ));
            if (premiumVoice) utterance.voice = premiumVoice;
            utterance.onend = () => this.finishSpeech(speechToken);
            utterance.onerror = () => this.finishSpeech(speechToken);
            window.speechSynthesis.speak(utterance);
        };

        if (window.EdgeTTS) {
            window.EdgeTTS.cancel();
            Promise.resolve(window.EdgeTTS.speak(pureText, 'BV001_streaming', {
                callback: () => this.finishSpeech(speechToken)
            })).then(() => this.finishSpeech(speechToken)).catch(err => {
                if (speechToken !== this.speechId) return;
                console.error('高保真 TTS 播放出错，降级为浏览器语音。', err);
                fallbackToBrowserTTS();
            });
        } else {
            fallbackToBrowserTTS();
        }
        return true;
    }

    armSpeechWatchdog(reply, speechToken) {
        if (this.speechWatchdog) clearTimeout(this.speechWatchdog);
        const watchdogMs = Math.max(15000, Math.min(90000, reply.length * 450 + 8000));
        this.speechWatchdog = setTimeout(() => this.finishSpeech(speechToken), watchdogMs);
    }

    suspendSpeechPlaybackForCandidate() {
        if (!this.isTtsPlaying) return false;
        const speechToken = this.speechId;
        const reply = this.currentSpeechText;
        let canResume = false;
        if (window.EdgeTTS?.pause) {
            canResume = window.EdgeTTS.pause();
        } else if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) {
            try {
                window.speechSynthesis.pause();
                canResume = window.speechSynthesis.paused === true;
            } catch (error) {
                console.debug('浏览器 TTS 无法可靠暂停，将在确认背景声后从头恢复。', error);
            }
        }

        if (!canResume) {
            if (window.EdgeTTS) window.EdgeTTS.cancel();
            window.speechSynthesis.cancel();
            this.speechId++;
        }
        if (this.speechWatchdog) {
            clearTimeout(this.speechWatchdog);
            this.speechWatchdog = null;
        }
        this.suspendedSpeech = {
            reply,
            runId: this.runId,
            canResume,
            speechToken: canResume ? speechToken : null
        };
        this.isTtsPlaying = false;
        this.isProcessing = false;
        this.ttsStartedAt = 0;
        this.statusText.innerText = '状态: 已暂停播报，正在确认插话 (TTS_SUSPENDED)';
        return true;
    }

    resumeSuspendedSpeech(allowWhileProcessing = false) {
        const suspended = this.suspendedSpeech;
        if (
            !suspended ||
            !suspended.reply ||
            suspended.runId !== this.runId ||
            !this.isActive ||
            !this.isListening ||
            (this.isProcessing && !allowWhileProcessing) ||
            this.isCandidateRecording ||
            this.isSpeaking ||
            this.hasUncommittedUserTurn() ||
            this.turnQueue.length > 0
        ) return false;

        this.suspendedSpeech = null;
        let resumed = false;
        if (suspended.canResume && suspended.speechToken === this.speechId) {
            if (window.EdgeTTS?.resume) {
                resumed = window.EdgeTTS.resume();
            } else if (window.speechSynthesis?.paused) {
                window.speechSynthesis.resume();
                resumed = true;
            }
        }

        if (resumed) {
            this.currentSpeechText = suspended.reply;
            this.isTtsPlaying = true;
            this.isProcessing = true;
            this.phase = 'SPEAKING';
            this.ttsStartedAt = performance.now();
            this.ttsNoiseFloor = this.noiseFloor;
            this.statusText.innerText = '状态: 背景声已过滤，继续播报 (TTS_RESUMED)';
            this.armSpeechWatchdog(suspended.reply, suspended.speechToken);
            return true;
        }

        this.isTtsPlaying = false;
        this.isProcessing = false;
        return this.startSpeech(suspended.reply, this.runId, this.requestId);
    }

    finishSpeech(speechToken) {
        if (speechToken !== this.speechId || !this.isActive || !this.isTtsPlaying) return;
        if (this.speechWatchdog) {
            clearTimeout(this.speechWatchdog);
            this.speechWatchdog = null;
        }
        this.isTtsPlaying = false;
        this.isProcessing = false;
        this.suspendedSpeech = null;
        this.currentSpeechText = '';
        this.phase = this.isListening ? 'LISTENING' : 'PAUSED';
        this.statusText.innerText = this.isListening
            ? '状态: 等待持续人声 (VAD_READY)'
            : '状态: 麦克风已暂停 (PAUSED)';
        if (this.turnQueue.length > 0) queueMicrotask(() => this.drainTurnQueue());
    }

    cancelSpeechPlayback(markInterrupted) {
        const wasPlaying = this.isTtsPlaying;
        this.speechId++;
        if (this.speechWatchdog) {
            clearTimeout(this.speechWatchdog);
            this.speechWatchdog = null;
        }
        if (window.EdgeTTS) window.EdgeTTS.cancel();
        window.speechSynthesis.cancel();
        this.isTtsPlaying = false;
        this.suspendedSpeech = null;
        this.currentSpeechText = '';
        this.ttsStartedAt = 0;
        if (wasPlaying) this.isProcessing = false;
        if (markInterrupted && wasPlaying) {
            this.subtitle.textContent = '已确认用户正在说话；上一轮内容已保存，正在听取补充。';
        }
    }

    stop() {
        // 先使所有异步任务失效，再释放硬件；旧 fetch/TTS 回调不能复活已关闭会话。
        this.runId++;
        this.requestId++;
        this.isActive = false;
        this.isListening = false;
        this.phase = 'STOPPED';
        this.turnQueue = [];
        this.pendingSpeech = null;
        this.suspendedSpeech = null;
        this.currentSpeechText = '';
        this.hud.style.display = 'none';

        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        if (this.maxRecordingTimer) {
            clearTimeout(this.maxRecordingTimer);
            this.maxRecordingTimer = null;
        }
        if (this.vadReqId !== null) {
            cancelAnimationFrame(this.vadReqId);
            this.vadReqId = null;
        }
        this.voiceCandidateSince = null;

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.isDiscardingNextAudio = true;
            this.recorderPendingStop = true;
            this.mediaRecorder.stop();
        }
        this.isCandidateRecording = false;
        this.isSpeaking = false;
        this.audioChunks = [];

        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }
        this.cancelSpeechPlayback(false);
        this.isProcessing = false;

        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        if (this.audioContext) {
            Promise.resolve(this.audioContext.close()).catch(() => {});
            this.audioContext = null;
        }
        this.closeRealtimeAsr();
        this.audioProcessor = null;
        this.mediaRecorder = null;
        this.video.srcObject = null;
    }
}

// 自动向全局抛出引擎单例
window.titanLiveVision = new LiveVisionCopilot();
