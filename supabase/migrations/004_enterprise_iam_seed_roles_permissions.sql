-- 004_enterprise_iam_seed_roles_permissions.sql
-- Enterprise permission catalog, role templates, tenant roles, and baseline grants.
-- Run after 002 and 005.

-- -----------------------------------------------------------------------------
-- 4) Permission catalog: enterprise coverage
-- -----------------------------------------------------------------------------
insert into public.iam_permissions (module_key, action_key, display_name, description)
select m.module_key,
       a.action_key,
       initcap(replace(m.module_key, '_', ' ')) || ': ' || initcap(a.action_key),
       initcap(a.action_key) || ' access for ' || replace(m.module_key, '_', ' ')
from unnest(array[
  'dashboard','crm','customers','contacts','customer_notes','communication_history',
  'appointment_requests','service_requests','work_orders','work_order_assignments',
  'work_order_checklist_items','work_order_photos','dispatch','schedule','technicians',
  'employees','operations','services','quotes','quote_items','invoices','invoice_items',
  'payments','expenses','tax_rates','financials','inventory','products','product_categories',
  'inventory_adjustments','inventory_balances','warehouses','vendors','purchase_orders',
  'purchase_order_items','reports','report_executive_dashboard','report_monthly_revenue',
  'report_customer_retention','report_job_counts_by_status','report_inventory_reorder',
  'report_technician_productivity','settings','iam','iam_roles','iam_permissions',
  'tenant_users','departments','service_locations','user_location_permissions',
  'audit','audit_logs','api_keys','service_accounts','integrations','integration_connections',
  'notifications','notification_templates','impersonation','templates','industry_templates'
]) as m(module_key)
cross join unnest(array['view','create','edit','delete','export','approve','assign','configure','admin']) as a(action_key)
on conflict (module_key, action_key) do nothing;

