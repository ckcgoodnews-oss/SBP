-- Enterprise IAM schema for Supabase
-- Run in Supabase SQL Editor after confirming the app has Supabase Auth enabled.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  address text,
  city text,
  state text,
  postal_code text,
  service_area text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  title text,
  phone text,
  status text not null default 'invited' check (status in ('invited','active','locked','disabled')),
  lock_reason text,
  last_login_at timestamptz,
  failed_login_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  is_system boolean not null default false,
  is_service_role boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null check (action in ('view','create','edit','delete','export','approve','assign','configure','admin')),
  description text,
  unique (module, action)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references public.app_users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists public.user_departments (
  user_id uuid not null references public.app_users(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  primary key (user_id, department_id)
);

create table if not exists public.user_locations (
  user_id uuid not null references public.app_users(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  primary key (user_id, location_id)
);

create table if not exists public.iam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  auth_session_id text,
  ip_address inet,
  user_agent text,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.app_users(id) on delete set null,
  name text not null,
  key_hash text not null,
  prefix text not null,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.app_users(id) on delete set null,
  target_user_id uuid references public.app_users(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.impersonation_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  admin_user_id uuid not null references public.app_users(id) on delete cascade,
  impersonated_user_id uuid not null references public.app_users(id) on delete cascade,
  reason text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  check (admin_user_id <> impersonated_user_id)
);

-- Permission seed
insert into public.permissions (module, action, description)
select module, action, initcap(module) || ' ' || action
from unnest(array[
  'dashboard','customers','jobs','dispatch','schedule','technicians','invoices','payments','inventory','warehouse','reports','settings','iam','audit','api_keys','locations','departments','service_accounts'
]) as module
cross join unnest(array['view','create','edit','delete','export','approve','assign','configure','admin']) as action
on conflict (module, action) do nothing;

-- System role templates. organization_id null means template/global system role.
insert into public.roles (organization_id, name, description, is_system, is_service_role) values
(null,'Owner','Full platform owner access',true,false),
(null,'Administrator','Full administrative access except ownership transfer',true,false),
(null,'General Manager','Operational and reporting management',true,false),
(null,'Operations Manager','Operations, scheduling, dispatch and technician management',true,false),
(null,'Dispatch Manager','Dispatch and scheduling management',true,false),
(null,'CSR','Customer service and appointment handling',true,false),
(null,'Technician','Field technician access',true,false),
(null,'Sales','Sales and customer pipeline access',true,false),
(null,'Accounting','Invoices, payments and financial reports',true,false),
(null,'Warehouse','Inventory and warehouse operations',true,false),
(null,'Customer','Customer portal access',true,false),
(null,'Vendor','Vendor-limited access',true,false),
(null,'Read Only','View-only access',true,false),
(null,'API Service Account','Integration/service account access',true,true)
on conflict (organization_id, name) do nothing;

-- Broad defaults: Owner/Admin receive all permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.organization_id is null and r.name in ('Owner','Administrator')
on conflict do nothing;

-- Read Only gets view permissions only.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.action='view'
where r.organization_id is null and r.name='Read Only'
on conflict do nothing;

create or replace function public.current_app_user_id()
returns uuid language sql stable security definer as $$
  select id from public.app_users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_org_id()
returns uuid language sql stable security definer as $$
  select organization_id from public.app_users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.has_permission(required_module text, required_action text)
returns boolean language sql stable security definer as $$
  select exists (
    select 1
    from public.app_users au
    join public.user_roles ur on ur.user_id = au.id
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where au.auth_user_id = auth.uid()
      and au.status = 'active'
      and p.module = required_module
      and (p.action = required_action or p.action = 'admin')
  );
$$;

alter table public.organizations enable row level security;
alter table public.departments enable row level security;
alter table public.locations enable row level security;
alter table public.app_users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_departments enable row level security;
alter table public.user_locations enable row level security;
alter table public.iam_sessions enable row level security;
alter table public.api_keys enable row level security;
alter table public.audit_log enable row level security;
alter table public.impersonation_grants enable row level security;

create policy org_select on public.organizations for select using (id = public.current_org_id() or public.has_permission('iam','admin'));
create policy org_update on public.organizations for update using (public.has_permission('iam','admin'));

create policy dept_org_access on public.departments for all using (organization_id = public.current_org_id() and public.has_permission('departments','view')) with check (organization_id = public.current_org_id() and public.has_permission('departments','configure'));
create policy loc_org_access on public.locations for all using (organization_id = public.current_org_id() and public.has_permission('locations','view')) with check (organization_id = public.current_org_id() and public.has_permission('locations','configure'));
create policy users_org_select on public.app_users for select using (organization_id = public.current_org_id() and public.has_permission('iam','view'));
create policy users_org_manage on public.app_users for all using (organization_id = public.current_org_id() and public.has_permission('iam','admin')) with check (organization_id = public.current_org_id() and public.has_permission('iam','admin'));
create policy roles_access on public.roles for select using (organization_id is null or organization_id = public.current_org_id());
create policy roles_manage on public.roles for all using ((organization_id = public.current_org_id() or organization_id is null) and public.has_permission('iam','configure')) with check ((organization_id = public.current_org_id() or organization_id is null) and public.has_permission('iam','configure'));
create policy permissions_read on public.permissions for select using (true);
create policy role_permissions_access on public.role_permissions for select using (public.has_permission('iam','view'));
create policy role_permissions_manage on public.role_permissions for all using (public.has_permission('iam','configure')) with check (public.has_permission('iam','configure'));
create policy user_role_access on public.user_roles for all using (public.has_permission('iam','view')) with check (public.has_permission('iam','assign'));
create policy user_scope_access on public.user_departments for all using (public.has_permission('iam','view')) with check (public.has_permission('iam','assign'));
create policy user_location_access on public.user_locations for all using (public.has_permission('iam','view')) with check (public.has_permission('iam','assign'));
create policy sessions_access on public.iam_sessions for select using (user_id = public.current_app_user_id() or public.has_permission('iam','admin'));
create policy api_keys_access on public.api_keys for all using (organization_id = public.current_org_id() and public.has_permission('api_keys','view')) with check (organization_id = public.current_org_id() and public.has_permission('api_keys','admin'));
create policy audit_read on public.audit_log for select using (organization_id = public.current_org_id() and public.has_permission('audit','view'));
create policy impersonation_access on public.impersonation_grants for all using (organization_id = public.current_org_id() and public.has_permission('iam','admin')) with check (organization_id = public.current_org_id() and public.has_permission('iam','admin'));
