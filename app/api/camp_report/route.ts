import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    let fetchUrl = `${supabaseUrl}/rest/v1/camp_evaluations`;
    if (id) {
       fetchUrl += `?id=eq.${encodeURIComponent(id)}&select=*`;
    } else {
       // The dashboard never renders the base64 photo. Excluding it keeps the
       // list response small while preserving every field used by CSV export.
       const dashboardFields = [
         'id', 'created_at', 'student_id', 'student_name', 'camp_name',
         'focus_score', 'dexterity_score', 'logic_score', 'resilience_score',
         'self_management_score', 'social_score', 'creativity_score',
         'collaboration_score', 'highlights', 'potential_improvements',
         'ai_overall_report'
       ].join(',');
       fetchUrl += `?select=${dashboardFields}&order=created_at.desc`;
    }

    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) {
         throw new Error(`Supabase GET failed: ${res.statusText}`);
    }
    const data = await res.json();

    if (id && data.length === 0) {
      return NextResponse.json({ success: false, error: '报告不存在' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: id ? data[0] : data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Camp Report Fetch Error:', error);
    return NextResponse.json({ error: '数据读取失败，请稍后重试' }, { status: 500 });
  }
}
