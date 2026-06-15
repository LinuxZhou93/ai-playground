export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const AGNES_IMAGES_URL = 'https://apihub.agnes-ai.com/v1/images/generations';

import fs from 'fs';
import path from 'path';

const getKeys = () => {
  const keysSet = new Set<string>();
  
  // 1. 读取环境变量中的 Key
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
    // 忽略错误并降级
  }

  // 2. 注入已知的两个 Key，确保至少有这两个已知 Key 可用
  keysSet.add('sk-thJ5xEElR6KKfwA4FJ6P5jHb2KZ3pNw0d0BODd8Q6pqFE8e2');
  keysSet.add('sk-pFm2lScYYARyjF6uUF4xrWoQlbu7PRdYEnMf4xJFoGIuQD5I');

  return Array.from(keysSet);
};

export async function POST(req: Request) {
  const keys = getKeys();
  // 随机打乱密钥顺序，当前端发出并发请求时，实现负载分流到不同的 Key
  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);

  try {
    const body = await req.json();

    // 智能映射：如果客户端传的是 dall-e-3，自动静默映射为 agnes-image-2.0-flash 免费生图模型
    let targetModel = body.model || 'agnes-image-2.0-flash';
    if (targetModel === 'dall-e-3' || targetModel.includes('dall-e')) {
      targetModel = 'agnes-image-2.0-flash';
    }

    // 彻底击碎上游缓存：在 Prompt 结尾注入独一无二的高精度随机签名
    let finalPrompt = body.prompt || '';
    if (finalPrompt) {
      const uniqueSuffix = `[ref: ${Date.now()}-${Math.random().toString(36).substring(2, 7)}]`;
      finalPrompt = `${finalPrompt} ${uniqueSuffix}`;
    }

    let lastError: any = null;
    let responseData: any = null;
    let success = false;

    // 依次尝试调用可用 API Key，实现单 Key 报错自动降级兜底
    for (let i = 0; i < shuffledKeys.length; i++) {
      const currentKey = shuffledKeys[i];
      try {
        const response = await fetch(AGNES_IMAGES_URL, {
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
          break; // 成功则终止重试循环
        } else {
          const errorMsg = await response.text();
          lastError = new Error(`Key index ${i} failed with status ${response.status}: ${errorMsg}`);
          console.warn(`[生图代理] 密钥 ${currentKey.slice(0, 8)}... 调用失败 (正在尝试下一个): ${errorMsg}`);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[生图代理] 密钥 ${currentKey.slice(0, 8)}... 请求异常 (正在尝试下一个): ${err.message}`);
      }
    }

    // 添加跨域响应头，方便外部主站等地方安全调用
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (success && responseData) {
      return NextResponse.json(responseData, { status: 200, headers });
    } else {
      return NextResponse.json({ 
        error: { 
          message: `All keys failed to generate image. Last error: ${lastError ? lastError.message : 'Unknown'}` 
        } 
      }, { status: 500, headers });
    }

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
