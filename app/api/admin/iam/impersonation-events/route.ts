import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();
    const { data, error } = await supabase.from('impersonation_events').select('*').eq('tenant_id', tenantId).order('started_at', { ascending: false });
    if (error) return fail('Failed to load impersonation events.', 500, error.message);
    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, rows: data || [] });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const payload = withTenantId(await readJsonOrFormData(request), tenantId);
    const supabase = createServerAdminSupabaseClient();
    const { data, error } = await supabase.from('impersonation_events').insert({
      tenant_id: tenantId,
      admin_user_id: payload.admin_user_id || null,
      target_user_id: payload.target_user_id || null,
      reason: payload.reason || 'Support review'
    }).select('*').single();
    if (error) return fail('Failed to save impersonation event.', 500, error.message);
    return ok({ row: data }, 201);
  } catch (error) { return handleApiError(error); }
}
