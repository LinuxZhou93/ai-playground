-- Create the user_dashboard_data table for Admin Panel Sync
create table if not exists public.user_dashboard_data (
  username text primary key,
  is_logged_in boolean default false,
  
  -- Progress Metrics
  prog_self integer default 0,
  prog_basic integer default 0,
  prog_subject integer default 0,
  prog_tech integer default 0,

  -- Skills
  skill_math boolean default false,
  skill_physics boolean default false,
  skill_info boolean default false,
  skill_ai boolean default false,
  skill_english boolean default false,
  skill_reading boolean default false,

  -- Modules
  mod_launch boolean default false,
  mod_trophy boolean default false,
  mod_brain boolean default false,
  mod_synergy boolean default false,
  mod_games boolean default false,
  mod_dino boolean default false,
  
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (Optional, but good practice)
alter table public.user_dashboard_data enable row level security;

-- Policy: Allow everyone to read (for Dashboard)
create policy "Allow public read access"
  on public.user_dashboard_data for select
  using ( true );

-- Policy: Allow Service Role (Admin) to insert/update
create policy "Allow service role full access"
  on public.user_dashboard_data for all
  using ( true )
  with check ( true );
