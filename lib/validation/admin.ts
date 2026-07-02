import { z } from 'zod';

export const idSchema = z.object({ id: z.string().uuid() });

export const tenantUserCreateSchema = z.object({
  tenant_id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1),
  role: z.string().min(1),
  title: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  mfa_required: z.boolean().optional(),
});

export const tenantUserUpdateSchema = tenantUserCreateSchema.partial().extend({ id: z.string().uuid() });

export const roleCreateSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  is_system: z.boolean().optional(),
});

export const roleUpdateSchema = roleCreateSchema.partial().extend({ id: z.string().uuid() });
