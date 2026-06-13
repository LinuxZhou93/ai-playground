-- =============================================================================
-- FutureClass / TitanTech 全球化订阅会员系统数据库迁移脚本 (Supabase)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    price_id VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- active, trialing, past_due, canceled, incomplete
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 启用 Row Level Security (RLS)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 🛡️ 安全策略 1：允许用户仅读取其本人的订阅状态
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 🛡️ 安全策略 2：允许 Service Role 权限（管理后台和 Webhook 路由）对所有数据进行增删改查
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
    USING (true) WITH CHECK (true);
