import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json({ error: '卡密和用户ID不能为空' }, { status: 400 });
    }

    // 1. 查询卡密是否存在及状态
    const { data: redeemCode, error: codeError } = await supabaseAdmin
      .from('redeem_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (codeError) {
      console.error('[Redeem API Error] Fetch code failed:', codeError);
      return NextResponse.json({ error: '数据库查询失败' }, { status: 500 });
    }

    if (!redeemCode) {
      return NextResponse.json({ error: '无效卡密' }, { status: 400 });
    }

    if (redeemCode.is_used) {
      return NextResponse.json({ error: '该卡密已被使用' }, { status: 400 });
    }

    const durationDays = redeemCode.duration_days || 30;

    // 2. 查询用户当前订阅状态，计算新的过期时间
    const { data: currentSub, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('current_period_end, status')
      .eq('user_id', userId)
      .maybeSingle();

    let baseDate = new Date();
    if (currentSub && currentSub.status === 'active' && currentSub.current_period_end) {
      const currentEnd = new Date(currentSub.current_period_end);
      if (currentEnd > baseDate) {
        baseDate = currentEnd;
      }
    }

    const newExpiryDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // 3. 更新卡密状态
    const { error: updateCodeError } = await supabaseAdmin
      .from('redeem_codes')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('code', code);

    if (updateCodeError) {
      console.error('[Redeem API Error] Update code failed:', updateCodeError);
      return NextResponse.json({ error: '更新卡密状态失败' }, { status: 500 });
    }

    // 4. 更新或插入订阅信息
    const { error: upsertSubError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        status: 'active',
        current_period_end: newExpiryDate,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertSubError) {
      console.error('[Redeem API Error] Upsert subscription failed:', upsertSubError);
      return NextResponse.json({ error: '更新订阅状态失败' }, { status: 500 });
    }

    // 5. 更新用户 profile
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        expiry_date: newExpiryDate,
      })
      .eq('id', userId);

    if (updateProfileError) {
      console.error('[Redeem API Error] Update profile failed:', updateProfileError);
      // 即使 profile 更新失败，订阅已经成功，但为了数据一致性，我们还是记录日志
    }

    return NextResponse.json({
      success: true,
      expiryDate: newExpiryDate,
      durationDays,
    });
  } catch (err: any) {
    console.error('[Redeem API Critical Error]', err);
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status: 500 });
  }
}