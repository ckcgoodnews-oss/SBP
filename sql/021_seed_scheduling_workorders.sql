with t as (select id tenant_id from tenants where slug='demo-company'),
e as (
  insert into employees (tenant_id, full_name, email, role)
  select tenant_id, 'Demo Technician', 'tech@example.com', 'technician' from t
  returning id, tenant_id
),
wo as (
  insert into work_orders (tenant_id, customer_id, work_order_number, status, summary, completed_at)
  select c.tenant_id, c.id, 'WO-1001', 'completed', 'Carpet cleaning - three rooms', now()
  from customers c where c.email='maria@example.com'
  returning id, tenant_id
)
insert into work_order_assignments (tenant_id, work_order_id, employee_id)
select wo.tenant_id, wo.id, e.id from wo join e on e.tenant_id=wo.tenant_id;
