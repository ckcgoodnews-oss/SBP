create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid references customers(id),
  invoice_number text not null,
  status text not null default 'draft',
  total_amount numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  issued_at date,
  due_at date
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  invoice_id uuid references invoices(id),
  amount numeric(12,2) not null,
  payment_date date default current_date
);
