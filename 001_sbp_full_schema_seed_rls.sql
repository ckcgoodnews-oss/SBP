-- ============================================================
-- Service Business Platform Full SQL Migration Pack v1.0
-- Supabase/PostgreSQL
-- Recommended use: NEW Supabase test project
-- ============================================================

begin;

create extension if not exists "pgcrypto";

create table if not exists sbp_schema_versions (
    id uuid primary key default gen_random_uuid(),
    version text not null unique,
    description text not null,
    installed_at timestamptz not null default now()
);

insert into sbp_schema_versions (version, description)
values ('1.0.0', 'SBP full schema, seed data, RLS, and reports')
on conflict (version) do nothing;

-- ============================================================
-- CORE TENANCY
-- ============================================================

create table if not exists tenants (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    industry text,
    status text not null default 'active'
        check (status in ('trial','active','suspended','cancelled')),
    timezone text not null default 'America/Indiana/Indianapolis',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists tenant_users (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    auth_user_id uuid,
    email text not null,
    full_name text not null,
    role text not null check (
        role in ('owner','admin','manager','staff','technician','accountant','customer')
    ),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (tenant_id, email)
);

create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references tenants(id) on delete cascade,
    actor_user_id uuid,
    actor_email text,
    action text not null,
    entity_type text,
    entity_id uuid,
    before_data jsonb,
    after_data jsonb,
    created_at timestamptz not null default now()
);

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from tenant_users tu
        where tu.tenant_id = target_tenant_id
          and tu.auth_user_id = auth.uid()
          and tu.active = true
    );
$$;

create or replace function public.has_tenant_role(target_tenant_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from tenant_users tu
        where tu.tenant_id = target_tenant_id
          and tu.auth_user_id = auth.uid()
          and tu.active = true
          and tu.role = any(allowed_roles)
    );
$$;



-- ============================================================
-- CRM
-- ============================================================

