-- =============================================================================
-- FutureClass ERP 教研系统底层数据表升级 (P0阶段)
-- =============================================================================

-- 1. 新建 edu_lesson_plans 课件正文表 (用于持久化保存 PPT 与教案)
CREATE TABLE IF NOT EXISTS public.edu_lesson_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES public.erp_courses(id) ON DELETE CASCADE,
    version integer DEFAULT 1,            -- 版本号，支持迭代
    slides jsonb NOT NULL,                -- 完整的 slides 数组 (PPT内容)
    lesson_plan text,                     -- 教案大纲文本
    status text DEFAULT 'DRAFT',          -- DRAFT / PUBLISHED / ARCHIVED
    created_by text,                      -- 创建者
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.edu_lesson_plans IS '核心教研表：存储每一门课程的完整 PPT 课件阵列与全景教案';

-- 2. 新建 edu_lessons 逐课教学设计表 (用于细化管理粒度，打通教辅闭环)
CREATE TABLE IF NOT EXISTS public.edu_lessons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES public.erp_courses(id) ON DELETE CASCADE,
    lesson_number integer NOT NULL,         -- 第几课 (例如：1)
    title text NOT NULL,                    -- 课次标题 (例如：初识传感器)
    objectives text[],                      -- 教学目标（数组）
    materials text[],                       -- 所需物料清单
    duration_min integer DEFAULT 90,
    slide_index integer,                    -- 如果该课对应 lesson_plans 中 slides 的某一页起始点
    assessment_criteria text,               -- 评估要点 (对接 AI 点评引擎)
    status text DEFAULT 'PLANNED',          -- PLANNED / COMPLETED
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(course_id, lesson_number)
);

COMMENT ON TABLE public.edu_lessons IS '骨架表：细化到逐次课的设计，包含教学目标与评估标准';

-- =============================================================================
-- RLS (Row Level Security) 策略配置预留层
-- 此处暂开启所有访问权限 (与开发阶段 erp_courses 保持一致)
-- =============================================================================

ALTER TABLE public.edu_lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on edu_lesson_plans"
ON public.edu_lesson_plans FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all on edu_lessons"
ON public.edu_lessons FOR ALL
USING (true)
WITH CHECK (true);
