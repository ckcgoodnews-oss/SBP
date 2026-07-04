import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { fail, ok } from '@/lib/enterprise-admin/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return fail(new Error('Missing session id'), 400);
    }

    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('iam_sessions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoke_reason: body.reason || 'Revoked from administration console',
      })
      .eq('id', body.id)
      .select('*')
      .single();

    if (error) throw error;

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}