with inv as (
  insert into invoices (tenant_id, customer_id, invoice_number, status, total_amount, amount_paid, issued_at, due_at)
  select c.tenant_id, c.id, 'INV-1001', 'paid', 267.50, 267.50, current_date, current_date
  from customers c where c.email='maria@example.com'
  returning id, tenant_id
)
insert into payments (tenant_id, invoice_id, amount, payment_date)
select tenant_id, id, 267.50, current_date from inv;
