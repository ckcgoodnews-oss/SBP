-- ENTERPRISE_IAM_BASELINE_CORRECTED.sql
-- Clean consolidated Enterprise IAM baseline for the SBP tenant-based schema.
-- Use this instead of the earlier PATCH_005 through PATCH_011 chain for new installs.
--
-- Expected core tables already present:
--   tenants, tenant_users, departments, service_locations, audit_logs,
--   api_keys, service_accounts, impersonation_events
--
-- This baseline is tenant-based. It does NOT use organization_id or iam_sessions.user_id.
-- Main identity record: public.tenant_users
-- Supabase Auth link: public.tenant_users.auth_user_id
-- Session link: public.iam_sessions.tenant_user_id
--
-- Safe to rerun.

create extension if not exists "pgcrypto";


-- -----------------------------------------------------------------------------
-- 0) Create IAM tables if they do not already exist
-- -----------------------------------------------------------------------------
create table if not exists public.iam_role_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  display_name text not null,
  description text,
  default_permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.iam_permissions (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  action_key text not null,
  display_name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.iam_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  role_key text not null,
  display_name text not null,
  description text,
  system_role boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.iam_role_permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  role_id uuid not null,
  permission_id uuid not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  tenant_user_id uuid not null,
  role_id uuid not null,
  assigned_by_tenant_user_id uuid,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.iam_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  tenant_user_id uuid,
  auth_user_id uuid,
  ip_address inet,
  user_agent text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by_tenant_user_id uuid,
  revoke_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.iam_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  email text not null,
  invited_by_tenant_user_id uuid,
  role_id uuid,
  token_hash text,
  status text not null default 'pending',
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.impersonation_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  actor_tenant_user_id uuid,
  target_tenant_user_id uuid,
  reason text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.service_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  description text,
  active boolean not null default true,
  created_by_tenant_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  service_account_id uuid,
  key_name text,
  key_prefix text,
  key_hash text,
  scopes jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  expires_at timestamptz,
  last_used_at timestamptz,
  last_used_ip inet,
  revoked_at timestamptz,
  created_by_tenant_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_location_permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  tenant_user_id uuid not null,
  service_location_id uuid,
  warehouse_id uuid,
  can_view boolean not null default true,
  can_manage boolean not null default false,
  created_at timestamptz not null default now()
);

-- Columns required by this baseline. These ALTERs are safe on existing tables.
alter table public.iam_role_templates add column if not exists template_key text;
alter table public.iam_role_templates add column if not exists display_name text;
alter table public.iam_role_templates add column if not exists description text;
alter table public.iam_role_templates add column if not exists default_permissions jsonb not null default '{}'::jsonb;

alter table public.iam_permissions add column if not exists module_key text;
alter table public.iam_permissions add column if not exists action_key text;
alter table public.iam_permissions add column if not exists display_name text;
alter table public.iam_permissions add column if not exists description text;

alter table public.iam_roles add column if not exists tenant_id uuid;
alter table public.iam_roles add column if not exists role_key text;
alter table public.iam_roles add column if not exists display_name text;
alter table public.iam_roles add column if not exists description text;
alter table public.iam_roles add column if not exists system_role boolean not null default false;
alter table public.iam_roles add column if not exists active boolean not null default true;

alter table public.iam_role_permissions add column if not exists tenant_id uuid;
alter table public.iam_role_permissions add column if not exists role_id uuid;
alter table public.iam_role_permissions add column if not exists permission_id uuid;
alter table public.iam_role_permissions add column if not exists allowed boolean not null default true;

alter table public.tenant_user_role_assignments add column if not exists tenant_id uuid;
alter table public.tenant_user_role_assignments add column if not exists tenant_user_id uuid;
alter table public.tenant_user_role_assignments add column if not exists role_id uuid;
alter table public.tenant_user_role_assignments add column if not exists assigned_by_tenant_user_id uuid;
alter table public.tenant_user_role_assignments add column if not exists assigned_at timestamptz not null default now();

