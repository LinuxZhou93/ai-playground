import { Suspense } from 'react';
import HomePage from '@/components/home-page';

/**
 * 根页面组件 (Page Component)
 * 
 * 注意：由于我们设置了 middleware.ts：
 * 1. ai.zhouxiaomai.com 会被重写到 /mozi，因此不会访问此页面。
 * 2. zhouxiaomai.com 会被重写到 /index.html (静态文件)，也不会访问此页面。
 * 
 * 这里的 Page.tsx 作为“兜底”路由存在：
 * - 解决 Next.js 因为有 app/layout.tsx 但没有 app/page.tsx 导致的 404 错误。
 * - 针对直接通过 IP 或其他未配置域名访问的情况，默认展示 AI 助手主页。
 */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading Titan Systems...</div>}>
      <HomePage />
    </Suspense>
  );
}
