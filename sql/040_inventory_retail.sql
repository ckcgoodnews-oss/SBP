create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sku text,
  name text not null
);

create table if not exists inventory_balances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid references products(id),
  quantity_on_hand numeric(12,2) default 0,
  reorder_point numeric(12,2) default 0
);
