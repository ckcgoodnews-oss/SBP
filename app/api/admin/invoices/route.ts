import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createInvoiceSchema } from '@/lib/validation/core-crud';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) return fail('Failed to load invoices.', 500, error.message);

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

    const parsed = createInvoiceSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('invoices')
      .upsert(parsed, { onConflict: 'tenant_id,invoice_number' })
      .select('*')
      .single();

    if (error) return fail('Failed to save invoices.', 500, error.message);

    return ok({ row: data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
