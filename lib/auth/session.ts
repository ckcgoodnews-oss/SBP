import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';

export type TenantUserRecord = {
  id: string;
  tenant_id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  role: string;
  active: boolean;
};

export async function getTenantUserByEmail(email: string): Promise<TenantUserRecord | null> {
  const supabase = createServerAdminSupabaseClient();

  const { data, error } = await supabase
    .from('tenant_users')
    .select('*')
    .eq('email', email)
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
