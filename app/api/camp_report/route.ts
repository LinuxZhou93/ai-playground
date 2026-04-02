import { NextResponse } from 'next/server';
import { httpsRequest } from '@/lib/server/https-request';

const supabaseUrl = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    let fetchUrl = `${supabaseUrl}/rest/v1/camp_evaluations`;
    if (id) {
       fetchUrl += `?id=eq.${id}&select=*`;
    } else {
       fetchUrl += `?select=*&order=created_at.desc`;
    }

    const data = await httpsRequest(fetchUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    return NextResponse.json({ success: true, data: id && data.length > 0 ? data[0] : data });
  } catch (error: any) {
    console.error('Camp Report Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
  }
}


