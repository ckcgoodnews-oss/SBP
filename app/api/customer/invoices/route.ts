import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest } from '@/lib/api/tenant';
import { ok, fail, handleApiError } from '@/lib/api/http';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, display_name, email')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (customerError || !customer) return fail('Demo customer not found.', 404, customerError?.message);

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) return fail('Failed to load customer invoices.', 500, error.message);

    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, customer, rows: data || [] });
  } catch (error) {
    return handleApiError(error);
  }
}
