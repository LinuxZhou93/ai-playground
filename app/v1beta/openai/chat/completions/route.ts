export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const BACKGRACE_BASE_URL = 'https://backgrace.com/v1';
const PRODUCTION_MODEL = 'gemini-3.8-flash';

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

    // Keep the browser free of credentials and pin production chat to the
    // latest Backgrace model verified with the server-owned API key.
    const configuredBaseUrl = (process.env.OPENAI_BASE_URL || process.env.GOOGLE_BASE_URL || BACKGRACE_BASE_URL).replace(/\/$/, '');
    const upstreamUrl = `${configuredBaseUrl}/chat/completions`;
    const upstreamApiKey = fallbackApiKey;
    if (!upstreamApiKey) {
      return NextResponse.json(
        { error: { message: 'Server AI provider is not configured' } },
        { status: 503, headers: getCorsHeaders(req) },
      );
    }

    const stream = body.stream === true;
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${upstreamApiKey}`,
      },
      body: JSON.stringify({
        model: PRODUCTION_MODEL,
        messages: body.messages || [],
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 4096,
        stream,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: { message: `Upstream error: ${response.status} ${errorData}` } },
        { status: response.status, headers: getCorsHeaders(req) },
      );
    }

    const headers = getCorsHeaders(req);
    headers.set('X-AI-Model', PRODUCTION_MODEL);
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
