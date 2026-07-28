-- XMP 奇妙伙伴 · 教学数字化结构化数据层
-- 状态：本地评审/未来试点迁移脚本；不会被应用启动过程自动执行。
-- 原始音视频、人脸模板、儿童姓名、联系方式、个人分数和诊断结果没有字段入口。

create table if not exists public.xmp_teaching_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  campus_id text not null check (char_length(campus_id) between 1 and 96),
  class_ref text not null check (char_length(class_ref) between 1 and 96),
  teacher_id uuid not null references auth.users(id) on delete restrict,
  course_release_ref text not null check (char_length(course_release_ref) between 1 and 128),
  schedule_signature_ref text not null check (char_length(schedule_signature_ref) between 1 and 128),
  correlation_id text not null check (
    char_length(correlation_id) between 8 and 96
    and correlation_id ~ '^[A-Za-z0-9._:-]+$'
  ),
  status text not null default 'prepared' check (
    status in ('prepared', 'ready', 'live', 'paused', 'review', 'signed', 'cancelled')
  ),
  edge_inference boolean not null default true check (edge_inference = true),
  raw_media_uploaded boolean not null default false check (raw_media_uploaded = false),
  individual_ranking boolean not null default false check (individual_ranking = false),
  medical_diagnosis boolean not null default false check (medical_diagnosis = false),
  started_at timestamptz,
  ended_at timestamptz,
  teacher_signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, correlation_id)
);

create table if not exists public.xmp_teaching_group_pulses (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  session_id uuid not null references public.xmp_teaching_sessions(id) on delete cascade,
  anonymous_group_ref text not null check (
    char_length(anonymous_group_ref) between 3 and 64
    and anonymous_group_ref !~* '(child|student|name|face|phone|email)'
  ),
  window_started_at timestamptz not null,
  window_ended_at timestamptz not null,
  participation smallint not null check (participation between 0 and 100),
  trend text not null check (trend in ('up', 'steady', 'down')),
  observed_state text not null check (
    observed_state in ('engaged', 'negotiating', 'needs-clarification', 'movement-transition')
  ),
  sample_count smallint not null check (sample_count between 1 and 600),
  model_version text not null check (char_length(model_version) between 1 and 64),
  created_at timestamptz not null default now(),
  expires_at timestamptz generated always as (created_at + interval '30 days') stored,
  check (window_ended_at > window_started_at),
  unique (tenant_id, session_id, anonymous_group_ref, window_started_at)
);

create table if not exists public.xmp_teaching_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  session_id uuid not null references public.xmp_teaching_sessions(id) on delete restrict,
  cue_ref text not null check (char_length(cue_ref) between 3 and 96),
  category text not null check (category in ('pacing', 'question', 'grouping', 'movement')),
  recommendation text not null check (char_length(recommendation) between 8 and 240),
  rationale text not null check (char_length(rationale) between 8 and 600),
  decision text not null check (decision in ('accepted', 'dismissed')),
  teacher_id uuid not null references auth.users(id) on delete restrict,
  decided_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, session_id, cue_ref)
);

