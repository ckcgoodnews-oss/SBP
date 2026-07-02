import { supabase } from './supabaseClient';
import type { AdminDashboardStats, IamRole, TenantUser } from '../types/iam';

export async function getAdminDashboardStats(tenantId: string): Promise<AdminDashboardStats> {
  const [users, invitations, sessions, audit] = await Promise.all([
    supabase.from('tenant_users').select('id,status', { count: 'exact', head: false }).eq('tenant_id', tenantId),
    supabase.from('iam_invitations').select('id,status', { count: 'exact', head: false }).eq('tenant_id', tenantId).eq('status', 'pending'),
    supabase.from('iam_sessions').select('id,revoked_at', { count: 'exact', head: false }).eq('tenant_id', tenantId).is('revoked_at', null),
    supabase.from('audit_logs').select('id', { count: 'exact', head: false }).eq('tenant_id', tenantId).in('action', ['login_failed', 'permission_changed', 'role_changed', 'impersonation_started']).limit(50),
  ]);

  if (users.error) throw users.error;
  if (invitations.error) throw invitations.error;
  if (sessions.error) throw sessions.error;
  if (audit.error) throw audit.error;

  const lockedAccounts = (users.data ?? []).filter((u: any) => u.status === 'locked').length;

  return {
    users: users.count ?? users.data?.length ?? 0,
    pendingInvitations: invitations.count ?? invitations.data?.length ?? 0,
    lockedAccounts,
    activeSessions: sessions.count ?? sessions.data?.length ?? 0,
    recentSecurityEvents: audit.count ?? audit.data?.length ?? 0,
  };
}

export async function listTenantUsers(tenantId: string): Promise<TenantUser[]> {
  const { data, error } = await supabase
    .from('tenant_users')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listRoles(tenantId: string): Promise<IamRole[]> {
  const { data, error } = await supabase
    .from('iam_roles')
    .select('*')
    .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function assignRole(tenantUserId: string, roleId: string) {
  const { error } = await supabase
    .from('tenant_user_role_assignments')
    .insert({ tenant_user_id: tenantUserId, role_id: roleId });
  if (error) throw error;
}

export async function revokeSession(sessionId: string) {
  const { error } = await supabase
    .from('iam_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function createInvitation(input: { tenant_id: string; email: string; role_id?: string | null; invited_by?: string | null }) {
  const { error } = await supabase.from('iam_invitations').insert({
    tenant_id: input.tenant_id,
    email: input.email,
    role_id: input.role_id ?? null,
    invited_by: input.invited_by ?? null,
    status: 'pending',
  });
  if (error) throw error;
}
