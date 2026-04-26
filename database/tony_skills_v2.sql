-- 增加核心代码和笔记字段
ALTER TABLE public.tony_skills ADD COLUMN IF NOT EXISTS core_code text;
ALTER TABLE public.tony_skills ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.tony_skills ADD COLUMN IF NOT EXISTS status text DEFAULT 'UNMOUNTED'; -- UNMOUNTED, MOUNTED, ARCHIVED
