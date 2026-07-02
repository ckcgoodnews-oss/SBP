import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { ok, fail, handleApiError } from '@/lib/api/http';

export async function GET() {
  try {
    const supabase = createServerAdminSupabaseClient();
    const { data, error } = await supabase.from('iam_permissions').select('*').order('module_key').order('action_key');
    if (error) return fail('Failed to load permissions.', 500, error.message);
    return ok({ rows: data || [] });
  } catch (error) { return handleApiError(error); }
}
