with p as (
  insert into products (tenant_id, sku, name)
  select id, 'CHEM-001', 'Demo Carpet Extraction Chemical' from tenants where slug='demo-company'
  returning id, tenant_id
)
insert into inventory_balances (tenant_id, product_id, quantity_on_hand, reorder_point)
select tenant_id, id, 10, 5 from p;