create unique index if not exists ux_iam_role_templates_template_key on public.iam_role_templates(template_key);
create unique index if not exists ux_iam_permissions_module_action on public.iam_permissions(module_key, action_key);
create unique index if not exists ux_iam_roles_tenant_role_key on public.iam_roles(tenant_id, role_key);
create unique index if not exists ux_iam_role_permissions_tenant_role_permission on public.iam_role_permissions(tenant_id, role_id, permission_id);
create unique index if not exists ux_tenant_user_role_assignments_unique on public.tenant_user_role_assignments(tenant_id, tenant_user_id, role_id);


-- -----------------------------------------------------------------------------
-- 1) Compatibility columns on existing IAM tables
-- -----------------------------------------------------------------------------
alter table public.tenant_users add column if not exists auth_user_id uuid;
alter table public.tenant_users add column if not exists active boolean not null default true;
alter table public.tenant_users add column if not exists locked_until timestamptz;
alter table public.tenant_users add column if not exists lock_reason text;
alter table public.tenant_users add column if not exists mfa_required boolean not null default false;
alter table public.tenant_users add column if not exists last_login_at timestamptz;
alter table public.tenant_users add column if not exists failed_login_count integer not null default 0;
alter table public.tenant_users add column if not exists department_id uuid;
alter table public.tenant_users add column if not exists title text;
alter table public.tenant_users add column if not exists phone text;
alter table public.tenant_users add column if not exists updated_at timestamptz not null default now();

alter table public.iam_sessions add column if not exists tenant_id uuid;
alter table public.iam_sessions add column if not exists tenant_user_id uuid;
alter table public.iam_sessions add column if not exists auth_user_id uuid;
alter table public.iam_sessions add column if not exists ip_address inet;
alter table public.iam_sessions add column if not exists user_agent text;
alter table public.iam_sessions add column if not exists started_at timestamptz not null default now();
alter table public.iam_sessions add column if not exists last_seen_at timestamptz not null default now();
alter table public.iam_sessions add column if not exists revoked_at timestamptz;
alter table public.iam_sessions add column if not exists revoked_by_tenant_user_id uuid;
alter table public.iam_sessions add column if not exists revoke_reason text;

alter table public.audit_logs add column if not exists tenant_id uuid;
alter table public.audit_logs add column if not exists actor_tenant_user_id uuid;
alter table public.audit_logs add column if not exists actor_user_id uuid;
alter table public.audit_logs add column if not exists actor_auth_user_id uuid;
alter table public.audit_logs add column if not exists action text;
alter table public.audit_logs add column if not exists entity_type text;
alter table public.audit_logs add column if not exists entity_id uuid;
alter table public.audit_logs add column if not exists old_values jsonb;
alter table public.audit_logs add column if not exists new_values jsonb;
alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.audit_logs add column if not exists ip_address inet;
alter table public.audit_logs add column if not exists user_agent text;
alter table public.audit_logs add column if not exists created_at timestamptz not null default now();

-- Existing api_keys table uses key_name/service_account_id/key_hash/scopes/active.
alter table public.api_keys add column if not exists last_used_at timestamptz;
alter table public.api_keys add column if not exists last_used_ip inet;
alter table public.api_keys add column if not exists revoked_at timestamptz;
alter table public.api_keys add column if not exists created_by_tenant_user_id uuid;

-- -----------------------------------------------------------------------------
-- 2) Indexes: tenant_user_id, not user_id
-- -----------------------------------------------------------------------------
create unique index if not exists ux_tenant_users_tenant_email on public.tenant_users(tenant_id, email);
create index if not exists idx_tenant_users_auth_user_id on public.tenant_users(auth_user_id);
create index if not exists idx_tenant_users_department_id on public.tenant_users(department_id);
create index if not exists idx_iam_roles_tenant_key on public.iam_roles(tenant_id, role_key);
create index if not exists idx_iam_permissions_module_action on public.iam_permissions(module_key, action_key);
create index if not exists idx_role_permissions_tenant_role on public.iam_role_permissions(tenant_id, role_id);
create index if not exists idx_tenant_user_role_assignments_user on public.tenant_user_role_assignments(tenant_id, tenant_user_id);
create index if not exists idx_iam_sessions_tenant_user on public.iam_sessions(tenant_id, tenant_user_id);
create index if not exists idx_audit_logs_tenant_created on public.audit_logs(tenant_id, created_at desc);
create index if not exists idx_api_keys_tenant_id on public.api_keys(tenant_id);

