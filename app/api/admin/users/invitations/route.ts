import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { fail, ok } from '@/lib/enterprise-admin/api-response';

export async function GET() {
  try {
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('iam_invitations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    return ok(data ?? []);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.tenant_id) return fail(new Error('Missing tenant_id'), 400);
    if (!body.email) return fail(new Error('Missing email'), 400);
    if (!body.full_name) return fail(new Error('Missing full_name'), 400);
    if (!body.role_key) return fail(new Error('Missing role_key'), 400);

    const supabase = createServerAdminSupabaseClient();

    const expiresDays = Number(body.expires_days || 7);
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    const payload = {
      tenant_id: body.tenant_id,
      email: body.email,
      full_name: body.full_name,
      role_key: body.role_key,
      invitation_token: crypto.randomUUID(),
      status: 'pending',
      expires_at: expiresAt,
      created_by_email: body.created_by_email || null,
    };

    const { data, error } = await supabase
      .from('iam_invitations')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) return fail(new Error('Missing invitation id'), 400);

    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('iam_invitations')
      .update({ status: body.status || 'cancelled' })
      .eq('id', body.id)
      .select('*')
      .single();

    if (error) throw error;

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}