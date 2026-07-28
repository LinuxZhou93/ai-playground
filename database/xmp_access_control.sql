-- XMP 奇妙伙伴 · 多租户身份与最小权限控制面
-- 状态：本地评审/未来试点迁移脚本；不会被应用启动过程自动执行。
-- 写操作仅允许经服务端验证的 service_role API，不向浏览器开放直写。

create or replace function public.xmp_current_tenant_id()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'tenant_id',
    auth.jwt() -> 'user_metadata' ->> 'tenant_id'
  );
$$;

create or replace function public.xmp_current_access_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'xmp_role',
    auth.jwt() -> 'user_metadata' ->> 'xmp_role'
  );
$$;

create table if not exists public.xmp_tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in (
    'tenant-admin', 'research-lead', 'teacher', 'family', 'support', 'security-officer'
  )),
  campus_ids text[] not null default '{}',
  class_ids text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'suspended')),
  assurance_required text not null default 'mfa' check (
    assurance_required in ('password', 'mfa', 'device-bound')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.xmp_access_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  requester_id uuid not null references auth.users(id) on delete cascade,
  campus_id text not null check (char_length(campus_id) between 1 and 96),
  module text not null check (module in (
    'overview', 'curriculum', 'scheduling', 'classroom', 'companion',
    'growth', 'family', 'fleet', 'operations', 'governance', 'access'
  )),
  actions text[] not null check (cardinality(actions) between 1 and 6),
  reason text not null check (char_length(reason) between 8 and 600),
  risk text not null check (risk in ('standard', 'high')),
  status text not null default 'pending' check (status in (
    'pending', 'first-approved', 'active', 'denied', 'revoked', 'expired'
  )),
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  check (valid_until > valid_from),
  check (valid_until <= valid_from + interval '24 hours')
);

create table if not exists public.xmp_access_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  request_id uuid not null references public.xmp_access_requests(id) on delete restrict,
  approver_id uuid not null references auth.users(id) on delete restrict,
  approver_role text not null check (approver_role in ('tenant-admin', 'security-officer')),
  decision text not null check (decision in ('approved', 'denied')),
  decided_at timestamptz not null default now(),
  unique (request_id, approver_id)
);

create table if not exists public.xmp_access_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  request_id uuid not null unique references public.xmp_access_requests(id) on delete restrict,
  principal_id uuid not null references auth.users(id) on delete cascade,
  campus_id text not null check (char_length(campus_id) between 1 and 96),
  module text not null,
  actions text[] not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  check (valid_until > valid_from),
  check (valid_until <= valid_from + interval '24 hours')
);

create table if not exists public.xmp_access_audit (
  id uuid primary key,
  tenant_id text not null check (char_length(tenant_id) between 1 and 96),
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 128),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 3 and 96),
  target_ref text not null check (char_length(target_ref) between 1 and 160),
  outcome text not null check (outcome in ('accepted', 'rejected')),
  reason text not null check (char_length(reason) between 1 and 600),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create index if not exists xmp_memberships_tenant_user_idx
  on public.xmp_tenant_memberships (tenant_id, user_id, status);
create index if not exists xmp_access_requests_tenant_status_idx
  on public.xmp_access_requests (tenant_id, status, created_at desc);
create index if not exists xmp_access_grants_principal_time_idx
  on public.xmp_access_grants (tenant_id, principal_id, valid_until desc);
create index if not exists xmp_access_audit_tenant_time_idx
  on public.xmp_access_audit (tenant_id, occurred_at desc);

alter table public.xmp_tenant_memberships enable row level security;
alter table public.xmp_tenant_memberships force row level security;
alter table public.xmp_access_requests enable row level security;
alter table public.xmp_access_requests force row level security;
alter table public.xmp_access_approvals enable row level security;
alter table public.xmp_access_approvals force row level security;
alter table public.xmp_access_grants enable row level security;
alter table public.xmp_access_grants force row level security;
alter table public.xmp_access_audit enable row level security;
alter table public.xmp_access_audit force row level security;

revoke all on table public.xmp_tenant_memberships from anon, authenticated;
revoke all on table public.xmp_access_requests from anon, authenticated;
revoke all on table public.xmp_access_approvals from anon, authenticated;
revoke all on table public.xmp_access_grants from anon, authenticated;
revoke all on table public.xmp_access_audit from anon, authenticated;
grant select on table public.xmp_tenant_memberships to authenticated;
grant select on table public.xmp_access_requests to authenticated;
grant select on table public.xmp_access_approvals to authenticated;
grant select on table public.xmp_access_grants to authenticated;
grant select on table public.xmp_access_audit to authenticated;

drop policy if exists xmp_memberships_scoped_read on public.xmp_tenant_memberships;
create policy xmp_memberships_scoped_read
  on public.xmp_tenant_memberships for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and (
      user_id = auth.uid()
      or public.xmp_current_access_role() in ('tenant-admin', 'security-officer')
    )
  );

drop policy if exists xmp_access_requests_scoped_read on public.xmp_access_requests;
create policy xmp_access_requests_scoped_read
  on public.xmp_access_requests for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and (
      requester_id = auth.uid()
      or public.xmp_current_access_role() in ('tenant-admin', 'security-officer')
    )
  );

drop policy if exists xmp_access_approvals_scoped_read on public.xmp_access_approvals;
create policy xmp_access_approvals_scoped_read
  on public.xmp_access_approvals for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and (
      approver_id = auth.uid()
      or public.xmp_current_access_role() in ('tenant-admin', 'security-officer')
    )
  );

drop policy if exists xmp_access_grants_scoped_read on public.xmp_access_grants;
create policy xmp_access_grants_scoped_read
  on public.xmp_access_grants for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and (
      principal_id = auth.uid()
      or public.xmp_current_access_role() in ('tenant-admin', 'security-officer')
    )
  );

drop policy if exists xmp_access_audit_scoped_read on public.xmp_access_audit;
create policy xmp_access_audit_scoped_read
  on public.xmp_access_audit for select to authenticated
  using (
    tenant_id = public.xmp_current_tenant_id()
    and public.xmp_current_access_role() in ('tenant-admin', 'security-officer')
  );

create or replace function public.xmp_reject_access_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'xmp_access_audit is append-only';
end;
$$;

drop trigger if exists xmp_access_audit_no_update on public.xmp_access_audit;
create trigger xmp_access_audit_no_update
  before update or delete on public.xmp_access_audit
  for each row execute function public.xmp_reject_access_audit_mutation();

revoke all on function public.xmp_current_tenant_id() from public, anon;
revoke all on function public.xmp_current_access_role() from public, anon;
grant execute on function public.xmp_current_tenant_id() to authenticated;
grant execute on function public.xmp_current_access_role() to authenticated;

comment on table public.xmp_tenant_memberships is
  'XMP tenant membership and scoped role assignments; no child profile data.';
comment on table public.xmp_access_audit is
  'Append-only access decision evidence; never raw child identity, audio or video.';
