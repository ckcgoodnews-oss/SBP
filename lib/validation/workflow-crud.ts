import { z } from 'zod';

const uuid = z.string().uuid();
const money = z.coerce.number().finite().min(0).max(999999999.99);

export const createServiceLocationSchema = z.object({
  tenant_id: uuid,
  customer_id: uuid,
  address1: z.string().trim().min(2).max(240),
  address2: z.string().trim().max(240).optional().or(z.literal('')),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(80),
  postal_code: z.string().trim().min(2).max(40),
  country: z.string().trim().max(80).default('US'),
  access_notes: z.string().trim().max(2000).optional().or(z.literal('')),
  service_notes: z.string().trim().max(2000).optional().or(z.literal(''))
});

export const createAppointmentRequestSchema = z.object({
  tenant_id: uuid,
  customer_id: uuid,
  preferred_date: z.string().optional().or(z.literal('')),
  preferred_window: z.string().trim().max(120).optional().or(z.literal('')),
  service_requested: z.string().trim().min(2).max(240),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  status: z.enum(['requested','reviewing','scheduled','declined','cancelled']).default('requested')
});

export const createPaymentSchema = z.object({
  tenant_id: uuid,
  invoice_id: uuid,
  payment_method: z.enum(['cash','check','card_external','ach_external','other']).default('other'),
  amount: money,
  payment_date: z.string().optional().or(z.literal('')),
  reference_number: z.string().trim().max(120).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal(''))
});
