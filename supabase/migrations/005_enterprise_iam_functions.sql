-- 005_enterprise_iam_functions.sql
-- Tenant-aware IAM helper functions and audit helper.
-- Parameter name target_tenant_id is intentionally preserved to avoid PostgreSQL 42P13 conflicts.

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


select '005_enterprise_iam_functions_ok' as status;
