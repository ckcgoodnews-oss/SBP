import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createTechnicianNoteSchema } from '@/lib/validation/portal-live';

async function getDemoTechnician(tenantId: string) {
  const supabase = createServerAdminSupabaseClient();
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, email')
    .eq('tenant_id', tenantId)
    .eq('role', 'technician')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) throw new Error('Demo technician not found.');
  return data;
}

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();
    const employee = await getDemoTechnician(tenantId);

    const { data, error } = await supabase
      .from('technician_job_notes')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false });

    if (error) return fail('Failed to load technician notes.', 500, error.message);

    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, employee, rows: data || [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const employee = await getDemoTechnician(tenantId);
    const rawPayload = await readJsonOrFormData(request);
    const payload = withTenantId({ ...rawPayload, employee_id: employee.id }, tenantId);

    for (const key of Object.keys(payload)) {
      if (payload[key] === '') delete payload[key];
    }

    const parsed = createTechnicianNoteSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('technician_job_notes')
      .insert(parsed.data)
      .select('*')
      .single();

    if (error) return fail('Failed to save technician note.', 500, error.message);

    return ok({ row: data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
