import { z } from 'zod';

const uuid = z.string().uuid();
const money = z.coerce.number().finite().min(0).max(999999999.99);
const qty = z.coerce.number().finite().min(0).max(999999999.99);
const signedQty = z.coerce.number().finite().min(-999999999.99).max(999999999.99);

export const createProductCategorySchema = z.object({
  tenant_id: uuid,
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  active: z.coerce.boolean().default(true)
});

export const createVendorSchema = z.object({
  tenant_id: uuid,
  name: z.string().trim().min(2).max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  website: z.string().trim().url().optional().or(z.literal('')),
  notes: z.string().trim().max(3000).optional().or(z.literal('')),
  active: z.coerce.boolean().default(true)
});

export const createWarehouseSchema = z.object({
  tenant_id: uuid,
  name: z.string().trim().min(2).max(200),
  location_type: z.enum(['warehouse','truck','van','office','customer_site','other']).default('warehouse'),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  active: z.coerce.boolean().default(true)
});

export const createInventoryBalanceSchema = z.object({
  tenant_id: uuid,
  product_id: uuid,
  warehouse_id: uuid,
  quantity_on_hand: qty.default(0),
  reorder_point: qty.default(0),
  reorder_quantity: qty.default(0)
});

export const createInventoryAdjustmentSchema = z.object({
  tenant_id: uuid,
  product_id: uuid,
  warehouse_id: uuid,
  adjustment_type: z.enum(['cycle_count','damage','shrinkage','correction','usage','return']),
  quantity_delta: signedQty,
  reason: z.string().trim().min(2).max(500)
});

export const createPurchaseOrderSchema = z.object({
  tenant_id: uuid,
  vendor_id: uuid.optional().or(z.literal('')),
  po_number: z.string().trim().min(1).max(80),
  status: z.enum(['draft','ordered','partially_received','received','cancelled']).default('draft'),
  total_amount: money.default(0)
});

export const createPurchaseOrderItemSchema = z.object({
  tenant_id: uuid,
  purchase_order_id: uuid,
  product_id: uuid.optional().or(z.literal('')),
  description: z.string().trim().min(1).max(500),
  quantity: qty.default(1),
  unit_cost: money.default(0),
  line_total: money.default(0)
});
