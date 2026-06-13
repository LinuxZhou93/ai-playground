import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '../../app/api/redeem/route';

const { hoistedMockFrom, hoistedMockSelect, hoistedMockInsert, hoistedMockUpdate, hoistedMockUpsert } = vi.hoisted(() => {
  const mockUpsert = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn().mockResolvedValue({ error: null });
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockEq = vi.fn();
  const mockSelect = vi.fn();
  const mockMaybeSingle = vi.fn();

  const mockQueryBuilder = {
    upsert: mockUpsert,
    update: mockUpdate,
    insert: mockInsert,
    eq: mockEq,
    select: mockSelect,
    maybeSingle: mockMaybeSingle,
  };

  mockEq.mockReturnValue(mockQueryBuilder);
  mockSelect.mockReturnValue(mockQueryBuilder);
  mockUpdate.mockReturnValue(mockQueryBuilder);
  mockInsert.mockReturnValue(mockQueryBuilder);
  mockMaybeSingle.mockReturnValue(mockQueryBuilder);

  const mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);

  return {
    hoistedMockFrom: mockFrom,
    hoistedMockSelect: mockSelect,
    hoistedMockInsert: mockInsert,
    hoistedMockUpdate: mockUpdate,
    hoistedMockUpsert: mockUpsert,
    mockMaybeSingle,
    mockEq,
  };
});

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: hoistedMockFrom,
    }),
  };
});

describe('Redeem Code API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('❌ 应该拒绝缺失卡密或用户ID的请求，返回 400', async () => {
    const req = new Request('http://localhost/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('卡密和用户ID不能为空');
  });

  it('❌ 应该拒绝无效卡密，返回 400', async () => {
    // Mock redeem_codes 查询返回 null
    const mockQueryBuilder = hoistedMockFrom('redeem_codes');
    mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const req = new Request('http://localhost/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'INVALID-CODE', userId: 'user-123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('无效卡密');
  });

  it('❌ 应该拒绝已使用的卡密，返回 400', async () => {
    // Mock redeem_codes 查询返回已使用的卡密
    const mockQueryBuilder = hoistedMockFrom('redeem_codes');
    mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { code: 'USED-CODE', is_used: true, duration_days: 30 },
      error: null,
    });

    const req = new Request('http://localhost/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'USED-CODE', userId: 'user-123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('该卡密已被使用');
  });

  it('✅ 应该成功核销有效卡密，更新数据库并返回 200', async () => {
    // 1. Mock redeem_codes 查询返回有效卡密
    const mockQueryBuilder = hoistedMockFrom('redeem_codes');
    mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { code: 'VALID-CODE', is_used: false, duration_days: 30 },
      error: null,
    });

    // 2. Mock user_subscriptions 查询返回无订阅
    mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const req = new Request('http://localhost/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'VALID-CODE', userId: 'user-123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.durationDays).toBe(30);
    expect(data.expiryDate).toBeDefined();

    // 验证数据库更新操作被调用
    expect(hoistedMockFrom).toHaveBeenCalledWith('redeem_codes');
    expect(hoistedMockUpdate).toHaveBeenCalled();
    expect(hoistedMockFrom).toHaveBeenCalledWith('user_subscriptions');
    expect(hoistedMockUpsert).toHaveBeenCalled();
    expect(hoistedMockFrom).toHaveBeenCalledWith('profiles');
  });
});