export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Server-side hardened key to bypass client-side proxy issues
const BACKGRACE_URL = 'https://backgrace.com/v1/chat/completions';
const DEFAULT_QWEN_COMPATIBLE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
import fs from 'fs';
import path from 'path';

const getCleanApiKey = () => {
  // 1. 优先从项目本地 .env 文件里解析，防止被系统全局过期的环境变量污染
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
    // 忽略错误并降级
  }

  // 2. 备用：从系统环境变量中读取
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

export async function POST(req: Request) {
  const fallbackApiKey = getCleanApiKey();
  try {
    const body = await req.json();

    // Prefer the server-owned Qwen connection when configured.  The Live Vision
    // client may still hold an old relay token in localStorage, but credentials
    // must never determine which server-side provider handles the request.
    const qwenApiKey = process.env.QWEN_API_KEY;
    const useQwen = Boolean(qwenApiKey);
    const qwenBaseUrl = (process.env.QWEN_BASE_URL || DEFAULT_QWEN_COMPATIBLE_BASE_URL).replace(/\/$/, '');
    const upstreamUrl = useQwen ? `${qwenBaseUrl}/chat/completions` : BACKGRACE_URL;

    let targetModel = body.model || (useQwen ? 'qwen-plus' : 'gemini-3.5-flash');
    if (useQwen && !String(targetModel).startsWith('qwen')) {
      targetModel = 'qwen-plus';
    } else if (!useQwen && String(targetModel).includes('gemini')) {
      targetModel = 'gemini-3.5-flash';
    }

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useQwen ? qwenApiKey : fallbackApiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: body.messages || [],
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 4096,
        stream: false
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
        const errorData = await response.text();
        return NextResponse.json({ error: { message: `Upstream error: ${response.status} ${errorData}` } }, { status: response.status });
    }

    const data = await response.json();
    
    // Add CORS headers for external websites (zhouxiaomai.com, futureclass.ai)
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return NextResponse.json(data, { status: 200, headers });
  } catch (error: any) {
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json({ error: { message: error.message || 'Internal proxy error' } }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { status: 204, headers });
}
