/**
 * Agnes AI Image Generation Adapter
 *
 * Uses OpenAI-compatible synchronous API format.
 * Endpoint: https://apihub.agnes-ai.com/v1/images/generations
 *
 * Supported models:
 * - agnes-image-2.1 (recommended)
 * - agnes-image-2.0
 */

import type {
  ImageGenerationConfig,
  ImageGenerationOptions,
  ImageGenerationResult,
} from '../types';

const DEFAULT_MODEL = 'agnes-image-2.0-flash';
const DEFAULT_BASE_URL = 'https://apihub.agnes-ai.com/v1';

/**
 * Connectivity test to validate API key with Agnes Image API
 */
export async function testAgnesImageConnectivity(
  config: ImageGenerationConfig,
): Promise<{ success: boolean; message: string }> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  try {
    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || DEFAULT_MODEL,
        prompt: 'test connectivity',
        n: 1,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      const text = await response.text();
      return {
        success: false,
        message: `Agnes Image auth failed (${response.status}): ${text}`,
      };
    }

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        message: `Agnes Image returned error status (${response.status}): ${text}`,
      };
    }

    return { success: true, message: 'Connected to Agnes Image' };
  } catch (err) {
    return { success: false, message: `Agnes Image connectivity error: ${err}` };
  }
}

export async function generateWithAgnesImage(
  config: ImageGenerationConfig,
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;

  // Map aspect ratio to standard sizes if dimensions not specified
  let size = '1024x1024';
  if (!options.width || !options.height) {
    if (options.aspectRatio === '16:9') {
      size = '1024x576';
    } else if (options.aspectRatio === '9:16') {
      size = '576x1024';
    } else if (options.aspectRatio === '4:3') {
      size = '1024x768';
    }
  } else {
    size = `${options.width}x${options.height}`;
  }

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || DEFAULT_MODEL,
      prompt: options.prompt,
      n: 1,
      size,
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agnes image generation failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const imageData = data.data?.[0];
  if (!imageData) {
    throw new Error('Agnes returned empty image response');
  }

  // Handle both URL and Base64 format
  return {
    url: imageData.url,
    base64: imageData.b64_json,
    width: options.width || (options.aspectRatio === '16:9' ? 1024 : 1024),
    height: options.height || (options.aspectRatio === '16:9' ? 576 : 1024),
  };
}
