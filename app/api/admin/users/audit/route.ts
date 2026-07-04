import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { fail, ok } from '@/lib/enterprise-admin/api-response';

export async function GET() {
  try {
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .or('entity_type.eq.user,entity_type.eq.tenant_user,entity_type.eq.iam_invitation,entity_type.eq.iam_session')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    return ok(data ?? []);
  } catch (error) {
    return fail(error);
  }
}