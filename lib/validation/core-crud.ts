import { z } from 'zod';

const uuid = z.string().uuid();
const money = z.coerce.number().finite().min(0).max(999999999.99);

export const createCustomerSchema = z.object({
  tenant_id: uuid,
  customer_type: z.enum(['residential','commercial','property_manager','government','other']).default('residential'),
  display_name: z.string().trim().min(2).max(240),
  company_name: z.string().trim().max(240).optional().or(z.literal('')),
  first_name: z.string().trim().max(120).optional().or(z.literal('')),
  last_name: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  state: z.string().trim().max(80).optional().or(z.literal('')),
  status: z.enum(['active','inactive','prospect','archived']).default('active')
});

export const createServiceSchema = z.object({
  tenant_id: uuid,
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  default_duration_minutes: z.coerce.number().int().positive().max(1440).default(60),
  pricing_model: z.enum(['tenant_configured','flat_rate','hourly','per_room','per_sqft','custom']).default('tenant_configured'),
  active: z.coerce.boolean().default(true)
});

export const createWorkOrderSchema = z.object({
  tenant_id: uuid,
  customer_id: uuid,
  service_id: uuid.optional().or(z.literal('')),
  work_order_number: z.string().trim().min(1).max(80),
  status: z.enum(['new','quoted','scheduled','dispatched','in_progress','completed','cancelled','invoiced','paid']).default('new'),
  priority: z.enum(['low','normal','urgent','emergency']).default('normal'),
  summary: z.string().trim().min(2).max(240),
  instructions: z.string().trim().max(5000).optional().or(z.literal(''))
});

export const createInvoiceSchema = z.object({
  tenant_id: uuid,
  customer_id: uuid,
  work_order_id: uuid.optional().or(z.literal('')),
  invoice_number: z.string().trim().min(1).max(80),
  status: z.enum(['draft','issued','partially_paid','paid','void','past_due']).default('draft'),
  subtotal: money.default(0),
  tax_amount: money.default(0),
  discount_amount: money.default(0),
  total_amount: money.default(0),
  amount_paid: money.default(0)
});

export const createProductSchema = z.object({
  tenant_id: uuid,
  sku: z.string().trim().max(80).optional().or(z.literal('')),
  name: z.string().trim().min(2).max(240),
  product_type: z.enum(['retail','service_consumable','equipment','chemical','part','bundle_component']).default('retail'),
  unit_of_measure: z.string().trim().min(1).max(40).default('each'),
  cost: money.default(0),
  retail_price: money.default(0),
  active: z.coerce.boolean().default(true)
});
