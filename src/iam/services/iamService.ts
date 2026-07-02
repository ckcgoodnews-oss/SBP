import { supabase } from '../../supabaseClient';
import type { AppUser, PermissionAction, Role, Permission } from '../types/iam';

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) return null;
  const { data, error } = await supabase.from('app_users').select('*').eq('auth_user_id', auth.user.id).maybeSingle();
  if (error) throw error;
  return data as AppUser | null;
}

export async function hasPermission(module: string, action: PermissionAction, tenantId?: string | null): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_permission', {
    target_module: module,
    target_action: action,
    target_tenant_id: tenantId ?? null,
  });
  if (error) throw error;
  return Boolean(data);
}

export async function listUsers(tenantId?: string | null): Promise<AppUser[]> {
  let q = supabase.from('app_users').select('*').order('full_name', { ascending: true });
  if (tenantId) q = q.eq('tenant_id', tenantId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AppUser[];
}

export async function listRoles(tenantId?: string | null): Promise<Role[]> {
  let q = supabase.from('roles').select('*').order('name', { ascending: true });
  if (tenantId) q = q.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Role[];
}

export async function listPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase.from('permissions').select('*').order('module').order('action');
  if (error) throw error;
  return (data ?? []) as Permission[];
}

export async function updateUserStatus(userId: string, status: AppUser['status']): Promise<void> {
  const { error } = await supabase.from('app_users').update({ status }).eq('id', userId);
  if (error) throw error;
}

export async function assignUserRole(userId: string, roleId: string | null): Promise<void> {
  const { error } = await supabase.from('app_users').update({ role_id: roleId }).eq('id', userId);
  if (error) throw error;
}

export async function setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
  const { error: delError } = await supabase.from('role_permissions').delete().eq('role_id', roleId);
  if (delError) throw delError;
  if (!permissionIds.length) return;
  const rows = permissionIds.map(permission_id => ({ role_id: roleId, permission_id }));
  const { error } = await supabase.from('role_permissions').insert(rows);
  if (error) throw error;
}
