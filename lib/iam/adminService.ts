import { supabase } from '@/lib/supabase/client';
import type { AuditLog, IamPermission, IamRole, IamSession, TenantUser } from '@/types/iam';

async function safeSelect<T>(table: string, query = '*', limit = 100): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(query).limit(limit);
  if (error) {
    console.error(`[IAM] ${table} select failed`, error.message);
    return [];
  }
  return (data || []) as T[];
}

async function safeCount(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
}

export const adminService = {
  listUsers: () => safeSelect<TenantUser>('tenant_users', '*', 250),
  listRoles: () => safeSelect<IamRole>('iam_roles', '*', 250),
  listPermissions: () => safeSelect<IamPermission>('iam_permissions', '*', 500),
  listAuditLogs: () => safeSelect<AuditLog>('audit_logs', '*', 250),
  listSessions: () => safeSelect<IamSession>('iam_sessions', '*', 250),
  listTenants: () => safeSelect<Record<string, unknown>>('tenants', '*', 250),
  listDepartments: () => safeSelect<Record<string, unknown>>('departments', '*', 250),
  listLocations: () => safeSelect<Record<string, unknown>>('service_locations', '*', 250),
  listApiKeys: () => safeSelect<Record<string, unknown>>('api_keys', '*', 250),
  listServiceAccounts: () => safeSelect<Record<string, unknown>>('service_accounts', '*', 250),
  async dashboardCounts() {
    const [users, roles, permissions, sessions, audit, apiKeys] = await Promise.all([
      safeCount('tenant_users'), safeCount('iam_roles'), safeCount('iam_permissions'),
      safeCount('iam_sessions'), safeCount('audit_logs'), safeCount('api_keys'),
    ]);
    return { users, roles, permissions, sessions, audit, apiKeys };
  },
  async revokeSession(id: string) {
    const { error } = await supabase.from('iam_sessions').update({ revoked_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};
