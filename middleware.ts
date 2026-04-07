import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // const { data: { user } } = await supabase.auth.getUser()
  const user = null; // 🚀 Emergency Rollback: Disable Auth for local development

  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''

  // 🛡️ [Security & Efficiency] 处理根路径及域名逻辑
  if (url.pathname === '/') {
    // 如果已登录，重定向到仪表盘
    if (user) {
      url.pathname = '/swarm/dashboard';
      return NextResponse.redirect(url);
    }

    if (host.includes('ai.zhouxiaomai.com')) {
      url.pathname = '/mozi';
      return NextResponse.rewrite(url);
    }

    url.pathname = '/index.html';
    return NextResponse.rewrite(url);
  }

  // 🔒 保护 /swarm 路由 (已暂时禁用)
  /*
  if (url.pathname.startsWith('/swarm') && !user) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }
  */

  // 🛠️ [Legacy Support] 自动映射 hub-auto-*.html
  if (url.pathname.startsWith('/hub-auto-') && url.pathname.endsWith('.html')) {
    url.pathname = `/resources${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return response
}

export const config = {
  matcher: ['/', '/swarm/:path*', '/hub-auto-:path*'],
}
