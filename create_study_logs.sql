-- ⚠️ CRITICAL UPDATE: 修复 "Commit Failed" 错误 (Fix Constraint Error)
-- 请在 Supabase SQL Editor 中运行以下所有代码：

-- 1. 移除旧的类型限制 (Drop old constraint)
ALTER TABLE study_logs DROP CONSTRAINT IF EXISTS study_logs_activity_type_check;

-- 2. 添加新的"科创少年"六维能力限制 (Add new Tech Youth dimension constraint)
ALTER TABLE study_logs ADD CONSTRAINT study_logs_activity_type_check 
CHECK (activity_type IN (
    'tech',      -- 核心技术 (Code/Hard Tech)
    'maker',     -- 工程实践 (Build/3D Print)
    'innovate',  -- 创新思维 (Design/Idea)
    'academic',  -- 学科融合 (Math/Physics)
    'team',      -- 团队协作 (Leadership)
    'review'     -- 深度复盘 (Debug/Reflection)
));

-- 3. (防备用) 如果表不存在，则用新结构创建
CREATE TABLE IF NOT EXISTS study_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    activity_date DATE NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('tech', 'maker', 'innovate', 'academic', 'team', 'review')),
    title TEXT NOT NULL,
    duration_minutes INT DEFAULT 30,
    xp_earned INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引 (Index)
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date ON study_logs(user_email, activity_date);
