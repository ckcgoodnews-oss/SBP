create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  display_name text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);
