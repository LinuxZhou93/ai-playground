import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // 仅在浏览器环境下打印中文提示
    if (typeof window !== 'undefined') {
      console.warn('⚠️ [Supabase] 缺失生产环境变量配置。已进入降级 Mock 模式。');
    }
    // 返回一个安全的代理，用于防止构建时调用报错
    return {
      from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
      auth: { getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
    } as any;
  }

  return createBrowserClient(url, key);
}
