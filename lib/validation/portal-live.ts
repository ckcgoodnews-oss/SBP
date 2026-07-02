import { z } from 'zod';

const uuid = z.string().uuid();

export const createCustomerAppointmentRequestSchema = z.object({
  tenant_id: uuid,
  customer_id: uuid,
  preferred_date: z.string().optional().or(z.literal('')),
  preferred_window: z.string().trim().max(120).optional().or(z.literal('')),
  service_requested: z.string().trim().min(2).max(240),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  status: z.enum(['requested','reviewing','scheduled','declined','cancelled']).default('requested')
});

export const createTechnicianNoteSchema = z.object({
  tenant_id: uuid,
  work_order_id: uuid,
  employee_id: uuid,
  note: z.string().trim().min(2).max(5000)
});

export const createWorkCompletionSchema = z.object({
  tenant_id: uuid,
  work_order_id: uuid,
  completion_notes: z.string().trim().max(5000).optional().or(z.literal('')),
  completed_at: z.string().optional().or(z.literal(''))
});
