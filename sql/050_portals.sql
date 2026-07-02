create table if not exists appointment_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid references customers(id),
  service_requested text,
  status text default 'requested',
  created_at timestamptz default now()
);
