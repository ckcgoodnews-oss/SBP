import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createCustomRoleSchema } from '@/lib/validation/enterprise-iam';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();
    const { data, error } = await supabase.from('iam_roles').select('*').eq('tenant_id', tenantId).order('role_key');
    if (error) return fail('Failed to load roles.', 500, error.message);
    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, rows: data || [] });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const payload = withTenantId(await readJsonOrFormData(request), tenantId);
    for (const key of Object.keys(payload)) if (payload[key] === '') delete payload[key];
    const parsed = createCustomRoleSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();
    const { data, error } = await supabase.from('iam_roles').upsert(parsed.data, { onConflict: 'tenant_id,role_key' }).select('*').single();
    if (error) return fail('Failed to save role.', 500, error.message);
    return ok({ row: data }, 201);
  } catch (error) { return handleApiError(error); }
}
