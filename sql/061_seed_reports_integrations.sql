insert into integration_connections (tenant_id, provider, status, public_config, secret_ref)
select id, 'stripe', 'not_configured', '{"mode":"test"}'::jsonb, 'env:STRIPE_SECRET_KEY'
from tenants where slug='demo-company'
on conflict (tenant_id, provider) do nothing;

insert into integration_connections (tenant_id, provider, status, public_config, secret_ref)
select id, 'twilio', 'not_configured', '{"sms_enabled":false}'::jsonb, 'env:TWILIO_AUTH_TOKEN'
from tenants where slug='demo-company'
on conflict (tenant_id, provider) do nothing;

insert into notification_templates (tenant_id, name, channel, subject_template, body_template)
select id, 'Appointment Reminder', 'sms', null, 'Reminder: your appointment is scheduled for {{appointment_time}}.'
from tenants where slug='demo-company'
on conflict (tenant_id, name) do nothing;

insert into notifications (tenant_id, channel, recipient, subject, body, status, provider)
select id, 'email', 'customer@example.com', 'Demo Notification', 'This is a demo queued notification.', 'queued', 'sendgrid'
from tenants where slug='demo-company';
