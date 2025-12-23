-- PSYCHE-X SUPABASE SCHEMA v1.0

-- 1. PROFILES (Public user data linked to Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  tier text default 'FREE', -- FREE, PRO, ELITE
  avatar_url text,
  xp_total bigint default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;

-- Policy: Everyone can view basic profiles (for leaderboards)
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

-- Policy: Users can insert their own profile.
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

-- Policy: Users can update own profile.
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 2. GAME RESULTS
create table public.game_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  game_title text not null,
  game_domain text not null,
  score int not null,
  metrics jsonb, -- store detailed stats key-value
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.game_results enable row level security;

-- Policy: Users can insert their own results.
create policy "Users can upload own results" on public.game_results
  for insert with check (auth.uid() = user_id);

-- Policy: Users view their own history.
create policy "Users view own results" on public.game_results
  for select using (auth.uid() = user_id);

-- 3. LICENSES (SaaS)
create table public.licenses (
  code text primary key,
  plan_type text not null, -- MONTHLY, SEMI, YEARLY
  status text default 'Active', -- Active, Redeemed
  created_at timestamp with time zone default timezone('utc'::text, now()),
  redeemed_by uuid references public.profiles(id),
  redeemed_at timestamp with time zone
);
alter table public.licenses enable row level security;

-- Policy: Only authenticated users can "read" licenses to check validity (strictly controlled via function usually, but for demo: open read if active)
-- In production, we'd use a server-side function (RPC) to redeem.
-- For this MVP, we allow select for active ones.
create policy "View active licenses" on public.licenses
  for select using (status = 'Active');

-- Policy: Users can update license to 'Redeemed' if they claim it (Optimistic locking needed in real app)
create policy "Redeem license" on public.licenses
  for update using (status = 'Active') with check (status = 'Redeemed');

-- 4. TRIGGER: Auto-create profile on signup
-- This function automatically creates a profile entry when a user confirms email
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, tier)
  values (new.id, new.raw_user_meta_data->>'username', 'FREE');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