-- -----------------------------------------------------------------------------
-- 3) Functions fitted to tenant_users / tenant_user_role_assignments
-- Parameter names keep target_tenant_id to avoid PostgreSQL 42P13 conflicts.
-- -----------------------------------------------------------------------------
drop function if exists public.current_tenant_user_id(uuid);
create or replace function public.current_tenant_user_id(target_tenant_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tu.id
  from public.tenant_users tu
  where tu.tenant_id = target_tenant_id
    and tu.auth_user_id = auth.uid()
    and coalesce(tu.active, true) = true
    and (tu.locked_until is null or tu.locked_until < now())
  limit 1;
$$;

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = target_tenant_id
      and tu.auth_user_id = auth.uid()
      and coalesce(tu.active, true) = true
      and (tu.locked_until is null or tu.locked_until < now())
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
    from public.tenant_users tu
    join public.tenant_user_role_assignments tura
      on tura.tenant_user_id = tu.id
     and tura.tenant_id = tu.tenant_id
    join public.iam_roles r
      on r.id = tura.role_id
     and r.tenant_id = tu.tenant_id
    where tu.tenant_id = target_tenant_id
      and tu.auth_user_id = auth.uid()
      and coalesce(tu.active, true) = true
      and coalesce(r.active, true) = true
      and (tu.locked_until is null or tu.locked_until < now())
      and r.role_key = any(allowed_roles)
  );
$$;

