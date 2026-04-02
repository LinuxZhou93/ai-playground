-- 第二阶段重构：为评估表增加学生现场巨幅照片存储列
ALTER TABLE public.camp_evaluations ADD COLUMN photo_data text;
