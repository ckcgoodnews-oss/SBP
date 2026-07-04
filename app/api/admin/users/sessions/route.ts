import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { fail, ok } from '@/lib/enterprise-admin/api-response';

export async function GET() {
  try {
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('iam_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    return ok(data ?? []);
  } catch (error) {
    return fail(error);
  }
}