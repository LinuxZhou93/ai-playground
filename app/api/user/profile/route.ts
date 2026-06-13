import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 校验 UUID 格式
function isValidUUID(uuid: any): boolean {
  if (typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 校验日期格式
function isValidDate(dateStr: any): boolean {
  if (typeof dateStr !== 'string') return false;
  return !isNaN(Date.parse(dateStr));
}

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

    const { userId, preferences, last_active_at } = body;

    // 3. 校验 userId
    if (!userId) {
      return NextResponse.json({ error: 'userId 必须提供' }, { status: 400 });
    }
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: 'userId 必须是合法的 UUID' }, { status: 400 });
    }

    // 4. 校验 preferences 和 last_active_at
    if (preferences !== undefined) {
      if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
        return NextResponse.json({ error: 'preferences 必须是对象' }, { status: 400 });
      }
    }

    if (last_active_at !== undefined) {
      if (!isValidDate(last_active_at)) {
        return NextResponse.json({ error: 'last_active_at 必须是合法的日期格式' }, { status: 400 });
      }
    }

    // 如果两个字段都未传，提示错误
    if (preferences === undefined && last_active_at === undefined) {
      return NextResponse.json({ error: 'preferences 或 last_active_at 至少需要提供一个' }, { status: 400 });
    }

    // 5. 增量更新 preferences (如果是增量更新 JSONB)
    let finalPreferences = preferences;
    if (preferences !== undefined) {
      const { data: currentProfile, error: fetchError } = await supabaseAdmin
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
    if (last_active_at !== undefined) {
      updateData.last_active_at = last_active_at;
    }

    // 7. 执行更新
    const { data, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('[Profile API Error] Update profile failed:', updateError);
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
