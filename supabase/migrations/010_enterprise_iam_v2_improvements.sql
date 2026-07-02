-- PATCH_010 / Enterprise IAM v2 improvements
-- Tenant-compatible, rerunnable Supabase/Postgres migration.
-- Safe for apps using tenants / tenant_users / tenant_id.
-- Run after PATCH_009 completed successfully.

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 0) Helper: add column only if missing
-- -----------------------------------------------------------------------------
create or replace function public._iam_add_column_if_missing(
  target_table text,
  target_column text,
  column_sql text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass('public.' || target_table) is not null then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = target_table
        and column_name = target_column
    ) then
      execute format('alter table public.%I add column %I %s', target_table, target_column, column_sql);
    end if;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1) Core tenant-aware tables
-- -----------------------------------------------------------------------------
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  auth_user_id uuid null references auth.users(id) on delete set null,
  email text not null,
  full_name text null,
  phone text null,
  title text null,
  role_id uuid null,
  status text not null default 'active' check (status in ('invited','active','disabled','locked','deleted')),
  is_service_account boolean not null default false,
  mfa_required boolean not null default false,
  last_login_at timestamptz null,
  failed_login_count integer not null default 0,
  locked_until timestamptz null,
  invited_at timestamptz null,
  invitation_accepted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, email)
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  code text null,
  description text null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, name)
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  code text null,
  address_line1 text null,
  address_line2 text null,
  city text null,
  state text null,
  postal_code text null,
  country text not null default 'US',
  service_area text null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, name)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null check (action in ('view','create','edit','delete','export','approve','assign','configure','admin')),
  description text null,
  created_at timestamptz not null default now(),
  unique(module, action)
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  name text not null,
  description text null,
  is_system_role boolean not null default false,
  is_service_role boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, name)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(role_id, permission_id)
);

create table if not exists public.user_departments (
  user_id uuid not null references public.app_users(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, department_id)
);

create table if not exists public.user_locations (
  user_id uuid not null references public.app_users(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, location_id)
);

create table if not exists public.iam_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  user_id uuid null references public.app_users(id) on delete set null,
  auth_user_id uuid null,
  ip_address inet null,
  user_agent text null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz null,
  revoked_by uuid null,
  revoke_reason text null
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  service_account_user_id uuid null references public.app_users(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  scopes text[] not null default '{}',
  expires_at timestamptz null,
  last_used_at timestamptz null,
  last_used_ip inet null,
  revoked_at timestamptz null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  unique(tenant_id, name),
  unique(key_prefix)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  actor_user_id uuid null,
  actor_auth_user_id uuid null,
  action text not null,
  entity_type text null,
  entity_id uuid null,
  old_values jsonb null,
  new_values jsonb null,
  metadata jsonb not null default '{}',
  ip_address inet null,
  user_agent text null,
  created_at timestamptz not null default now()
);

-- Compatibility columns for partially-installed tables.
select public._iam_add_column_if_missing('roles','tenant_id','uuid null');
select public._iam_add_column_if_missing('roles','is_system_role','boolean not null default false');
select public._iam_add_column_if_missing('roles','is_service_role','boolean not null default false');
select public._iam_add_column_if_missing('app_users','tenant_id','uuid null');
select public._iam_add_column_if_missing('app_users','role_id','uuid null');
select public._iam_add_column_if_missing('app_users','mfa_required','boolean not null default false');
select public._iam_add_column_if_missing('app_users','failed_login_count','integer not null default 0');
select public._iam_add_column_if_missing('app_users','locked_until','timestamptz null');

-- Add FKs after compatibility columns exist.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'app_users_role_id_fkey') then
    alter table public.app_users add constraint app_users_role_id_fkey foreign key(role_id) references public.roles(id) on delete set null;
  end if;
