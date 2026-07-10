export type PermissionAction = 'view'|'create'|'edit'|'delete'|'export'|'approve'|'assign'|'configure'|'admin';

export interface AppUser {
  id: string;
  tenant_id: string | null;
  auth_user_id: string | null;
  email: string;
  full_name: string | null;
  role_id: string | null;
  status: 'invited'|'active'|'disabled'|'locked'|'deleted';
  mfa_required: boolean;
  is_service_account: boolean;
}

export interface Role {
  id: string;
  tenant_id: string | null;
  name: string;
  description: string | null;
  is_system_role: boolean;
  is_service_role: boolean;
  active: boolean;
}

export interface Permission {
  id: string;
  module: string;
  action: PermissionAction;
  description: string | null;
}
