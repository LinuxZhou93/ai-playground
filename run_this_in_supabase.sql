-- 1. Create the Table / 创建表
create table if not exists public.user_dashboard_data (
  username text primary key,
  is_logged_in boolean default false,
  prog_self integer default 0,
  prog_basic integer default 0,
  prog_subject integer default 0,
  prog_tech integer default 0,
  skill_math boolean default false,
  skill_physics boolean default false,
  skill_info boolean default false,
  skill_ai boolean default false,
  skill_english boolean default false,
  skill_reading boolean default false,
  mod_launch boolean default false,
  mod_trophy boolean default false,
  mod_brain boolean default false,
  mod_synergy boolean default false,
  mod_games boolean default false,
  mod_dino boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Security Settings / 开启安全访问
alter table public.user_dashboard_data enable row level security;

-- 3. Access Policies / 设置访问权限
create policy "Allow public read access" on public.user_dashboard_data for select using ( true );
create policy "Allow service role full access" on public.user_dashboard_data for all using ( true ) with check ( true );
