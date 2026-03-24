-- 方案一：前端一键生成报表的底层支撑表
-- 请在 Supabase 的 SQL Editor 中运行此脚本，创建"学生学习流水线"表

CREATE TABLE IF NOT EXISTS public.student_learning_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,                     -- 访问用户的唯一识别码 (可以是匿名或注册用户)
    module_name TEXT NOT NULL,        -- 当前正在学习的模块名字，比如 "OpenClaw 物理运算", "AI 导论"
    action_type TEXT NOT NULL,        -- 动作类型，比如 'ENTER_PAGE' (进入), 'READ_TIME' (停留阅读), 'TEST_SUBMIT' (提交试卷)
    action_value TEXT,                -- 具体的数据值，如停留了 "300s", 或者测试考了 "Score: 95"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL -- 记录产生时间
);

-- 安全策略配置 (RLS)
-- 因为前端埋点需要频繁、无感的推送到数据库，且极有可能在未完全登录的试用阶段产生：
ALTER TABLE public.student_learning_logs ENABLE ROW LEVEL SECURITY;

-- 任何人（包含游客）都允许执行 Insert 插入学情记录
CREATE POLICY "Allow public insert to student learning logs" 
ON public.student_learning_logs 
FOR INSERT 
WITH CHECK (true);

-- 只有通过拥有 Service Key 的后台系统，或者特权账号，才能 Select 查阅所有学情数据
-- 这里为了简便和安全，我们其实默认管理员在 admin.html 中使用的是 Service Key，所以具备无视 RLS 查询所有数据的能力。
-- 如果用普通前端查阅，需要下面这一句（可选）：
-- CREATE POLICY "Allow admin to select learning logs" ON public.student_learning_logs FOR SELECT USING (true);
