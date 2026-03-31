/**
 * Server-side media and TTS generation for classrooms.
 *
 * Generates image/video files and TTS audio for a classroom,
 * uploads them directly to Supabase Storage, and returns serving URL mappings.
 */

import { createLogger } from '@/lib/logger';
import { generateImage } from '@/lib/media/image-providers';
import { generateVideo, normalizeVideoOptions } from '@/lib/media/video-providers';
import { generateTTS } from '@/lib/audio/tts-providers';
import { DEFAULT_TTS_VOICES, TTS_PROVIDERS } from '@/lib/audio/constants';
import { IMAGE_PROVIDERS } from '@/lib/media/image-providers';
import { VIDEO_PROVIDERS } from '@/lib/media/video-providers';
import { isMediaPlaceholder } from '@/lib/store/media-generation';
import {
  getServerImageProviders,
  getServerVideoProviders,
  getServerTTSProviders,
  resolveImageApiKey,
  resolveImageBaseUrl,
  resolveVideoApiKey,
  resolveVideoBaseUrl,
  resolveTTSApiKey,
  resolveTTSBaseUrl,
} from '@/lib/server/provider-config';
import type { SceneOutline } from '@/lib/types/generation';
import type { Scene } from '@/lib/types/stage';
import type { SpeechAction } from '@/lib/types/action';
import type { ImageProviderId } from '@/lib/media/types';
import type { VideoProviderId } from '@/lib/media/types';
import type { TTSProviderId } from '@/lib/audio/types';
import { splitLongSpeechActions } from '@/lib/audio/tts-utils';
import { supabase } from '@/lib/supabase';

const log = createLogger('ClassroomMedia');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DOWNLOAD_TIMEOUT_MS = 120_000; // 2 minutes
const DOWNLOAD_MAX_SIZE = 100 * 1024 * 1024; // 100 MB

async function downloadToBuffer(url: string): Promise<Buffer> {
  const resp = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!resp.ok) throw new Error(`Download failed: ${resp.status} ${resp.statusText}`);
  const contentLength = Number(resp.headers.get('content-length') || 0);
  if (contentLength > DOWNLOAD_MAX_SIZE) {
    throw new Error(`File too large: ${contentLength} bytes (max ${DOWNLOAD_MAX_SIZE})`);
  }
  return Buffer.from(await resp.arrayBuffer());
}

async function uploadToSupabaseStorage(
  storagePath: string,
  buffer: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('classroom-media')
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from('classroom-media')
    .getPublicUrl(storagePath);
    
  return publicData.publicUrl;
}

// ---------------------------------------------------------------------------
// Image / Video generation
// ---------------------------------------------------------------------------

export async function generateMediaForClassroom(
  outlines: SceneOutline[],
  classroomId: string,
  baseUrl: string,
): Promise<Record<string, string>> {
  // Collect all media generation requests from outlines
  const requests = outlines.flatMap((o) => o.mediaGenerations ?? []);
  if (requests.length === 0) return {};

  // Resolve providers
  const imageProviderIds = Object.keys(getServerImageProviders());
  const videoProviderIds = Object.keys(getServerVideoProviders());

  const mediaMap: Record<string, string> = {};

  const imageRequests = requests.filter((r) => r.type === 'image' && imageProviderIds.length > 0);
  const videoRequests = requests.filter((r) => r.type === 'video' && videoProviderIds.length > 0);

  const generateImages = async () => {
    for (const req of imageRequests) {
      try {
        const providerId = imageProviderIds[0] as ImageProviderId;
        const apiKey = resolveImageApiKey(providerId);
        if (!apiKey) continue;
        const providerConfig = IMAGE_PROVIDERS[providerId];
        const model = providerConfig?.models?.[0]?.id;

        const result = await generateImage(
          { providerId, apiKey, baseUrl: resolveImageBaseUrl(providerId), model },
          { prompt: req.prompt, aspectRatio: req.aspectRatio || '16:9' },
        );

        let buf: Buffer;
        let ext: string;
        let mime: string;
        if (result.base64) {
          buf = Buffer.from(result.base64, 'base64');
          ext = 'png';
          mime = 'image/png';
        } else if (result.url) {
          buf = await downloadToBuffer(result.url);
          ext = 'png';
          mime = 'image/png';
          // Trivial fallback extraction could be here, but generally image generation URL results are PNG or JPG
        } else {
          continue;
        }

        const filename = `${req.elementId}.${ext}`;
        const storagePath = `${classroomId}/media/${filename}`;
        
        const publicUrl = await uploadToSupabaseStorage(storagePath, buf, mime);
        mediaMap[req.elementId] = publicUrl;
        log.info(`Uploaded generated image to Supabase: ${publicUrl}`);
      } catch (err) {
        log.warn(`Image generation failed for ${req.elementId}:`, err);
      }
    }
  };

  const generateVideos = async () => {
    for (const req of videoRequests) {
      try {
        const providerId = videoProviderIds[0] as VideoProviderId;
        const apiKey = resolveVideoApiKey(providerId);
        if (!apiKey) continue;
        const providerConfig = VIDEO_PROVIDERS[providerId];
        const model = providerConfig?.models?.[0]?.id;

        const normalized = normalizeVideoOptions(providerId, {
          prompt: req.prompt,
          aspectRatio: (req.aspectRatio as '16:9' | '4:3' | '1:1' | '9:16') || '16:9',
        });

        const result = await generateVideo(
          { providerId, apiKey, baseUrl: resolveVideoBaseUrl(providerId), model },
          normalized,
        );

        const buf = await downloadToBuffer(result.url);
        const filename = `${req.elementId}.mp4`;
        const storagePath = `${classroomId}/media/${filename}`;

        const publicUrl = await uploadToSupabaseStorage(storagePath, buf, 'video/mp4');
        mediaMap[req.elementId] = publicUrl;
        log.info(`Uploaded generated video to Supabase: ${publicUrl}`);
      } catch (err) {
        log.warn(`Video generation failed for ${req.elementId}:`, err);
      }
    }
  };

  await Promise.all([generateImages(), generateVideos()]);

  return mediaMap;
}

