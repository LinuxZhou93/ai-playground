export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API endpoints
const BACKGRACE_CHAT_URL = 'https://backgrace.com/v1/chat/completions';
const BACKGRACE_TTS_URL = 'https://backgrace.com/v1/audio/speech';
const BACKGRACE_ASR_URL = 'https://backgrace.com/v1/audio/transcriptions';
const AGNES_IMAGE_URL = 'https://apihub.agnes-ai.com/v1/images/generations';

// 解析 .env 中最新的 Backgrace Key
const getBackgraceKey = () => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valParts] = trimmed.split('=');
          const val = valParts.join('=').trim();
          if ((key.trim() === 'OPENAI_API_KEY' || key.trim() === 'GOOGLE_API_KEY') && val) {
            const cleanVal = val.replace(/^['"]|['"]$/g, '');
            if (cleanVal && !cleanVal.startsWith('sk-Ob49') && !cleanVal.startsWith('sk-4nI8') && !cleanVal.startsWith('sk-YU1Cu') && !cleanVal.startsWith('sk-yRWW')) {
              return cleanVal;
            }
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }

  const keys = [
    process.env.OPENAI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GEMINI_API_KEY
  ];
  for (const k of keys) {
    if (k && !k.startsWith('sk-Ob49') && !k.startsWith('sk-4nI8') && !k.startsWith('sk-YU1Cu') && !k.startsWith('sk-yRWW')) {
      return k;
    }
  }
  return '';
};

// 获取 Agnes Keys (双 Key 负载分流)
const getAgnesKeys = () => {
  const keysSet = new Set<string>();
  
  const envKeys = [
    process.env.AGNES_API_KEY,
    process.env.IMAGE_GENERATION_API_KEY
  ];
  for (const k of envKeys) {
    if (k && k.startsWith('sk-')) keysSet.add(k);
  }

  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valParts] = trimmed.split('=');
          const val = valParts.join('=').trim();
          if ((key.trim() === 'AGNES_API_KEY' || key.trim() === 'IMAGE_GENERATION_API_KEY') && val) {
            const cleanVal = val.replace(/^['"]|['"]$/g, '');
            if (cleanVal && cleanVal.startsWith('sk-')) {
              keysSet.add(cleanVal);
            }
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // 注入已知的两个 Key，确保至少有这两个已知 Key 可用
  keysSet.add('sk-thJ5xEElR6KKfwA4FJ6P5jHb2KZ3pNw0d0BODd8Q6pqFE8e2');
  keysSet.add('sk-pFm2lScYYARyjF6uUF4xrWoQlbu7PRdYEnMf4xJFoGIuQD5I');

  return Array.from(keysSet);
};

export async function POST(req: Request) {
  try {
    // 如果是 ASR, 需要解析 FormData, 否则解析 JSON
    const contentType = req.headers.get('content-type') || '';
    let type = '';
    let body: any = {};
    let formData: FormData | null = null;

    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData();
      type = (formData.get('type') as string) || 'asr';
    } else {
      body = await req.json();
      type = body.type || 'llm';
    }

    const backgraceKey = getBackgraceKey();
    const agnesKeys = getAgnesKeys();

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 1. LLM Chat Completions (Backgrace)
    if (type === 'llm') {
      let targetModel = body.model || 'gemini-3.5-flash';
      // 强制在 proxy 内重映射一些可用模型
      if (targetModel.includes('gemini') && !targetModel.includes('3.5')) {
        targetModel = 'gemini-3.5-flash';
      }

      const response = await fetch(BACKGRACE_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backgraceKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: body.messages || [],
          temperature: body.temperature ?? 0.7,
          max_tokens: body.max_tokens ?? 2048,
          stream: false
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json({ error: { message: `Upstream error: ${response.status} ${errorData}` } }, { status: response.status, headers: corsHeaders });
      }

      const data = await response.json();
      return NextResponse.json(data, { status: 200, headers: corsHeaders });
    }

    // 2. Image Generations (Agnes / Double-key Load Balanced)
    if (type === 'image') {
      const shuffledKeys = [...agnesKeys].sort(() => Math.random() - 0.5);
      let targetModel = body.model || 'agnes-image-2.0-flash';
      if (targetModel.includes('dall-e')) {
        targetModel = 'agnes-image-2.0-flash';
      }

      let finalPrompt = body.prompt || '';
      if (finalPrompt) {
        // 击碎缓存印记
        const uniqueSuffix = `[ref: ${Date.now()}-${Math.random().toString(36).substring(2, 7)}]`;
        finalPrompt = `${finalPrompt} ${uniqueSuffix}`;
      }

      let lastError: any = null;
      let responseData: any = null;
      let success = false;

      for (let i = 0; i < shuffledKeys.length; i++) {
        const currentKey = shuffledKeys[i];
        try {
          const response = await fetch(AGNES_IMAGE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              prompt: finalPrompt,
              n: body.n ?? 1,
              size: body.size ?? '1024x1024'
            }),
            cache: 'no-store'
          });

          if (response.ok) {
            responseData = await response.json();
            success = true;
            break;
          } else {
            const errorMsg = await response.text();
            lastError = new Error(`Key ${i} status ${response.status}: ${errorMsg}`);
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (success && responseData) {
        return NextResponse.json(responseData, { status: 200, headers: corsHeaders });
      } else {
        return NextResponse.json({ error: { message: `All Agnes keys failed. Last error: ${lastError?.message}` } }, { status: 500, headers: corsHeaders });
      }
    }

    // 3. TTS Text to Speech (Backgrace)
    if (type === 'tts') {
      const response = await fetch(BACKGRACE_TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backgraceKey}`,
        },
        body: JSON.stringify({
          model: body.model || 'tts-1',
          input: body.input || '',
          voice: body.voice || 'alloy',
          response_format: 'mp3'
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json({ error: { message: `TTS upstream error: ${response.status} ${errorData}` } }, { status: response.status, headers: corsHeaders });
      }

      const audioBuffer = await response.arrayBuffer();
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
        }
      });
    }

    // 4. ASR Speech to Text (Backgrace)
    if (type === 'asr' && formData) {
      const audioBlob = formData.get('audio') as Blob;
      if (!audioBlob) {
        return NextResponse.json({ error: { message: 'No audio file provided' } }, { status: 400, headers: corsHeaders });
      }

      const upstreamFormData = new FormData();
      upstreamFormData.append('file', audioBlob, 'audio.wav');
      upstreamFormData.append('model', 'whisper-1');

      const response = await fetch(BACKGRACE_ASR_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${backgraceKey}`,
        },
        body: upstreamFormData,
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json({ error: { message: `ASR upstream error: ${response.status} ${errorData}` } }, { status: response.status, headers: corsHeaders });
      }

      const data = await response.json();
      return NextResponse.json(data, { status: 200, headers: corsHeaders });
    }

    return NextResponse.json({ error: { message: `Unsupported request type: ${type}` } }, { status: 400, headers: corsHeaders });

  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message || 'Internal proxy error' } }, { status: 500 });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { status: 204, headers });
}
