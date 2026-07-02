import { z } from 'zod';

const uuid = z.string().uuid();

export const createTenantUserSchema = z.object({
  tenant_id: uuid,
  email: z.string().trim().email(),
  full_name: z.string().trim().min(2).max(200),
  role: z.enum(['owner','admin','manager','staff','technician','accountant','customer']),
  auth_user_id: uuid.optional().or(z.literal('')),
  active: z.coerce.boolean().default(true)
});

export const updateTenantUserSchema = createTenantUserSchema.partial().extend({
  id: uuid
});
