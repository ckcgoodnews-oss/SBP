-- ============================================================
-- COMPATIBILITY PATCH: EXISTING PARTIAL TABLES
-- CREATE TABLE IF NOT EXISTS does not add columns to tables
-- created by earlier partial runs. These ALTERs make the migration
-- safe after earlier failed attempts.
-- ============================================================

alter table customers add column if not exists customer_type text not null default 'residential';
alter table customers add column if not exists company_name text;
alter table customers add column if not exists first_name text;
alter table customers add column if not exists last_name text;
alter table customers add column if not exists mobile_phone text;
alter table customers add column if not exists address1 text;
alter table customers add column if not exists address2 text;
alter table customers add column if not exists city text;
alter table customers add column if not exists state text;
alter table customers add column if not exists postal_code text;
alter table customers add column if not exists notes text;
alter table customers add column if not exists status text not null default 'active';
alter table customers add column if not exists created_at timestamptz not null default now();
alter table customers add column if not exists updated_at timestamptz not null default now();

alter table service_locations add column if not exists address2 text;
alter table service_locations add column if not exists country text not null default 'US';
alter table service_locations add column if not exists access_notes text;
alter table service_locations add column if not exists service_notes text;
alter table service_locations add column if not exists created_at timestamptz not null default now();

alter table service_requests add column if not exists customer_id uuid references customers(id) on delete set null;
alter table service_requests add column if not exists description text;
alter table service_requests add column if not exists converted_customer_id uuid references customers(id) on delete set null;
alter table service_requests add column if not exists converted_at timestamptz;

alter table employees add column if not exists phone text;
alter table employees add column if not exists active boolean not null default true;
alter table employees add column if not exists created_at timestamptz not null default now();

alter table work_orders add column if not exists service_location_id uuid references service_locations(id);
alter table work_orders add column if not exists service_id uuid references services(id);
alter table work_orders add column if not exists priority text not null default 'normal';
alter table work_orders add column if not exists scheduled_start timestamptz;
alter table work_orders add column if not exists scheduled_end timestamptz;
alter table work_orders add column if not exists instructions text;
alter table work_orders add column if not exists completed_at timestamptz;
alter table work_orders add column if not exists created_at timestamptz not null default now();

alter table invoices add column if not exists work_order_id uuid references work_orders(id);
alter table invoices add column if not exists quote_id uuid references quotes(id);
alter table invoices add column if not exists subtotal numeric(12,2) not null default 0;
alter table invoices add column if not exists tax_amount numeric(12,2) not null default 0;
alter table invoices add column if not exists discount_amount numeric(12,2) not null default 0;
alter table invoices add column if not exists amount_paid numeric(12,2) not null default 0;
alter table invoices add column if not exists issued_at date;
alter table invoices add column if not exists due_at date;
alter table invoices add column if not exists created_at timestamptz not null default now();

alter table products add column if not exists category_id uuid references product_categories(id);
alter table products add column if not exists product_type text not null default 'retail';
alter table products add column if not exists vendor_id uuid references vendors(id);
alter table products add column if not exists manufacturer text;
alter table products add column if not exists unit_of_measure text not null default 'each';
alter table products add column if not exists cost numeric(12,2) not null default 0;
alter table products add column if not exists retail_price numeric(12,2) not null default 0;
alter table products add column if not exists dealer_price numeric(12,2);
alter table products add column if not exists wholesale_price numeric(12,2);
alter table products add column if not exists taxable boolean not null default true;
alter table products add column if not exists active boolean not null default true;
alter table products add column if not exists created_at timestamptz not null default now();

alter table inventory_balances add column if not exists warehouse_id uuid references warehouses(id);
alter table inventory_balances add column if not exists reorder_point numeric(12,2) not null default 0;
alter table inventory_balances add column if not exists reorder_quantity numeric(12,2) not null default 0;
alter table inventory_balances add column if not exists updated_at timestamptz not null default now();

alter table appointment_requests add column if not exists preferred_date date;
alter table appointment_requests add column if not exists preferred_window text;
alter table appointment_requests add column if not exists description text;
alter table appointment_requests add column if not exists created_at timestamptz not null default now();
