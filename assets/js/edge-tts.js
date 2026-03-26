/**
 * TITAN OS - Pure Client-Side TTS Engine
 * 高级纯前端发音引擎：彻底抛弃复杂的企业后端验签，直接调用本地最高质量的原生大模型神经语音，或标准 OpenAI 兼容接口。
 */
class EdgeTTS {
    // 强制打断当前的语音播放
    static cancel() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (window.__titan_external_audio__) {
            window.__titan_external_audio__.pause();
            window.__titan_external_audio__.currentTime = 0;
            window.__titan_external_audio__ = null;
        }
    }

    static async speak(text, fallbackVoice = '', onEndParams = {}) {
        return new Promise(async (resolve, reject) => {
            if (!text) {
                if (onEndParams.callback) onEndParams.callback();
                return resolve();
            }

            // 0. 【打包客户端专属降维打击】尝试调用 Electron 主进程的 Edge-TTS
            // 只要环境是在 Electron 中，直接走 Node 级的伪装高拟真语音！
            if (window.require) {
                try {
                    const { ipcRenderer } = window.require('electron');
                    if (ipcRenderer) {
                        console.log("⚡ 侦测到 Electron 打包环境，正在激活微软 Azure 高清神经女声专线...");
                        this.cancel();
                        
                        // 从底层要回来的原生 MP3 Buffer 数据
                        const buffer = await ipcRenderer.invoke('generate-edge-tts', text, 'zh-CN-XiaoxiaoNeural');
                        
                        // 装配成 Blob 和 URL
                        const blob = new Blob([buffer], { type: 'audio/mp3' });
                        const url = URL.createObjectURL(blob);
                        
                        this._playAudioUrl(url, onEndParams, resolve, reject);
                        return; // 成功截胡，不再往下执行！
                    }
                } catch (e) {
                    console.warn("Electron IPC 调用失败，这可能是开在普通浏览器里导致的降级。", e);
                }
            }

            // 1. 如果用户在设置里配置了 OpenAI 格式的 TTS 代理，且开启了外部调用
            const { ttsProxyUrl, ttsApiKey } = window.titanAIAssistant?.settings || {};
            if (ttsProxyUrl && ttsApiKey && ttsProxyUrl.includes('/v1/audio/speech')) {
                return this.speakViaOpenAICompatible(text, ttsProxyUrl, ttsApiKey, onEndParams, resolve, reject);
            }

            // 2. 核心主线：使用纯浏览器原生 API 发音（绝对不会报 401 权限错误，永远免费）
            this.speakViaBrowserNative(text, onEndParams, resolve, reject);
        });
    }

    static bestNativeVoice = undefined;

    static async _getBestNativeVoice() {
        if (this.bestNativeVoice !== undefined) return this.bestNativeVoice;

        let voices = window.speechSynthesis.getVoices();
        
        // 应对 Chrome 的一个著名 Bug：voices 需要延迟加载
        if (voices.length === 0) {
            await new Promise(resolve => {
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                    resolve();
                };
                // 保底超时，防止死锁
                setTimeout(resolve, 200); 
            });
        }

        const premiumVoices = [
            voices.find(v => v.name.includes('Xiaoxiao') && v.name.includes('Neural')), // Edge 浏览器独占霸主：晓晓 Neural
            voices.find(v => v.name.includes('Ting-Ting') || v.name.includes('Tingting')), // macOS 环境下的高质量女声 (婷婷)
            voices.find(v => v.name.includes('Sin-Ji') && v.name.includes('Premium')), // macOS 广东发音优质女声
            voices.find(v => v.name.includes('Mei-Jia')), // macOS 台湾发音优质女声
            voices.find(v => v.name.includes('Google') && v.lang === 'zh-CN'), // Chrome 原生语音
            voices.find(v => v.lang === 'zh-CN' || v.lang === 'zh-HK' || v.lang === 'zh-TW') // 最后的保底中文
        ];

        this.bestNativeVoice = premiumVoices.find(v => !!v) || null;
        if (this.bestNativeVoice) {
            console.log(`[TTS 甄选音色] 抓取到本地最高质量声音: ${this.bestNativeVoice.name}`);
        } else {
            console.log('[TTS 甄选音色] 未找到高级音质，采用系统系统保底中文字典');
        }

        return this.bestNativeVoice;
    }

    static async speakViaBrowserNative(text, onEndParams, resolve, reject) {
        if (!('speechSynthesis' in window)) {
            console.error("当前浏览器完全不支持语音合成 API");
            if (onEndParams.callback) onEndParams.callback();
            return resolve();
        }

        this.cancel(); // 说话前清空队列

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.05; // 稍微调快一点更自然
        utterance.pitch = 1.0;

        // 🧠 核心黑科技：通过内存级别缓存避免暴击 Chrome 主线程，杜绝页面卡顿！
        const bestVoice = await this._getBestNativeVoice();
        if (bestVoice) {
            utterance.voice = bestVoice;
        }

        // 绑定事件
        utterance.onend = () => {
            if (onEndParams.callback) onEndParams.callback();
            resolve();
        };

        utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') {
                return resolve(); // 这是因用户打断或发音取消而触发的，属于正常现象，静默放行不报错！
            }
            console.error("本地 TTS 引擎触发异常:", e);
            reject(e);
        };

        // 解决 Chrome 长文本 15 秒自动中断的 Bug，通过挂靠全局变量防止被垃圾回收
        window.__titan_utterance_hack__ = utterance; 
        
        window.speechSynthesis.speak(utterance);
    }

    static async speakViaOpenAICompatible(text, apiUrl, apiKey, onEndParams, resolve, reject) {
        try {
            console.log("🌊 正在调用外部基于 OpenAI 协议的优质 TTS 代理...");
            this.cancel();

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: 'nova' // Nova 是极其优质的自然女声
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`TTS API 错误: ${response.status} - ${err}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.__titan_external_audio__ = new Audio(url);
            
            window.__titan_external_audio__.onended = () => {
                URL.revokeObjectURL(url);
                if (onEndParams.callback) onEndParams.callback();
                resolve();
            };

            window.__titan_external_audio__.onerror = (e) => {
                console.error("外部声音播放失败:", e);
                reject(e);
            };

            window.__titan_external_audio__.play();

        } catch (e) {
            console.error("第三方 OpenAI TTS 代理崩了，正在毫秒级切回本地高保真免密引擎！", e);
            // 外部 API 崩了也不要紧，立刻光速切回本地原版念出来！
            this.speakViaBrowserNative(text, onEndParams, resolve, reject);
        }
    }
}

window.EdgeTTS = EdgeTTS;
