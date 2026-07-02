-- User permissions support patch

alter table tenant_users
    add column if not exists auth_user_id uuid;

alter table tenant_users
    add column if not exists active boolean not null default true;

create unique index if not exists ux_tenant_users_tenant_email
    on tenant_users(tenant_id, email);

create index if not exists idx_tenant_users_auth_user_id
    on tenant_users(auth_user_id);

-- Optional demo users
insert into tenant_users (tenant_id, email, full_name, role, active)
select id, 'admin@example.com', 'Demo Admin', 'admin', true
from tenants
where slug = 'demo-company'
on conflict (tenant_id, email) do nothing;

insert into tenant_users (tenant_id, email, full_name, role, active)
select id, 'manager@example.com', 'Demo Manager', 'manager', true
from tenants
where slug = 'demo-company'
on conflict (tenant_id, email) do nothing;

insert into tenant_users (tenant_id, email, full_name, role, active)
select id, 'accountant@example.com', 'Demo Accountant', 'accountant', true
from tenants
where slug = 'demo-company'
on conflict (tenant_id, email) do nothing;

insert into tenant_users (tenant_id, email, full_name, role, active)
select id, 'tech@example.com', 'Demo Technician User', 'technician', true
from tenants
where slug = 'demo-company'
on conflict (tenant_id, email) do nothing;

insert into tenant_users (tenant_id, email, full_name, role, active)
select id, 'customer@example.com', 'Demo Customer User', 'customer', true
from tenants
where slug = 'demo-company'
on conflict (tenant_id, email) do nothing;
