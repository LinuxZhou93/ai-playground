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

  // 🛡️ [Security & Efficiency] 处理根路径及 hub-auto 动态路由
  if (url.pathname === '/') {
    // 💡 处理 ai.zhouxiaomai.com 子域
    if (host.includes('ai.zhouxiaomai.com')) {
      console.log('🚀 [Domain Logic] Detected ai.zhouxiaomai.com -> Rewriting to /mozi');
      url.pathname = '/mozi';
      return NextResponse.rewrite(url);
    }

    // 💡 处理 zhouxiaomai.com 主域
    console.log(`📡 [Domain Logic] Host: ${host} -> Rendering original Tech Talent landing page (index.html)`);
    url.pathname = '/index.html';
    return NextResponse.rewrite(url);
  }

  // 🛠️ [Legacy Support] 自动映射 hub-auto-*.html 到 resources/ 目录
  if (url.pathname.startsWith('/hub-auto-') && url.pathname.endsWith('.html')) {
    console.log(`📂 [Resource Logic] Mapping ${url.pathname} -> /resources${url.pathname}`);
    url.pathname = `/resources${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// 🎯 配置匹配规则，支持根路径及特征文件名的劫持
export const config = {
  matcher: ['/', '/hub-auto-:path*'],
};
