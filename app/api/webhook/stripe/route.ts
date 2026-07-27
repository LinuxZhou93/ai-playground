import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { buildSafeSupabaseServerKey, buildSafeSupabaseUrl, isSupabaseServerConfigured } from '@/lib/supabase/config';

// 初始化特权 Supabase 客户端 (Service Role Key 可绕过 RLS 策略写入订阅状态)
const supabaseAdmin = createClient(buildSafeSupabaseUrl, buildSafeSupabaseServerKey);

/**
 * 原生安全签名验证函数
 */
function verifyStripeSignature(rawBody: string, signatureHeader: string, webhookSecret: string): boolean {
  try {
    const parts = signatureHeader.split(',');
    const timestampPart = parts.find((p) => p.trim().startsWith('t='));
    const signaturePart = parts.find((p) => p.trim().startsWith('v1='));
    if (!timestampPart || !signaturePart) return false;

    const timestamp = timestampPart.split('=')[1];
    const signature = signaturePart.split('=')[1];

    // 防御重放攻击：校验时间戳是否在合理范围内（5分钟，即 300 秒）
    const now = Math.floor(Date.now() / 1000);
    const timestampVal = parseInt(timestamp, 10);
    if (isNaN(timestampVal) || Math.abs(now - timestampVal) > 300) {
      console.warn('[Stripe Webhook] Replay attack detected or timestamp expired');
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf-8');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf-8');

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
  } catch (err) {
    console.error('[Stripe Webhook Signature Verification Failed]', err);
    return false;
  }
}

/**
 * 辅助函数：通过 Stripe API 检索订阅详情，获取 current_period_end
 */
async function fetchStripeSubscription(subscriptionId: string): Promise<{
  status: string;
  current_period_end: number;
  price_id: string;
}> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscription detail from Stripe: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    status: data.status,
    current_period_end: data.current_period_end,
    price_id: data.items.data[0]?.price?.id || '',
  };
}

export async function POST(req: Request) {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const signature = req.headers.get('stripe-signature');
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 1. 签名验证安全防线
  const isValid = verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    console.warn('[Stripe Webhook] Unauthorized webhook signature warning.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: 'Parse error' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received Event Type: ${event.type}`);

  try {
    switch (event.type) {
      // 事件 1：收银台支付首次完成 (订阅被拉起)
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        if (!userId || !subscriptionId) {
          console.error('[Stripe Webhook] Missing userId or subscriptionId in metadata');
          break;
        }

        // 调用 Stripe API 拉取最新到期时间
        const subDetails = await fetchStripeSubscription(subscriptionId);
        const currentPeriodEnd = new Date(subDetails.current_period_end * 1000).toISOString();

        //  upsert 同步至 Supabase
        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            price_id: subDetails.price_id,
            status: subDetails.status,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('[Supabase Upsert Error] checkout.session.completed failed:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 🔗 [Profile Sync] 联锁同步更新 profiles 表的会员期限
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ expiry_date: currentPeriodEnd })
          .eq('id', userId);
        if (profileError) {
          console.error('[Supabase profiles Sync Error] checkout.session.completed profiles update failed:', profileError);
        }

        console.log(`[Stripe Webhook SUCCESS] User ${userId} subscription initialized and profile synced successfully.`);
        break;
      }

      // 事件 2：续费自动扣款成功
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;

        if (!subscriptionId) break;

        const subDetails = await fetchStripeSubscription(subscriptionId);
        const currentPeriodEnd = new Date(subDetails.current_period_end * 1000).toISOString();

        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: subDetails.status,
            current_period_end: currentPeriodEnd,
            price_id: subDetails.price_id,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('[Supabase Update Error] invoice.payment_succeeded failed:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 🔗 [Profile Sync] 联锁同步更新 profiles 表
        const { data: subData } = await supabaseAdmin
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();

        if (subData?.user_id) {
          const { error: pSyncErr } = await supabaseAdmin
            .from('profiles')
            .update({ expiry_date: currentPeriodEnd })
            .eq('id', subData.user_id);
          if (pSyncErr) {
            console.error('[Supabase profiles Sync Error] invoice.payment_succeeded failed:', pSyncErr);
          }
        }

        console.log(`[Stripe Webhook SUCCESS] Subscription ${subscriptionId} renewed and profile synced successfully.`);
        break;
      }

      // 事件 3 & 4：用户主动退订 / 升级 / 账单失效
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: status,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('[Supabase Update Error] subscription event update failed:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 🔗 [Profile Sync] 联锁同步更新 profiles 表
        const { data: subData } = await supabaseAdmin
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();

        if (subData?.user_id) {
          // 如果是 canceled (已取消)，在 Stripe 里代表已过期，我们同样更新 expiry_date 为到期时间
          // profiles 会根据 expiry_date 是否大于当前时间来判定 VIP 是否有效
          const { error: pSyncErr } = await supabaseAdmin
            .from('profiles')
            .update({ expiry_date: currentPeriodEnd })
            .eq('id', subData.user_id);
          if (pSyncErr) {
            console.error('[Supabase profiles Sync Error] subscription update sync failed:', pSyncErr);
          }
        }

        console.log(`[Stripe Webhook SUCCESS] Subscription ${subscriptionId} synced to status: ${status} and profile updated.`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook Critical Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
