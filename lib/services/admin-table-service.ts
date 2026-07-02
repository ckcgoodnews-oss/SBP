import { getAdminClient } from '@/lib/enterprise-admin/admin-client';

export type TableServiceConfig = {
  table: string;
  orderBy?: string;
  select?: string;
  softDeleteField?: string;
  softDeleteValue?: unknown;
};

export function createTableService(config: TableServiceConfig) {
  return {
    async list() {
      const supabase = getAdminClient();
      let q = supabase.from(config.table).select(config.select ?? '*');
      if (config.orderBy) q = q.order(config.orderBy, { ascending: false });
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return data ?? [];
    },
    async create(payload: Record<string, unknown>) {
      const supabase = getAdminClient();
      const { data, error } = await supabase.from(config.table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async update(id: string, payload: Record<string, unknown>) {
      const supabase = getAdminClient();
      const { data, error } = await supabase.from(config.table).update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async remove(id: string) {
      const supabase = getAdminClient();
      const query = config.softDeleteField
        ? supabase.from(config.table).update({ [config.softDeleteField]: config.softDeleteValue ?? false }).eq('id', id)
        : supabase.from(config.table).delete().eq('id', id);
      const { error } = await query;
      if (error) throw error;
      return { id };
    },
  };
}
