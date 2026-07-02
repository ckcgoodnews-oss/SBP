import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest } from '@/lib/api/tenant';
import { ok, fail, handleApiError } from '@/lib/api/http';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, full_name, email')
      .eq('tenant_id', tenantId)
      .eq('role', 'technician')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (employeeError || !employee) return fail('Demo technician not found.', 404, employeeError?.message);

    const { data: assignments, error } = await supabase
      .from('work_order_assignments')
      .select('id, employee_id, work_order_id, assignment_role, work_orders(*)')
      .eq('tenant_id', tenantId)
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false });

    if (error) return fail('Failed to load assigned jobs.', 500, error.message);

    const rows = (assignments || []).map((a: any) => ({
      assignment_id: a.id,
      employee_id: a.employee_id,
      work_order_id: a.work_order_id,
      assignment_role: a.assignment_role,
      ...(a.work_orders || {})
    }));

    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, employee, rows });
  } catch (error) {
    return handleApiError(error);
  }
}
