-- 002_enterprise_iam_baseline.sql
-- Enterprise IAM baseline tables/columns/indexes for SBP tenant-based schema.
-- Safe to rerun. Does not use organization_id or iam_sessions.user_id.

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


select '002_enterprise_iam_baseline_ok' as status;