exception when duplicate_object then null;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2) Indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_app_users_tenant_id on public.app_users(tenant_id);
create index if not exists idx_app_users_auth_user_id on public.app_users(auth_user_id);
create index if not exists idx_roles_tenant_id on public.roles(tenant_id);
create index if not exists idx_permissions_module_action on public.permissions(module, action);
create index if not exists idx_departments_tenant_id on public.departments(tenant_id);
create index if not exists idx_locations_tenant_id on public.locations(tenant_id);
create index if not exists idx_audit_log_tenant_created on public.audit_log(tenant_id, created_at desc);
create index if not exists idx_iam_sessions_tenant_user on public.iam_sessions(tenant_id, user_id);
create index if not exists idx_api_keys_tenant_id on public.api_keys(tenant_id);

-- -----------------------------------------------------------------------------
-- 3) Tenant / role / permission functions
-- Keep parameter name target_tenant_id to avoid PostgreSQL 42P13 conflicts.
-- -----------------------------------------------------------------------------
create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_users au
    where au.tenant_id = target_tenant_id
      and au.auth_user_id = auth.uid()
      and au.status in ('active','invited')
  )
  or exists (
    select 1
    from information_schema.tables t
    where t.table_schema = 'public' and t.table_name = 'tenant_users'
  ) and exists (
    select 1 from public.tenant_users tu
    where tu.tenant_id = target_tenant_id
      and tu.user_id = auth.uid()
  );
$$;

create or replace function public.has_tenant_role(target_tenant_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users au
    join public.roles r on r.id = au.role_id
    where au.tenant_id = target_tenant_id
      and au.auth_user_id = auth.uid()
      and au.status = 'active'
      and lower(r.name) = any(select lower(x) from unnest(allowed_roles) x)
  )
  or exists (
    select 1
    from information_schema.tables t
    where t.table_schema = 'public' and t.table_name = 'tenant_users'
  ) and exists (
    select 1 from public.tenant_users tu
    where tu.tenant_id = target_tenant_id
      and tu.user_id = auth.uid()
      and lower(coalesce(tu.role,'')) = any(select lower(x) from unnest(allowed_roles) x)
  );
$$;

create or replace function public.has_role(target_role text, target_tenant_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users au
    join public.roles r on r.id = au.role_id
    where au.auth_user_id = auth.uid()
      and au.status = 'active'
      and (target_tenant_id is null or au.tenant_id = target_tenant_id)
      and lower(r.name) = lower(target_role)
  );
$$;

create or replace function public.has_permission(target_module text, target_action text, target_tenant_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users au
    join public.roles r on r.id = au.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where au.auth_user_id = auth.uid()
      and au.status = 'active'
      and (target_tenant_id is null or au.tenant_id = target_tenant_id)
      and p.module = target_module
      and (p.action = target_action or p.action = 'admin')
  );
$$;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.app_users where auth_user_id = auth.uid() and status = 'active' limit 1;
$$;

-- -----------------------------------------------------------------------------
-- 4) Seed permissions and role templates
-- -----------------------------------------------------------------------------
with modules(module) as (
  values
  ('dashboard'),('customers'),('jobs'),('dispatch'),('schedule'),('technicians'),
  ('invoices'),('payments'),('inventory'),('warehouse'),('reports'),('settings'),
  ('iam'),('audit'),('api_keys'),('locations'),('departments'),('service_accounts'),
  ('organizations'),('roles'),('permissions'),('sessions'),('mfa'),('impersonation')
), actions(action) as (
  values ('view'),('create'),('edit'),('delete'),('export'),('approve'),('assign'),('configure'),('admin')
)
insert into public.permissions(module, action, description)
select m.module, a.action, initcap(m.module) || ' / ' || initcap(a.action)
from modules m cross join actions a
on conflict(module, action) do nothing;

