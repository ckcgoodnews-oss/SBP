insert into appointment_requests (tenant_id, customer_id, service_requested, status)
select c.tenant_id, c.id, 'Carpet Cleaning', 'requested'
from customers c where c.email='maria@example.com';
