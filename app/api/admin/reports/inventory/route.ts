import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest } from '@/lib/api/tenant';
import { ok, handleApiError, fail } from '@/lib/api/http';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('report_inventory_reorder')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      return fail('Failed to load inventory report.', 500, error.message);
    }

    return ok({
      report: 'inventory',
      source_view: 'report_inventory_reorder',
      tenant_id: tenantId,
      tenant_slug: tenantSlug,
      rows: data || []
    });
  } catch (error) {
    return handleApiError(error);
  }
}