// ---------------------------------------------------------------------------
// Placeholder replacement in scene content
// ---------------------------------------------------------------------------

export function replaceMediaPlaceholders(scenes: Scene[], mediaMap: Record<string, string>): void {
  if (Object.keys(mediaMap).length === 0) return;

  for (const scene of scenes) {
    if (scene.type === 'slide') {
      const canvas = (scene.content as any)?.canvas;
      if (canvas?.elements) {
        for (const el of canvas.elements) {
          if (
            (el.type === 'image' || el.type === 'video') &&
            typeof el.src === 'string' &&
            isMediaPlaceholder(el.src) &&
            mediaMap[el.src]
          ) {
            el.src = mediaMap[el.src];
          }
        }
      }
    }
    if (scene.type === 'interactive') {
      const content = scene.content as { html?: string };
      if (content.html) {
        let updatedHtml = content.html;
        for (const [placeholder, url] of Object.entries(mediaMap)) {
          updatedHtml = updatedHtml.replaceAll(placeholder, url);
          updatedHtml = updatedHtml.replaceAll(`ai-render://${placeholder}`, url);
        }
        content.html = updatedHtml;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// TTS generation
// ---------------------------------------------------------------------------

export async function generateTTSForClassroom(
  scenes: Scene[],
  classroomId: string,
  baseUrl: string,
): Promise<void> {
  const ttsProviderIds = Object.keys(getServerTTSProviders()).filter(
    (id) => id !== 'browser-native-tts',
  );
  if (ttsProviderIds.length === 0) return;

  const providerId = ttsProviderIds[0] as TTSProviderId;
  const apiKey = resolveTTSApiKey(providerId);
  if (!apiKey) return;
  
  const ttsBaseUrl = resolveTTSBaseUrl(providerId) || TTS_PROVIDERS[providerId]?.defaultBaseUrl;
  let voice = DEFAULT_TTS_VOICES[providerId] || 'default';
  if (providerId === 'volcengine-tts') {
    voice = 'zh_male_shaonianzixin_uranus_bigtts';
  }
  const format = TTS_PROVIDERS[providerId]?.supportedFormats?.[0] || 'mp3';
  const mime = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';

  for (const scene of scenes) {
    if (!scene.actions) continue;
    scene.actions = splitLongSpeechActions(scene.actions, providerId);

    for (const action of scene.actions) {
      if (action.type !== 'speech' || !(action as SpeechAction).text) continue;
      const speechAction = action as SpeechAction;
      const audioId = `tts_${action.id}`;

      try {
        const result = await generateTTS(
          { providerId, apiKey, baseUrl: ttsBaseUrl, voice, speed: speechAction.speed },
          speechAction.text,
        );

        const filename = `${audioId}.${format}`;
        const storagePath = `${classroomId}/audio/${filename}`;
        
        const publicUrl = await uploadToSupabaseStorage(storagePath, result.audio, mime);

        speechAction.audioId = audioId;
        speechAction.audioUrl = publicUrl;
        log.info(`Uploaded generated TTS to Supabase: ${publicUrl}`);
      } catch (err) {
        log.error(`TTS generation FAILED for action ${action.id}:`, err);
      }
    }
  }
}