create or replace function public.has_role(role_key text, target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_tenant_role(target_tenant_id, array[role_key]);
$$;

create or replace function public.has_permission(module_key text, action_key text, target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_tenant_role(target_tenant_id, array['owner','admin'])
    or exists (
      select 1
      from public.tenant_users tu
      join public.tenant_user_role_assignments tura
        on tura.tenant_user_id = tu.id
       and tura.tenant_id = tu.tenant_id
      join public.iam_roles r
        on r.id = tura.role_id
       and r.tenant_id = tu.tenant_id
      join public.iam_role_permissions rp
        on rp.role_id = r.id
       and rp.tenant_id = tu.tenant_id
       and coalesce(rp.allowed, true) = true
      join public.iam_permissions p
        on p.id = rp.permission_id
      where tu.tenant_id = target_tenant_id
        and tu.auth_user_id = auth.uid()
        and coalesce(tu.active, true) = true
        and coalesce(r.active, true) = true
        and (tu.locked_until is null or tu.locked_until < now())
        and p.module_key = has_permission.module_key
        and p.action_key = has_permission.action_key
    );
$$;

-- -----------------------------------------------------------------------------
-- 4) Permission catalog: enterprise coverage
-- -----------------------------------------------------------------------------
insert into public.iam_permissions (module_key, action_key, display_name, description)
select m.module_key,
       a.action_key,
       initcap(replace(m.module_key, '_', ' ')) || ': ' || initcap(a.action_key),
       initcap(a.action_key) || ' access for ' || replace(m.module_key, '_', ' ')
from unnest(array[
  'dashboard','crm','customers','contacts','customer_notes','communication_history',
  'appointment_requests','service_requests','work_orders','work_order_assignments',
  'work_order_checklist_items','work_order_photos','dispatch','schedule','technicians',
  'employees','operations','services','quotes','quote_items','invoices','invoice_items',
  'payments','expenses','tax_rates','financials','inventory','products','product_categories',
  'inventory_adjustments','inventory_balances','warehouses','vendors','purchase_orders',
  'purchase_order_items','reports','report_executive_dashboard','report_monthly_revenue',
  'report_customer_retention','report_job_counts_by_status','report_inventory_reorder',
  'report_technician_productivity','settings','iam','iam_roles','iam_permissions',
  'tenant_users','departments','service_locations','user_location_permissions',
  'audit','audit_logs','api_keys','service_accounts','integrations','integration_connections',
  'notifications','notification_templates','impersonation','templates','industry_templates'
]) as m(module_key)
cross join unnest(array['view','create','edit','delete','export','approve','assign','configure','admin']) as a(action_key)
on conflict (module_key, action_key) do nothing;

-- -----------------------------------------------------------------------------
-- 5) Role templates and tenant roles
-- -----------------------------------------------------------------------------
insert into public.iam_role_templates (template_key, display_name, description, default_permissions)
values
('owner','Owner','Full business owner access','{"all": true}'::jsonb),
('admin','Administrator','Full administrative access','{"all": true}'::jsonb),
('general_manager','General Manager','Business-wide management access','{"operations":["view","create","edit","approve"],"reports":["view","export"],"iam":["view"]}'::jsonb),
('operations_manager','Operations Manager','Operations, dispatch, scheduling, and technician management','{"operations":["view","create","edit","approve"],"dispatch":["view","create","edit","assign"],"schedule":["view","create","edit"],"technicians":["view","assign"]}'::jsonb),
('dispatch_manager','Dispatch Manager','Dispatch and scheduling management','{"dispatch":["view","create","edit","assign"],"schedule":["view","create","edit"],"technicians":["view","assign"]}'::jsonb),
('csr','CSR','Customer service representative access','{"customers":["view","create","edit"],"contacts":["view","create","edit"],"service_requests":["view","create"],"schedule":["view"]}'::jsonb),
('technician','Technician','Field technician access','{"work_orders":["view","edit"],"schedule":["view"],"work_order_photos":["view","create"],"work_order_checklist_items":["view","edit"]}'::jsonb),
('sales','Sales','Sales and customer pipeline access','{"customers":["view","create","edit"],"quotes":["view","create","edit"],"reports":["view"]}'::jsonb),
('accounting','Accounting','Financial access','{"invoices":["view","create","edit"],"payments":["view","create","edit"],"expenses":["view","create","edit"],"reports":["view","export"]}'::jsonb),
('warehouse','Warehouse','Inventory and warehouse operations','{"inventory":["view","create","edit"],"warehouses":["view","create","edit"],"products":["view","create","edit"],"purchase_orders":["view","create","edit"]}'::jsonb),
('customer','Customer','Customer portal access','{"service_requests":["view","create"],"quotes":["view"],"invoices":["view"],"payments":["view"]}'::jsonb),
('vendor','Vendor','Vendor-limited access','{"purchase_orders":["view"],"inventory":["view"]}'::jsonb),
('readonly','Read Only','View-only access','{"view_only": true}'::jsonb),
('api_service_account','API Service Account','Integration and service account access','{"integrations":["view","edit"],"api_keys":["view","create","edit"],"service_accounts":["view"]}'::jsonb)
on conflict (template_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    default_permissions = excluded.default_permissions;

insert into public.iam_roles (tenant_id, role_key, display_name, description, system_role, active)
select t.id, rt.template_key, rt.display_name, rt.description, true, true
from public.tenants t
cross join public.iam_role_templates rt
on conflict (tenant_id, role_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    system_role = true,
    active = true;

-- -----------------------------------------------------------------------------
-- 6) Baseline role permission grants
-- -----------------------------------------------------------------------------
-- Owner/Admin: all permissions
insert into public.iam_role_permissions (tenant_id, role_id, permission_id, allowed)
select r.tenant_id, r.id, p.id, true
from public.iam_roles r
cross join public.iam_permissions p
where r.role_key in ('owner','admin')
on conflict (tenant_id, role_id, permission_id) do update set allowed = true;

-- Readonly: every view permission
insert into public.iam_role_permissions (tenant_id, role_id, permission_id, allowed)
select r.tenant_id, r.id, p.id, true
from public.iam_roles r
join public.iam_permissions p on p.action_key = 'view'
where r.role_key = 'readonly'
on conflict (tenant_id, role_id, permission_id) do update set allowed = true;

-- General role grants from concise mapping.
with grants(role_key, module_key, action_key) as (
  values
  ('general_manager','dashboard','view'),('general_manager','operations','view'),('general_manager','operations','edit'),('general_manager','reports','view'),('general_manager','reports','export'),('general_manager','iam','view'),
  ('operations_manager','work_orders','view'),('operations_manager','work_orders','create'),('operations_manager','work_orders','edit'),('operations_manager','dispatch','view'),('operations_manager','dispatch','assign'),('operations_manager','schedule','view'),('operations_manager','schedule','edit'),('operations_manager','technicians','assign'),
  ('dispatch_manager','dispatch','view'),('dispatch_manager','dispatch','create'),('dispatch_manager','dispatch','edit'),('dispatch_manager','dispatch','assign'),('dispatch_manager','schedule','view'),('dispatch_manager','schedule','edit'),
  ('csr','customers','view'),('csr','customers','create'),('csr','customers','edit'),('csr','contacts','view'),('csr','contacts','create'),('csr','contacts','edit'),('csr','service_requests','view'),('csr','service_requests','create'),('csr','schedule','view'),
  ('technician','work_orders','view'),('technician','work_orders','edit'),('technician','schedule','view'),('technician','work_order_photos','view'),('technician','work_order_photos','create'),('technician','work_order_checklist_items','view'),('technician','work_order_checklist_items','edit'),
  ('sales','customers','view'),('sales','customers','create'),('sales','customers','edit'),('sales','quotes','view'),('sales','quotes','create'),('sales','quotes','edit'),('sales','reports','view'),
  ('accounting','invoices','view'),('accounting','invoices','create'),('accounting','invoices','edit'),('accounting','payments','view'),('accounting','payments','create'),('accounting','payments','edit'),('accounting','expenses','view'),('accounting','expenses','create'),('accounting','expenses','edit'),('accounting','reports','view'),('accounting','reports','export'),
  ('warehouse','inventory','view'),('warehouse','inventory','create'),('warehouse','inventory','edit'),('warehouse','products','view'),('warehouse','products','create'),('warehouse','products','edit'),('warehouse','warehouses','view'),('warehouse','purchase_orders','view'),('warehouse','purchase_orders','create'),('warehouse','purchase_orders','edit'),
  ('customer','service_requests','view'),('customer','service_requests','create'),('customer','quotes','view'),('customer','invoices','view'),('customer','payments','view'),
  ('vendor','purchase_orders','view'),('vendor','inventory','view'),
  ('api_service_account','integration_connections','view'),('api_service_account','integration_connections','edit'),('api_service_account','api_keys','view'),('api_service_account','api_keys','create'),('api_service_account','api_keys','edit'),('api_service_account','service_accounts','view')
)
insert into public.iam_role_permissions (tenant_id, role_id, permission_id, allowed)
select r.tenant_id, r.id, p.id, true
from grants g
join public.iam_roles r on r.role_key = g.role_key
join public.iam_permissions p on p.module_key = g.module_key and p.action_key = g.action_key
on conflict (tenant_id, role_id, permission_id) do update set allowed = true;

-- -----------------------------------------------------------------------------
-- 7) Tenant-aware RLS policies using has_permission where safe
-- -----------------------------------------------------------------------------
alter table public.iam_roles enable row level security;
alter table public.iam_permissions enable row level security;
alter table public.iam_role_permissions enable row level security;
alter table public.tenant_user_role_assignments enable row level security;
alter table public.iam_sessions enable row level security;
alter table public.service_accounts enable row level security;
alter table public.api_keys enable row level security;
alter table public.impersonation_events enable row level security;

