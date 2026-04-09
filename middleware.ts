import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 墨子实验室 (Mozi Lab) 统一代理网关
 * 
 * 核心功能：
 * 1. Supabase 会话管理 (Legacy/Hybrid)
 * 2. 域名智能分流：ai. 域名进入新版 App，主域名渲染旧版面板
 * 3. 静态资源智能重映射：解决 resources/ 目录下的 404 问题
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 🛡️ [Runtime Safety] 确保环境变量存在
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // 如果没有配置 Supabase，也继续执行后续的路由逻辑
  } else {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    // await supabase.auth.getUser() // 目前全局禁用 Auth 检查以减小延迟
  }

  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''
  const pathname = url.pathname

  // 🛡️ [Domain Routing] 处理根路径域名分流
  if (pathname === '/') {
    // 💡 情况 A：如果是 ai.zhouxiaomai.com 子域 -> 渲染新版 FutureClass
    if (host.includes('ai.zhouxiaomai.com')) {
      console.log('🚀 [Domain Logic] ai.zhouxiaomai.com -> Serving Next.js App');
      return NextResponse.next();
    }

    // 💡 情况 B：如果是 www.zhouxiaomai.com 或 zhouxiaomai.com 主域 -> 渲染旧版面板 (index.html)
    console.log(`📡 [Domain Logic] Main Domain (${host}) -> Rewriting to Legacy Dashboard (index.html)`);
    return NextResponse.rewrite(new URL('/index.html', request.url));
  }

  // 🛠️ [Clean URL Logic] 显式处理常用简洁路径映射到 resources/
  const cleanUrlMaps: Record<string, string> = {
    '/course': '/resources/course.html',
    '/pricing': '/resources/pricing-demo.html',
    '/download': '/resources/download.html',
    '/labs': '/resources/labs.html',
    '/ide': '/resources/ide-scratch.html',
  };

  if (cleanUrlMaps[pathname]) {
    console.log(`🔗 [Clean URL] Mapping ${pathname} -> ${cleanUrlMaps[pathname]}`);
    url.pathname = cleanUrlMaps[pathname];
    return NextResponse.rewrite(url);
  }

  // 📂 [Resource Logic] 自动将根路径下的 .html 文件映射到 resources/ 目录
  if (pathname.endsWith('.html') && !pathname.includes('/', 1)) {
    const rootFiles = ['/index.html', '/mozi_lab.html', '/mozi_curriculum_overview.html'];
    if (!rootFiles.includes(pathname)) {
      url.pathname = `/resources${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 🛠️ [Legacy Support] 保持对原有 hub-auto 逻辑的支持
  if (pathname.startsWith('/hub-auto-') && pathname.endsWith('.html')) {
    if (!pathname.startsWith('/resources/')) {
      url.pathname = `/resources${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return response
}

// 🎯 配置匹配规则
export const config = {
  matcher: [
    '/',
    '/course',
    '/pricing',
    '/download',
    '/labs',
    '/ide',
    '/swarm/:path*',
    '/hub-auto-:path*',
    // 匹配所有非静态资源的 .html 文件请求
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|avatars|libs|css|js).+\\.html)',
  ],
}
