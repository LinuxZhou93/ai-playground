-- XMP 奇妙伙伴 · 追加式教学事件链
-- 设计目标：服务端租户注入、幂等追加、无浏览器直写、受控留存删除。
-- 本文件仅作为本地评审/未来迁移脚本，不会被应用启动过程自动执行。

create table if not exists public.xmp_events (
  id uuid primary key,
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  correlation_id text not null check (
    char_length(correlation_id) between 8 and 96
    and correlation_id ~ '^[A-Za-z0-9._:-]+$'
  ),
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 128),
  kind text not null check (kind in (
    'classroom.started', 'classroom.paused', 'classroom.adjusted',
    'schedule.adjusted', 'schedule.validated', 'schedule.published', 'schedule.rolled_back',
    'teaching.prepared', 'teaching.started', 'teaching.cue_decided', 'teaching.evidence_confirmed', 'teaching.reflection_signed',
    'insight.generated', 'insight.reviewed', 'insight.applied',
    'strategy.candidate_imported', 'strategy.approved', 'strategy.adapted',
    'orchestration.session_aligned', 'orchestration.signal_formed', 'orchestration.intervention_decided', 'orchestration.intervention_applied',
    'evidence.candidate', 'evidence.approved', 'evidence.rejected',
    'family.dispatched', 'family.feedback_candidate', 'family.feedback_rejected',
    'device.degraded', 'device.diagnostic_completed', 'device.recovered',
    'access.requested', 'access.approved', 'access.granted', 'access.revoked', 'access.session_revoked'
  )),
  domain text not null check (domain in ('classroom', 'scheduling', 'teaching', 'insights', 'strategies', 'orchestration', 'growth', 'family', 'fleet', 'access')),
  title text not null check (char_length(title) between 1 and 120),
  detail text not null check (char_length(detail) between 1 and 600),
  actor_label text not null check (char_length(actor_label) between 1 and 80),
  entity_ref text not null check (char_length(entity_ref) between 1 and 120),
  privacy_level text not null check (
    privacy_level in ('anonymous', 'aggregate', 'teacher-reviewed')
  ),
  source text not null default 'local-interaction' check (
    source in ('local-interaction', 'server-sync')
  ),
  payload_version smallint not null default 1 check (payload_version = 1),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  expires_at timestamptz generated always as (
    occurred_at + case privacy_level
      when 'anonymous' then interval '30 days'
      when 'aggregate' then interval '90 days'
      else interval '180 days'
    end
  ) stored,
  constraint xmp_events_tenant_idempotency_unique unique (tenant_id, idempotency_key),
  constraint xmp_events_kind_domain_consistent check (
    (kind like 'classroom.%' and domain = 'classroom')
    or (kind like 'schedule.%' and domain = 'scheduling')
    or (kind like 'teaching.%' and domain = 'teaching')
    or (kind like 'insight.%' and domain = 'insights')
    or (kind like 'strategy.%' and domain = 'strategies')
    or (kind like 'orchestration.%' and domain = 'orchestration')
    or (kind like 'evidence.%' and domain = 'growth')
    or (kind like 'family.%' and domain = 'family')
    or (kind like 'device.%' and domain = 'fleet')
    or (kind like 'access.%' and domain = 'access')
  )
);

create index if not exists xmp_events_tenant_correlation_time_idx
  on public.xmp_events (tenant_id, correlation_id, occurred_at desc);
create index if not exists xmp_events_tenant_received_idx
  on public.xmp_events (tenant_id, received_at desc);
create index if not exists xmp_events_expiry_idx
  on public.xmp_events (expires_at);

alter table public.xmp_events enable row level security;
alter table public.xmp_events force row level security;

revoke all on table public.xmp_events from anon, authenticated;
grant select on table public.xmp_events to authenticated;

drop policy if exists xmp_events_tenant_read on public.xmp_events;
create policy xmp_events_tenant_read
  on public.xmp_events
  for select
  to authenticated
  using (
    tenant_id = coalesce(
      auth.jwt() -> 'app_metadata' ->> 'tenant_id',
      auth.jwt() -> 'user_metadata' ->> 'tenant_id'
    )
  );

-- service_role 仍可通过受保护 API 追加；即使使用高权限客户端，也不允许改写历史。
create or replace function public.xmp_reject_event_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'xmp_events is append-only';
end;
$$;

drop trigger if exists xmp_events_no_update on public.xmp_events;
create trigger xmp_events_no_update
  before update on public.xmp_events
  for each row execute function public.xmp_reject_event_update();

-- 删除只允许由调度器以 service_role 执行该留存函数，不开放给 Web 角色。
create or replace function public.xmp_purge_expired_events()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
begin
  delete from public.xmp_events where expires_at <= now();
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.xmp_purge_expired_events() from public, anon, authenticated;
grant execute on function public.xmp_purge_expired_events() to service_role;

comment on table public.xmp_events is
  'XMP tenant-scoped append-only operational events; never raw child audio/video or child profiles.';