create table if not exists public.xmp_teaching_evidence (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  session_id uuid not null references public.xmp_teaching_sessions(id) on delete restrict,
  anonymous_group_ref text not null check (char_length(anonymous_group_ref) between 3 and 64),
  observable_fact text not null check (char_length(observable_fact) between 8 and 600),
  source text not null check (source in ('teacher-note', 'anonymous-pulse', 'classroom-event')),
  teacher_id uuid not null references auth.users(id) on delete restrict,
  teacher_confirmed boolean not null check (teacher_confirmed = true),
  confirmed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists xmp_teaching_sessions_tenant_time_idx
  on public.xmp_teaching_sessions (tenant_id, created_at desc);
create index if not exists xmp_teaching_pulses_session_time_idx
  on public.xmp_teaching_group_pulses (tenant_id, session_id, window_started_at desc);
create index if not exists xmp_teaching_decisions_session_time_idx
  on public.xmp_teaching_decisions (tenant_id, session_id, decided_at desc);
create index if not exists xmp_teaching_evidence_session_time_idx
  on public.xmp_teaching_evidence (tenant_id, session_id, confirmed_at desc);
create index if not exists xmp_teaching_pulses_expiry_idx
  on public.xmp_teaching_group_pulses (expires_at);

alter table public.xmp_teaching_sessions enable row level security;
alter table public.xmp_teaching_sessions force row level security;
alter table public.xmp_teaching_group_pulses enable row level security;
alter table public.xmp_teaching_group_pulses force row level security;
alter table public.xmp_teaching_decisions enable row level security;
alter table public.xmp_teaching_decisions force row level security;
alter table public.xmp_teaching_evidence enable row level security;
alter table public.xmp_teaching_evidence force row level security;

revoke all on table public.xmp_teaching_sessions from anon, authenticated;
revoke all on table public.xmp_teaching_group_pulses from anon, authenticated;
revoke all on table public.xmp_teaching_decisions from anon, authenticated;
revoke all on table public.xmp_teaching_evidence from anon, authenticated;
grant select on table public.xmp_teaching_sessions to authenticated;
grant select on table public.xmp_teaching_group_pulses to authenticated;
grant select on table public.xmp_teaching_decisions to authenticated;
grant select on table public.xmp_teaching_evidence to authenticated;

drop policy if exists xmp_teaching_sessions_scoped_read on public.xmp_teaching_sessions;
create policy xmp_teaching_sessions_scoped_read
  on public.xmp_teaching_sessions for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and (
      teacher_id = auth.uid()
      or public.xmp_current_access_role() in ('tenant-admin', 'research-lead', 'security-officer')
    )
  );

drop policy if exists xmp_teaching_pulses_scoped_read on public.xmp_teaching_group_pulses;
create policy xmp_teaching_pulses_scoped_read
  on public.xmp_teaching_group_pulses for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and exists (
      select 1 from public.xmp_teaching_sessions session
      where session.id = public.xmp_teaching_group_pulses.session_id
        and session.tenant_id = public.xmp_teaching_group_pulses.tenant_id
        and (
          session.teacher_id = auth.uid()
          or public.xmp_current_access_role() in ('tenant-admin', 'research-lead', 'security-officer')
        )
    )
  );

drop policy if exists xmp_teaching_decisions_scoped_read on public.xmp_teaching_decisions;
create policy xmp_teaching_decisions_scoped_read
  on public.xmp_teaching_decisions for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and (
      teacher_id = auth.uid()
      or public.xmp_current_access_role() in ('tenant-admin', 'research-lead', 'security-officer')
    )
  );

drop policy if exists xmp_teaching_evidence_scoped_read on public.xmp_teaching_evidence;
create policy xmp_teaching_evidence_scoped_read
  on public.xmp_teaching_evidence for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and (
      teacher_id = auth.uid()
      or public.xmp_current_access_role() in ('tenant-admin', 'research-lead', 'security-officer')
    )
  );

create or replace function public.xmp_reject_teaching_evidence_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'confirmed teaching evidence and decisions are append-only';
end;
$$;

drop trigger if exists xmp_teaching_decisions_no_mutation on public.xmp_teaching_decisions;
create trigger xmp_teaching_decisions_no_mutation
  before update or delete on public.xmp_teaching_decisions
  for each row execute function public.xmp_reject_teaching_evidence_mutation();

drop trigger if exists xmp_teaching_evidence_no_mutation on public.xmp_teaching_evidence;
create trigger xmp_teaching_evidence_no_mutation
  before update or delete on public.xmp_teaching_evidence
  for each row execute function public.xmp_reject_teaching_evidence_mutation();

create or replace function public.xmp_purge_expired_teaching_pulses()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
begin
  delete from public.xmp_teaching_group_pulses where expires_at <= now();
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.xmp_purge_expired_teaching_pulses() from public, anon, authenticated;
grant execute on function public.xmp_purge_expired_teaching_pulses() to service_role;

comment on table public.xmp_teaching_group_pulses is
  'Short-lived anonymous group-level teaching signals; never individual child scores or raw media.';
comment on table public.xmp_teaching_evidence is
  'Teacher-confirmed observable facts linked to anonymous groups; no child identity or diagnosis.';
