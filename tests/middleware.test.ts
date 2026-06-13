import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

// 模拟 crypto 模块，防止 decryptSession 报错
vi.mock('@/lib/crypto', () => ({
  decryptSession: vi.fn().mockResolvedValue(null),
}));

// 模拟 @supabase/ssr
vi.mock('@/lib/supabase', () => ({}));
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({}),
}));

describe('Middleware Cache-Control Header Injection Tests', () => {
  const createRequest = (urlStr: string, headersInit?: Record<string, string>) => {
    const req = new NextRequest(new URL(urlStr, 'http://localhost:3000'), {
      headers: headersInit,
    });
    return req;
  };

  it('should inject Cache-Control: no-cache for HTML files under /resources/', async () => {
    // 1. 直接访问 /resources/ 下的 html
    const req1 = createRequest('http://localhost:3000/resources/explain.html');
    const res1 = await middleware(req1);
    expect(res1).toBeDefined();
    expect(res1.headers.get('Cache-Control')).toBe('no-cache');

    // 2. 通过 clean URL 映射到 /resources/ 下的 html
    const req2 = createRequest('http://localhost:3000/explain');
    const res2 = await middleware(req2);
    expect(res2).toBeDefined();
    expect(res2.headers.get('Cache-Control')).toBe('no-cache');

    // 3. 自动补全资源路径映射到 /resources/ 下的 html
    const req3 = createRequest('http://localhost:3000/mozi_lab.html');
    const res3 = await middleware(req3);
    // 注意：mozi_lab.html 在 rootFiles 中，不会被重写到 /resources/mozi_lab.html
    // 我们测试一个非 rootFiles 的 html，比如 /test-page.html
    const req4 = createRequest('http://localhost:3000/test-page.html');
    const res4 = await middleware(req4);
    expect(res4).toBeDefined();
    expect(res4.headers.get('Cache-Control')).toBe('no-cache');
  });

  it('should inject Cache-Control: public, max-age=31536000, immutable for JS/CSS files under /resources/', async () => {
    // 1. 直接访问 /resources/js/main.js
    const req1 = createRequest('http://localhost:3000/resources/js/main.js');
    const res1 = await middleware(req1);
    expect(res1).toBeDefined();
    expect(res1.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');

    // 2. 自动补全资源路径映射到 /resources/css/style.css
    const req2 = createRequest('http://localhost:3000/css/style.css');
    const res2 = await middleware(req2);
    expect(res2).toBeDefined();
    expect(res2.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
  });

  it('should inject Cache-Control: public, max-age=31536000, immutable for image files under /resources/', async () => {
    // 1. 直接访问 /resources/images/logo.png
    const req1 = createRequest('http://localhost:3000/resources/images/logo.png');
    const res1 = await middleware(req1);
    expect(res1).toBeDefined();
    expect(res1.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');

    // 2. 自动补全资源路径映射到 /resources/avatars/user.webp
    const req2 = createRequest('http://localhost:3000/avatars/user.webp');
    const res2 = await middleware(req2);
    expect(res2).toBeDefined();
    expect(res2.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
  });

  it('should not inject Cache-Control for non-resources paths', async () => {
    const req = createRequest('http://localhost:3000/erp/dashboard');
    // erp/dashboard 会被 RBAC 拦截重定向，我们使用一个普通的非匹配路径，或者模拟已登录
    // 比如 / (主域名根路径)
    const req2 = createRequest('http://localhost:3000/');
    const res2 = await middleware(req2);
    expect(res2).toBeDefined();
    expect(res2.headers.get('Cache-Control')).toBeNull();
  });

  it('should inject ETag header for HTML files under /resources/ or clean URLs', async () => {
    const req = createRequest('http://localhost:3000/explain');
    const res = await middleware(req);
    expect(res).toBeDefined();
    const etag = res.headers.get('ETag');
    expect(etag).toBe('W/"explain.html-20260613"');
    expect(res.headers.get('Cache-Control')).toBe('no-cache');
  });

  it('should return 304 Not Modified when If-None-Match matches the ETag', async () => {
    const req = createRequest('http://localhost:3000/explain', {
      'if-none-match': 'W/"explain.html-20260613"',
    });
    const res = await middleware(req);
    expect(res).toBeDefined();
    expect(res.status).toBe(304);
    expect(res.headers.get('ETag')).toBe('W/"explain.html-20260613"');
    expect(res.headers.get('Cache-Control')).toBe('no-cache');
  });
});