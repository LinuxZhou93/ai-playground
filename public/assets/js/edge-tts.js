/**
 * TITAN OS - Pure Client-Side TTS Engine
 * 高级纯前端发音引擎：彻底抛弃复杂的企业后端验签，直接调用本地最高质量的原生大模型神经语音，或标准 OpenAI 兼容接口。
 */
class EdgeTTS {
    static playbackGeneration = 0;

    static _cleanupExternalAudio(resolveCancelled = true) {
        const audio = window.__titan_external_audio__;
        if (!audio) return;

        const objectUrl = audio.__titan_object_url__;
        const cancelledResolver = audio.__titan_cancel_resolve__;
        audio.onended = null;
        audio.onerror = null;
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.removeAttribute('src');
            audio.load();
        } catch (err) {
            console.debug('外部 TTS 音频清理时浏览器已释放资源。', err);
        }
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        window.__titan_external_audio__ = null;
        if (resolveCancelled && typeof cancelledResolver === 'function') cancelledResolver();
    }

    // 强制打断当前的语音播放
    static cancel() {
        // 每次取消都让先前尚在等待音色或网络结果的播放任务失效，避免“取消后又突然开口”。
        this.playbackGeneration++;
        if (window.__titan_external_tts_abort__) {
            window.__titan_external_tts_abort__.abort();
            window.__titan_external_tts_abort__ = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        window.__titan_utterance_hack__ = null;
        this._cleanupExternalAudio(true);
    }

    // 候选插话阶段只暂停，等语义确认后再决定继续还是取消。
    static pause() {
        const externalAudio = window.__titan_external_audio__;
        if (externalAudio && !externalAudio.ended) {
            try {
                externalAudio.pause();
                return externalAudio.paused === true;
            } catch (error) {
                console.debug('外部 TTS 暂停失败，将改为安全取消。', error);
                return false;
            }
        }
        if (
            window.speechSynthesis &&
            (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused)
        ) {
            try {
                window.speechSynthesis.pause();
                return window.speechSynthesis.paused === true;
            } catch (error) {
                console.debug('浏览器 TTS 暂停失败，将改为安全取消。', error);
                return false;
            }
        }
        return false;
    }

    static resume() {
        const externalAudio = window.__titan_external_audio__;
        if (externalAudio && externalAudio.paused && !externalAudio.ended) {
            try {
                Promise.resolve(externalAudio.play()).catch(error => {
                    if (typeof externalAudio.onerror === 'function') externalAudio.onerror(error);
                });
                return true;
            } catch (error) {
                if (typeof externalAudio.onerror === 'function') externalAudio.onerror(error);
                return false;
            }
        }
        if (window.speechSynthesis?.paused) {
            try {
                window.speechSynthesis.resume();
                return true;
            } catch (error) {
                console.debug('浏览器 TTS 恢复失败，将从头重播。', error);
                return false;
            }
        }
        return false;
    }

    static async speak(text, fallbackVoice = '', onEndParams = {}) {
        return new Promise(async (resolve, reject) => {
            if (!text) {
                if (onEndParams.callback) onEndParams.callback();
                return resolve();
            }

            // 0. Electron 专属拦截已被移除：保持多端统一，优先使用用户配置的高级音色代理（而不是写死本地机器音），
            // 并确保音频流走标准的浏览器或代理通道，以维持系统的 AEC (回声消除) 正常工作！
            
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
        const playbackGeneration = this.playbackGeneration;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.05; // 稍微调快一点更自然
        utterance.pitch = 1.0;

        // 🧠 核心黑科技：通过内存级别缓存避免暴击 Chrome 主线程，杜绝页面卡顿！
        const bestVoice = await this._getBestNativeVoice();
        if (playbackGeneration !== this.playbackGeneration) return resolve();
        if (bestVoice) {
            utterance.voice = bestVoice;
        }

        // 绑定事件
        utterance.onend = () => {
            if (window.__titan_utterance_hack__ === utterance) {
                window.__titan_utterance_hack__ = null;
            }
            if (playbackGeneration === this.playbackGeneration && onEndParams.callback) {
                onEndParams.callback();
            }
            resolve();
        };

        utterance.onerror = (e) => {
            if (window.__titan_utterance_hack__ === utterance) {
                window.__titan_utterance_hack__ = null;
            }
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
        let requestController = null;
        let audio = null;
        let url = null;
        let playbackGeneration = null;
        try {
            console.log("🌊 正在调用外部基于 OpenAI 协议的优质 TTS 代理...");
            this.cancel();
            playbackGeneration = this.playbackGeneration;
            requestController = new AbortController();
            window.__titan_external_tts_abort__ = requestController;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                signal: requestController.signal,
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: 'nova' // Nova 是极其优质的自然女声
                })
            });

            if (playbackGeneration !== this.playbackGeneration) return resolve();

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`TTS API 错误: ${response.status} - ${err}`);
            }

            const blob = await response.blob();
            if (playbackGeneration !== this.playbackGeneration) return resolve();
            url = URL.createObjectURL(blob);
            audio = new Audio(url);
            if (window.__titan_external_tts_abort__ === requestController) {
                window.__titan_external_tts_abort__ = null;
            }
            audio.__titan_object_url__ = url;
            audio.__titan_cancel_resolve__ = resolve;
            window.__titan_external_audio__ = audio;

            const cleanup = () => {
                if (window.__titan_external_audio__ === audio) {
                    this._cleanupExternalAudio(false);
                } else if (audio.__titan_object_url__) {
                    URL.revokeObjectURL(audio.__titan_object_url__);
                    audio.__titan_object_url__ = null;
                }
            };
            
            audio.onended = () => {
                cleanup();
                if (onEndParams.callback) onEndParams.callback();
                resolve();
            };

            audio.onerror = (e) => {
                cleanup();
                console.error("外部声音播放失败:", e);
                reject(e);
            };

            if (playbackGeneration !== this.playbackGeneration) {
                cleanup();
                return resolve();
            }
            await audio.play();

        } catch (e) {
            if (e.name === 'AbortError') {
                return resolve();
            }
            if (audio && window.__titan_external_audio__ === audio) {
                this._cleanupExternalAudio(false);
            } else if (url) {
                URL.revokeObjectURL(url);
            }
            if (window.__titan_external_tts_abort__ === requestController) {
                window.__titan_external_tts_abort__ = null;
            }
            // 用户已经取消或开始了更新的播报时，不允许旧任务降级后“幽灵开口”。
            if (
                requestController?.signal.aborted ||
                playbackGeneration !== this.playbackGeneration
            ) return resolve();
            console.error("第三方 OpenAI TTS 代理崩了，正在毫秒级切回本地高保真免密引擎！", e);
            // 外部 API 崩了也不要紧，立刻光速切回本地原版念出来！
            this.speakViaBrowserNative(text, onEndParams, resolve, reject);
        }
    }
}

window.EdgeTTS = EdgeTTS;
