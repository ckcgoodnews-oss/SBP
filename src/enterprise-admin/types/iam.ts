export type UUID = string;

export interface TenantUser {
  id: UUID;
  tenant_id: UUID;
  auth_user_id?: UUID | null;
  email: string;
  full_name?: string | null;
  status?: 'active' | 'inactive' | 'locked' | 'pending' | string;
  created_at?: string;
  last_login_at?: string | null;
}

export interface IamRole {
  id: UUID;
  tenant_id?: UUID | null;
  name: string;
  description?: string | null;
  is_system?: boolean;
  created_at?: string;
}

export interface IamPermission {
  id: UUID;
  module: string;
  action: string;
  key?: string;
  description?: string | null;
}

export interface IamSession {
  id: UUID;
  tenant_id: UUID;
  tenant_user_id: UUID;
  ip_address?: string | null;
  user_agent?: string | null;
  revoked_at?: string | null;
  created_at?: string;
  expires_at?: string | null;
}

export interface AuditLog {
  id: UUID;
  tenant_id?: UUID | null;
  actor_user_id?: UUID | null;
  action: string;
  entity_type?: string | null;
  entity_id?: UUID | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}

export interface AdminDashboardStats {
  users: number;
  pendingInvitations: number;
  lockedAccounts: number;
  activeSessions: number;
  recentSecurityEvents: number;
}
