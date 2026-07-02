import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createPurchaseOrderItemSchema } from '@/lib/validation/inventory-operations';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('id', { ascending: false });

    if (error) return fail('Failed to load purchase-order-items.', 500, error.message);
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

    const parsed = createPurchaseOrderItemSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('purchase_order_items')
      .insert(parsed.data)
      .select('*')
      .single();

    if (error) return fail('Failed to save purchase-order-items.', 500, error.message);
    return ok({ row: data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
