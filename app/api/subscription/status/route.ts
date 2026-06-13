import { NextResponse } from 'next/server';
import { checkUserSubscription } from '@/lib/subscription/stripe';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // 查询数据库中该用户的真实 Stripe 订阅状态
    const statusResult = await checkUserSubscription(userId);

    return NextResponse.json({
      isVIP: statusResult.isSubscribed,
      status: statusResult.status,
      currentPeriodEnd: statusResult.currentPeriodEnd,
    });
  } catch (err: any) {
    console.error('[Subscription Status API Error]', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