create table if not exists customers (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_type text not null default 'residential'
        check (customer_type in ('residential','commercial','property_manager','government','other')),
    display_name text not null,
    company_name text,
    first_name text,
    last_name text,
    email text,
    phone text,
    mobile_phone text,
    address1 text,
    address2 text,
    city text,
    state text,
    postal_code text,
    notes text,
    status text not null default 'active'
        check (status in ('active','inactive','prospect','archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists contacts (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid not null references customers(id) on delete cascade,
    full_name text not null,
    role_title text,
    phone text,
    email text,
    primary_contact boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists service_locations (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid not null references customers(id) on delete cascade,
    address1 text not null,
    address2 text,
    city text not null,
    state text not null,
    postal_code text not null,
    country text not null default 'US',
    access_notes text,
    service_notes text,
    created_at timestamptz not null default now()
);

create table if not exists service_requests (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid references customers(id) on delete set null,
    name text not null,
    phone text,
    email text,
    service_requested text,
    description text,
    status text not null default 'new'
        check (status in ('new','reviewing','converted','closed','spam','requested','scheduled','declined','cancelled')),
    converted_customer_id uuid references customers(id) on delete set null,
    created_at timestamptz not null default now(),
    converted_at timestamptz
);

create table if not exists customer_notes (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid not null references customers(id) on delete cascade,
    note text not null,
    created_by_email text,
    created_at timestamptz not null default now()
);

create table if not exists communication_history (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid references customers(id) on delete cascade,
    contact_id uuid references contacts(id) on delete set null,
    channel text not null check (channel in ('phone','email','sms','in_person','portal','other')),
    direction text not null check (direction in ('inbound','outbound','internal')),
    subject text,
    body text,
    occurred_at timestamptz not null default now(),
    created_by_email text
);



-- ============================================================
-- OPERATIONS / WORK ORDERS
-- ============================================================

create table if not exists employees (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    full_name text not null,
    email text,
    phone text,
    role text not null default 'technician'
        check (role in ('manager','staff','technician','sales','warehouse')),
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists services (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    description text,
    default_duration_minutes integer not null default 60,
    pricing_model text not null default 'tenant_configured'
        check (pricing_model in ('tenant_configured','flat_rate','hourly','per_room','per_sqft','custom')),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (tenant_id, name)
);

create table if not exists work_orders (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid not null references customers(id),
    service_location_id uuid references service_locations(id),
    service_id uuid references services(id),
    work_order_number text,
    status text not null default 'new'
        check (status in ('new','quoted','scheduled','dispatched','in_progress','completed','cancelled','invoiced','paid')),
    priority text not null default 'normal'
        check (priority in ('low','normal','urgent','emergency')),
    scheduled_start timestamptz,
    scheduled_end timestamptz,
    summary text not null,
    instructions text,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    unique (tenant_id, work_order_number)
);

create table if not exists work_order_assignments (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    work_order_id uuid not null references work_orders(id) on delete cascade,
    employee_id uuid not null references employees(id),
    assignment_role text not null default 'primary'
        check (assignment_role in ('primary','assistant','observer')),
    created_at timestamptz not null default now(),
    unique (tenant_id, work_order_id, employee_id)
);

create table if not exists work_order_checklist_items (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    work_order_id uuid not null references work_orders(id) on delete cascade,
    label text not null,
    sort_order integer not null default 0,
    completed boolean not null default false,
    completed_at timestamptz
);

create table if not exists work_order_photos (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    work_order_id uuid not null references work_orders(id) on delete cascade,
    photo_url text not null,
    photo_type text not null default 'general'
        check (photo_type in ('before','after','general')),
    caption text,
    created_at timestamptz not null default now()
);



-- ============================================================
-- FINANCIALS
-- ============================================================

create table if not exists tax_rates (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    rate numeric(7,6) not null default 0 check (rate >= 0 and rate <= 1),
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists quotes (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid not null references customers(id),
    work_order_id uuid references work_orders(id),
    quote_number text not null,
    status text not null default 'draft'
        check (status in ('draft','sent','accepted','declined','expired','converted')),
    subtotal numeric(12,2) not null default 0,
    tax_amount numeric(12,2) not null default 0,
    discount_amount numeric(12,2) not null default 0,
    total_amount numeric(12,2) not null default 0,
    expires_at date,
    created_at timestamptz not null default now(),
    unique (tenant_id, quote_number)
);

create table if not exists quote_items (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    quote_id uuid not null references quotes(id) on delete cascade,
    description text not null,
    quantity numeric(12,2) not null default 1,
    unit_price numeric(12,2) not null default 0,
    line_total numeric(12,2) not null default 0,
    taxable boolean not null default true
);

create table if not exists invoices (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid not null references customers(id),
    work_order_id uuid references work_orders(id),
    quote_id uuid references quotes(id),
    invoice_number text not null,
    status text not null default 'draft'
        check (status in ('draft','issued','partially_paid','paid','void','past_due')),
    subtotal numeric(12,2) not null default 0,
    tax_amount numeric(12,2) not null default 0,
    discount_amount numeric(12,2) not null default 0,
    total_amount numeric(12,2) not null default 0,
    amount_paid numeric(12,2) not null default 0,
    balance_due numeric(12,2) generated always as (total_amount - amount_paid) stored,
    issued_at date,
    due_at date,
    created_at timestamptz not null default now(),
    unique (tenant_id, invoice_number)
);

create table if not exists invoice_items (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    invoice_id uuid not null references invoices(id) on delete cascade,
    description text not null,
    quantity numeric(12,2) not null default 1,
    unit_price numeric(12,2) not null default 0,
    line_total numeric(12,2) not null default 0,
    taxable boolean not null default true
);

create table if not exists payments (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    invoice_id uuid not null references invoices(id),
    payment_method text not null default 'other'
        check (payment_method in ('cash','check','card_external','ach_external','other')),
    amount numeric(12,2) not null check (amount >= 0),
    payment_date date not null default current_date,
    reference_number text,
    notes text,
    created_at timestamptz not null default now()
);

create table if not exists expenses (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    vendor_name text,
    category text not null,
    amount numeric(12,2) not null,
    expense_date date not null default current_date,
    notes text,
    created_at timestamptz not null default now()
);



-- ============================================================
-- INVENTORY / RETAIL
-- ============================================================

create table if not exists product_categories (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    description text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (tenant_id, name)
);

create table if not exists vendors (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    phone text,
    email text,
    website text,
    notes text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (tenant_id, name)
);

create table if not exists warehouses (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    location_type text not null default 'warehouse'
        check (location_type in ('warehouse','truck','van','office','customer_site','other')),
    address text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (tenant_id, name)
);

create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    sku text,
    name text not null,
    category_id uuid references product_categories(id),
    product_type text not null default 'retail'
        check (product_type in ('retail','service_consumable','equipment','chemical','part','bundle_component')),
    vendor_id uuid references vendors(id),
    manufacturer text,
    unit_of_measure text not null default 'each',
    cost numeric(12,2) not null default 0,
    retail_price numeric(12,2) not null default 0,
    dealer_price numeric(12,2),
    wholesale_price numeric(12,2),
    taxable boolean not null default true,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (tenant_id, sku)
);

create table if not exists inventory_balances (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    product_id uuid not null references products(id) on delete cascade,
    warehouse_id uuid not null references warehouses(id) on delete cascade,
    quantity_on_hand numeric(12,2) not null default 0,
    reorder_point numeric(12,2) not null default 0,
    reorder_quantity numeric(12,2) not null default 0,
    updated_at timestamptz not null default now(),
    unique (tenant_id, product_id, warehouse_id)
);

create table if not exists inventory_adjustments (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    product_id uuid not null references products(id),
    warehouse_id uuid not null references warehouses(id),
    adjustment_type text not null
        check (adjustment_type in ('cycle_count','damage','shrinkage','correction','usage','return')),
    quantity_delta numeric(12,2) not null,
    reason text not null,
    created_at timestamptz not null default now()
);

create table if not exists purchase_orders (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    vendor_id uuid references vendors(id),
    po_number text not null,
    status text not null default 'draft'
        check (status in ('draft','ordered','partially_received','received','cancelled')),
    total_amount numeric(12,2) not null default 0,
    ordered_at date,
    expected_at date,
    created_at timestamptz not null default now(),
    unique (tenant_id, po_number)
);

create table if not exists purchase_order_items (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
    product_id uuid references products(id),
    description text not null,
    quantity numeric(12,2) not null default 1,
    unit_cost numeric(12,2) not null default 0,
    line_total numeric(12,2) not null default 0
);



-- ============================================================
-- PORTALS / INTEGRATIONS / TEMPLATES
-- ============================================================

create table if not exists appointment_requests (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    customer_id uuid not null references customers(id) on delete cascade,
    preferred_date date,
    preferred_window text,
    service_requested text not null,
    description text,
    status text not null default 'requested'
        check (status in ('requested','reviewing','scheduled','declined','cancelled')),
    created_at timestamptz not null default now()
);

create table if not exists integration_connections (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    provider text not null check (provider in ('stripe','square','twilio','sendgrid','quickbooks')),
    status text not null default 'not_configured'
        check (status in ('not_configured','configured','disabled','error')),
    public_config jsonb not null default '{}'::jsonb,
    secret_ref text,
    last_checked_at timestamptz,
    created_at timestamptz not null default now(),
    unique (tenant_id, provider)
);

create table if not exists notification_templates (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    channel text not null check (channel in ('email','sms','in_app')),
    subject_template text,
    body_template text not null,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (tenant_id, name)
);

create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    channel text not null check (channel in ('email','sms','in_app')),
    recipient text not null,
    subject text,
    body text not null,
    status text not null default 'queued' check (status in ('queued','sent','failed','cancelled')),
    provider text check (provider in ('stripe','square','twilio','sendgrid','quickbooks')),
    error_message text,
    created_at timestamptz not null default now(),
    sent_at timestamptz
);

create table if not exists industry_templates (
    id uuid primary key default gen_random_uuid(),
    template_key text not null unique,
    display_name text not null,
    version text not null,
    description text,
    active boolean not null default true,
    template_json jsonb not null,
    created_at timestamptz not null default now()
);

create table if not exists tenant_template_imports (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    template_key text not null,
    template_version text not null,
    imported_by_email text,
    imported_at timestamptz not null default now(),
    import_summary jsonb not null default '{}'::jsonb
);


-- ============================================================
-- ENABLE RLS
-- ============================================================
alter table tenants enable row level security;
alter table tenant_users enable row level security;
alter table audit_logs enable row level security;
alter table customers enable row level security;
alter table contacts enable row level security;
alter table service_locations enable row level security;
alter table service_requests enable row level security;
alter table customer_notes enable row level security;
alter table communication_history enable row level security;
alter table employees enable row level security;
alter table services enable row level security;
alter table work_orders enable row level security;
alter table work_order_assignments enable row level security;
alter table work_order_checklist_items enable row level security;
alter table work_order_photos enable row level security;
alter table tax_rates enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table product_categories enable row level security;
alter table vendors enable row level security;
alter table warehouses enable row level security;
alter table products enable row level security;
alter table inventory_balances enable row level security;
alter table inventory_adjustments enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table appointment_requests enable row level security;
alter table integration_connections enable row level security;
alter table notification_templates enable row level security;
alter table notifications enable row level security;
alter table industry_templates enable row level security;
alter table tenant_template_imports enable row level security;


-- ============================================================
-- RLS POLICIES
-- ============================================================

drop policy if exists "industry templates readable" on industry_templates;
create policy "industry templates readable" on industry_templates for select using (true);

drop policy if exists "tenants read" on tenants;
create policy "tenants read" on tenants for select using (public.is_tenant_member(id));

drop policy if exists "tenants update" on tenants;
create policy "tenants update" on tenants for update
using (public.has_tenant_role(id, array['owner','admin']))
with check (public.has_tenant_role(id, array['owner','admin']));

drop policy if exists "tenant users read" on tenant_users;
create policy "tenant users read" on tenant_users for select using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant users manage" on tenant_users;
create policy "tenant users manage" on tenant_users for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

drop policy if exists "customers read" on customers;
create policy "customers read" on customers for select using (public.is_tenant_member(tenant_id));

drop policy if exists "customers manage" on customers;
create policy "customers manage" on customers for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "contacts read" on contacts;
create policy "contacts read" on contacts for select using (public.is_tenant_member(tenant_id));

drop policy if exists "contacts manage" on contacts;
create policy "contacts manage" on contacts for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "service_locations read" on service_locations;
create policy "service_locations read" on service_locations for select using (public.is_tenant_member(tenant_id));

drop policy if exists "service_locations manage" on service_locations;
create policy "service_locations manage" on service_locations for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "service_requests read" on service_requests;
create policy "service_requests read" on service_requests for select using (public.is_tenant_member(tenant_id));

drop policy if exists "service_requests manage" on service_requests;
create policy "service_requests manage" on service_requests for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "employees read" on employees;
create policy "employees read" on employees for select using (public.is_tenant_member(tenant_id));

drop policy if exists "employees manage" on employees;
create policy "employees manage" on employees for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager']));

drop policy if exists "services read" on services;
create policy "services read" on services for select using (public.is_tenant_member(tenant_id));

drop policy if exists "services manage" on services;
create policy "services manage" on services for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "work_orders read" on work_orders;
create policy "work_orders read" on work_orders for select using (public.is_tenant_member(tenant_id));

drop policy if exists "work_orders manage" on work_orders;
create policy "work_orders manage" on work_orders for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "work_order_assignments read" on work_order_assignments;
create policy "work_order_assignments read" on work_order_assignments for select using (public.is_tenant_member(tenant_id));

drop policy if exists "work_order_assignments manage" on work_order_assignments;
create policy "work_order_assignments manage" on work_order_assignments for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "invoices read" on invoices;
create policy "invoices read" on invoices for select using (public.is_tenant_member(tenant_id));

drop policy if exists "invoices manage" on invoices;
create policy "invoices manage" on invoices for all
using (public.has_tenant_role(tenant_id, array['owner','admin','accountant']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','accountant']));

drop policy if exists "payments read" on payments;
create policy "payments read" on payments for select using (public.is_tenant_member(tenant_id));

drop policy if exists "payments manage" on payments;
create policy "payments manage" on payments for all
using (public.has_tenant_role(tenant_id, array['owner','admin','accountant']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','accountant']));

drop policy if exists "quotes read" on quotes;
create policy "quotes read" on quotes for select using (public.is_tenant_member(tenant_id));

drop policy if exists "quotes manage" on quotes;
create policy "quotes manage" on quotes for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff','accountant']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff','accountant']));

drop policy if exists "products read" on products;
create policy "products read" on products for select using (public.is_tenant_member(tenant_id));

drop policy if exists "products manage" on products;
create policy "products manage" on products for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "inventory_balances read" on inventory_balances;
create policy "inventory_balances read" on inventory_balances for select using (public.is_tenant_member(tenant_id));

drop policy if exists "inventory_balances manage" on inventory_balances;
create policy "inventory_balances manage" on inventory_balances for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "purchase_orders read" on purchase_orders;
create policy "purchase_orders read" on purchase_orders for select using (public.is_tenant_member(tenant_id));

drop policy if exists "purchase_orders manage" on purchase_orders;
create policy "purchase_orders manage" on purchase_orders for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager']));

drop policy if exists "integration_connections read" on integration_connections;
create policy "integration_connections read" on integration_connections for select using (public.is_tenant_member(tenant_id));

drop policy if exists "integration_connections manage" on integration_connections;
create policy "integration_connections manage" on integration_connections for all
using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

drop policy if exists "notifications read" on notifications;
create policy "notifications read" on notifications for select using (public.is_tenant_member(tenant_id));

drop policy if exists "notifications manage" on notifications;
create policy "notifications manage" on notifications for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

drop policy if exists "tenant_template_imports read" on tenant_template_imports;
create policy "tenant_template_imports read" on tenant_template_imports for select using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant_template_imports manage" on tenant_template_imports;
create policy "tenant_template_imports manage" on tenant_template_imports for all
using (public.has_tenant_role(tenant_id, array['owner','admin','manager']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager']));

drop policy if exists "audit_logs read" on audit_logs;
create policy "audit_logs read" on audit_logs for select using (public.is_tenant_member(tenant_id));

drop policy if exists "customer_notes read" on customer_notes;
create policy "customer_notes read" on customer_notes for select using (public.is_tenant_member(tenant_id));

drop policy if exists "communication_history read" on communication_history;
create policy "communication_history read" on communication_history for select using (public.is_tenant_member(tenant_id));

drop policy if exists "work_order_checklist_items read" on work_order_checklist_items;
create policy "work_order_checklist_items read" on work_order_checklist_items for select using (public.is_tenant_member(tenant_id));

drop policy if exists "work_order_photos read" on work_order_photos;
create policy "work_order_photos read" on work_order_photos for select using (public.is_tenant_member(tenant_id));

drop policy if exists "tax_rates read" on tax_rates;
create policy "tax_rates read" on tax_rates for select using (public.is_tenant_member(tenant_id));

drop policy if exists "quote_items read" on quote_items;
create policy "quote_items read" on quote_items for select using (public.is_tenant_member(tenant_id));

drop policy if exists "invoice_items read" on invoice_items;
create policy "invoice_items read" on invoice_items for select using (public.is_tenant_member(tenant_id));

drop policy if exists "expenses read" on expenses;
create policy "expenses read" on expenses for select using (public.is_tenant_member(tenant_id));

drop policy if exists "product_categories read" on product_categories;
create policy "product_categories read" on product_categories for select using (public.is_tenant_member(tenant_id));

drop policy if exists "vendors read" on vendors;
create policy "vendors read" on vendors for select using (public.is_tenant_member(tenant_id));

drop policy if exists "warehouses read" on warehouses;
create policy "warehouses read" on warehouses for select using (public.is_tenant_member(tenant_id));

drop policy if exists "inventory_adjustments read" on inventory_adjustments;
create policy "inventory_adjustments read" on inventory_adjustments for select using (public.is_tenant_member(tenant_id));

drop policy if exists "purchase_order_items read" on purchase_order_items;
create policy "purchase_order_items read" on purchase_order_items for select using (public.is_tenant_member(tenant_id));

drop policy if exists "appointment_requests read" on appointment_requests;
create policy "appointment_requests read" on appointment_requests for select using (public.is_tenant_member(tenant_id));

drop policy if exists "notification_templates read" on notification_templates;
create policy "notification_templates read" on notification_templates for select using (public.is_tenant_member(tenant_id));




-- ============================================================
-- COMPATIBILITY PATCH: INVENTORY BALANCES
-- If inventory_balances was created by an earlier partial run,
-- add missing columns safely before views or seed inserts use them.
-- ============================================================

alter table inventory_balances
    add column if not exists reorder_point numeric(12,2) not null default 0;

alter table inventory_balances
    add column if not exists reorder_quantity numeric(12,2) not null default 0;

alter table inventory_balances
    add column if not exists updated_at timestamptz not null default now();


-- ============================================================
-- REPORTING VIEWS
-- ============================================================

create or replace view report_monthly_revenue as
select tenant_id, date_trunc('month', payment_date)::date as month, sum(amount) as revenue
from payments
group by tenant_id, date_trunc('month', payment_date)::date;

create or replace view report_job_counts_by_status as
select tenant_id, status, count(*) as job_count
from work_orders
group by tenant_id, status;

create or replace view report_technician_productivity as
select a.tenant_id, e.full_name as technician,
       count(*) as assigned_jobs,
       count(*) filter (where w.status = 'completed') as completed_jobs
from work_order_assignments a
join employees e on e.id = a.employee_id
join work_orders w on w.id = a.work_order_id
group by a.tenant_id, e.full_name;

create or replace view report_inventory_reorder as
select b.tenant_id, p.sku, p.name, b.quantity_on_hand, b.reorder_point, b.reorder_quantity
from inventory_balances b
join products p on p.id = b.product_id
where b.quantity_on_hand <= b.reorder_point;

create or replace view report_customer_retention as
select c.tenant_id,
       count(distinct c.id) as total_customers,
       count(distinct w.customer_id) as customers_with_jobs
from customers c
left join work_orders w on w.customer_id = c.id
group by c.tenant_id;

create or replace view report_executive_dashboard as
select t.id as tenant_id,
       coalesce((select sum(amount) from payments p where p.tenant_id = t.id), 0) as total_revenue,
       coalesce((select count(*) from work_orders w where w.tenant_id = t.id), 0) as total_jobs,
       coalesce((select count(*) from customers c where c.tenant_id = t.id), 0) as total_customers,
       coalesce((select count(*) from appointment_requests ar where ar.tenant_id = t.id and ar.status = 'requested'), 0) as open_requests
from tenants t;

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_tenant_users_auth_user_id on tenant_users(auth_user_id);
create index if not exists idx_tenant_users_tenant_id on tenant_users(tenant_id);
create index if not exists idx_customers_tenant_name on customers(tenant_id, display_name);
create index if not exists idx_work_orders_tenant_status on work_orders(tenant_id, status);
create index if not exists idx_invoices_tenant_status on invoices(tenant_id, status);
create index if not exists idx_payments_tenant_date on payments(tenant_id, payment_date);
create index if not exists idx_products_tenant_sku on products(tenant_id, sku);
create index if not exists idx_inventory_balances_tenant_product on inventory_balances(tenant_id, product_id);
create index if not exists idx_integrations_tenant_provider on integration_connections(tenant_id, provider);
create index if not exists idx_notifications_tenant_status on notifications(tenant_id, status);




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



-- ============================================================
-- COMPATIBILITY PATCH: UNIQUE INDEXES FOR ON CONFLICT
-- Earlier partial runs may have created tables without the
-- unique constraints expected by ON CONFLICT clauses.
-- ============================================================

create unique index if not exists ux_tenants_slug
    on tenants(slug);

create unique index if not exists ux_tenant_users_tenant_email
    on tenant_users(tenant_id, email);

create unique index if not exists ux_services_tenant_name
    on services(tenant_id, name);

create unique index if not exists ux_work_orders_tenant_number
    on work_orders(tenant_id, work_order_number);

create unique index if not exists ux_work_order_assignments_tenant_wo_employee
    on work_order_assignments(tenant_id, work_order_id, employee_id);

create unique index if not exists ux_quotes_tenant_number
    on quotes(tenant_id, quote_number);

create unique index if not exists ux_invoices_tenant_number
    on invoices(tenant_id, invoice_number);

create unique index if not exists ux_product_categories_tenant_name
    on product_categories(tenant_id, name);

create unique index if not exists ux_vendors_tenant_name
    on vendors(tenant_id, name);

create unique index if not exists ux_warehouses_tenant_name
    on warehouses(tenant_id, name);

create unique index if not exists ux_products_tenant_sku
    on products(tenant_id, sku);

create unique index if not exists ux_inventory_balances_tenant_product_warehouse
    on inventory_balances(tenant_id, product_id, warehouse_id);

create unique index if not exists ux_integration_connections_tenant_provider
    on integration_connections(tenant_id, provider);

create unique index if not exists ux_industry_templates_key
    on industry_templates(template_key);


-- ============================================================
-- SEED DATA
-- ============================================================

insert into tenants (name, slug, industry, status)
values ('Demo Service Company', 'demo-company', 'carpet_cleaning', 'trial')
on conflict (slug) do nothing;

insert into tenant_users (tenant_id, email, full_name, role, active)
select id, 'owner@example.com', 'Demo Owner', 'owner', true
from tenants where slug = 'demo-company'
on conflict (tenant_id, email) do nothing;

insert into customers (tenant_id, customer_type, display_name, first_name, last_name, email, phone, city, state)
select id, 'residential', 'Maria Thompson', 'Maria', 'Thompson', 'maria@example.com', '555-0112', 'Indianapolis', 'IN'
from tenants where slug = 'demo-company'
on conflict do nothing;

insert into service_locations (tenant_id, customer_id, address1, city, state, postal_code)
select c.tenant_id, c.id, '100 Main St', 'Indianapolis', 'IN', '46201'
from customers c where c.email = 'maria@example.com'
on conflict do nothing;

insert into employees (tenant_id, full_name, email, phone, role)
select id, 'Demo Technician', 'tech@example.com', '555-0150', 'technician'
from tenants where slug = 'demo-company'
on conflict do nothing;

insert into services (tenant_id, name, description, default_duration_minutes, pricing_model)
select id, 'Carpet Cleaning', 'Demo carpet cleaning service', 120, 'per_room'
from tenants where slug = 'demo-company'
on conflict (tenant_id, name) do nothing;

with c as (
    select c.id customer_id, c.tenant_id from customers c where c.email = 'maria@example.com'
), sl as (
    select id service_location_id, tenant_id from service_locations limit 1
), svc as (
    select id service_id, tenant_id from services where name = 'Carpet Cleaning'
)
insert into work_orders (tenant_id, customer_id, service_location_id, service_id, work_order_number, status, priority, scheduled_start, scheduled_end, summary, instructions, completed_at)
select c.tenant_id, c.customer_id, sl.service_location_id, svc.service_id, 'WO-1001', 'completed', 'normal',
       now() + interval '1 day', now() + interval '1 day' + interval '2 hours',
       'Carpet cleaning - three rooms', 'Demo work order.', now()
from c join sl on sl.tenant_id = c.tenant_id join svc on svc.tenant_id = c.tenant_id
on conflict (tenant_id, work_order_number) do nothing;

insert into work_order_assignments (tenant_id, work_order_id, employee_id)
select wo.tenant_id, wo.id, e.id
from work_orders wo join employees e on e.tenant_id = wo.tenant_id
where wo.work_order_number = 'WO-1001'
on conflict (tenant_id, work_order_id, employee_id) do nothing;

insert into tax_rates (tenant_id, name, rate)
select id, 'Demo Sales Tax', 0.070000 from tenants where slug = 'demo-company';

with c as (
    select id customer_id, tenant_id from customers where email = 'maria@example.com'
), wo as (
    select id work_order_id, tenant_id from work_orders where work_order_number = 'WO-1001'
), q as (
    insert into quotes (tenant_id, customer_id, work_order_id, quote_number, status, subtotal, tax_amount, discount_amount, total_amount)
    select c.tenant_id, c.customer_id, wo.work_order_id, 'Q-1001', 'accepted', 250.00, 17.50, 0.00, 267.50
    from c join wo on wo.tenant_id = c.tenant_id
    on conflict (tenant_id, quote_number) do nothing
    returning id, tenant_id, customer_id, work_order_id
)
insert into invoices (tenant_id, customer_id, work_order_id, quote_id, invoice_number, status, subtotal, tax_amount, discount_amount, total_amount, amount_paid, issued_at, due_at)
select q.tenant_id, q.customer_id, q.work_order_id, q.id, 'INV-1001', 'paid', 250.00, 17.50, 0.00, 267.50, 267.50, current_date, current_date
from q
on conflict (tenant_id, invoice_number) do nothing;

insert into payments (tenant_id, invoice_id, payment_method, amount, payment_date, reference_number, notes)
select tenant_id, id, 'cash', 267.50, current_date, 'DEMO-PAID', 'Demo payment'
from invoices where invoice_number = 'INV-1001';

with t as (
    select id tenant_id from tenants where slug = 'demo-company'
), cat as (
    insert into product_categories (tenant_id, name, description)
    select tenant_id, 'Carpet Cleaning Chemicals', 'Demo chemical category' from t
    on conflict (tenant_id, name) do update set description = excluded.description
    returning id, tenant_id
), v as (
    insert into vendors (tenant_id, name, phone, email)
    select tenant_id, 'Demo Supply Vendor', '555-0300', 'orders@supply.example' from t
    on conflict (tenant_id, name) do update set phone = excluded.phone
    returning id, tenant_id
), w as (
    insert into warehouses (tenant_id, name, location_type, address)
    select tenant_id, 'Main Warehouse', 'warehouse', '100 Warehouse Way' from t
    on conflict (tenant_id, name) do update set address = excluded.address
    returning id, tenant_id
), p as (
    insert into products (tenant_id, sku, name, category_id, product_type, vendor_id, manufacturer, unit_of_measure, cost, retail_price, dealer_price, wholesale_price, taxable)
    select cat.tenant_id, 'CHEM-001', 'Demo Carpet Extraction Chemical', cat.id, 'chemical', v.id, 'Demo Manufacturer', 'gallon', 12.50, 29.99, 22.00, 18.00, true
    from cat join v on v.tenant_id = cat.tenant_id
    on conflict (tenant_id, sku) do update set name = excluded.name
    returning id, tenant_id
)
insert into inventory_balances (tenant_id, product_id, warehouse_id, quantity_on_hand, reorder_point, reorder_quantity)
select p.tenant_id, p.id, w.id, 10, 5, 12
from p join w on w.tenant_id = p.tenant_id
on conflict (tenant_id, product_id, warehouse_id) do update
set quantity_on_hand = excluded.quantity_on_hand,
    reorder_point = excluded.reorder_point,
    reorder_quantity = excluded.reorder_quantity;

insert into appointment_requests (tenant_id, customer_id, preferred_date, preferred_window, service_requested, description, status)
select c.tenant_id, c.id, current_date + interval '7 days', 'Morning', 'Carpet Cleaning', 'Demo customer appointment request', 'requested'
from customers c where c.email = 'maria@example.com';

insert into integration_connections (tenant_id, provider, status, public_config, secret_ref)
select id, 'stripe', 'not_configured', '{"mode":"test"}'::jsonb, 'env:STRIPE_SECRET_KEY'
from tenants where slug = 'demo-company'
on conflict (tenant_id, provider) do nothing;

insert into integration_connections (tenant_id, provider, status, public_config, secret_ref)
select id, 'twilio', 'not_configured', '{"sms_enabled":false}'::jsonb, 'env:TWILIO_AUTH_TOKEN'
from tenants where slug = 'demo-company'
on conflict (tenant_id, provider) do nothing;

insert into industry_templates (template_key, display_name, version, description, template_json)
values
('carpet_cleaning', 'Carpet Cleaning', '0.9.0', 'Configuration template for carpet cleaning.', '{}'::jsonb),
('plumbing', 'Plumbing', '0.9.0', 'Configuration template for plumbing.', '{}'::jsonb),
('hvac', 'HVAC', '0.9.0', 'Configuration template for HVAC.', '{}'::jsonb),
('electrical', 'Electrical', '0.9.0', 'Configuration template for electrical.', '{}'::jsonb),
('janitorial', 'Janitorial', '0.9.0', 'Configuration template for janitorial.', '{}'::jsonb),
('restoration', 'Restoration', '0.9.0', 'Configuration template for restoration.', '{}'::jsonb),
('pressure_washing', 'Pressure Washing', '0.9.0', 'Configuration template for pressure washing.', '{}'::jsonb),
('landscaping', 'Landscaping', '0.9.0', 'Configuration template for landscaping.', '{}'::jsonb),
('appliance_repair', 'Appliance Repair', '0.9.0', 'Configuration template for appliance repair.', '{}'::jsonb),
('window_cleaning', 'Window Cleaning', '0.9.0', 'Configuration template for window cleaning.', '{}'::jsonb)
on conflict (template_key) do update
set display_name = excluded.display_name,
    version = excluded.version,
    description = excluded.description;

commit;
