insert into tenants (name, slug, industry, status)
values ('Demo Service Company', 'demo-company', 'carpet_cleaning', 'trial')
on conflict (slug) do nothing;
insert into tenant_users (tenant_id, email, full_name, role, active)
select id, 'owner@example.com', 'Demo Owner', 'owner', true from tenants where slug='demo-company'
on conflict (tenant_id, email) do nothing;
