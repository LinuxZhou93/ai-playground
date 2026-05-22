import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    let fetchUrl = `${supabaseUrl}/rest/v1/camp_evaluations`;
    if (id) {
       fetchUrl += `?id=eq.${id}&select=*`;
    } else {
       // 只查询课程名称 (camp_name) 包含 "wowcreator" 相关的实验室评价记录
       fetchUrl += `?camp_name=ilike.*wowcreator*&order=created_at.desc`;
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

    return NextResponse.json({ success: true, data: id && data.length > 0 ? data[0] : data });
  } catch (error: any) {
    console.error('Lab Report Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
  }
}
