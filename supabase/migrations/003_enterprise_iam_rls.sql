-- 003_enterprise_iam_rls.sql
-- Tenant-aware RLS policies for Enterprise IAM.
-- Run after 002 and 005, before or after 004 is acceptable.

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


select '003_enterprise_iam_rls_ok' as status;
