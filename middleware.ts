import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 墨子实验室 (Mozi Lab) 域名动态路由系统
 * 
 * 核心逻辑：
 * 1. 检测请求的 Hostname。
 * 2. 如果是 ai.zhouxiaomai.com，且访问根路径 (/)，重写至 /mozi 渲染 AI 助手主界面。
 * 3. 如果是 zhouxiaomai.com 或其他主域，则顺延至原有路由（将由 app/page.tsx 或 public/index.html 处理）。
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // 🛡️ [Security & Efficiency] 处理根路径域名分流
  if (pathname === '/') {
    // 💡 情况 A：如果是 ai.zhouxiaomai.com 子域 -> 渲染新版 FutureClass (通过 app/page.tsx)
    if (host.includes('ai.zhouxiaomai.com')) {
      console.log('🚀 [Domain Logic] ai.zhouxiaomai.com detected -> Serving Next.js App');
      return NextResponse.next();
    }

    // 💡 情况 B：如果是 www.zhouxiaomai.com 或 zhouxiaomai.com 主域 -> 渲染旧版面板 (index.html)
    // 使用 rewrite 确保用户在浏览器地址栏看到的仍是 zhouxiaomai.com
    console.log(`📡 [Domain Logic] Main Domain (${host}) detected -> Rewriting to Legacy Dashboard (index.html)`);
    return NextResponse.rewrite(new URL('/index.html', request.url));
  }

  // 🛠️ [Resource Mapping Logic] 处理所有位于 resources/ 目录下的静态页面映射
  
  // 1. 显式处理常用简洁路径 (Clean URLs)
  const cleanUrlMaps: Record<string, string> = {
    '/course': '/resources/course.html',
    '/pricing': '/resources/pricing-demo.html',
    '/download': '/resources/download.html',
    '/labs': '/resources/labs.html',
    '/ide': '/resources/ide-scratch.html',
  };

  if (cleanUrlMaps[pathname]) {
    console.log(`🔗 [Clean URL Logic] Mapping ${pathname} -> ${cleanUrlMaps[pathname]}`);
    url.pathname = cleanUrlMaps[pathname];
    return NextResponse.rewrite(url);
  }

  // 2. 自动映射根路径下的所有 .html 文件到 resources/ 目录 (排除 index.html 和已经存在的 app 路由)
  // 注意：Next.js 会优先查找 public/ 根目录下的文件，如果文件不存在才会进入 middleware（对于某些配置）
  // 或者在 middleware 中统一处理非 app 路由的请求。
  if (pathname.endsWith('.html') && !pathname.includes('/', 1)) {
    // 排除一些已知的根目录文件
    const rootFiles = ['/index.html', '/mozi_lab.html', '/mozi_curriculum_overview.html'];
    if (!rootFiles.includes(pathname)) {
      console.log(`📂 [Resource Logic] Mapping root HTML ${pathname} -> /resources${pathname}`);
      url.pathname = `/resources${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 🛠️ [Legacy Support] 保持对原有 hub-auto 逻辑的支持（如果它在子目录中）
  if (pathname.startsWith('/hub-auto-') && pathname.endsWith('.html')) {
     if (!pathname.startsWith('/resources/')) {
        url.pathname = `/resources${pathname}`;
        return NextResponse.rewrite(url);
     }
  }

  return NextResponse.next();
}

// 🎯 配置匹配规则：匹配根路径、不带目录层级的 .html 请求，以及核心功能路径
export const config = {
  // 匹配：
  // /
  // /course, /pricing 等
  // /*.html
  // /hub-auto-*.html
  matcher: [
    '/',
    '/course',
    '/pricing',
    '/download',
    '/labs',
    '/ide',
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|avatars|libs|css|js).+\\.html)',
  ],
};