insert into public.roles(tenant_id, name, description, is_system_role, is_service_role)
values
(null,'Owner','Full platform owner access',true,false),
(null,'Administrator','Full administrative access excluding owner-only controls',true,false),
(null,'General Manager','Cross-department management access',true,false),
(null,'Operations Manager','Operations, dispatch, jobs, technicians, reports',true,false),
(null,'Dispatch Manager','Dispatch and scheduling management',true,false),
(null,'CSR','Customer service and job intake',true,false),
(null,'Technician','Technician field access',true,false),
(null,'Sales','Customer and estimate-oriented access',true,false),
(null,'Accounting','Invoice, payment, and reporting access',true,false),
(null,'Warehouse','Inventory and warehouse access',true,false),
(null,'Customer','Customer portal access',true,false),
(null,'Vendor','Vendor-facing limited access',true,false),
(null,'Read Only','Read-only access',true,false),
(null,'API Service Account','Service integration account',true,true)
on conflict(tenant_id, name) do nothing;

-- Owner/Admin/API get broad permissions.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.tenant_id is null
  and r.name in ('Owner','Administrator','API Service Account')
on conflict do nothing;

-- Read Only gets view permissions.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.action = 'view'
where r.tenant_id is null and r.name = 'Read Only'
on conflict do nothing;

-- Operational templates.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.module in ('dashboard','customers','jobs','dispatch','schedule','technicians','reports','locations')
where r.tenant_id is null and r.name in ('General Manager','Operations Manager')
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.module in ('dashboard','dispatch','schedule','technicians','jobs')
where r.tenant_id is null and r.name = 'Dispatch Manager'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.module in ('dashboard','customers','jobs','schedule') and p.action in ('view','create','edit')
where r.tenant_id is null and r.name = 'CSR'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.module in ('dashboard','jobs','schedule','inventory') and p.action in ('view','edit')
where r.tenant_id is null and r.name = 'Technician'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.module in ('dashboard','customers','jobs','reports') and p.action in ('view','create','edit','export')
where r.tenant_id is null and r.name = 'Sales'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.module in ('dashboard','invoices','payments','reports','customers')
where r.tenant_id is null and r.name = 'Accounting'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.module in ('dashboard','inventory','warehouse','reports')
where r.tenant_id is null and r.name = 'Warehouse'
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- 5) Audit helpers and trigger
-- -----------------------------------------------------------------------------
create or replace function public.iam_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['app_users','departments','locations','roles'] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.iam_touch_updated_at()', t, t);
  end loop;
end;
$$;

create or replace function public.iam_audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_tenant uuid;
  actor uuid;
