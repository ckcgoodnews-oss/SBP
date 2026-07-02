-- ============================================================
-- COMPATIBILITY PATCH: UNIQUE INDEXES FOR ON CONFLICT
-- Earlier partial runs may have created tables without the
-- unique constraints expected by ON CONFLICT clauses.
-- ============================================================

create unique index if not exists ux_tenants_slug
    on tenants(slug);

create unique index if not exists ux_tenant_users_tenant_email
    on tenant_users(tenant_id, email);

create unique index if not exists ux_services_tenant_name
    on services(tenant_id, name);

create unique index if not exists ux_work_orders_tenant_number
    on work_orders(tenant_id, work_order_number);

create unique index if not exists ux_work_order_assignments_tenant_wo_employee
    on work_order_assignments(tenant_id, work_order_id, employee_id);

create unique index if not exists ux_quotes_tenant_number
    on quotes(tenant_id, quote_number);

create unique index if not exists ux_invoices_tenant_number
    on invoices(tenant_id, invoice_number);

create unique index if not exists ux_product_categories_tenant_name
    on product_categories(tenant_id, name);

create unique index if not exists ux_vendors_tenant_name
    on vendors(tenant_id, name);

create unique index if not exists ux_warehouses_tenant_name
    on warehouses(tenant_id, name);

create unique index if not exists ux_products_tenant_sku
    on products(tenant_id, sku);

create unique index if not exists ux_inventory_balances_tenant_product_warehouse
    on inventory_balances(tenant_id, product_id, warehouse_id);

create unique index if not exists ux_integration_connections_tenant_provider
    on integration_connections(tenant_id, provider);

create unique index if not exists ux_industry_templates_key
    on industry_templates(template_key);
