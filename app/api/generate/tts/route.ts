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

    // 🚀 服务端平滑降级双保险：若指定的提供商需要 API Key 但实际没有配置，直接安全降级到内置免密的微软高品质神经网络 TTS (edge-tts)
    const providerDef = TTS_PROVIDERS[ttsProviderId];
    if (providerDef?.requiresApiKey && !resolvedApiKey && ttsProviderId !== 'edge-tts') {
      log.info(`[TTS Server Fallback] Provider ${ttsProviderId} requires API key but none provided. Falling back to edge-tts (Microsoft Free Neural).`);
      resolvedProviderId = 'edge-tts';
      resolvedApiKey = '';
      resolvedBaseUrl = undefined;

      const v = ttsVoice.toLowerCase();
      // 精准映射到微软目前最自然、像真人的神经网络免密音色，彻底告别新闻播报腔的机械棒读感
      if (v.includes('yunxi') || v.includes('echo') || v.includes('onyx') || v.includes('ethan') || v.includes('moon') || v.includes('kai') || v.includes('nofish') || v.includes('ryan') || v.includes('aiden') || v.includes('mochi') || v.includes('vincent') || v.includes('neil') || v.includes('arthur') || v.includes('pip') || v.includes('yunjian') || v.includes('guy')) {
        if (v.includes('teacher') || v.includes('guy') || v.includes('arthur') || v.includes('vincent') || v.includes('yunjian') || v.includes('neil')) {
          resolvedVoice = 'zh-CN-YunjianNeural'; // 云健 (沉稳专业的成熟讲师男声，真感极佳)
        } else {
          resolvedVoice = 'zh-CN-YunxiNeural'; // 云希 (清朗自然的男学生声)
        }
      } else {
        // 所有的女声角色（老师、学生、少女）都映射到高拟真的 Xiaoyi 音色，温柔真实，绝不机械
        resolvedVoice = 'zh-CN-XiaoyiNeural'; // 晓伊 (极其温柔拟真的日常女声，媲美真人配音)
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

      // 2. 优先降级到内置免密的微软 Edge TTS (edge-tts)
      if (config.providerId !== 'edge-tts') {
        log.warn(`[TTS Server Exception Fallback] ${config.providerId} failed:`, firstError, `. Trying fallback to edge-tts (Microsoft Free Neural).`);
        
        let fallbackVoice = 'zh-CN-XiaoyiNeural';
        const v = config.voice.toLowerCase();
        if (v.includes('yunxi') || v.includes('echo') || v.includes('onyx') || v.includes('ethan') || v.includes('moon') || v.includes('kai') || v.includes('nofish') || v.includes('ryan') || v.includes('aiden') || v.includes('mochi') || v.includes('vincent') || v.includes('neil') || v.includes('arthur') || v.includes('pip') || v.includes('yunjian') || v.includes('guy')) {
          if (v.includes('teacher') || v.includes('guy') || v.includes('arthur') || v.includes('vincent') || v.includes('yunjian') || v.includes('neil')) {
            fallbackVoice = 'zh-CN-YunjianNeural';
          } else {
            fallbackVoice = 'zh-CN-YunxiNeural';
          }
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
            fallbackController.abort();
            reject(new Error('TTS_EDGE_FALLBACK_TIMEOUT'));
          }, 4000); // 降级超时设置为 4.0 秒
        });

        try {
          const result = await Promise.race([
            generateTTS(fallbackConfig, cleanText),
            fallbackTimeoutPromise
          ]);
          if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
          audio = result.audio;
          format = result.format;
        } catch (edgeError) {
          if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
          fallbackController.abort();
          throw edgeError;
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
