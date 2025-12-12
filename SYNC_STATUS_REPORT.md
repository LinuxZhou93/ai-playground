# System Data Synchronization Status / 系统数据同步状态报告

## 🟢 1. 已在云端 (Synced to Supabase Cloud)
以下数据已经成功存储在云端数据库，可以跨设备访问：
*   **Users (Auth)**: 用户注册账户、密码、登录状态。
*   **Profiles**: 用户昵称、头像、会员有效期。
*   **Vouchers**: 生成的会员卡密、使用状态。

## 🔴 2. 仅在本地 (Local Only)
以下数据目前**仅存储在浏览器本地** (localStorage)，尚未进入云端：
*   **User Dashboard Data**:
    *   核心素养指标 (Scores: 52%, 41%, etc.)
    *   技能树点亮状态 (Skill Tree)
    *   模块开关 (Modules)

## ⚠️ 原因 (Root Cause)
Supabase 数据库中缺少 **`user_dashboard_data`** 表。Admin 面板尝试推送数据时被拒绝。

## 🛠️ 修复方案 (Fix Solution)
请复制以下 SQL 代码，在 **Supabase Dashboard -> SQL Editor** 中运行一次即可修复：

```sql
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

-- Enable RLS
alter table public.user_dashboard_data enable row level security;

-- Policies
create policy "Allow public read access" on public.user_dashboard_data for select using ( true );
create policy "Allow service role full access" on public.user_dashboard_data for all using ( true ) with check ( true );
```

运行后，回到 Admin 面板再次点击 **"Push Update"**，所有数据将变绿并同步上云。
