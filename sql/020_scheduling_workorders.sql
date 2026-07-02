create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  full_name text not null,
  email text,
  role text default 'technician'
);

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid references customers(id),
  work_order_number text,
  status text not null default 'new',
  summary text not null,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists work_order_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  work_order_id uuid not null references work_orders(id),
  employee_id uuid not null references employees(id)
);
