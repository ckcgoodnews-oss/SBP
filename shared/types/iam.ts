export type UUID = string;

export interface Tenant { id: UUID; name: string; slug?: string | null; status?: string | null; created_at?: string | null; }
export interface TenantUser { id: UUID; tenant_id: UUID; auth_user_id?: UUID | null; email: string; full_name?: string | null; status?: string | null; locked_until?: string | null; created_at?: string | null; }
export interface IamRole { id: UUID; tenant_id?: UUID | null; name: string; description?: string | null; is_system?: boolean | null; created_at?: string | null; }
export interface IamPermission { id: UUID; module: string; action: string; permission_key: string; description?: string | null; }
export interface AuditLog { id: UUID; tenant_id?: UUID | null; actor_user_id?: UUID | null; action: string; entity_type?: string | null; entity_id?: UUID | null; metadata?: Record<string, unknown> | null; created_at?: string | null; }
export interface IamSession { id: UUID; tenant_id?: UUID | null; tenant_user_id?: UUID | null; auth_user_id?: UUID | null; ip_address?: string | null; user_agent?: string | null; revoked_at?: string | null; created_at?: string | null; last_seen_at?: string | null; }
export interface ApiKeyRecord { id: UUID; tenant_id?: UUID | null; name: string; key_prefix?: string | null; status?: string | null; last_used_at?: string | null; expires_at?: string | null; created_at?: string | null; }
