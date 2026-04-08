import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase 单例连接池 (Server-Side Only)
 * 
 * 核心优化：复用同一个 TCP/TLS 连接，避免每次 Server Action 都重建握手。
 * 这对海外 Supabase 实例尤为关键，单次 TLS 握手在国内可达 3s+。
 * 
 * 注意：此客户端使用 anon key，适用于 RLS 已放行的 ERP 数据查询。
 * 对于需要用户身份鉴权的场景，仍应使用 lib/supabase/server.ts 的 cookie-based client。
 */

let singletonClient: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase() {
  if (singletonClient) return singletonClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  singletonClient = createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    // 全局 fetch 超时：10 秒
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000),
        });
      },
    },
  });

  return singletonClient;
}
