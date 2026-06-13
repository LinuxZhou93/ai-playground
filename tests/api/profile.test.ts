import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../../app/api/user/profile/route';

// 使用 vi.hoisted 提供智能级联 Mock
const { hoistedMockFrom, hoistedMockContext } = vi.hoisted(() => {
  const context = {
    currentTable: '',
    currentAction: '',
    presetResults: {} as Record<string, any>,
  };

  const mockFrom = vi.fn().mockImplementation((table) => {
    context.currentTable = table;
    context.currentAction = '';
    return mockQueryBuilder;
  });

  const mockSelect = vi.fn().mockImplementation(() => {
    if (context.currentAction !== 'update' && context.currentAction !== 'upsert') {
      context.currentAction = 'select';
    }
    return mockQueryBuilder;
  });

  const mockUpdate = vi.fn().mockImplementation(() => {
    context.currentAction = 'update';
    return mockQueryBuilder;
  });

  const mockUpsert = vi.fn().mockImplementation(() => {
    context.currentAction = 'upsert';
    return mockQueryBuilder;
  });

  const mockEq = vi.fn().mockImplementation(() => {
    return mockQueryBuilder;
  });

  const mockMaybeSingle = vi.fn().mockImplementation(() => {
    return mockQueryBuilder;
  });

  const mockQueryBuilder: any = {
    from: mockFrom,
    select: mockSelect,
    update: mockUpdate,
    upsert: mockUpsert,
    eq: mockEq,
    maybeSingle: mockMaybeSingle,
    then: (resolve: any) => {
      const key = `${context.currentTable}:${context.currentAction}`;
      let result = { data: null, error: null };
      if (context.presetResults[key] !== undefined) {
        result = context.presetResults[key];
      }
      resolve(result);
    }
  };

  return {
    hoistedMockFrom: mockFrom,
    hoistedMockContext: context,
  };
});

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: hoistedMockFrom,
    }),
  };
});

describe('User Profile API Route & Schema Validation & RLS Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoistedMockContext.presetResults = {};
  });

  it('❌ 应该拦截超大 Payload', async () => {
    const hugePreferences = {
      data: 'a'.repeat(5000)
    };
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        preferences: hugePreferences
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Payload 太大');
  });

  it('❌ 应该拦截无效的 JSON 格式', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid-json }',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('无效的 JSON 格式');
  });

  it('❌ 应该拦截含有 XSS 脚本的请求', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        preferences: {
          theme: '<script>alert("hack")</script>'
        }
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('输入包含非法字符');
  });

  it('❌ 应该拦截含有 HTML 标签的请求', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        preferences: {
          theme: '<div>hello</div>'
        }
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('输入包含非法字符');
  });

  it('❌ 应该拦截含有 SQL 注入字符的请求', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' OR '1'='1",
        preferences: {
          theme: 'dark'
        }
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('输入包含非法字符');
  });

  it('❌ 应该由 Zod 拦截无效的 UUID', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'invalid-uuid',
        preferences: {
          theme: 'dark'
        }
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('userId 必须是合法的 UUID');
  });

  it('❌ 应该由 Zod 拦截无效的 last_active_at 日期格式', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        last_active_at: 'not-a-date'
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('last_active_at 必须是合法的日期格式');
  });

  it('❌ 应该由 Zod 拦截非法 subscription_tier 层级类型', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        subscription_tier: 'vip-level-99'
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('subscription_tier 必须是 free, pro 或 enterprise');
  });

  it('❌ 应该由 Zod 拦截未传任何可更新字段的空更新请求', async () => {
    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('preferences, subscription_tier 或 last_active_at 至少需要提供一个');
  });

  it('✅ 能够成功增量更新 preferences 并返回 200', async () => {
    const mockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // 1. Mock select 现有 preferences
    hoistedMockContext.presetResults['profiles:select'] = {
      data: { id: mockUserId, preferences: { theme: 'light', lang: 'en' } },
      error: null
    };

    // 2. Mock update 返回更新后的数据
    hoistedMockContext.presetResults['profiles:update'] = {
      data: { id: mockUserId, preferences: { theme: 'light', lang: 'zh', fontSize: '14px' } },
      error: null
    };

    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: mockUserId,
        preferences: { lang: 'zh', fontSize: '14px' }
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.preferences).toEqual({ theme: 'light', lang: 'zh', fontSize: '14px' });
  });

  it('✅ 支持为不同订阅层级用户 (pro / enterprise) 顺利更新 subscription_tier', async () => {
    const mockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    hoistedMockContext.presetResults['profiles:update'] = {
      data: { id: mockUserId, subscription_tier: 'enterprise' },
      error: null
    };

    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: mockUserId,
        subscription_tier: 'enterprise'
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.subscription_tier).toBe('enterprise');
  });

  it('❌ RLS 机制防御：若非本人修改他人 Profile，更新数据库返回 403 权限不足', async () => {
    const mockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // 模拟 Supabase 因 RLS 返回 42501 permission denied 错误
    hoistedMockContext.presetResults['profiles:update'] = {
      data: null,
      error: { code: '42501', message: 'new row violates row-level security policy for table "profiles"' }
    };

    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer other-user-token'
      },
      body: JSON.stringify({
        userId: mockUserId,
        subscription_tier: 'pro'
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('权限不足，无法更新此 Profile');
  });
});
