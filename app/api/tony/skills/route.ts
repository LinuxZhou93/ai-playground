import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

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
