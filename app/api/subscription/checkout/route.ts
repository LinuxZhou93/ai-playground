import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/subscription/stripe';

// Stripe 测试价格 ID 映射（高优先级从环境变量读取，开发环境提供占位符）
const PRICE_MAP: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  quarterly: process.env.STRIPE_PRICE_QUARTERLY || 'price_quarterly_placeholder',
  yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly_placeholder',
};

export async function POST(req: Request) {
  try {
    const { tier, userId, userEmail } = await req.json();

    if (!tier || !PRICE_MAP[tier]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier selected. Choose monthly, quarterly or yearly.' },
        { status: 400 }
      );
    }

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Authentication Required: Please login before subscribing.' },
        { status: 401 }
      );
    }

    const priceId = PRICE_MAP[tier];
    const origin = req.headers.get('origin') || 'https://zhouxiaomai.com';

    console.log(`[Stripe Checkout API] User ${userId} (${userEmail}) initiating checkout for tier: ${tier}`);

    const session = await createCheckoutSession({
      priceId,
      userEmail,
      origin,
      userId,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe Checkout API Exception]', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
