-- 创建营地评价表
CREATE TABLE IF NOT EXISTS public.camp_evaluations (
   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
   student_id text NOT NULL,
   student_name text NOT NULL,
   camp_name text NOT NULL DEFAULT '成电创客智能台灯营地',
   -- 八大维度成绩
   focus_score integer NOT NULL DEFAULT 3,
   dexterity_score integer NOT NULL DEFAULT 3,
   logic_score integer NOT NULL DEFAULT 3,
   resilience_score integer NOT NULL DEFAULT 3,
   self_management_score integer NOT NULL DEFAULT 3,
   social_score integer NOT NULL DEFAULT 3,
   creativity_score integer NOT NULL DEFAULT 3,
   collaboration_score integer NOT NULL DEFAULT 3,
   -- 定性描述
   highlights text,
   potential_improvements text,
   -- AI 生成字段
   ai_overall_report text,
   ai_recommendations jsonb,
   created_at timestamp with time zone DEFAULT now()
);

-- 设置权限，允许所有人插/查 (供纯前端 MVP 体验)
ALTER TABLE public.camp_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Camp Evaluations Select" ON public.camp_evaluations FOR SELECT USING (true);
CREATE POLICY "Public Camp Evaluations Insert" ON public.camp_evaluations FOR INSERT WITH CHECK (true);
