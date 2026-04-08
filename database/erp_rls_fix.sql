-- =========================================================================
-- FutureClass ERP: RLS 修补脚本 (开发阶段 - 允许 anon 访问)
-- 在 Supabase Dashboard → SQL Editor 中执行
-- =========================================================================

-- 1. 移除旧策略 (仅限 authenticated)
DROP POLICY IF EXISTS "Authenticated users can manage ERP" ON public.erp_courses;
DROP POLICY IF EXISTS "Authenticated users can manage ERP" ON public.erp_students;
DROP POLICY IF EXISTS "Authenticated users can manage ERP" ON public.erp_classes;
DROP POLICY IF EXISTS "Authenticated users can manage ERP" ON public.erp_enrollments;
DROP POLICY IF EXISTS "Authenticated users can manage ERP" ON public.erp_attendance;

-- 2. 创建新策略 (开发阶段：允许 anon + authenticated 全权操作)
CREATE POLICY "Dev: Allow all access to erp_courses" ON public.erp_courses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Dev: Allow all access to erp_students" ON public.erp_students
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Dev: Allow all access to erp_classes" ON public.erp_classes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Dev: Allow all access to erp_enrollments" ON public.erp_enrollments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Dev: Allow all access to erp_attendance" ON public.erp_attendance
  FOR ALL USING (true) WITH CHECK (true);

-- 3. 验证
SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'erp_%';
