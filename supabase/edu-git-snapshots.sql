-- ==========================================
-- 建立 "千人千面" 的学习笔记与断点数据库表
-- 采用 Supabase RLS 保障每人仅能看到自己的数据
-- ==========================================

-- 1. 创建 user_learning_snapshots 表
CREATE TABLE IF NOT EXISTS public.user_learning_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id VARCHAR NOT NULL,               -- 关联到 stage.id
    scene_index INTEGER NOT NULL,             -- 幻灯片当前的断点索引
    ai_summary TEXT,                          -- AI 小创老师为你自动生成的总结
    notes TEXT,                               -- 学生自主撰写的 Markdown 笔记
    state_data JSONB,                         -- 包含了整个 chatHistory 和白板交互的数据快照
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用行级安全性 (RLS)
ALTER TABLE public.user_learning_snapshots ENABLE ROW LEVEL SECURITY;

-- 3. 构建安全策略 (Policies): 强千人千面机制
-- (a) 允许用户插入自己的学习快照
CREATE POLICY "Users can insert their own snapshots" 
ON public.user_learning_snapshots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- (b) 允许用户只拉取自己的历史学习快照
CREATE POLICY "Users can view their own snapshots" 
ON public.user_learning_snapshots 
FOR SELECT 
USING (auth.uid() = user_id);

-- (c) 允许用户更新自己的笔记与快照
CREATE POLICY "Users can update their own snapshots" 
ON public.user_learning_snapshots 
FOR UPDATE 
USING (auth.uid() = user_id);

-- (d) 允许用户删除自己的快照
CREATE POLICY "Users can delete their own snapshots" 
ON public.user_learning_snapshots 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. 优化抓取性能
CREATE INDEX IF NOT EXISTS idx_learning_snapshots_user_course 
ON public.user_learning_snapshots(user_id, course_id, created_at DESC);
