export type Quote = {
  id: string;
  tenant_id?: string | null;
  customer_id?: string | null;
  quote_number?: string | null;
  status?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
  valid_until?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  notes?: string | null;
};

export type QuoteItem = {
  id: string;
  tenant_id?: string | null;
  quote_id?: string | null;
  product_id?: string | null;
  service_id?: string | null;
  description?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  line_total?: number | null;
  created_at?: string | null;
};
