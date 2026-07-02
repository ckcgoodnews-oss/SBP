import { supabase } from '../../../lib/supabaseClient';
import { ApiKeyRecord, AuditLog, IamPermission, IamRole, IamSession, Tenant, TenantUser } from '../../../shared/types/iam';

export const iamService = {
  async dashboardStats() {
    const [users, invites, sessions, audit] = await Promise.all([
      supabase.from('tenant_users').select('id,status,locked_until').limit(500),
      supabase.from('iam_invitations').select('id,status').limit(500),
      supabase.from('iam_sessions').select('id,revoked_at').limit(500),
      supabase.from('audit_logs').select('id,action,created_at').order('created_at', { ascending: false }).limit(10),
    ]);
    const userRows = users.data ?? [];
    const sessionRows = sessions.data ?? [];
    return {
      users: userRows.length,
      pendingInvitations: (invites.data ?? []).filter((x: any) => x.status === 'pending').length,
      lockedAccounts: userRows.filter((x: any) => x.locked_until && new Date(x.locked_until) > new Date()).length,
      activeSessions: sessionRows.filter((x: any) => !x.revoked_at).length,
      recentEvents: audit.data ?? [],
      error: users.error?.message || invites.error?.message || sessions.error?.message || audit.error?.message || null,
    };
  },
  async listUsers() { return supabase.from('tenant_users').select('*').order('created_at', { ascending: false }).returns<TenantUser[]>(); },
  async listRoles() { return supabase.from('iam_roles').select('*').order('name').returns<IamRole[]>(); },
  async listPermissions() { return supabase.from('iam_permissions').select('*').order('module').order('action').returns<IamPermission[]>(); },
  async listAuditLogs() { return supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(250).returns<AuditLog[]>(); },
  async listSessions() { return supabase.from('iam_sessions').select('*').order('last_seen_at', { ascending: false }).limit(250).returns<IamSession[]>(); },
  async revokeSession(id: string) { return supabase.from('iam_sessions').update({ revoked_at: new Date().toISOString() }).eq('id', id); },
  async listApiKeys() { return supabase.from('api_keys').select('*').order('created_at', { ascending: false }).returns<ApiKeyRecord[]>(); },
  async listTenants() { return supabase.from('tenants').select('*').order('name').returns<Tenant[]>(); },
  async listDepartments() { return supabase.from('departments').select('*').order('name'); },
  async listLocations() { return supabase.from('service_locations').select('*').order('name'); },
};