do $$
begin
  execute 'drop policy if exists "iam roles read" on public.iam_roles';
  execute 'drop policy if exists "iam roles manage" on public.iam_roles';
  execute 'drop policy if exists "iam permissions readable" on public.iam_permissions';
  execute 'drop policy if exists "iam role permissions read" on public.iam_role_permissions';
  execute 'drop policy if exists "iam role permissions manage" on public.iam_role_permissions';
  execute 'drop policy if exists "tenant user role assignments read" on public.tenant_user_role_assignments';
  execute 'drop policy if exists "tenant user role assignments manage" on public.tenant_user_role_assignments';
  execute 'drop policy if exists "iam sessions read" on public.iam_sessions';
  execute 'drop policy if exists "iam sessions manage" on public.iam_sessions';
  execute 'drop policy if exists "service accounts read" on public.service_accounts';
  execute 'drop policy if exists "service accounts manage" on public.service_accounts';
  execute 'drop policy if exists "api keys read" on public.api_keys';
  execute 'drop policy if exists "api keys manage" on public.api_keys';
  execute 'drop policy if exists "impersonation read" on public.impersonation_events';
  execute 'drop policy if exists "impersonation manage" on public.impersonation_events';
end $$;

create policy "iam roles read" on public.iam_roles
for select using (public.is_tenant_member(tenant_id));
create policy "iam roles manage" on public.iam_roles
for all using (public.has_permission('iam_roles','admin',tenant_id))
with check (public.has_permission('iam_roles','admin',tenant_id));

