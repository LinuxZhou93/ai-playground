-- XMP 奇妙伙伴 · 教学策略资产库（本地迁移草案）
-- 策略来自教师验证的教学洞察，经独立教研审核后方可复用；复用只生成课程草稿。

create table if not exists public.xmp_teaching_strategies (
  id uuid primary key,
  tenant_id text not null,
  source_inquiry_id uuid not null references public.xmp_teaching_inquiries(id),
  source_insight_ref text not null,
  version text not null,
  title text not null check (char_length(title) between 4 and 120),
  teaching_problem text not null check (char_length(teaching_problem) between 12 and 500),
  pattern text not null check (char_length(pattern) between 18 and 1200),
  teacher_moves jsonb not null check (jsonb_typeof(teacher_moves) = 'array'),
  observable_signals jsonb not null check (jsonb_typeof(observable_signals) = 'array'),
  age_bands text[] not null,
  suitable_moments text[] not null,
  limitation text not null check (char_length(limitation) between 12 and 600),
  author_id uuid not null,
  status text not null check (
    status in ('candidate', 'in-review', 'approved', 'changes-requested', 'retired')
  ),
  created_at timestamptz not null default now(),
  constraint xmp_strategy_source_unique unique (tenant_id, source_insight_ref)
);

create table if not exists public.xmp_strategy_evidence_refs (
  id uuid primary key,
  tenant_id text not null,
  strategy_id uuid not null references public.xmp_teaching_strategies(id),
  aggregate_lesson_metric_id uuid references public.xmp_aggregate_lesson_metrics(id),
  teacher_evidence_ref text,
  evidence_kind text not null check (
    evidence_kind in ('anonymous-aggregate', 'teacher-confirmed')
  ),
  coverage_percent numeric(5,2) not null check (coverage_percent between 0 and 100),
  created_at timestamptz not null default now(),
  constraint xmp_strategy_evidence_has_source check (
    aggregate_lesson_metric_id is not null or teacher_evidence_ref is not null
  )
);

create table if not exists public.xmp_strategy_review_decisions (
  id uuid primary key,
  tenant_id text not null,
  strategy_id uuid not null references public.xmp_teaching_strategies(id),
  reviewer_id uuid not null,
  decision text not null check (decision in ('approved', 'changes-requested')),
  rationale text not null check (char_length(rationale) between 12 and 600),
  decided_at timestamptz not null default now()
);

create table if not exists public.xmp_strategy_course_adaptations (
  id uuid primary key,
  tenant_id text not null,
  strategy_id uuid not null references public.xmp_teaching_strategies(id),
  source_course_version_id text not null,
  target_course_draft_id text not null,
  target_phase_id text not null,
  age_band text not null,
  teacher_authored_action text not null check (
    char_length(teacher_authored_action) between 18 and 1200
  ),
  publish_state text not null default 'draft' check (publish_state = 'draft'),
  revalidation_required boolean not null default true check (revalidation_required),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint xmp_strategy_course_draft_unique unique (tenant_id, target_course_draft_id)
);

alter table public.xmp_teaching_strategies enable row level security;
alter table public.xmp_strategy_evidence_refs enable row level security;
alter table public.xmp_strategy_review_decisions enable row level security;
alter table public.xmp_strategy_course_adaptations enable row level security;

revoke all on public.xmp_teaching_strategies from anon, authenticated;
revoke all on public.xmp_strategy_evidence_refs from anon, authenticated;
revoke all on public.xmp_strategy_review_decisions from anon, authenticated;
revoke all on public.xmp_strategy_course_adaptations from anon, authenticated;

create index if not exists xmp_strategies_tenant_status_idx
  on public.xmp_teaching_strategies (tenant_id, status, created_at desc);
create index if not exists xmp_strategy_evidence_strategy_idx
  on public.xmp_strategy_evidence_refs (tenant_id, strategy_id, created_at desc);
create index if not exists xmp_strategy_adaptation_strategy_idx
  on public.xmp_strategy_course_adaptations (tenant_id, strategy_id, created_at desc);

-- 浏览器无直写权限。服务端命令必须校验：
-- 1. 候选策略来自教师已接受、编辑并应用的洞察；
-- 2. 至少两节课堂覆盖率 >= 70%；
-- 3. reviewer_id 与 author_id 分离；
-- 4. 只有 approved 策略可创建 draft 适配，且不得自动发布。
