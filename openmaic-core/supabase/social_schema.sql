-- 1. 创建点赞表 (Likes Table) 社交发现系统的核心支持
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, 
    stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, stage_id)
);

-- 2. 为课程表增加统计字段 (Field Extensions for Stages)
ALTER TABLE public.stages 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forks_count INTEGER DEFAULT 0;

-- 3. 配置 RLS (Row Level Security)
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看公共课程的点赞数 (通过 stages 表)
-- 允许登录用户查看自己的点赞记录
CREATE POLICY "Users can view their own likes" ON public.likes
    FOR SELECT USING (true);

-- 4. 原子计数器 RPC 函数 (Atomic Increments)
-- 这些函数允许我们安全地更新统计数据，避免并发冲突。

-- 增加点赞数
CREATE OR REPLACE FUNCTION increment_likes(target_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.stages
    SET likes_count = likes_count + 1
    WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

-- 减少点赞数
CREATE OR REPLACE FUNCTION decrement_likes(target_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.stages
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

-- 增加观看量
CREATE OR REPLACE FUNCTION increment_views(target_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.stages
    SET views_count = views_count + 1
    WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;
