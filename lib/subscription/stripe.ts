import { createClient } from '@supabase/supabase-js';
import { buildSafeSupabaseServerKey, buildSafeSupabaseUrl, isSupabaseServerConfigured } from '@/lib/supabase/config';

/**
 * Stripe REST API Client (Edge Compatible)
 * 
 * 采用原生 fetch 调用 Stripe HTTP 接口，不依赖任何第三方包，
 * 完美支持 Edge Runtime，避免版本冲突，轻量且高效。
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

const supabaseAdmin = createClient(buildSafeSupabaseUrl, buildSafeSupabaseServerKey);

/**
 * 创建 Stripe 订阅收银台 Session
 */
export async function createCheckoutSession(params: {
  priceId: string;
  userEmail: string;
  origin: string;
  userId: string;
}): Promise<{ id: string; url: string }> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in server environment variables.');
  }

  const bodyParams = new URLSearchParams();
  bodyParams.append('payment_method_types[0]', 'card');
  bodyParams.append('line_items[0][price]', params.priceId);
  bodyParams.append('line_items[0][quantity]', '1');
  bodyParams.append('mode', 'subscription');
  bodyParams.append('success_url', `${params.origin}/pricing?payment_status=success`);
  bodyParams.append('cancel_url', `${params.origin}/pricing?payment_status=cancelled`);
  bodyParams.append('customer_email', params.userEmail);
  bodyParams.append('metadata[userId]', params.userId); // 关键：回传 userId 用于 Supabase 数据对齐

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Stripe SDK Error] Failed to create checkout session:', errText);
    throw new Error(`Stripe Error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    url: data.url,
  };
}

/**
 * 创建 Stripe 客户管理门户 (Portal)
 * 允许用户自主升级、降级、绑定信用卡或取消订阅
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  const bodyParams = new URLSearchParams();
  bodyParams.append('customer', params.customerId);
  bodyParams.append('return_url', params.returnUrl);

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Stripe SDK Error] Failed to create portal session:', errText);
    throw new Error(`Stripe Portal Error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    url: data.url,
  };
}

/**
 * 校验用户的订阅状态是否有效
 */
export async function checkUserSubscription(userId: string): Promise<{
  isSubscribed: boolean;
  status: string;
  currentPeriodEnd: string | null;
}> {
  if (!isSupabaseServerConfigured) {
    return { isSubscribed: false, status: 'unconfigured', currentPeriodEnd: null };
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return { isSubscribed: false, status: 'none', currentPeriodEnd: null };
    }

    const isSubscribed =
      data.status === 'active' &&
      (data.current_period_end ? new Date(data.current_period_end) > new Date() : false);

    return {
      isSubscribed,
      status: data.status,
      currentPeriodEnd: data.current_period_end,
    };
  } catch (err) {
    console.error('[checkUserSubscription Error]', err);
    return { isSubscribed: false, status: 'error', currentPeriodEnd: null };
  }
}
