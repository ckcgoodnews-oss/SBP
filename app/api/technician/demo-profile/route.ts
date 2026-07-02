import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest } from '@/lib/api/tenant';
import { ok, fail, handleApiError } from '@/lib/api/http';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('role', 'technician')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !data) return fail('Demo technician not found.', 404, error?.message);

    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, employee: data });
  } catch (error) {
    return handleApiError(error);
  }
}