begin
  actor := public.current_app_user_id();
  row_tenant := coalesce((to_jsonb(new)->>'tenant_id')::uuid, (to_jsonb(old)->>'tenant_id')::uuid);

  insert into public.audit_log(tenant_id, actor_user_id, actor_auth_user_id, action, entity_type, entity_id, old_values, new_values)
  values (
    row_tenant,
    actor,
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['app_users','departments','locations','roles','api_keys'] loop
    execute format('drop trigger if exists trg_%I_audit on public.%I', t, t);
    execute format('create trigger trg_%I_audit after insert or update or delete on public.%I for each row execute function public.iam_audit_row_change()', t, t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6) RLS policies
-- -----------------------------------------------------------------------------
alter table public.app_users enable row level security;
alter table public.departments enable row level security;
alter table public.locations enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_departments enable row level security;
alter table public.user_locations enable row level security;
alter table public.iam_sessions enable row level security;
alter table public.api_keys enable row level security;
alter table public.audit_log enable row level security;

do $$
declare item record;
begin
  for item in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('app_users','departments','locations','permissions','roles','role_permissions','user_departments','user_locations','iam_sessions','api_keys','audit_log')
      and policyname like 'iam_v2_%'
  loop
    execute format('drop policy if exists %I on %I.%I', item.policyname, item.schemaname, item.tablename);
  end loop;
end;
$$;

create policy "iam_v2_app_users_read" on public.app_users
for select using (auth_user_id = auth.uid() or public.is_tenant_member(tenant_id));

create policy "iam_v2_app_users_manage" on public.app_users
for all using (public.has_permission('iam','admin',tenant_id) or public.has_permission('iam','edit',tenant_id))
with check (public.has_permission('iam','admin',tenant_id) or public.has_permission('iam','edit',tenant_id));

create policy "iam_v2_departments_read" on public.departments
for select using (public.is_tenant_member(tenant_id));
create policy "iam_v2_departments_manage" on public.departments
for all using (public.has_permission('departments','admin',tenant_id) or public.has_permission('departments','edit',tenant_id))
with check (public.has_permission('departments','admin',tenant_id) or public.has_permission('departments','edit',tenant_id));

create policy "iam_v2_locations_read" on public.locations
for select using (public.is_tenant_member(tenant_id));
create policy "iam_v2_locations_manage" on public.locations
for all using (public.has_permission('locations','admin',tenant_id) or public.has_permission('locations','edit',tenant_id))
with check (public.has_permission('locations','admin',tenant_id) or public.has_permission('locations','edit',tenant_id));

create policy "iam_v2_permissions_read" on public.permissions
for select using (auth.role() = 'authenticated');

create policy "iam_v2_roles_read" on public.roles
for select using (tenant_id is null or public.is_tenant_member(tenant_id));
create policy "iam_v2_roles_manage" on public.roles
for all using (tenant_id is null or public.has_permission('roles','admin',tenant_id) or public.has_permission('roles','edit',tenant_id))
with check (tenant_id is null or public.has_permission('roles','admin',tenant_id) or public.has_permission('roles','edit',tenant_id));

create policy "iam_v2_role_permissions_read" on public.role_permissions
for select using (true);
create policy "iam_v2_role_permissions_manage" on public.role_permissions
for all using (
  exists (select 1 from public.roles r where r.id = role_id and (r.tenant_id is null or public.has_permission('permissions','admin',r.tenant_id)))
)
with check (
  exists (select 1 from public.roles r where r.id = role_id and (r.tenant_id is null or public.has_permission('permissions','admin',r.tenant_id)))
);

create policy "iam_v2_user_departments_read" on public.user_departments
for select using (exists (select 1 from public.app_users au where au.id = user_id and public.is_tenant_member(au.tenant_id)));
create policy "iam_v2_user_departments_manage" on public.user_departments
for all using (exists (select 1 from public.app_users au where au.id = user_id and public.has_permission('departments','assign',au.tenant_id)))
with check (exists (select 1 from public.app_users au where au.id = user_id and public.has_permission('departments','assign',au.tenant_id)));

create policy "iam_v2_user_locations_read" on public.user_locations
for select using (exists (select 1 from public.app_users au where au.id = user_id and public.is_tenant_member(au.tenant_id)));
create policy "iam_v2_user_locations_manage" on public.user_locations
for all using (exists (select 1 from public.app_users au where au.id = user_id and public.has_permission('locations','assign',au.tenant_id)))
with check (exists (select 1 from public.app_users au where au.id = user_id and public.has_permission('locations','assign',au.tenant_id)));

create policy "iam_v2_sessions_read" on public.iam_sessions
for select using (auth_user_id = auth.uid() or public.has_permission('sessions','view',tenant_id));
create policy "iam_v2_sessions_manage" on public.iam_sessions
for all using (public.has_permission('sessions','admin',tenant_id))
with check (public.has_permission('sessions','admin',tenant_id));

create policy "iam_v2_api_keys_read" on public.api_keys
for select using (public.has_permission('api_keys','view',tenant_id));
create policy "iam_v2_api_keys_manage" on public.api_keys
for all using (public.has_permission('api_keys','admin',tenant_id) or public.has_permission('api_keys','configure',tenant_id))
with check (public.has_permission('api_keys','admin',tenant_id) or public.has_permission('api_keys','configure',tenant_id));

create policy "iam_v2_audit_read" on public.audit_log
for select using (public.has_permission('audit','view',tenant_id) or actor_auth_user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7) Verification result
-- -----------------------------------------------------------------------------
select 'Enterprise IAM v2 improvements installed' as status,
       (select count(*) from public.permissions) as permission_count,
       (select count(*) from public.roles where tenant_id is null) as system_role_count;
