export type AdminEntity =
  | 'users'
  | 'roles'
  | 'permissions'
  | 'sessions'
  | 'service-accounts'
  | 'audit-logs';

export type TenantUser = {
  id: string;
  tenant_id?: string | null;
  auth_user_id?: string | null;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type IamRole = {
  id: string;
  tenant_id?: string | null;
  name: string;
  description?: string | null;
  role_type?: string | null;
  is_system?: boolean | null;
  created_at?: string | null;
};

export type IamPermission = {
  id: string;
  module: string;
  action: string;
  permission_key?: string | null;
  description?: string | null;
  created_at?: string | null;
};

export type IamSession = {
  id: string;
  tenant_user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  status?: string | null;
  created_at?: string | null;
  revoked_at?: string | null;
};

export type ServiceAccount = {
  id: string;
  tenant_id?: string | null;
  name: string;
  description?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type AuditLog = {
  id: string;
  tenant_id?: string | null;
  actor_user_id?: string | null;
  action?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};
export type AuditTimelineEvent = AuditLog & {
  event_type?: string | null;
  target_table?: string | null;
};

export type ServiceAccountRow = ServiceAccount & {
  last_used_at?: string | null;
};

export type ImpersonationEvent = {
  id: string;
  tenant_id?: string | null;

  admin_user_id?: string | null;
  impersonated_user_id?: string | null;

  impersonator_user_id?: string | null;
  target_user_id?: string | null;

  started_at?: string | null;
  ended_at?: string | null;
  reason?: string | null;
};

export type ImpersonationEventRow = ImpersonationEvent;