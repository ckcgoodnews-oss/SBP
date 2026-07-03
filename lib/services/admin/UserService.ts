import { getAdminClient } from '@/lib/enterprise-admin/admin-client';

export type TenantUserInput = {
  tenant_id: string;
  email: string;
  full_name: string;
  role?: string;
  title?: string | null;
  phone?: string | null;
  department_id?: string | null;
  mfa_required?: boolean;
  active?: boolean;
};

export class UserService {
  static async list() {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('tenant_users')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return data ?? [];
  }

  static async create(input: TenantUserInput) {
    const supabase = getAdminClient();

    const payload = {
      tenant_id: input.tenant_id,
      email: input.email,
      full_name: input.full_name,
      role: input.role ?? 'staff',
      title: input.title ?? null,
      phone: input.phone ?? null,
      department_id: input.department_id ?? null,
      mfa_required: input.mfa_required ?? false,
      active: input.active ?? true,
      failed_login_count: 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tenant_users')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, input: Partial<TenantUserInput>) {
    const supabase = getAdminClient();

    const payload = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tenant_users')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async disable(id: string) {
    return this.update(id, { active: false });
  }

  static async enable(id: string) {
    return this.update(id, { active: true });
  }

  static async lock(id: string, reason = 'Administrative lock') {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('tenant_users')
      .update({
        locked_until: '2099-12-31T23:59:59Z',
        lock_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async unlock(id: string) {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('tenant_users')
      .update({
        locked_until: null,
        lock_reason: null,
        failed_login_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async requireMfa(id: string, required: boolean) {
    return this.update(id, { mfa_required: required });
  }

  static async resetFailedLogins(id: string) {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('tenant_users')
      .update({
        failed_login_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async remove(id: string) {
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('tenant_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { id };
  }
}