-- -----------------------------------------------------------------------------
-- 5) Role templates and tenant roles
-- -----------------------------------------------------------------------------
insert into public.iam_role_templates (template_key, display_name, description, default_permissions)
values
('owner','Owner','Full business owner access','{"all": true}'::jsonb),
('admin','Administrator','Full administrative access','{"all": true}'::jsonb),
('general_manager','General Manager','Business-wide management access','{"operations":["view","create","edit","approve"],"reports":["view","export"],"iam":["view"]}'::jsonb),
('operations_manager','Operations Manager','Operations, dispatch, scheduling, and technician management','{"operations":["view","create","edit","approve"],"dispatch":["view","create","edit","assign"],"schedule":["view","create","edit"],"technicians":["view","assign"]}'::jsonb),
('dispatch_manager','Dispatch Manager','Dispatch and scheduling management','{"dispatch":["view","create","edit","assign"],"schedule":["view","create","edit"],"technicians":["view","assign"]}'::jsonb),
('csr','CSR','Customer service representative access','{"customers":["view","create","edit"],"contacts":["view","create","edit"],"service_requests":["view","create"],"schedule":["view"]}'::jsonb),
('technician','Technician','Field technician access','{"work_orders":["view","edit"],"schedule":["view"],"work_order_photos":["view","create"],"work_order_checklist_items":["view","edit"]}'::jsonb),
('sales','Sales','Sales and customer pipeline access','{"customers":["view","create","edit"],"quotes":["view","create","edit"],"reports":["view"]}'::jsonb),
('accounting','Accounting','Financial access','{"invoices":["view","create","edit"],"payments":["view","create","edit"],"expenses":["view","create","edit"],"reports":["view","export"]}'::jsonb),
('warehouse','Warehouse','Inventory and warehouse operations','{"inventory":["view","create","edit"],"warehouses":["view","create","edit"],"products":["view","create","edit"],"purchase_orders":["view","create","edit"]}'::jsonb),
('customer','Customer','Customer portal access','{"service_requests":["view","create"],"quotes":["view"],"invoices":["view"],"payments":["view"]}'::jsonb),
('vendor','Vendor','Vendor-limited access','{"purchase_orders":["view"],"inventory":["view"]}'::jsonb),
('readonly','Read Only','View-only access','{"view_only": true}'::jsonb),
('api_service_account','API Service Account','Integration and service account access','{"integrations":["view","edit"],"api_keys":["view","create","edit"],"service_accounts":["view"]}'::jsonb)
on conflict (template_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    default_permissions = excluded.default_permissions;

insert into public.iam_roles (tenant_id, role_key, display_name, description, system_role, active)
select t.id, rt.template_key, rt.display_name, rt.description, true, true
from public.tenants t
cross join public.iam_role_templates rt
on conflict (tenant_id, role_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    system_role = true,
    active = true;

-- -----------------------------------------------------------------------------
-- 6) Baseline role permission grants
-- -----------------------------------------------------------------------------
-- Owner/Admin: all permissions
insert into public.iam_role_permissions (tenant_id, role_id, permission_id, allowed)
select r.tenant_id, r.id, p.id, true
from public.iam_roles r
cross join public.iam_permissions p
where r.role_key in ('owner','admin')
on conflict (tenant_id, role_id, permission_id) do update set allowed = true;

-- Readonly: every view permission
insert into public.iam_role_permissions (tenant_id, role_id, permission_id, allowed)
select r.tenant_id, r.id, p.id, true
from public.iam_roles r
join public.iam_permissions p on p.action_key = 'view'
where r.role_key = 'readonly'
on conflict (tenant_id, role_id, permission_id) do update set allowed = true;

-- General role grants from concise mapping.
with grants(role_key, module_key, action_key) as (
  values
  ('general_manager','dashboard','view'),('general_manager','operations','view'),('general_manager','operations','edit'),('general_manager','reports','view'),('general_manager','reports','export'),('general_manager','iam','view'),
  ('operations_manager','work_orders','view'),('operations_manager','work_orders','create'),('operations_manager','work_orders','edit'),('operations_manager','dispatch','view'),('operations_manager','dispatch','assign'),('operations_manager','schedule','view'),('operations_manager','schedule','edit'),('operations_manager','technicians','assign'),
  ('dispatch_manager','dispatch','view'),('dispatch_manager','dispatch','create'),('dispatch_manager','dispatch','edit'),('dispatch_manager','dispatch','assign'),('dispatch_manager','schedule','view'),('dispatch_manager','schedule','edit'),
  ('csr','customers','view'),('csr','customers','create'),('csr','customers','edit'),('csr','contacts','view'),('csr','contacts','create'),('csr','contacts','edit'),('csr','service_requests','view'),('csr','service_requests','create'),('csr','schedule','view'),
  ('technician','work_orders','view'),('technician','work_orders','edit'),('technician','schedule','view'),('technician','work_order_photos','view'),('technician','work_order_photos','create'),('technician','work_order_checklist_items','view'),('technician','work_order_checklist_items','edit'),
  ('sales','customers','view'),('sales','customers','create'),('sales','customers','edit'),('sales','quotes','view'),('sales','quotes','create'),('sales','quotes','edit'),('sales','reports','view'),
  ('accounting','invoices','view'),('accounting','invoices','create'),('accounting','invoices','edit'),('accounting','payments','view'),('accounting','payments','create'),('accounting','payments','edit'),('accounting','expenses','view'),('accounting','expenses','create'),('accounting','expenses','edit'),('accounting','reports','view'),('accounting','reports','export'),
  ('warehouse','inventory','view'),('warehouse','inventory','create'),('warehouse','inventory','edit'),('warehouse','products','view'),('warehouse','products','create'),('warehouse','products','edit'),('warehouse','warehouses','view'),('warehouse','purchase_orders','view'),('warehouse','purchase_orders','create'),('warehouse','purchase_orders','edit'),
  ('customer','service_requests','view'),('customer','service_requests','create'),('customer','quotes','view'),('customer','invoices','view'),('customer','payments','view'),
  ('vendor','purchase_orders','view'),('vendor','inventory','view'),
  ('api_service_account','integration_connections','view'),('api_service_account','integration_connections','edit'),('api_service_account','api_keys','view'),('api_service_account','api_keys','create'),('api_service_account','api_keys','edit'),('api_service_account','service_accounts','view')
)
insert into public.iam_role_permissions (tenant_id, role_id, permission_id, allowed)
select r.tenant_id, r.id, p.id, true
from grants g
join public.iam_roles r on r.role_key = g.role_key
join public.iam_permissions p on p.module_key = g.module_key and p.action_key = g.action_key
on conflict (tenant_id, role_id, permission_id) do update set allowed = true;


select '004_enterprise_iam_seed_roles_permissions_ok' as status;
