import { ok, fail } from '@/lib/api/http';
import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';

export async function GET() {
  try {
    const supabase = createServerAdminSupabaseClient();
    const { count, error } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return fail('Supabase connection failed.', 500, error.message);
    }

    return ok({
      app: 'service-business-platform',
      package: 'SBP_API_Implementation_Patch_v1',
      version: '1.0.0',
      database: 'connected',
      tenant_count: count ?? 0,
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Health check failed.', 500);
  }
}
