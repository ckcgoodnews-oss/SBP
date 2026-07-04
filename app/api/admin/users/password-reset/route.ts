import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return fail(new Error('Missing userId'), 400);
    }

    const supabase = createServerAdminSupabaseClient();

    const { data: user, error: userError } = await supabase
      .from('tenant_users')
      .select('*')
      .eq('id', body.userId)
      .single();

    if (userError) throw userError;
    if (!user) return fail(new Error('User not found'), 404);

    const forcePasswordChange = Boolean(body.forcePasswordChange);

    await supabase.from('audit_logs').insert({
      tenant_id: user.tenant_id,
      actor_email: body.actorEmail || 'admin@example.com',
      action: 'password_reset_requested',
      entity_type: 'tenant_user',
      entity_id: user.id,
      target_user_id: user.id,
      target_email: user.email,
      metadata: {
        force_password_change: forcePasswordChange,
        delivery_method: 'email',
      },
    });

    return ok({
      user_id: user.id,
      email: user.email,
      force_password_change: forcePasswordChange,
      status: 'reset_requested',
      message: 'Password reset request recorded. Email delivery integration will be connected next.',
    });
  } catch (error) {
    return fail(error);
  }
}