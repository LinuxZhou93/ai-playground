import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/singleton';

/**
 * 安全卡密核销接口
 * POST /api/subscription/redeem
 */
export async function POST(req: Request) {
  try {
    // 1. 读取并校验卡密输入
    const body = await req.json().catch(() => ({}));
    const { code } = body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: '请输入有效的卡密' }, { status: 400 });
    }

    // 2. 使用 Session Cookie 解析当前登录的 Authenticated 用户身份
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn('[Redeem API] 未授权兑换尝试:', authError);
      return NextResponse.json({ error: '请先登录后再进行兑换' }, { status: 401 });
    }

    // 3. 调用以 SECURITY DEFINER 运行的特权 RPC 事务函数，安全更新并核销卡密
    const supabaseAdmin = getSupabaseAdmin();
    const normalizedCode = code.trim().toUpperCase();

    const { data, error: rpcError } = await supabaseAdmin.rpc('redeem_voucher', {
      p_voucher_code: normalizedCode,
      p_user_id: user.id
    });

    if (rpcError) {
      console.warn(`[Redeem API RPC Error] 用户: ${user.id}, 卡密: ${normalizedCode}, 错误: ${rpcError.message}`);
      // Supabase PL/pgSQL RAISE EXCEPTION 会把消息返回在 rpcError.message 中
      return NextResponse.json({ error: rpcError.message || '卡密兑换失败，请稍后重试' }, { status: 400 });
    }

    console.log(`[Redeem API Success] 用户: ${user.id} 成功兑换卡密: ${normalizedCode}, 新到期日: ${data.new_expiry}`);

    return NextResponse.json({
      success: true,
      newExpiry: data.new_expiry,
      durationApplied: data.duration_applied
    });
  } catch (err: any) {
    console.error('[Redeem API System Error]', err);
    return NextResponse.json(
      { error: err.message || '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
