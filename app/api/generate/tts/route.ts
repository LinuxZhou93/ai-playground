/**
 * Single TTS Generation API
 *
 * Generates TTS audio for a single text string and returns base64-encoded audio.
 * Called by the client in parallel for each speech action after a scene is generated.
 *
 * POST /api/generate/tts
 */

import { NextRequest } from 'next/server';
import { generateTTS } from '@/lib/audio/tts-providers';
import { resolveTTSApiKey, resolveTTSBaseUrl } from '@/lib/server/provider-config';
import type { TTSProviderId } from '@/lib/audio/types';
import { cleanTextForTTS } from '@/lib/audio/tts-utils';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { validateUrlForSSRF } from '@/lib/server/ssrf-guard';
import { TTS_PROVIDERS } from '@/lib/audio/constants';

const log = createLogger('TTS API');

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, audioId, ttsProviderId, ttsVoice, ttsSpeed, ttsApiKey, ttsBaseUrl, ttsFormat } = body as {
      text: string;
      audioId: string;
      ttsProviderId: TTSProviderId;
      ttsVoice: string;
      ttsSpeed?: number;
      ttsApiKey?: string;
      ttsBaseUrl?: string;
      ttsFormat?: string;
    };

    // Validate required fields
    if (!text || !audioId || !ttsProviderId || !ttsVoice) {
      return apiError(
        'MISSING_REQUIRED_FIELD',
        400,
        'Missing required fields: text, audioId, ttsProviderId, ttsVoice',
      );
    }

    // Reject browser-native TTS — must be handled client-side
    if (ttsProviderId === 'browser-native-tts') {
      return apiError('INVALID_REQUEST', 400, 'browser-native-tts must be handled client-side');
    }

    const clientBaseUrl = ttsBaseUrl || undefined;
    if (clientBaseUrl && process.env.NODE_ENV === 'production') {
      const ssrfError = validateUrlForSSRF(clientBaseUrl);
      if (ssrfError) {
        return apiError('INVALID_URL', 403, ssrfError);
      }
    }

    const initialApiKey = clientBaseUrl
      ? ttsApiKey || ''
      : resolveTTSApiKey(ttsProviderId, ttsApiKey || undefined);
    const initialBaseUrl = clientBaseUrl
      ? clientBaseUrl
      : resolveTTSBaseUrl(ttsProviderId, ttsBaseUrl || undefined);

    let resolvedProviderId = ttsProviderId;
    let resolvedVoice = ttsVoice;
    let resolvedApiKey = initialApiKey;
    let resolvedBaseUrl = initialBaseUrl;

    // 🚀 服务端平滑降级双保险：若指定的提供商需要 API Key 但实际没有配置，直接安全降级到免密的 Edge TTS
    const providerDef = TTS_PROVIDERS[ttsProviderId];
    if (providerDef?.requiresApiKey && !resolvedApiKey && ttsProviderId !== 'volcengine-tts') {
      log.info(`[TTS Server Fallback] Provider ${ttsProviderId} requires API key but none provided. Falling back to edge-tts.`);
      resolvedProviderId = 'edge-tts';
      resolvedApiKey = '';
      resolvedBaseUrl = undefined;

      const v = ttsVoice.toLowerCase();
      if (v.includes('xiaoxiao') || v.includes('nova') || v.includes('shimmer') || v.includes('coral') || v.includes('serena') || v.includes('chelsie') || v.includes('momo') || v.includes('vivian') || v.includes('maia') || v.includes('bella') || v.includes('jennifer') || v.includes('katerina') || v.includes('mia') || v.includes('bellona') || v.includes('bunny') || v.includes('elias') || v.includes('nini') || v.includes('ebona') || v.includes('seren') || v.includes('stella') || v.includes('xiaoyi') || v.includes('jenny')) {
        resolvedVoice = 'zh-CN-XiaoxiaoNeural';
      } else if (v.includes('yunxi') || v.includes('echo') || v.includes('onyx') || v.includes('ethan') || v.includes('moon') || v.includes('kai') || v.includes('nofish') || v.includes('ryan') || v.includes('aiden') || v.includes('mochi') || v.includes('vincent') || v.includes('neil') || v.includes('arthur') || v.includes('pip') || v.includes('yunjian') || v.includes('guy')) {
        resolvedVoice = 'zh-CN-YunxiNeural';
      } else {
        resolvedVoice = 'zh-CN-XiaoxiaoNeural';
      }
    }

    // Build TTS config
    const config = {
      providerId: resolvedProviderId,
      voice: resolvedVoice,
      speed: ttsSpeed ?? 1.0,
      apiKey: resolvedApiKey,
      baseUrl: resolvedBaseUrl,
      format: ttsFormat || 'mp3',
    };

    const cleanText = cleanTextForTTS(text);

    log.info(
      `Generating TTS: provider=${ttsProviderId}, voice=${ttsVoice}, audioId=${audioId}, textLen=${cleanText.length}`,
    );

    // Generate audio
    let audio: Uint8Array;
    let format: string;

    // 1. 首发尝试控制器与超时设定 (4.0 秒)
    const firstController = new AbortController();
    const firstConfig = {
      ...config,
      signal: firstController.signal,
    };
    let firstTimeoutId: NodeJS.Timeout | undefined;

    const firstTimeoutPromise = new Promise<never>((_, reject) => {
      firstTimeoutId = setTimeout(() => {
        firstController.abort(); // 强行中断第一个 fetch 请求，释放套接字与容器连接
        reject(new Error('TTS_FIRST_ATTEMPT_TIMEOUT'));
      }, 4000);
    });

    try {
      const result = await Promise.race([
        generateTTS(firstConfig, cleanText),
        firstTimeoutPromise
      ]);
      if (firstTimeoutId) clearTimeout(firstTimeoutId);
      audio = result.audio;
      format = result.format;
    } catch (firstError) {
      if (firstTimeoutId) clearTimeout(firstTimeoutId);
      firstController.abort(); // 确保即便由于非超时报错退出，底层连接也必须中断

      // 2. 降级尝试防线
      if (config.providerId !== 'edge-tts') {
        log.warn(`[TTS Server Exception Fallback] ${config.providerId} failed/timeout:`, firstError, `. Trying ultimate fallback to edge-tts.`);
        
        let fallbackVoice = 'zh-CN-XiaoxiaoNeural';
        const v = config.voice.toLowerCase();
        if (v.includes('xiaoxiao') || v.includes('nova') || v.includes('shimmer') || v.includes('coral') || v.includes('serena') || v.includes('chelsie') || v.includes('momo') || v.includes('vivian') || v.includes('maia') || v.includes('bella') || v.includes('jennifer') || v.includes('katerina') || v.includes('mia') || v.includes('bellona') || v.includes('bunny') || v.includes('elias') || v.includes('nini') || v.includes('ebona') || v.includes('seren') || v.includes('stella') || v.includes('xiaoyi') || v.includes('jenny')) {
          fallbackVoice = 'zh-CN-XiaoxiaoNeural';
        } else if (v.includes('yunxi') || v.includes('echo') || v.includes('onyx') || v.includes('ethan') || v.includes('moon') || v.includes('kai') || v.includes('nofish') || v.includes('ryan') || v.includes('aiden') || v.includes('mochi') || v.includes('vincent') || v.includes('neil') || v.includes('arthur') || v.includes('pip') || v.includes('yunjian') || v.includes('guy')) {
          fallbackVoice = 'zh-CN-YunxiNeural';
        }

        const fallbackController = new AbortController();
        const fallbackConfig = {
          providerId: 'edge-tts' as const,
          voice: fallbackVoice,
          speed: config.speed,
          apiKey: '',
          baseUrl: undefined,
          format: 'mp3',
          signal: fallbackController.signal,
        };

        let fallbackTimeoutId: NodeJS.Timeout | undefined;
        const fallbackTimeoutPromise = new Promise<never>((_, reject) => {
          fallbackTimeoutId = setTimeout(() => {
            fallbackController.abort(); // 强行中断降级的 WebSocket 连线，防止容器被耗尽挂起
            reject(new Error('TTS_FALLBACK_TIMEOUT'));
          }, 4500);
        });

        try {
          const result = await Promise.race([
            generateTTS(fallbackConfig, cleanText),
            fallbackTimeoutPromise
          ]);
          if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
          audio = result.audio;
          format = result.format;
        } catch (fallbackError) {
          if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
          fallbackController.abort(); // 确保资源释放
          throw fallbackError;
        }
      } else {
        throw firstError;
      }
    }

    // Convert to base64
    const base64 = Buffer.from(audio).toString('base64');

    return apiSuccess({ audioId, base64, format });
  } catch (error) {
    log.error('TTS generation error:', error);
    return apiError(
      'GENERATION_FAILED',
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
}
