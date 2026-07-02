import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';

export type TenantLookup = {
  tenantId: string;
  tenantSlug: string;
};

export async function resolveTenantFromRequest(request: Request): Promise<TenantLookup> {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenant_id');
  const tenantSlug = url.searchParams.get('tenant_slug') || process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || 'demo-company';

  if (tenantId) {
    return { tenantId, tenantSlug };
  }

  const supabase = createServerAdminSupabaseClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('id, slug')
    .eq('slug', tenantSlug)
    .single();

  if (error || !data) {
    throw new Error(`Tenant not found for slug: ${tenantSlug}`);
  }

  return { tenantId: data.id, tenantSlug: data.slug };
}

export function withTenantId<T extends Record<string, unknown>>(payload: T, tenantId: string): T & { tenant_id: string } {
  return {
    ...payload,
    tenant_id: String(payload.tenant_id || tenantId)
  };
}
