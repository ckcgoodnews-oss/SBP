import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createWorkCompletionSchema } from '@/lib/validation/portal-live';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('work_completions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('completed_at', { ascending: false });

    if (error) return fail('Failed to load work completions.', 500, error.message);
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

    const parsed = createWorkCompletionSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('work_completions')
      .insert({
        ...parsed,
        completed_at: parsed.completed_at || new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) return fail('Failed to save work completion.', 500, error.message);

    await supabase
      .from('work_orders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', parsed.work_order_id);

    return ok({ row: data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
