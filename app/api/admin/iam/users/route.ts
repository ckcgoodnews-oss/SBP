import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createEnterpriseUserSchema } from '@/lib/validation/enterprise-iam';
import { createSupabaseAuthUser } from '@/lib/auth/supabase-admin-auth';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('tenant_users')
      .select('*, departments(name)')
      .eq('tenant_id', tenantId)
      .order('role')
      .order('full_name');

    if (error) return fail('Failed to load IAM users.', 500, error.message);

    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, rows: data || [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const rawPayload = await readJsonOrFormData(request);
    const payload = withTenantId(rawPayload, tenantId);

    for (const key of Object.keys(payload)) {
      if (payload[key] === '') delete payload[key];
    }

    const parsed = createEnterpriseUserSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();

    const authResult = await createSupabaseAuthUser({
      email: parsed.email,
      password: parsed.password,
      fullName: parsed.full_name,
      emailConfirm: true
    });

    const { data: userRow, error: userError } = await supabase
      .from('tenant_users')
      .upsert({
        tenant_id: tenantId,
        email: parsed.email,
        full_name: parsed.full_name,
        role: parsed.role,
        auth_user_id: authResult.user.id,
        title: parsed.title || null,
        phone: parsed.phone || null,
        department_id: parsed.department_id || null,
        mfa_required: parsed.mfa_required,
        active: parsed.active
      }, { onConflict: 'tenant_id,email' })
      .select('*')
      .single();

    if (userError) return fail('Auth user created, but tenant user save failed.', 500, userError.message);

    const { data: roleRow } = await supabase
      .from('iam_roles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('role_key', parsed.role)
      .maybeSingle();

    if (roleRow?.id) {
      await supabase
        .from('tenant_user_role_assignments')
        .upsert({
          tenant_id: tenantId,
          tenant_user_id: userRow.id,
          role_id: roleRow.id
        }, { onConflict: 'tenant_id,tenant_user_id,role_id' });
    }

    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      actor_email: 'system',
      action: 'iam.user.created_or_updated',
      entity_type: 'tenant_users',
      entity_id: userRow.id,
      after_data: {
        email: userRow.email,
        role: userRow.role,
        auth_user_id: userRow.auth_user_id,
        auth_user_already_existed: authResult.alreadyExisted
      }
    });

    return ok({
      row: userRow,
      auth_user_id: authResult.user.id,
      auth_user_already_existed: authResult.alreadyExisted,
      generated_password_note: parsed.password ? 'Password set from form.' : 'Temporary password generated server-side. Use password reset for the user.'
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
