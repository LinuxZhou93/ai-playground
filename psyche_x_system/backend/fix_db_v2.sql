-- 复制以下所有代码，在 Supabase SQL Editor 中运行
-- 1. 重置 Trigger (先删除旧的以防万一)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. 确保扩展开启
create extension if not exists "uuid-ossp";

-- 3. 确保 Profiles 表存在 (如果不存在则创建)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  email text,
  tier text default 'FREE',
  avatar_url text,
  xp_total bigint default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 开启 RLS 但允许所有人读写 (为了调试方便，之后可改回严谨模式)
alter table public.profiles enable row level security;

-- 删除旧策略以防冲突
drop policy if exists "Enable all for users" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

-- 创建一个宽容的策略 (允许已登录用户做任何事)
create policy "Enable all for users" on public.profiles
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 5. 重建 Trigger 函数 (去除 Unique 强校验，容错性更高)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, username, tier)
  values (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', 'User ' || substring(new.id::text from 1 for 4)),
    'FREE'
  )
  on conflict (id) do nothing; -- 如果ID已存在则忽略
  return new;
end;
$$ language plpgsql security definer;

-- 6. 重新绑定 Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. 确保其他表存在
create table if not exists public.game_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  game_title text,
  game_domain text,
  score int,
  metrics jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.game_results enable row level security;
create policy "Enable all for game_results" on public.game_results for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create table if not exists public.licenses (
  code text primary key,
  plan_type text,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  redeemed_by uuid references public.profiles(id),
  redeemed_at timestamp with time zone
);
alter table public.licenses enable row level security;
create policy "Enable all for licenses" on public.licenses for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
