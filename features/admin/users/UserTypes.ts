export type TenantUser = {
  id: string;
  tenant_id: string;
  auth_user_id?: string | null;
  email: string;
  full_name: string;
  role?: string | null;
  active?: boolean | null;
  locked_until?: string | null;
  lock_reason?: string | null;
  mfa_required?: boolean | null;
  last_login_at?: string | null;
  department_id?: string | null;
  title?: string | null;
  phone?: string | null;
  updated_at?: string | null;
  failed_login_count?: number | null;
};

export type IamRole = {
  id: string;
  role_key: string;
  display_name: string;
  description?: string | null;
  active?: boolean | null;
};

export type Department = {
  id: string;
  name: string;
  description?: string | null;
  active?: boolean | null;
};

export type ApiResponse<T> = {
  ok?: boolean;
  data?: T;
  error?: string;
};

export type UserForm = {
  tenant_id: string;
  email: string;
  full_name: string;
  role: string;
  title: string;
  phone: string;
  department_id: string;
  mfa_required: boolean;
  active: boolean;
};

export type UserWizardStep = 1 | 2 | 3 | 4;

export const emptyUserForm: UserForm = {
  tenant_id: '',
  email: '',
  full_name: '',
  role: 'staff',
  title: '',
  phone: '',
  department_id: '',
  mfa_required: false,
  active: true,
};