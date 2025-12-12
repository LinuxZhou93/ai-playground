-- 1. Patch Missing Columns / 补全缺失的列
-- 您的表中似乎缺少 'mod_brain' 等列，这通常是因为之前的建表脚本没跑完
alter table public.user_dashboard_data add column if not exists mod_brain boolean default false;

-- 2. Force Reload Cache / 强制刷新缓存
-- 让 Supabase 立即识别新加入的列
NOTIFY pgrst, 'reload schema';
