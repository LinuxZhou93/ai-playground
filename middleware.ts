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
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''
  const pathname = url.pathname

  // 🛡️ [Domain Routing] 域名分流逻辑 (最高优先级)
  // 1. 科创教研专属系统
  if (host.includes('edu.') || pathname.startsWith('/edu')) {
    if (pathname === '/' || pathname === '/index.html') {
      return NextResponse.rewrite(new URL('/edu', request.url));
    }
    // 即使主域名直接访问 /edu，也直接放行，Next.js 会匹配 app/edu
  }

  // 2. 原版课件系统 (旧体系)
  if (host.includes('ai.zhouxiaomai.com')) {
    if (pathname === '/index.html') {
      return NextResponse.rewrite(new URL('/', request.url));
    }
    if (pathname === '/debate-lab') {
      return NextResponse.rewrite(new URL('/psyche_x_system/frontend/debate_lab.html', request.url));
    }
  }

  // 💡 处理主域名 (zhouxiaomai.com / www.) 的根路径逻辑
  if (pathname === '/' || pathname === '/index.html') {
    // 仅主域名重写到旧版面板
    return NextResponse.rewrite(new URL('/index.html', request.url));
  }

  // 🛠️ [Clean URL Logic] 显式处理常用简洁路径映射到 resources/
  const cleanUrlMaps: Record<string, string> = {
    '/explain': '/resources/explain.html',
    '/course': '/resources/course.html',
    '/pricing': '/resources/pricing-demo.html',
    '/pengzhou-mall-demo': '/resources/pengzhou-mall-demo.html',
    '/download': '/resources/download.html',
    '/labs': '/resources/labs.html',
    '/ide': '/resources/ide-scratch.html',
    '/debate-lab': '/psyche_x_system/frontend/debate_lab.html',
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

  // 📦 [Asset Intelligence] 自动补全资源路径
  // 处理旧版 HTML 中引用的相对路径资源 (如 assets/css/..., libs/...)
  const assetFolders = ['assets', 'libs', 'css', 'js', 'images', 'avatars'];
  const firstSegment = pathname.split('/')[1];

  if (assetFolders.includes(firstSegment)) {
    // 如果请求的是这些文件夹，且不是直接访问 resources 目录，则自动重定向到 resources/ 内部
    if (!pathname.startsWith('/resources/')) {
       console.log(`🎨 [Asset Logic] Mapping legacy asset ${pathname} -> /resources${pathname}`);
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

  // 🔒 [RBAC Guard] 教务 ERP 权限拦截
  if (pathname.startsWith('/erp')) {
    const role = request.cookies.get('X-FC-Role')?.value || 'ADMIN';
    
    // 教师限制
    if (role === 'TEACHER' && ['/erp/finance', '/erp/settings', '/erp/leads', '/erp/inventory', '/erp/courses'].some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/erp/dashboard', request.url));
    }
    // 教务限制
    if (role === 'ACADEMIC' && ['/erp/finance', '/erp/settings', '/erp/leads'].some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/erp/dashboard', request.url));
    }
    // 销售限制
    if (role === 'SALES' && ['/erp/schedules', '/erp/settings', '/erp/courses', '/erp/inventory', '/erp/attendance', '/erp/classes'].some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/erp/dashboard', request.url));
    }
  }

  // --- 💡 后置逻辑：Supabase 会话管理 (仅在上述路由未拦截时执行) ---
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 保护：如果缺失关键环境变量，则跳过 Supabase 处理
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
    // await supabase.auth.getUser() 
  }

  return response
}

// 🎯 配置匹配规则
export const config = {
  matcher: [
    '/',
    '/explain',
    '/course',
    '/pricing',
    '/pengzhou-mall-demo',
    '/download',
    '/labs',
    '/ide',
    '/debate-lab',
    '/swarm/:path*',
    '/erp/:path*',
    '/hub-auto-:path*',
    // 匹配所有非静态资源的 .html 文件请求
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|avatars|libs|css|js).+\\.html)',
  ],
}
