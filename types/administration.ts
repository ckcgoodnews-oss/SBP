export type TenantUser = {
  id: string;
  tenant_id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  role: string;
  active: boolean;
  locked_until: string | null;
  lock_reason: string | null;
  mfa_required: boolean;
  last_login_at: string | null;
  department_id: string | null;
  title: string | null;
  phone: string | null;
  updated_at: string | null;
  failed_login_count: number | null;
};

export type AdminSession = {
  id: string;
  tenant_id: string;
  tenant_user_id: string | null;
  auth_user_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  last_seen_at: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
};
