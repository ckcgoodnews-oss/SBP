-- PATCH_006_fix_iam_tenant_schema.sql
-- Purpose: Fix IAM install error: column "organization_id" does not exist.
-- Use this for the SBP tenant-based schema that uses tenants / tenant_users / tenant_id.
-- Do NOT run the older organization_id-based 001_enterprise_iam.sql after this.

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1) Clean up policies from the earlier organization_id-based IAM draft if present
-- -----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.organizations') is not null then
    execute 'drop policy if exists org_select on public.organizations';
    execute 'drop policy if exists org_update on public.organizations';
  end if;

  if to_regclass('public.departments') is not null then
    execute 'drop policy if exists dept_org_access on public.departments';
    execute 'drop policy if exists departments read on public.departments';
    execute 'drop policy if exists departments manage on public.departments';
  end if;

  if to_regclass('public.locations') is not null then
    execute 'drop policy if exists loc_org_access on public.locations';
  end if;

  if to_regclass('public.app_users') is not null then
    execute 'drop policy if exists users_org_select on public.app_users';
    execute 'drop policy if exists users_org_manage on public.app_users';
  end if;

  if to_regclass('public.roles') is not null then
    execute 'drop policy if exists roles_access on public.roles';
    execute 'drop policy if exists roles_manage on public.roles';
  end if;

  if to_regclass('public.permissions') is not null then
    execute 'drop policy if exists permissions_read on public.permissions';
  end if;

  if to_regclass('public.role_permissions') is not null then
    execute 'drop policy if exists role_permissions_access on public.role_permissions';
    execute 'drop policy if exists role_permissions_manage on public.role_permissions';
  end if;

  if to_regclass('public.user_roles') is not null then
    execute 'drop policy if exists user_role_access on public.user_roles';
  end if;

  if to_regclass('public.user_departments') is not null then
    execute 'drop policy if exists user_scope_access on public.user_departments';
  end if;

  if to_regclass('public.user_locations') is not null then
    execute 'drop policy if exists user_location_access on public.user_locations';
  end if;

  if to_regclass('public.iam_sessions') is not null then
    execute 'drop policy if exists sessions_access on public.iam_sessions';
    execute 'drop policy if exists iam sessions read on public.iam_sessions';
  end if;

  if to_regclass('public.api_keys') is not null then
    execute 'drop policy if exists api_keys_access on public.api_keys';
    execute 'drop policy if exists api keys read on public.api_keys';
    execute 'drop policy if exists api keys manage on public.api_keys';
  end if;

  if to_regclass('public.audit_log') is not null then
    execute 'drop policy if exists audit_read on public.audit_log';
  end if;

  if to_regclass('public.impersonation_grants') is not null then
    execute 'drop policy if exists impersonation_access on public.impersonation_grants';
  end if;

  if to_regclass('public.impersonation_events') is not null then
    execute 'drop policy if exists impersonation events read on public.impersonation_events';
  end if;

  if to_regclass('public.service_accounts') is not null then
    execute 'drop policy if exists service accounts read on public.service_accounts';
    execute 'drop policy if exists service accounts manage on public.service_accounts';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2) Tenant-compatible IAM schema
-- -----------------------------------------------------------------------------

-- Strengthen tenant_users
alter table tenant_users add column if not exists auth_user_id uuid;
alter table tenant_users add column if not exists active boolean not null default true;
alter table tenant_users add column if not exists locked_until timestamptz;
alter table tenant_users add column if not exists lock_reason text;
alter table tenant_users add column if not exists mfa_required boolean not null default false;
alter table tenant_users add column if not exists last_login_at timestamptz;
alter table tenant_users add column if not exists department_id uuid;
alter table tenant_users add column if not exists title text;
alter table tenant_users add column if not exists phone text;
alter table tenant_users add column if not exists updated_at timestamptz not null default now();

create unique index if not exists ux_tenant_users_tenant_email on tenant_users(tenant_id, email);
create index if not exists idx_tenant_users_auth_user_id on tenant_users(auth_user_id);
create index if not exists idx_tenant_users_department_id on tenant_users(department_id);

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists iam_role_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  display_name text not null,
  description text not null,
  default_permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists iam_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  role_key text not null,
  display_name text not null,
  description text,
  system_role boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, role_key)
);

