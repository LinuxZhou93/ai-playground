import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../../app/api/user/profile/route';

const { hoistedMockFrom, hoistedMockSelect, hoistedMockUpdate, hoistedMockMaybeSingle, hoistedMockEq } = vi.hoisted(() => {
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn();
  const mockSelect = vi.fn();
  const mockUpdate = vi.fn();

  const mockQueryBuilder = {
    select: mockSelect,
    update: mockUpdate,
    eq: mockEq,
    maybeSingle: mockMaybeSingle,
  };

  mockSelect.mockReturnValue(mockQueryBuilder);
  mockUpdate.mockReturnValue(mockQueryBuilder);
  mockEq.mockReturnValue(mockQueryBuilder);
  mockMaybeSingle.mockReturnValue(mockQueryBuilder);

  const mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);

  return {
    hoistedMockFrom: mockFrom,
    hoistedMockSelect: mockSelect,
    hoistedMockUpdate: mockUpdate,
    hoistedMockMaybeSingle: mockMaybeSingle,
    hoistedMockEq: mockEq,
  };
});

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: hoistedMockFrom,
    }),
  };
});

describe('User Profile API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('❌ 应该拦截超大 Payload', async () => {
    // 构造一个很大的 preferences 字段
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

  it('❌ 应该拦截无效的 UUID', async () => {
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

  it('❌ 应该拦截无效的 last_active_at 日期格式', async () => {
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

  it('❌ 应该拦截未传 preferences 且未传 last_active_at 的请求', async () => {
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
    expect(data.error).toBe('preferences 或 last_active_at 至少需要提供一个');
  });

  it('✅ 能够成功增量更新 preferences 并返回 200', async () => {
    const mockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // 1. Mock select 现有 preferences
    const mockQueryBuilder = hoistedMockFrom('profiles');
    mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { id: mockUserId, preferences: { theme: 'light', lang: 'en' } },
      error: null
    });

    // 2. Mock update 返回更新后的数据
    mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { id: mockUserId, preferences: { theme: 'light', lang: 'zh', fontSize: '14px' } },
      error: null
    });

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

    // 验证更新逻辑调用
    expect(hoistedMockFrom).toHaveBeenCalledWith('profiles');
    expect(hoistedMockUpdate).toHaveBeenCalledWith({
      preferences: { theme: 'light', lang: 'zh', fontSize: '14px' }
    });
  });

  it('✅ 能够成功更新 last_active_at 并返回 200', async () => {
    const mockUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const mockDateStr = '2026-06-13T10:12:02.000Z';

    const mockQueryBuilder = hoistedMockFrom('profiles');
    mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { id: mockUserId, last_active_at: mockDateStr },
      error: null
    });

    const req = new Request('http://localhost/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: mockUserId,
        last_active_at: mockDateStr
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    expect(hoistedMockUpdate).toHaveBeenCalledWith({
      last_active_at: mockDateStr
    });
  });
});
