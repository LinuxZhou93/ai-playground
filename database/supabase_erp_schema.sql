-- =========================================================================
-- Supabase Schema for CHRONOS ERP (V1.0)
-- Purpose: 为 STEM 机构提供的一套私有化、AI 原生的教务与财务管理系统。
-- =========================================================================

-- 1. ERP 核心配置与字典表 (Dictionary Boards)
CREATE TABLE IF NOT EXISTS public.erp_courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text, -- 机器人, 编程, 电子, 碳材料
    duration_min integer DEFAULT 90, -- 课程时长 (分钟)
    price_per_lesson decimal(10, 2) DEFAULT 0.00, -- 课时单价
    total_lessons integer DEFAULT 1, -- 总课时
    status text DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. 学员与课程账户 (Students & Course Accounts)
CREATE TABLE IF NOT EXISTS public.erp_students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    gender text,
    phone text15, -- 主联系方式
    parent_name text,
    birthday date,
    source text, -- 来源 (转介绍, 地推等)
    grade text, -- 年级
    school text, -- 在读学校
    status text DEFAULT 'ACTIVE', -- ACTIVE, GRADUATED, REFUNDED
    tags text[], -- 自定义画像标签
    creator_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. 班级模块 (Class & Scheduling)
CREATE TABLE IF NOT EXISTS public.erp_classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    course_id uuid REFERENCES public.erp_courses(id),
    teacher_id uuid REFERENCES auth.users(id), -- 主讲老师
    assistant_id uuid REFERENCES auth.users(id), -- 助教
    capacity integer DEFAULT 10, -- 班级容量
    classroom text,
    start_date date,
    end_date date,
    status text DEFAULT 'OPENING', -- OPENING, FULL, COMPLETED
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. 报读与课时账户 (Enrollments - 这里的逻辑即订单)
CREATE TABLE IF NOT EXISTS public.erp_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES public.erp_students(id) ON DELETE CASCADE,
    class_id uuid REFERENCES public.erp_classes(id) ON DELETE SET NULL,
    course_id uuid REFERENCES public.erp_courses(id),
    total_purchased_lessons integer NOT NULL, -- 购买总课时
    remaining_lessons decimal(10, 2) NOT NULL, -- 剩余课时 (关键字段，财务对冲核心)
    enroll_status text DEFAULT 'STUDYING', -- STUDYING, SUSPENDED, COMPLETED, REFUNDED
    remark text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. 出勤与课消流水 (Attendance & Consumption)
CREATE TABLE IF NOT EXISTS public.erp_attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES public.erp_students(id) ON DELETE CASCADE,
    class_id uuid REFERENCES public.erp_classes(id),
    lesson_date date NOT NULL DEFAULT current_date,
    status text DEFAULT 'PRESENT', -- PRESENT (出席), ABSENT (缺席), LEAVE (请假)
    consumption_value decimal(5, 2) DEFAULT 1.0, -- 消耗课时数
    ai_feedback text, -- AI 生成的课后点评
    media_urls text[], -- 课堂照片或作品链接
    operator_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);

-- 6. RLS Policies (Security)
ALTER TABLE public.erp_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_attendance ENABLE ROW LEVEL SECURITY;

-- 允许登录员工完全控制 (初期宽松策略，后期按角色细分)
CREATE POLICY "Authenticated users can manage ERP" ON public.erp_courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage ERP" ON public.erp_students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage ERP" ON public.erp_classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage ERP" ON public.erp_enrollments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage ERP" ON public.erp_attendance FOR ALL USING (auth.role() = 'authenticated');

-- 7. Trigger for updated_at
CREATE OR REPLACE FUNCTION erp_update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER erp_courses_modtime BEFORE UPDATE ON public.erp_courses FOR EACH ROW EXECUTE PROCEDURE erp_update_modified_column();
CREATE TRIGGER erp_students_modtime BEFORE UPDATE ON public.erp_students FOR EACH ROW EXECUTE PROCEDURE erp_update_modified_column();
CREATE TRIGGER erp_classes_modtime BEFORE UPDATE ON public.erp_classes FOR EACH ROW EXECUTE PROCEDURE erp_update_modified_column();
CREATE TRIGGER erp_enrollments_modtime BEFORE UPDATE ON public.erp_enrollments FOR EACH ROW EXECUTE PROCEDURE erp_update_modified_column();