create table if not exists iam_permissions (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  action_key text not null,
  display_name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (module_key, action_key)
);

create table if not exists iam_role_permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  role_id uuid not null references iam_roles(id) on delete cascade,
  permission_id uuid not null references iam_permissions(id) on delete cascade,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, role_id, permission_id)
);

create table if not exists tenant_user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  tenant_user_id uuid not null references tenant_users(id) on delete cascade,
  role_id uuid not null references iam_roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, tenant_user_id, role_id)
);

create table if not exists user_location_permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  tenant_user_id uuid not null references tenant_users(id) on delete cascade,
  service_location_id uuid references service_locations(id) on delete cascade,
  warehouse_id uuid references warehouses(id) on delete cascade,
  permission_scope text not null default 'allowed' check (permission_scope in ('allowed','denied')),
  created_at timestamptz not null default now()
);

create table if not exists iam_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  full_name text not null,
  role_key text not null,
  invitation_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_by_email text,
  created_at timestamptz not null default now()
);

create table if not exists iam_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  tenant_user_id uuid references tenant_users(id) on delete cascade,
  auth_user_id uuid,
  email text,
  ip_address text,
  user_agent text,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists impersonation_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  admin_user_id uuid references tenant_users(id),
  target_user_id uuid references tenant_users(id),
  reason text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists service_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  service_account_id uuid references service_accounts(id) on delete cascade,
  key_name text not null,
  key_prefix text not null,
  key_hash text not null,
  scopes jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique (tenant_id, key_prefix)
);

-- Compatibility helpers: creates tenant membership/role checks if not already present.
create or replace function public.is_tenant_member(check_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from tenant_users tu
    where tu.tenant_id = check_tenant_id
      and tu.auth_user_id = auth.uid()
      and coalesce(tu.active, true) = true
  );
$$;

create or replace function public.has_tenant_role(check_tenant_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from tenant_users tu
    join tenant_user_role_assignments tura on tura.tenant_user_id = tu.id and tura.tenant_id = tu.tenant_id
    join iam_roles r on r.id = tura.role_id and r.tenant_id = tu.tenant_id
    where tu.tenant_id = check_tenant_id
      and tu.auth_user_id = auth.uid()
      and coalesce(tu.active, true) = true
      and r.role_key = any(allowed_roles)
  );
$$;

-- RLS
alter table departments enable row level security;
alter table iam_role_templates enable row level security;
alter table iam_roles enable row level security;
alter table iam_permissions enable row level security;
alter table iam_role_permissions enable row level security;
alter table tenant_user_role_assignments enable row level security;
alter table user_location_permissions enable row level security;
alter table iam_invitations enable row level security;
alter table iam_sessions enable row level security;
alter table impersonation_events enable row level security;
alter table service_accounts enable row level security;
alter table api_keys enable row level security;

-- RLS policies
create policy "role templates readable" on iam_role_templates for select using (true);
create policy "permissions readable" on iam_permissions for select using (true);

create policy "departments read" on departments for select using (public.is_tenant_member(tenant_id));
create policy "departments manage" on departments for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager']));

create policy "iam roles read" on iam_roles for select using (public.is_tenant_member(tenant_id));
create policy "iam roles manage" on iam_roles for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "iam role permissions read" on iam_role_permissions for select using (public.is_tenant_member(tenant_id));
create policy "iam role permissions manage" on iam_role_permissions for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "user role assignments read" on tenant_user_role_assignments for select using (public.is_tenant_member(tenant_id));
create policy "user role assignments manage" on tenant_user_role_assignments for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "user location permissions read" on user_location_permissions for select using (public.is_tenant_member(tenant_id));
create policy "user location permissions manage" on user_location_permissions for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager']));

create policy "iam invitations read" on iam_invitations for select using (public.is_tenant_member(tenant_id));
create policy "iam invitations manage" on iam_invitations for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "iam sessions read" on iam_sessions for select using (public.is_tenant_member(tenant_id));

