import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createDepartmentSchema } from '@/lib/validation/enterprise-iam';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();
    const { data, error } = await supabase.from('departments').select('*').eq('tenant_id', tenantId).order('name');
    if (error) return fail('Failed to load departments.', 500, error.message);
    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, rows: data || [] });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const payload = withTenantId(await readJsonOrFormData(request), tenantId);
    for (const key of Object.keys(payload)) if (payload[key] === '') delete payload[key];
    const parsed = createDepartmentSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();
    const { data, error } = await supabase.from('departments').upsert(parsed, { onConflict: 'tenant_id,name' }).select('*').single();
    if (error) return fail('Failed to save department.', 500, error.message);
    return ok({ row: data }, 201);
  } catch (error) { return handleApiError(error); }
}
