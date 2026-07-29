-- XMP 奇妙伙伴 · 三端数智课堂感知与教师干预
-- 摄像头、Rokid、桌宠在边缘侧融合；原始媒体不入云，个体证据经授权和教师审核。

create table if not exists public.xmp_classroom_signal_windows (
  id uuid primary key,
  tenant_id text not null,
  campus_id text not null,
  class_id text not null,
  session_id text not null,
  phase_id text not null,
  phase_title text not null check (char_length(phase_title) between 1 and 80),
  window_seconds smallint not null default 90 check (window_seconds = 90),
  scene text not null check (scene in ('collective', 'learning-corner', 'outdoor', 'life')),
  scope text not null default 'multi-end-fusion' check (scope = 'multi-end-fusion'),
  raw_media_retained boolean not null default false check (raw_media_retained = false),
  retention_policy text not null default 'metrics-24h-evidence-pending-review'
    check (retention_policy = 'metrics-24h-evidence-pending-review'),
  sources text[] not null,
  source_coverage jsonb not null default '[]'::jsonb
    check (jsonb_typeof(source_coverage) = 'array'),
  participation_coverage numeric(5,2) not null check (participation_coverage between 0 and 100),
  peer_response_count integer not null check (peer_response_count >= 0),
  open_question_count integer not null check (open_question_count >= 0),
  average_wait_seconds numeric(6,2) not null check (average_wait_seconds between 0 and 120),
  ambient_level_db numeric(6,2) not null check (ambient_level_db between 0 and 140),
  active_material_stations integer not null check (active_material_stations >= 0),
  anonymous_responses integer not null check (anonymous_responses >= 0),
  observed_at timestamptz not null,
  expires_at timestamptz generated always as (observed_at + interval '24 hours') stored,
  created_at timestamptz not null default now(),
  unique (tenant_id, session_id, observed_at)
);

create table if not exists public.xmp_student_evidence_candidates (
  id uuid primary key,
  tenant_id text not null,
  signal_window_id uuid not null references public.xmp_classroom_signal_windows(id) on delete cascade,
  child_ref text not null check (char_length(child_ref) between 2 and 40),
  consent_status text not null check (consent_status = 'authorized'),
  purpose text not null check (purpose in ('teaching-adjustment', 'growth-evidence')),
  curriculum_target text not null,
  observation text not null,
  ai_hypothesis text not null,
  sources text[] not null,
  source_agreement text not null check (source_agreement in ('single-source', 'corroborated', 'conflicted')),
  confidence smallint not null check (confidence between 0 and 100),
  raw_media_policy text not null default 'edge-ring-buffer' check (raw_media_policy = 'edge-ring-buffer'),
  status text not null default 'candidate' check (status in ('candidate', 'teacher-confirmed', 'rejected')),
  teacher_id text,
  teacher_note text,
  captured_at timestamptz not null,
  expires_at timestamptz not null,
  reviewed_at timestamptz,
  constraint xmp_evidence_teacher_review check (
    (status = 'candidate' and teacher_id is null and reviewed_at is null)
    or (status in ('teacher-confirmed', 'rejected') and teacher_id is not null and reviewed_at is not null)
  )
);

create table if not exists public.xmp_classroom_interventions (
  id uuid primary key,
  tenant_id text not null,
  signal_window_id uuid not null references public.xmp_classroom_signal_windows(id) on delete cascade,
  phase_id text not null,
  kind text not null check (kind in ('pace', 'question', 'participation', 'materials', 'safety')),
  title text not null check (char_length(title) between 1 and 120),
  rationale text not null check (char_length(rationale) between 12 and 600),
  suggested_action text not null check (char_length(suggested_action) between 12 and 400),
  teacher_action text not null check (char_length(teacher_action) between 12 and 400),
  status text not null check (status in ('proposed', 'accepted', 'edited', 'applied', 'dismissed', 'expired')),
  confidence smallint not null check (confidence between 0 and 100),
  teacher_id text,
  teacher_name text,
  created_at timestamptz not null,
  decided_at timestamptz,
  applied_at timestamptz,
  constraint xmp_intervention_teacher_decision_required check (
    (status in ('proposed', 'expired') and teacher_id is null and decided_at is null)
    or (status in ('accepted', 'edited', 'applied', 'dismissed') and teacher_id is not null and decided_at is not null)
  ),
  constraint xmp_intervention_application_time_required check (
    (status = 'applied' and applied_at is not null)
    or (status <> 'applied' and applied_at is null)
  )
);

create table if not exists public.xmp_applied_teaching_actions (
  id uuid primary key,
  tenant_id text not null,
  intervention_id uuid not null unique references public.xmp_classroom_interventions(id),
  session_id text not null,
  phase_id text not null,
  action_text text not null check (char_length(action_text) between 12 and 400),
  teacher_id text not null,
  teacher_name text not null,
  revalidation text not null default 'required' check (revalidation = 'required'),
  applied_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists xmp_signal_windows_session_time_idx
  on public.xmp_classroom_signal_windows (tenant_id, session_id, observed_at desc);
create index if not exists xmp_interventions_signal_status_idx
  on public.xmp_classroom_interventions (tenant_id, signal_window_id, status);
create index if not exists xmp_evidence_review_queue_idx
  on public.xmp_student_evidence_candidates (tenant_id, status, expires_at);

alter table public.xmp_classroom_signal_windows enable row level security;
alter table public.xmp_classroom_signal_windows force row level security;
alter table public.xmp_classroom_interventions enable row level security;
alter table public.xmp_classroom_interventions force row level security;
alter table public.xmp_student_evidence_candidates enable row level security;
alter table public.xmp_student_evidence_candidates force row level security;
alter table public.xmp_applied_teaching_actions enable row level security;
alter table public.xmp_applied_teaching_actions force row level security;

revoke all on public.xmp_classroom_signal_windows from anon, authenticated;
revoke all on public.xmp_classroom_interventions from anon, authenticated;
revoke all on public.xmp_student_evidence_candidates from anon, authenticated;
revoke all on public.xmp_applied_teaching_actions from anon, authenticated;
grant select on public.xmp_classroom_signal_windows to authenticated;
grant select on public.xmp_classroom_interventions to authenticated;
grant select on public.xmp_student_evidence_candidates to authenticated;
grant select on public.xmp_applied_teaching_actions to authenticated;

-- 未来仅允许受保护的园所边缘接入 API 写入信号；租户、可信设备、课堂状态、
-- 当前课程阶段和教师会话必须由服务端验证。浏览器不能直接写入或扩大采集范围。
