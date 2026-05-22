import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/tony_skills?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase failed: ${response.statusText}`);
    }

    const skills = await response.json();
    return NextResponse.json({ success: true, data: skills });

  } catch (error: any) {
    console.error('Fetch Skills Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
