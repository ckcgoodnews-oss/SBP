select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

select * from tenants;
select * from customers;
select * from work_orders;
select * from invoices;
select * from products;
select * from report_executive_dashboard;
