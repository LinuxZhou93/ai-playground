import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { buildSafeSupabaseAnonKey, buildSafeSupabaseServerKey, buildSafeSupabaseUrl, isSupabaseServerConfigured } from '@/lib/supabase/config';

const supabaseUrl = buildSafeSupabaseUrl;
const supabaseAnonKey = buildSafeSupabaseAnonKey;
const supabaseAdmin = createClient(buildSafeSupabaseUrl, buildSafeSupabaseServerKey);

// Zod 验证 Schema (简单第一层，规避 Zod v4 引擎 Bug)
const updateProfileSchema = z.object({
  userId: z.string().uuid({ message: 'userId 必须是合法的 UUID' }),
  preferences: z.any().optional(),
  subscription_tier: z.string().optional(),
  last_active_at: z.string().optional(),
});

// 非法字符/注入模式校验
function containsIllegalCharacters(val: string): boolean {
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i;
  const htmlPattern = /<[^>]*>/;
  const sqlInjectionPattern = /('|--|#|\/\*|\*\/)/; // 敏感字符
  return xssPattern.test(val) || htmlPattern.test(val) || sqlInjectionPattern.test(val);
}

// 递归检查对象所有键和值
function checkIllegalCharsRecursive(obj: any): boolean {
  if (typeof obj === 'string') {
    return containsIllegalCharacters(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (containsIllegalCharacters(key)) return true;
      if (checkIllegalCharsRecursive(obj[key])) return true;
    }
  }
  return false;
}

export async function POST(req: Request) {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ error: 'Supabase 未配置，用户资料服务暂不可用' }, { status: 503 });
  }
  try {
    // 1. 拦截超大 payload，防止超大 JSON 注入
    const rawText = await req.text();
    if (rawText.length > 5000) {
      return NextResponse.json({ error: 'Payload 太大' }, { status: 400 });
    }

    let body: any;
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      return NextResponse.json({ error: '无效的 JSON 格式' }, { status: 400 });
    }

    // 2. 检查非法字符 (XSS、SQL 注入、HTML 标签)
    if (checkIllegalCharsRecursive(body)) {
      return NextResponse.json({ error: '输入包含非法字符' }, { status: 400 });
    }

    // 3. Zod 校验的第一层
    const parseResult = updateProfileSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { userId, preferences, subscription_tier, last_active_at } = parseResult.data;

    // 手动校验细节以补充 Zod 结构 (确保与任务的 Zod 逻辑和原校验完全兼容且更健壮)
    if (preferences !== undefined) {
      if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
        return NextResponse.json({ error: 'preferences 必须是对象' }, { status: 400 });
      }
    }

    if (subscription_tier !== undefined) {
      if (!['free', 'pro', 'enterprise'].includes(subscription_tier)) {
        return NextResponse.json({ error: 'subscription_tier 必须是 free, pro 或 enterprise' }, { status: 400 });
      }
    }

    if (last_active_at !== undefined) {
      if (isNaN(Date.parse(last_active_at))) {
        return NextResponse.json({ error: 'last_active_at 必须是合法的日期格式' }, { status: 400 });
      }
    }

    if (preferences === undefined && subscription_tier === undefined && last_active_at === undefined) {
      return NextResponse.json({ error: 'preferences, subscription_tier 或 last_active_at 至少需要提供一个' }, { status: 400 });
    }

    // 4. 根据 Authorization 头动态决定是否使用 RLS 用户客户端
    const authHeader = req.headers.get('Authorization');
    const supabase = authHeader && supabaseAnonKey
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } }
        })
      : supabaseAdmin;

    // 5. 增量更新 preferences (如果是增量更新 JSONB)
    let finalPreferences = preferences;
    if (preferences !== undefined) {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('[Profile API Error] Fetch profile failed:', fetchError);
      }

      const existingPrefs = currentProfile?.preferences && typeof currentProfile.preferences === 'object'
        ? currentProfile.preferences
        : {};

      finalPreferences = { ...existingPrefs, ...preferences };
    }

    // 6. 组装更新 payload
    const updateData: any = {};
    if (preferences !== undefined) {
      updateData.preferences = finalPreferences;
    }
    if (subscription_tier !== undefined) {
      updateData.subscription_tier = subscription_tier;
    }
    if (last_active_at !== undefined) {
      updateData.last_active_at = last_active_at;
    }

    // 7. 执行更新
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('[Profile API Error] Update profile failed:', updateError);
      // 如果是 RLS 引起的 permission denied，这里判断一下
      if (updateError.code === '42501' || updateError.message?.includes('permission denied')) {
        return NextResponse.json({ error: '权限不足，无法更新此 Profile' }, { status: 403 });
      }
      return NextResponse.json({ error: '数据库更新失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('[Profile API Critical Error]', err);
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status: 500 });
  }
}
