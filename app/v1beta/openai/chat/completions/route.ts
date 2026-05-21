import { NextResponse } from 'next/server';

// Server-side hardened key to bypass client-side proxy issues
const BACKGRACE_URL = 'https://backgrace.com/v1/chat/completions';
const getCleanApiKey = () => {
  const keys = [process.env.OPENAI_API_KEY, process.env.GEMINI_API_KEY];
  for (const k of keys) {
    if (k && !k.startsWith('sk-Ob49') && !k.startsWith('sk-4nI8')) {
      return k;
    }
  }
  return 'sk-YU1CuYxkbWCqLpqG6VevPLgSuaUugYlKzwrBXsl1JhSCKJZ4';
};
const PROD_KEY = getCleanApiKey();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(BACKGRACE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROD_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || 'gemini-3-flash',
        messages: body.messages || [],
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 4096,
        stream: false
      }),
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
