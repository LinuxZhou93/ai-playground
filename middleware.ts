import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decryptSession } from '@/lib/crypto'

/**
 * 智能注入 Cache-Control 头部
 */
function applyCacheControl(response: NextResponse, targetPathname: string) {
  if (targetPathname.startsWith('/resources/')) {
    const lowercasePath = targetPathname.toLowerCase();
    const lastSlashIndex = lowercasePath.lastIndexOf('/');
    const fileName = lastSlashIndex !== -1 ? lowercasePath.slice(lastSlashIndex + 1) : lowercasePath;
    
    const isHtml = fileName.endsWith('.html') || fileName.endsWith('.htm') || !fileName.includes('.');

    if (isHtml) {
      response.headers.set('Cache-Control', 'no-cache');
      response.headers.set('ETag', `W/"${fileName}-20260613"`);
    } else {
      const isJsOrCss = fileName.endsWith('.js') || 
                        fileName.endsWith('.mjs') || 
                        fileName.endsWith('.cjs') || 
                        fileName.endsWith('.css');
      
      const isImage = fileName.endsWith('.png') || 
                      fileName.endsWith('.jpg') || 
                      fileName.endsWith('.jpeg') || 
                      fileName.endsWith('.gif') || 
                      fileName.endsWith('.svg') || 
                      fileName.endsWith('.webp') || 
                      fileName.endsWith('.ico') || 
                      fileName.endsWith('.bmp') || 
                      fileName.endsWith('.tiff');

      if (isJsOrCss || isImage) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }
  return response;
}

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

  // 🌐 [i18n Language Detection]
  let locale = request.cookies.get('locale')?.value
  const queryLang = request.nextUrl.searchParams.get('lang')
  if (queryLang === 'zh-CN' || queryLang === 'en-US') {
    locale = queryLang
  } else if (!locale) {
    const acceptLanguage = request.headers.get('accept-language') || ''
    locale = acceptLanguage.toLowerCase().includes('zh') ? 'zh-CN' : 'en-US'
  }

  // 🛡️ [Domain Routing] 域名分流逻辑 (最高优先级)
  // 1. 科创教研专属系统
  if (host.includes('edu.') || pathname.startsWith('/edu')) {
    if (pathname === '/' || pathname === '/index.html') {
      return NextResponse.rewrite(new URL('/edu', request.url));
    }
    // 即使主域名直接访问 /edu，也直接放行，Next.js 会匹配 app/edu
  }

  // 2. 原版课件 system (旧体系)
  if (host.includes('ai.zhouxiaomai.com')) {
    if (pathname === '/' || pathname === '/index.html') {
      return NextResponse.next();
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

  // 📦 [AI Generated Archive Mapping]
  // 自动将访问 hub-auto-*.html 或 auto-*.html 的请求重映射到归档目录 resources/archive/
  const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
  if ((lastSegment.startsWith('hub-auto-') || lastSegment.startsWith('auto-')) && lastSegment.endsWith('.html')) {
    const targetArchiveRoute = `/resources/archive/${lastSegment}`;
    if (pathname !== targetArchiveRoute) {
      url.pathname = targetArchiveRoute;
      console.log(`🤖 [AI Archive] Mapping ${pathname} -> ${url.pathname}`);
      return applyCacheControl(NextResponse.rewrite(url), url.pathname);
    }
  }

  // 🛠️ [Clean URL Logic] 显式处理常用简洁路径映射到 resources/
  const cleanUrlMaps: Record<string, string> = {
    '/xmp': '/resources/xmp/index.html',
    '/xmp/': '/resources/xmp/index.html',
    '/xmp/kid': '/resources/xmp/kid.html',
    '/xmp/teacher': '/resources/xmp/teacher.html',
    '/xmp/dashboard': '/resources/xmp/dashboard.html',
    '/SNU': '/SNU/index.html',
    '/SNU/': '/SNU/index.html',
    '/snu': '/SNU/index.html',
    '/snu/': '/SNU/index.html',
    '/explain': '/resources/explain.html',
    '/course': '/resources/course.html',
    '/pricing': '/resources/pricing-demo.html',
    '/pengzhou-mall-demo': '/resources/pengzhou-mall-demo.html',
    '/download': '/resources/download.html',
    '/labs': '/resources/labs.html',
    '/ide': '/resources/ide-scratch.html',
    '/debate-lab': '/psyche_x_system/frontend/debate_lab.html',
  };

  // ETag 协商缓存拦截（静态 HTML 页面）
  let isRequestingHtml = false;
  let targetFileName = '';
  
  if (cleanUrlMaps[pathname]) {
    const mappedPath = cleanUrlMaps[pathname];
    if (mappedPath.endsWith('.html')) {
      isRequestingHtml = true;
      targetFileName = mappedPath.slice(mappedPath.lastIndexOf('/') + 1);
    }
  } else if (pathname.startsWith('/resources/')) {
    const lastPart = pathname.slice(pathname.lastIndexOf('/') + 1);
    if (lastPart.endsWith('.html') || lastPart.endsWith('.htm') || !lastPart.includes('.')) {
      isRequestingHtml = true;
      targetFileName = lastPart;
    }
  } else if (pathname.endsWith('.html') && !pathname.includes('/', 1)) {
    isRequestingHtml = true;
    targetFileName = pathname.slice(1);
  }
  
  if (isRequestingHtml && targetFileName) {
    const etagVal = `W/"${targetFileName}-20260613"`;
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etagVal) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etagVal,
          'Cache-Control': 'no-cache',
        }
      });
    }
  }

  if (cleanUrlMaps[pathname]) {
    console.log(`🔗 [Clean URL] Mapping ${pathname} -> ${cleanUrlMaps[pathname]}`);
    url.pathname = cleanUrlMaps[pathname];
    return applyCacheControl(NextResponse.rewrite(url), url.pathname);
  }

  // 📂 [Resource Logic] 自动将根路径下的 .html 文件映射到 resources/ 目录
  if (pathname.endsWith('.html') && !pathname.includes('/', 1)) {
    const rootFiles = ['/index.html', '/mozi_lab.html', '/mozi_curriculum_overview.html'];
    if (!rootFiles.includes(pathname)) {
      url.pathname = `/resources${pathname}`;
      return applyCacheControl(NextResponse.rewrite(url), url.pathname);
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
       return applyCacheControl(NextResponse.rewrite(url), url.pathname);
    }
  }

  // Note: 以前对 hub-auto 的支持现已通过顶部的 [AI Generated Archive Mapping] 统一管理并映射到 archive 目录

  // 🔒 [RBAC Guard] 教务 ERP 权限拦截
  if (pathname.startsWith('/erp')) {
    let role = 'GUEST';
    const authToken = request.cookies.get('X-FC-Auth-Token')?.value;
    if (authToken) {
      const session = await decryptSession(authToken);
      if (session && session.role) {
        role = session.role;
      }
    } else {
      // 降级策略（仅在本地开发环境中允许读取明文 Cookie）
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        role = request.cookies.get('X-FC-Role')?.value || 'ADMIN';
      }
    }

    // GUEST (未认证或解密失败) 绝对禁止访问任何 erp 的路由，强制跳转回 login
    if (role === 'GUEST') {
      console.warn(`🔒 [RBAC Guard] 未授权访问 ${pathname} 被拦截，重定向回登录页`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
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

    if (locale) {
    response.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  }
  return applyCacheControl(response, pathname)
}

// 🎯 配置匹配规则
export const config = {
  matcher: [
    '/',
    '/SNU',
    '/SNU/',
    '/snu',
    '/snu/',
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
    '/resources/:path*',
    // 匹配所有非静态资源的 .html 文件请求
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|avatars|libs|css|js).+\\.html)',
  ],
}
