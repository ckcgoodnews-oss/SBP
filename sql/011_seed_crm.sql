insert into customers (tenant_id, display_name, email, phone)
select id, 'Maria Thompson', 'maria@example.com', '555-0112'
from tenants where slug='demo-company';
