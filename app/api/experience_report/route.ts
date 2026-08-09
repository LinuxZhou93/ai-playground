import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ success: false, error: '报告编号无效' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/camp_evaluations?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: 'no-store',
      },
    );
    if (!response.ok) throw new Error(`Supabase GET failed: ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) {
      return NextResponse.json({ success: false, error: '报告不存在' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, data: rows[0] },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('experience report fetch failed', error);
    return NextResponse.json(
      { success: false, error: '报告读取失败，请稍后重试' },
      { status: 500 },
    );
  }
}
