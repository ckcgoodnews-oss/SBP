import { z } from 'zod';

const uuid = z.string().uuid();

export const enterpriseRoles = [
  'owner',
  'admin',
  'manager',
  'csr',
  'staff',
  'technician',
  'accountant',
  'customer'
] as const;

export const createEnterpriseUserSchema = z.object({
  tenant_id: uuid,
  email: z.string().trim().email(),
  full_name: z.string().trim().min(2).max(200),
  role: z.enum(enterpriseRoles),
  title: z.string().trim().max(160).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  department_id: uuid.optional().or(z.literal('')),
  password: z.string().min(8).max(200).optional().or(z.literal('')),
  send_invite: z.coerce.boolean().default(false),
  mfa_required: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true)
});

export const createDepartmentSchema = z.object({
  tenant_id: uuid,
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  active: z.coerce.boolean().default(true)
});

export const createCustomRoleSchema = z.object({
  tenant_id: uuid,
  role_key: z.string().trim().min(2).max(80).regex(/^[a-z0-9_]+$/),
  display_name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  active: z.coerce.boolean().default(true)
});

export const createServiceAccountSchema = z.object({
  tenant_id: uuid,
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  active: z.coerce.boolean().default(true)
});

export const createApiKeySchema = z.object({
  tenant_id: uuid,
  service_account_id: uuid,
  key_name: z.string().trim().min(2).max(160),
  scopes: z.string().trim().optional().or(z.literal('')),
  expires_at: z.string().optional().or(z.literal(''))
});
