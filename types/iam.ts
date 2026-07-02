export type UUID = string;

export type AdminStat = {
  label: string;
  value: number | string;
  hint?: string;
};

export type TenantUser = {
  id: UUID;
  tenant_id?: UUID | null;
  auth_user_id?: UUID | null;
  email?: string | null;
  full_name?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  locked_until?: string | null;
  created_at?: string | null;
};

export type IamRole = {
  id: UUID;
  tenant_id?: UUID | null;
  name: string;
  description?: string | null;
  is_system_role?: boolean | null;
  created_at?: string | null;
};

export type IamPermission = {
  id: UUID;
  key?: string | null;
  permission_key?: string | null;
  module?: string | null;
  action?: string | null;
  description?: string | null;
};

export type AuditLog = {
  id: UUID;
  tenant_id?: UUID | null;
  actor_user_id?: UUID | null;
  action?: string | null;
  entity_type?: string | null;
  entity_id?: UUID | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type IamSession = {
  id: UUID;
  tenant_user_id?: UUID | null;
  user_agent?: string | null;
  ip_address?: string | null;
  revoked_at?: string | null;
  created_at?: string | null;
  last_seen_at?: string | null;
};
