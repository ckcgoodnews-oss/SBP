import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey);

export async function listAuditTimeline(limit = 50) {
  const { data, error } = await adminSupabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listServiceAccounts() {
  const { data, error } = await adminSupabase
    .from('service_accounts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listImpersonationEvents() {
  const { data, error } = await adminSupabase
    .from('impersonation_events')
    .select('*')
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAdminSessions() {
  const { data, error } = await adminSupabase
    .from('iam_sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
