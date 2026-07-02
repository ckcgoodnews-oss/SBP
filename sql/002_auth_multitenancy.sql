create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  status text not null default 'active'
);

create table if not exists tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  auth_user_id uuid,
  email text not null,
  full_name text not null,
  role text not null,
  active boolean not null default true,
  unique (tenant_id, email)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  actor_user_id uuid,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean language sql stable security definer as $$
  select exists (select 1 from tenant_users tu where tu.tenant_id = target_tenant_id and tu.auth_user_id = auth.uid() and tu.active = true);
$$;

create or replace function public.has_tenant_role(target_tenant_id uuid, allowed_roles text[])
returns boolean language sql stable security definer as $$
  select exists (select 1 from tenant_users tu where tu.tenant_id = target_tenant_id and tu.auth_user_id = auth.uid() and tu.active = true and tu.role = any(allowed_roles));
$$;
