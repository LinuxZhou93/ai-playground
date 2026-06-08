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
    const { audio, format } = await generateTTS(config, cleanText);

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
