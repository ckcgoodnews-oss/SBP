import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createNotificationSchema } from '@/lib/validation/reports-integrations';

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return fail('Failed to load notifications.', 500, error.message);
    }

    return ok({
      tenant_id: tenantId,
      tenant_slug: tenantSlug,
      rows: data || []
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const rawPayload = await readJsonOrFormData(request);
    const payload = withTenantId(rawPayload, tenantId);

    if (typeof payload.public_config === 'string' && payload.public_config.trim()) {
      try {
        payload.public_config = JSON.parse(payload.public_config);
      } catch {
        return fail('public_config must be valid JSON.', 400);
      }
    }

    if (typeof payload.before_data === 'string' && payload.before_data.trim()) {
      try { payload.before_data = JSON.parse(payload.before_data); } catch { payload.before_data = { raw: payload.before_data }; }
    }

    if (typeof payload.after_data === 'string' && payload.after_data.trim()) {
      try { payload.after_data = JSON.parse(payload.after_data); } catch { payload.after_data = { raw: payload.after_data }; }
    }

    const parsed = createNotificationSchema.parse(payload);
    const supabase = createServerAdminSupabaseClient();

    const { data, error } = await supabase
      .from('notifications')
      .insert(parsed.data)
      .select('*')
      .single();

    if (error) {
      return fail('Failed to save notifications.', 500, error.message);
    }

    return ok({ row: data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
