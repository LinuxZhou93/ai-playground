-- ==============================================================================
-- AI Tony: Digital Twin Skills System (技能挂载系统)
-- ==============================================================================

-- 1. 技能库核心表
CREATE TABLE IF NOT EXISTS public.tony_skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,                    -- 技能名称 (如: React 并发渲染)
    category text DEFAULT '未分类',          -- 技能领域 (Coding, AI, Strategy, Design)
    level integer DEFAULT 1,               -- 技能等级
    exp bigint DEFAULT 0,                  -- 经验值
    icon text DEFAULT 'Zap',               -- Lucide 图标名称
    summary text,                          -- 技能摘要 (Tony 总结)
    source_urls text[],                    -- 关联的原始素材链接 (YT/B站)
    metadata jsonb DEFAULT '{}',           -- 扩展数据 (技能节点、脑图逻辑)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. 技能演化记录 (打怪日志)
CREATE TABLE IF NOT EXISTS public.tony_skill_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id uuid REFERENCES public.tony_skills(id) ON DELETE CASCADE,
    action_type text,                      -- INGESTED, UPGRADED, REPLACED
    content_title text,                    -- 吸收的内容标题
    exp_gained integer DEFAULT 0,          -- 获得的经验
    tony_comment text,                     -- Tony 的点评
    created_at timestamptz DEFAULT now()
);

-- 开启安全策略
ALTER TABLE public.tony_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tony_skill_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for digital twin owner" ON public.tony_skills FOR ALL USING (true);
CREATE POLICY "Allow all for digital twin owner" ON public.tony_skill_logs FOR ALL USING (true);
