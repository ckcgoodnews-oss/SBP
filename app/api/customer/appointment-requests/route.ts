import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createCustomerAppointmentRequestSchema } from '@/lib/validation/portal-live';

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

    const { data, error } = await supabase
      .from('appointment_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (error) return fail('Failed to load appointment requests.', 500, error.message);

    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, customer, rows: data || [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (customerError || !customer) return fail('Demo customer not found.', 404, customerError?.message);

    const rawPayload = await readJsonOrFormData(request);
	const payload = withTenantId(
		{ ...rawPayload, customer_id: customer.id },
		tenantId
	) as Record<string, any>;

    for (const key of Object.keys(payload)) {
      if (payload[key] === '') delete payload[key];
    }

    const parsed = createCustomerAppointmentRequestSchema.parse(payload);

    const { data, error } = await supabase
      .from('appointment_requests')
      .insert(parsed)
      .select('*')
      .single();

    if (error) return fail('Failed to save appointment request.', 500, error.message);

    return ok({ row: data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
