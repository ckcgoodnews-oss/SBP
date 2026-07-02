-- Run this if you got:
-- ERROR: column b.reorder_quantity does not exist

alter table inventory_balances
    add column if not exists reorder_point numeric(12,2) not null default 0;

alter table inventory_balances
    add column if not exists reorder_quantity numeric(12,2) not null default 0;

alter table inventory_balances
    add column if not exists updated_at timestamptz not null default now();

-- Then rerun the full migration file, or rerun from the reporting views section onward.
