import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';
import { resolveTenantFromRequest, withTenantId } from '@/lib/api/tenant';
import { ok, fail, handleApiError, readJsonOrFormData } from '@/lib/api/http';
import { createServiceAccountSchema, createApiKeySchema } from '@/lib/validation/enterprise-iam';

function fakeHash(value: string) {
  return 'sha256-placeholder-' + value.slice(-12);
}

export async function GET(request: Request) {
  try {
    const { tenantId, tenantSlug } = await resolveTenantFromRequest(request);
    const supabase = createServerAdminSupabaseClient();

    const { data: serviceAccounts } = await supabase.from('service_accounts').select('*').eq('tenant_id', tenantId).order('name');
    const { data: apiKeys } = await supabase.from('api_keys').select('id, tenant_id, service_account_id, key_name, key_prefix, scopes, active, expires_at, created_at, last_used_at').eq('tenant_id', tenantId).order('created_at', { ascending: false });

    return ok({ tenant_id: tenantId, tenant_slug: tenantSlug, service_accounts: serviceAccounts || [], api_keys: apiKeys || [], rows: apiKeys || [] });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const { tenantId } = await resolveTenantFromRequest(request);
    const raw = await readJsonOrFormData(request);
    const mode = String(raw.mode || 'service_account');
    const supabase = createServerAdminSupabaseClient();

    if (mode === 'service_account') {
      const payload = withTenantId(raw, tenantId);
      for (const key of Object.keys(payload)) if (payload[key] === '') delete payload[key];
      const parsed = createServiceAccountSchema.parse(payload);
      const { data, error } = await supabase.from('service_accounts').upsert(parsed.data, { onConflict: 'tenant_id,name' }).select('*').single();
      if (error) return fail('Failed to save service account.', 500, error.message);
      return ok({ row: data }, 201);
    }

    const payload = withTenantId(raw, tenantId);
    for (const key of Object.keys(payload)) if (payload[key] === '') delete payload[key];
    const parsed = createApiKeySchema.parse(payload);

    const rawKey = 'sbp_' + crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
    const keyPrefix = rawKey.slice(0, 12);
    const scopes = parsed.data.scopes ? parsed.data.scopes.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const { data, error } = await supabase.from('api_keys').insert({
      tenant_id: tenantId,
      service_account_id: parsed.data.service_account_id,
      key_name: parsed.data.key_name,
      key_prefix: keyPrefix,
      key_hash: fakeHash(rawKey),
      scopes,
      expires_at: parsed.data.expires_at || null,
      active: true
    }).select('id, tenant_id, service_account_id, key_name, key_prefix, scopes, active, expires_at, created_at').single();

    if (error) return fail('Failed to create API key.', 500, error.message);

    return ok({ row: data, api_key_once: rawKey, warning: 'Store this key now. It will not be shown again.' }, 201);
  } catch (error) { return handleApiError(error); }
}
