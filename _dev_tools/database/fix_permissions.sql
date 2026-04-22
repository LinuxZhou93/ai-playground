-- Fix RLS Permissions to allow Anon Key write access (for Demo)

-- 1. Drop old policies / 删除旧策略
drop policy if exists "Allow service role full access" on public.user_dashboard_data;
drop policy if exists "Allow public read access" on public.user_dashboard_data;

-- 2. Create Permissive Policy / 创建全开策略
-- This allows anyone with the Anon Key to Insert/Update/Select
create policy "Allow public full access"
  on public.user_dashboard_data
  for all
  using ( true )
  with check ( true );
