import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createInventoryBalanceSchema } from '@/lib/validation/inventory-operations';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('inventory_balances')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('updated_at', { ascending: false });

    if (error) return fail('Failed to load inventory-balances.', 500, error.message);
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

    const parsed = createInventoryBalanceSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('inventory_balances')
      .upsert(parsed, { onConflict: 'tenant_id,product_id,warehouse_id' })
      .select('*')
      .single();

    if (error) return fail('Failed to save inventory-balances.', 500, error.message);
    return ok({ row: data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
