import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { POST as stripePost } from '../../app/api/webhook/stripe/route';
import { POST as redeemPost } from '../../app/api/redeem/route';

// 使用 vi.hoisted 确保 mock 相关的函数和对象在 vi.mock 之前被提升和初始化
const { hoistedMockFrom, hoistedMockContext } = vi.hoisted(() => {
  const context = {
    currentTable: '',
    currentAction: '',
    presetResults: {} as Record<string, any>,
  };

  const mockFrom = vi.fn().mockImplementation((table) => {
    context.currentTable = table;
    context.currentAction = ''; // reset action
    return mockQueryBuilder;
  });

  const mockSelect = vi.fn().mockImplementation(() => {
    context.currentAction = 'select';
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

// Mock global fetch for Stripe API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

const WEBHOOK_SECRET = 'whsec_test_secret';

describe('Stripe Webhook Security & Signature Verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    hoistedMockContext.presetResults = {};
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

    const res = await stripePost(req);
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

    const res = await stripePost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
    expect(hoistedMockFrom).not.toHaveBeenCalled();
  });

  it('❌ 应该拒绝重放攻击（replay attack，时间戳过期），返回 400', async () => {
    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
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

    const res = await stripePost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
    expect(hoistedMockFrom).not.toHaveBeenCalled();
  });

  it('❌ 应该拒绝 payload 被篡改的请求，返回 400', async () => {
    const originalPayload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    const tamperedPayload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed', extra: 'hacked' });
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const signatureHeader = generateSignatureHeader(originalPayload, currentTimestamp, WEBHOOK_SECRET);

    const req = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signatureHeader,
      },
      body: tamperedPayload,
    });

    const res = await stripePost(req);
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

    hoistedMockContext.presetResults['user_subscriptions:upsert'] = { error: null };
    hoistedMockContext.presetResults['profiles:update'] = { error: null };

    const req = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signatureHeader,
      },
      body: payload,
    });

    const res = await stripePost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
    
    expect(hoistedMockFrom).toHaveBeenCalledWith('user_subscriptions');
  });
});

describe('Redeem API Error Boundaries & DB States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoistedMockContext.presetResults = {};
  });

  it('❌ 应该拒绝重复核销卡密（已使用的卡密），返回 400', async () => {
    hoistedMockContext.presetResults['redeem_codes:select'] = {
      data: { code: 'ALREADY-USED-CODE', is_used: true, duration_days: 30 },
      error: null,
    };

    const req = new Request('http://localhost/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'ALREADY-USED-CODE', userId: 'user_test_123' }),
    });

    const res = await redeemPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('该卡密已被使用');
  });

  it('❌ 更新卡密状态发生数据库故障时，应该终止执行并返回 500', async () => {
    hoistedMockContext.presetResults['redeem_codes:select'] = {
      data: { code: 'FAIL-UPDATE-CODE', is_used: false, duration_days: 30 },
      error: null,
    };
    hoistedMockContext.presetResults['user_subscriptions:select'] = {
      data: null,
      error: null,
    };
    hoistedMockContext.presetResults['redeem_codes:update'] = {
      error: { message: 'DB UPDATE ERROR' },
    };

    const req = new Request('http://localhost/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FAIL-UPDATE-CODE', userId: 'user_test_123' }),
    });

    const res = await redeemPost(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('更新卡密状态失败');
  });

  it('❌ 更新订阅状态发生数据库故障时，应该终止执行并返回 500', async () => {
    hoistedMockContext.presetResults['redeem_codes:select'] = {
      data: { code: 'FAIL-SUB-CODE', is_used: false, duration_days: 30 },
      error: null,
    };
    hoistedMockContext.presetResults['user_subscriptions:select'] = {
      data: null,
      error: null,
    };
    hoistedMockContext.presetResults['redeem_codes:update'] = {
      error: null,
    };
    hoistedMockContext.presetResults['user_subscriptions:upsert'] = {
      error: { message: 'DB UPSERT ERROR' },
    };

    const req = new Request('http://localhost/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FAIL-SUB-CODE', userId: 'user_test_123' }),
    });

    const res = await redeemPost(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('更新订阅状态失败');
  });
});