create policy "iam permissions readable" on public.iam_permissions
for select using (true);

create policy "iam role permissions read" on public.iam_role_permissions
for select using (public.is_tenant_member(tenant_id));
create policy "iam role permissions manage" on public.iam_role_permissions
for all using (public.has_permission('iam_permissions','admin',tenant_id))
with check (public.has_permission('iam_permissions','admin',tenant_id));

create policy "tenant user role assignments read" on public.tenant_user_role_assignments
for select using (public.is_tenant_member(tenant_id));
create policy "tenant user role assignments manage" on public.tenant_user_role_assignments
for all using (public.has_permission('tenant_users','assign',tenant_id) or public.has_permission('iam','admin',tenant_id))
with check (public.has_permission('tenant_users','assign',tenant_id) or public.has_permission('iam','admin',tenant_id));

create policy "iam sessions read" on public.iam_sessions
for select using (
  auth_user_id = auth.uid()
  or public.has_permission('iam','view',tenant_id)
);
create policy "iam sessions manage" on public.iam_sessions
for all using (public.has_permission('iam','admin',tenant_id))
with check (public.has_permission('iam','admin',tenant_id));

create policy "service accounts read" on public.service_accounts
for select using (public.is_tenant_member(tenant_id));
create policy "service accounts manage" on public.service_accounts
for all using (public.has_permission('service_accounts','admin',tenant_id) or public.has_permission('api_keys','admin',tenant_id))
with check (public.has_permission('service_accounts','admin',tenant_id) or public.has_permission('api_keys','admin',tenant_id));

create policy "api keys read" on public.api_keys
for select using (public.has_permission('api_keys','view',tenant_id));
create policy "api keys manage" on public.api_keys
for all using (public.has_permission('api_keys','admin',tenant_id) or public.has_permission('api_keys','create',tenant_id) or public.has_permission('api_keys','edit',tenant_id))
with check (public.has_permission('api_keys','admin',tenant_id) or public.has_permission('api_keys','create',tenant_id) or public.has_permission('api_keys','edit',tenant_id));

create policy "impersonation read" on public.impersonation_events
for select using (public.has_permission('impersonation','view',tenant_id) or public.has_permission('iam','admin',tenant_id));
create policy "impersonation manage" on public.impersonation_events
for all using (public.has_permission('impersonation','admin',tenant_id) or public.has_permission('iam','admin',tenant_id))
with check (public.has_permission('impersonation','admin',tenant_id) or public.has_permission('iam','admin',tenant_id));

-- -----------------------------------------------------------------------------
-- 8) Audit helper
-- -----------------------------------------------------------------------------
create or replace function public.log_iam_audit(
  target_tenant_id uuid,
  action_name text,
  entity_type_name text default null,
  entity_uuid uuid default null,
  old_row jsonb default null,
  new_row jsonb default null,
  extra_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_audit_id uuid;
  actor_tu_id uuid;
begin
  actor_tu_id := public.current_tenant_user_id(target_tenant_id);
  insert into public.audit_logs(
    tenant_id, actor_tenant_user_id, actor_user_id, actor_auth_user_id,
    action, entity_type, entity_id, old_values, new_values, metadata
  ) values (
    target_tenant_id, actor_tu_id, auth.uid(), auth.uid(),
    action_name, entity_type_name, entity_uuid, old_row, new_row, coalesce(extra_metadata, '{}'::jsonb)
  ) returning id into new_audit_id;
  return new_audit_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 9) Verification output
-- -----------------------------------------------------------------------------
select 'ENTERPRISE_IAM_BASELINE_CORRECTED_OK' as status;
