import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { POST } from '../../app/api/webhook/stripe/route';

// 使用 vi.hoisted 确保 mock 相关的函数和对象在 vi.mock 之前被提升和初始化
const { hoistedMockFrom, hoistedMockUpsert, hoistedMockUpdate } = vi.hoisted(() => {
  const mockUpsert = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn().mockResolvedValue({ error: null });
  const mockEq = vi.fn();
  const mockSelect = vi.fn();
  const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

  // 链式调用需要返回包含这些方法的对象
  const mockQueryBuilder = {
    upsert: mockUpsert,
    update: mockUpdate,
    eq: mockEq,
    select: mockSelect,
    maybeSingle: mockMaybeSingle,
  };

  mockEq.mockReturnValue(mockQueryBuilder);
  mockSelect.mockReturnValue(mockQueryBuilder);
  mockUpdate.mockReturnValue(mockQueryBuilder);

  const mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);

  return {
    hoistedMockFrom: mockFrom,
    hoistedMockUpsert: mockUpsert,
    hoistedMockUpdate: mockUpdate,
  };
});

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: hoistedMockFrom,
    }),
  };
});

// Mock global fetch for Stripe API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

const WEBHOOK_SECRET = 'whsec_test_secret';

describe('Stripe Webhook Security & Signature Verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
      STRIPE_SECRET_KEY: 'sk_test_key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function generateSignatureHeader(rawBody: string, timestamp: number, secret: string): string {
    const signedPayload = `${timestamp}.${rawBody}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

    it('❌ 应该拒绝缺失 stripe-signature 头的请求，返回 400', async () => {
    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    const req = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing signature');
    expect(hoistedMockFrom).not.toHaveBeenCalled();
  });

  it('❌ 应该拒绝非法签名（invalid signature），返回 400', async () => {
    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    const req = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=1234567890,v1=invalid_signature_value',
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
    expect(hoistedMockFrom).not.toHaveBeenCalled();
  });

  it('❌ 应该拒绝重放攻击（replay attack，时间戳过期），返回 400', async () => {
    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    // 10分钟前的时间戳 (600秒前)
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 600;
    const signatureHeader = generateSignatureHeader(payload, expiredTimestamp, WEBHOOK_SECRET);

    const req = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signatureHeader,
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
    expect(hoistedMockFrom).not.toHaveBeenCalled();
  });

  it('❌ 应该拒绝 payload 被篡改的请求，返回 400', async () => {
    const originalPayload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    const tamperedPayload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed', extra: 'hacked' });
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // 签名是基于 originalPayload 生成的
    const signatureHeader = generateSignatureHeader(originalPayload, currentTimestamp, WEBHOOK_SECRET);

    // 发送时使用被篡改的 tamperedPayload
    const req = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signatureHeader,
      },
      body: tamperedPayload,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
    expect(hoistedMockFrom).not.toHaveBeenCalled();
  });

  it('✅ 应该接受签名正确且在时间窗口内的合法请求', async () => {
    const payload = JSON.stringify({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          metadata: {
            userId: 'user_test_123',
          },
        },
      },
    });

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const signatureHeader = generateSignatureHeader(payload, currentTimestamp, WEBHOOK_SECRET);

    // Mock Stripe API response for subscription details
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
        items: {
          data: [{ price: { id: 'price_test_123' } }],
        },
      }),
    });

    const req = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signatureHeader,
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
    
    // 验证 Supabase 数据库被正确更新
    expect(hoistedMockFrom).toHaveBeenCalledWith('user_subscriptions');
    expect(hoistedMockUpsert).toHaveBeenCalled();
  });
});