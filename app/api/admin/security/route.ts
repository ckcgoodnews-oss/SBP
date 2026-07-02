import { ok, fail } from '@/lib/enterprise-admin/api-response';
import { getAdminClient } from '@/lib/enterprise-admin/admin-client';

export async function GET() {
  try {
    const supabase = getAdminClient();
    const [users, sessions, apiKeys, audit] = await Promise.all([
      supabase.from('tenant_users').select('id,active,mfa_required,locked_until,failed_login_count'),
      supabase.from('iam_sessions').select('id,status,revoked_at'),
      supabase.from('api_keys').select('id'),
      supabase.from('audit_logs').select('id').limit(100),
    ]);
    for (const r of [users, sessions, apiKeys, audit]) if (r.error) throw r.error;
    const u = users.data ?? [];
    const s = sessions.data ?? [];
    return ok({
      users: u.length,
      activeUsers: u.filter((x: any) => x.active).length,
      lockedUsers: u.filter((x: any) => x.locked_until).length,
      mfaRequired: u.filter((x: any) => x.mfa_required).length,
      failedLoginTotal: u.reduce((a: number, x: any) => a + (x.failed_login_count ?? 0), 0),
      sessions: s.length,
      activeSessions: s.filter((x: any) => !x.revoked_at && x.status !== 'revoked').length,
      apiKeys: (apiKeys.data ?? []).length,
      auditEventsSampled: (audit.data ?? []).length,
    });
  } catch (e) { return fail(e); }
}
