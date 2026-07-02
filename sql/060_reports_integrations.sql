-- SBP Package 08: Reports and Integrations

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

alter table integration_connections enable row level security;
alter table notification_templates enable row level security;
alter table notifications enable row level security;

drop policy if exists "integrations read" on integration_connections;
create policy "integrations read" on integration_connections
for select using (public.is_tenant_member(tenant_id));

drop policy if exists "integrations manage" on integration_connections;
create policy "integrations manage" on integration_connections
for all using (public.has_tenant_role(tenant_id, array['owner','admin']))
with check (public.has_tenant_role(tenant_id, array['owner','admin']));

drop policy if exists "notification templates read" on notification_templates;
create policy "notification templates read" on notification_templates
for select using (public.is_tenant_member(tenant_id));

drop policy if exists "notification templates manage" on notification_templates;
create policy "notification templates manage" on notification_templates
for all using (public.has_tenant_role(tenant_id, array['owner','admin','manager']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager']));

drop policy if exists "notifications read" on notifications;
create policy "notifications read" on notifications
for select using (public.is_tenant_member(tenant_id));

drop policy if exists "notifications manage" on notifications;
create policy "notifications manage" on notifications
for all using (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']))
with check (public.has_tenant_role(tenant_id, array['owner','admin','manager','staff']));

create or replace view report_monthly_revenue as
select tenant_id, date_trunc('month', payment_date)::date as month, sum(amount) as revenue
from payments
group by tenant_id, date_trunc('month', payment_date)::date;

create or replace view report_job_counts_by_status as
select tenant_id, status, count(*) as job_count
from work_orders
group by tenant_id, status;

create or replace view report_technician_productivity as
select
  a.tenant_id,
  e.full_name as technician,
  count(*) as assigned_jobs,
  count(*) filter (where w.status = 'completed') as completed_jobs
from work_order_assignments a
join employees e on e.id = a.employee_id
join work_orders w on w.id = a.work_order_id
group by a.tenant_id, e.full_name;

create or replace view report_inventory_reorder as
select
  b.tenant_id,
  p.sku,
  p.name,
  b.quantity_on_hand,
  b.reorder_point
from inventory_balances b
join products p on p.id = b.product_id
where b.quantity_on_hand <= b.reorder_point;

create or replace view report_customer_retention as
select
  c.tenant_id,
  count(distinct c.id) as total_customers,
  count(distinct w.customer_id) as customers_with_jobs
from customers c
left join work_orders w on w.customer_id = c.id
group by c.tenant_id;

create or replace view report_executive_dashboard as
select
  t.id as tenant_id,
  coalesce((select sum(amount) from payments p where p.tenant_id = t.id), 0) as total_revenue,
  coalesce((select count(*) from work_orders w where w.tenant_id = t.id), 0) as total_jobs,
  coalesce((select count(*) from customers c where c.tenant_id = t.id), 0) as total_customers,
  coalesce((select count(*) from appointment_requests ar where ar.tenant_id = t.id and ar.status = 'requested'), 0) as open_requests
from tenants t;

create index if not exists idx_integrations_tenant_provider on integration_connections(tenant_id, provider);
create index if not exists idx_notifications_tenant_status on notifications(tenant_id, status);
