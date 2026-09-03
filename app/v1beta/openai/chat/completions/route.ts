export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const BACKGRACE_URL = 'https://backgrace.com/v1/chat/completions';
const GEMINI_RELAY_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-low',
  // Backgrace is LiteLLM-compatible. The explicit provider prefix prevents
  // its reasoning router from turning the bare alias into an unresolvable
  // `gemini-3.5-flash-low` model name.
  'gemini/gemini-3.5-flash',
  'gemini/gemini-3.5-flash-low',
  'google/gemini-3.5-flash',
  'google/gemini-3.5-flash-low',
  'gemini-3.5-flash-preview',
  'gemini/gemini-3.5-flash-preview',
] as const;

const getCleanApiKey = () => {
  return (
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    ''
  );
};

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = new Headers({ Vary: 'Origin' });
  if (origin && /^https:\/\/(?:www\.)?zhouxiaomai\.com$|^https:\/\/ai\.zhouxiaomai\.com$/.test(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
};

export async function POST(req: Request) {
  const fallbackApiKey = getCleanApiKey();
  try {
    const body = await req.json();

    // Live Vision 与 OpenAI 兼容调用统一走服务端中转站。
    // 客户端提交的模型名、Base URL 与凭证均不能改变生产路由。
    const configuredBaseUrl = (process.env.OPENAI_BASE_URL || process.env.GOOGLE_BASE_URL || '').replace(/\/$/, '');
    const upstreamUrl = configuredBaseUrl
      ? `${configuredBaseUrl}/chat/completions`
      : BACKGRACE_URL;
    const upstreamApiKey = fallbackApiKey;
    if (!upstreamApiKey) {
      return NextResponse.json(
        { error: { message: 'Server AI provider is not configured' } },
        { status: 503, headers: getCorsHeaders(req) },
      );
    }

    const stream = body.stream === true;
    let response: Response | undefined;
    let errorData = '';
    let resolvedModel: (typeof GEMINI_RELAY_MODELS)[number] = GEMINI_RELAY_MODELS[0];

    for (const targetModel of GEMINI_RELAY_MODELS) {
      resolvedModel = targetModel;
      response = await fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${upstreamApiKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: body.messages || [],
          temperature: body.temperature ?? 0.7,
          max_tokens: body.max_tokens ?? 4096,
          stream,
        }),
        cache: 'no-store',
      });

      if (response.ok) break;

      errorData = await response.text();
      const isModelRoutingError =
        response.status === 404 ||
        response.status === 502 ||
        /unknown provider|unknown model|model.*not found|no access to model/i.test(errorData);
      if (!isModelRoutingError) break;
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: { message: `Upstream error: ${response?.status || 502} ${errorData}` } },
        { status: response?.status || 502, headers: getCorsHeaders(req) },
      );
    }

    const headers = getCorsHeaders(req);
    headers.set('X-AI-Model', resolvedModel);
    if (stream && response.body) {
      headers.set('Content-Type', response.headers.get('Content-Type') || 'text/event-stream');
      headers.set('Cache-Control', 'no-cache, no-transform');
      return new Response(response.body, { status: 200, headers });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200, headers });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Internal proxy error' } },
      { status: 500, headers: getCorsHeaders(req) },
    );
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) });
}
