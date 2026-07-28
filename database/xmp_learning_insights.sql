-- XMP 奇妙伙伴 · 智慧学情与教学洞察（本地迁移草案）
-- 目标：跨课堂比较教学策略，不建立儿童画像，不存原始音视频，不允许浏览器直写。

create table if not exists public.xmp_teaching_inquiries (
  id uuid primary key,
  tenant_id text not null,
  campus_id text not null,
  class_ref text not null,
  course_ref text not null,
  question text not null check (char_length(question) between 12 and 300),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.xmp_aggregate_lesson_metrics (
  id uuid primary key,
  tenant_id text not null,
  inquiry_id uuid not null references public.xmp_teaching_inquiries(id),
  session_ref text not null,
  strategy_label text not null,
  coverage_percent numeric(5,2) not null check (coverage_percent between 0 and 100),
  anonymous_participation_percent numeric(5,2) check (anonymous_participation_percent between 0 and 100),
  evidence_use_percent numeric(5,2) check (evidence_use_percent between 0 and 100),
  teacher_confirmed_fact_count integer not null default 0 check (teacher_confirmed_fact_count >= 0),
  source_kinds text[] not null check (cardinality(source_kinds) >= 1),
  observed_at timestamptz not null,
  expires_at timestamptz not null default (now() + interval '90 days'),
  constraint xmp_no_child_identifier_columns check (
    session_ref !~* '(child|student|face|name|phone|identity)'
  )
);

create table if not exists public.xmp_teaching_hypotheses (
  id uuid primary key,
  tenant_id text not null,
  inquiry_id uuid not null references public.xmp_teaching_inquiries(id),
  statement text not null,
  evidence_refs uuid[] not null check (cardinality(evidence_refs) >= 2),
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  limitation text not null,
  review_state text not null default 'candidate' check (
    review_state in ('candidate', 'accepted', 'dismissed', 'blocked')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.xmp_teacher_insight_decisions (
  id uuid primary key,
  tenant_id text not null,
  hypothesis_id uuid not null references public.xmp_teaching_hypotheses(id),
  teacher_id uuid not null,
  decision text not null check (decision in ('accepted', 'dismissed')),
  rationale text not null,
  decided_at timestamptz not null default now()
);

create table if not exists public.xmp_next_lesson_adjustments (
  id uuid primary key,
  tenant_id text not null,
  inquiry_id uuid not null references public.xmp_teaching_inquiries(id),
  accepted_hypothesis_id uuid not null references public.xmp_teaching_hypotheses(id),
  target_lesson_ref text not null,
  teacher_authored_action text not null check (char_length(teacher_authored_action) between 18 and 1200),
  publish_state text not null default 'draft' check (publish_state = 'draft'),
  teacher_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.xmp_teaching_inquiries enable row level security;
alter table public.xmp_aggregate_lesson_metrics enable row level security;
alter table public.xmp_teaching_hypotheses enable row level security;
alter table public.xmp_teacher_insight_decisions enable row level security;
alter table public.xmp_next_lesson_adjustments enable row level security;

revoke all on public.xmp_teaching_inquiries from anon, authenticated;
revoke all on public.xmp_aggregate_lesson_metrics from anon, authenticated;
revoke all on public.xmp_teaching_hypotheses from anon, authenticated;
revoke all on public.xmp_teacher_insight_decisions from anon, authenticated;
revoke all on public.xmp_next_lesson_adjustments from anon, authenticated;

-- 所有写入由受保护的服务端命令完成；前端只获得当前租户的脱敏投影。
create index if not exists xmp_lesson_metrics_inquiry_idx
  on public.xmp_aggregate_lesson_metrics (tenant_id, inquiry_id, observed_at desc);
create index if not exists xmp_hypotheses_inquiry_idx
  on public.xmp_teaching_hypotheses (tenant_id, inquiry_id, created_at desc);

-- 聚合课堂信号按留存策略自动清理；教师判断与下一课调整作为教研审计记录保留。
create or replace function public.xmp_purge_expired_lesson_metrics()
returns bigint language plpgsql security definer set search_path = public as $$
declare removed bigint;
begin
  delete from public.xmp_aggregate_lesson_metrics where expires_at <= now();
  get diagnostics removed = row_count;
  return removed;
end;
$$;
