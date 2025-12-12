-- Final Patch: Ensure ALL columns exist (补全所有可能缺失的列)

-- Progress Metrics
alter table public.user_dashboard_data add column if not exists prog_self integer default 0;
alter table public.user_dashboard_data add column if not exists prog_basic integer default 0;
alter table public.user_dashboard_data add column if not exists prog_subject integer default 0;
alter table public.user_dashboard_data add column if not exists prog_tech integer default 0;

-- Skills
alter table public.user_dashboard_data add column if not exists skill_math boolean default false;
alter table public.user_dashboard_data add column if not exists skill_physics boolean default false;
alter table public.user_dashboard_data add column if not exists skill_info boolean default false;
alter table public.user_dashboard_data add column if not exists skill_ai boolean default false;
alter table public.user_dashboard_data add column if not exists skill_english boolean default false;
alter table public.user_dashboard_data add column if not exists skill_reading boolean default false;

-- Modules (Missing Ones)
alter table public.user_dashboard_data add column if not exists mod_launch boolean default false;
alter table public.user_dashboard_data add column if not exists mod_trophy boolean default false;
alter table public.user_dashboard_data add column if not exists mod_brain boolean default false;
alter table public.user_dashboard_data add column if not exists mod_synergy boolean default false;
alter table public.user_dashboard_data add column if not exists mod_games boolean default false;
alter table public.user_dashboard_data add column if not exists mod_dino boolean default false;

-- Reload Cache (Crucial)
NOTIFY pgrst, 'reload schema';