create policy "impersonation events read" on impersonation_events for select using (public.is_tenant_member(tenant_id));

create policy "service accounts read" on service_accounts for select using (public.is_tenant_member(tenant_id));
create policy "service accounts manage" on service_accounts for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "api keys read" on api_keys for select using (public.is_tenant_member(tenant_id));
create policy "api keys manage" on api_keys for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

-- Seed permissions
insert into iam_permissions (module_key, action_key, display_name, description)
select module_key, action_key, initcap(module_key) || ': ' || initcap(action_key), initcap(action_key) || ' access for ' || module_key
from unnest(array[
  'dashboard','crm','customers','jobs','dispatch','schedule','technicians','operations','financials','invoices','payments','inventory','warehouse','reports','settings','iam','audit','api_keys','locations','departments','service_accounts','portal_customer','portal_technician','integrations'
]) as module_key
cross join unnest(array['view','create','edit','delete','export','approve','assign','configure','admin']) as action_key
on conflict (module_key, action_key) do nothing;

insert into iam_role_templates (template_key, display_name, description, default_permissions)
values
('owner','Owner','Full business owner access','{"all": true}'::jsonb),
('admin','Administrator','Full administrative access','{"all": true}'::jsonb),
('general_manager','General Manager','Business-wide management access','{"operations":["view","create","edit","approve"],"crm":["view","create","edit"],"reports":["view","export"],"iam":["view"]}'::jsonb),
('operations_manager','Operations Manager','Operations, scheduling, dispatch, and technician management','{"operations":["view","create","edit","approve"],"dispatch":["view","create","edit"],"schedule":["view","create","edit"],"technicians":["view","assign"]}'::jsonb),
('dispatch_manager','Dispatch Manager','Dispatch and scheduling management','{"dispatch":["view","create","edit","assign"],"schedule":["view","create","edit"],"technicians":["view","assign"]}'::jsonb),
('csr','CSR','Customer service representative access','{"crm":["view","create","edit"],"customers":["view","create","edit"],"jobs":["view","create"],"schedule":["view"]}'::jsonb),
('technician','Technician','Field technician access','{"portal_technician":["view"],"jobs":["view","edit"],"schedule":["view"]}'::jsonb),
('sales','Sales','Sales and customer pipeline access','{"crm":["view","create","edit"],"customers":["view","create","edit"],"reports":["view"]}'::jsonb),
('accounting','Accounting','Financial access','{"financials":["view","create","edit","approve"],"invoices":["view","create","edit"],"payments":["view","create","edit"],"reports":["view","export"]}'::jsonb),
('warehouse','Warehouse','Inventory and warehouse operations','{"inventory":["view","create","edit"],"warehouse":["view","create","edit"]}'::jsonb),
('customer','Customer','Customer portal access','{"portal_customer":["view"]}'::jsonb),
('vendor','Vendor','Vendor-limited access','{"jobs":["view"],"inventory":["view"]}'::jsonb),
('readonly','Read Only','View-only access','{"view_only": true}'::jsonb),
('api_service_account','API Service Account','Integration and service account access','{"integrations":["view","edit"],"api_keys":["view","create","edit"]}'::jsonb)
on conflict (template_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    default_permissions = excluded.default_permissions;

-- Tenant roles from templates for every existing tenant.
insert into iam_roles (tenant_id, role_key, display_name, description, system_role)
select t.id, rt.template_key, rt.display_name, rt.description, true
from tenants t
cross join iam_role_templates rt
on conflict (tenant_id, role_key) do update
set display_name = excluded.display_name,
    description = excluded.description;

-- Demo/default departments for every existing tenant.
insert into departments (tenant_id, name, description)
select t.id, d.name, d.description
from tenants t
cross join (values
  ('Operations', 'Scheduling, dispatch, and field service'),
  ('Finance', 'Accounting and financial operations'),
  ('Customer Service', 'Customer intake and support')
) as d(name, description)
on conflict (tenant_id, name) do nothing;
