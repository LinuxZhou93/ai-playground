/**
 * Agnes AI Video Generation Adapter
 *
 * Async task pattern: submit → poll → return video URL.
 *
 * REST endpoints:
 * - Submit: POST /v1/videos
 * - Poll:   GET  /v1/videos/{task_id}
 *
 * Supported models:
 * - agnes-video-v2.0
 */

import type {
  VideoGenerationConfig,
  VideoGenerationOptions,
  VideoGenerationResult,
} from '../types';

const DEFAULT_MODEL = 'agnes-video-v2.0';
const DEFAULT_BASE_URL = 'https://apihub.agnes-ai.com/v1';
const POLL_INTERVAL_MS = 10_000; // 10 seconds
const MAX_POLL_ATTEMPTS = 60; // 10 minutes max

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Dimension defaults per aspect ratio */
function getDimensions(aspectRatio?: string): {
  width: number;
  height: number;
} {
  switch (aspectRatio) {
    case '9:16':
      return { width: 720, height: 1280 };
    case '1:1':
      return { width: 1024, height: 1024 };
    case '4:3':
      return { width: 1024, height: 768 };
    default:
      return { width: 1152, height: 768 }; // Agnes Video V2.0 推荐宽屏 1152x768
  }
}

/** Common headers for Agnes Video API calls */
function apiHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

// ---------------------------------------------------------------------------
// REST types
// ---------------------------------------------------------------------------

interface AgnesVideoSubmitResponse {
  id: string;
  task_id?: string;
  status: string;
}

interface AgnesVideoPollResponse {
  id: string;
  status: string; // "queued" | "in_progress" | "completed" | "failed"
  progress?: number; // 0-100
  remixed_from_video_id?: string; // 视频 URL
  error?: string;
}

// ---------------------------------------------------------------------------
// Connectivity test
// ---------------------------------------------------------------------------

/**
 * Lightweight connectivity test - validates API key by checking status
 * of a dummy task ID. 401/403 means auth failure.
 */
export async function testAgnesConnectivity(
  config: VideoGenerationConfig,
): Promise<{ success: boolean; message: string }> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  try {
    const response = await fetch(`${baseUrl}/videos/test_conn_dummy_id`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      const text = await response.text();
      return {
        success: false,
        message: `Agnes Video auth failed (${response.status}): ${text}`,
      };
    }

    return { success: true, message: 'Connected to Agnes Video API (Auth verified)' };
  } catch (err) {
    return { success: false, message: `Agnes Video connectivity error: ${err}` };
  }
}

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

async function submitVideoGeneration(
  baseUrl: string,
  apiKey: string,
  model: string,
  options: VideoGenerationOptions,
): Promise<string> {
  const { width, height } = getDimensions(options.aspectRatio);

  const body: Record<string, unknown> = {
    model,
    prompt: options.prompt,
    width,
    height,
    num_frames: 121, // 约 5 秒 @ 24fps
    frame_rate: 24,
  };

  const response = await fetch(`${baseUrl}/videos`, {
    method: 'POST',
    headers: apiHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agnes video submit failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as AgnesVideoSubmitResponse;
  const taskId = data.id || data.task_id;
  if (!taskId) {
    throw new Error('Agnes video returned empty task ID');
  }

  return taskId;
}

// ---------------------------------------------------------------------------
// Poll
// ---------------------------------------------------------------------------

async function pollVideoStatus(
  baseUrl: string,
  apiKey: string,
  taskId: string,
): Promise<AgnesVideoPollResponse> {
  const response = await fetch(`${baseUrl}/videos/${taskId}`, {
    method: 'GET',
    headers: apiHeaders(apiKey),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agnes video poll failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<AgnesVideoPollResponse>;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function generateWithAgnes(
  config: VideoGenerationConfig,
  options: VideoGenerationOptions,
): Promise<VideoGenerationResult> {
  const model = config.model || DEFAULT_MODEL;
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;

  // 1. Submit task
  const taskId = await submitVideoGeneration(baseUrl, config.apiKey, model, options);

  // 2. Poll until completed or failed
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await delay(POLL_INTERVAL_MS);
    const result = await pollVideoStatus(baseUrl, config.apiKey, taskId);

    if (result.status === 'completed' || result.status === 'done') {
      const url = result.remixed_from_video_id;
      if (!url) {
        throw new Error('Agnes video task completed but no video URL (remixed_from_video_id) was returned');
      }
      const { width, height } = getDimensions(options.aspectRatio);
      return {
        url,
        duration: 5,
        width,
        height,
      };
    }

    if (result.status === 'failed') {
      throw new Error(`Agnes video generation failed: ${result.error || JSON.stringify(result)}`);
    }
  }

  throw new Error(
    `Agnes video generation timed out after ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s (task: ${taskId})`,
  );
}
