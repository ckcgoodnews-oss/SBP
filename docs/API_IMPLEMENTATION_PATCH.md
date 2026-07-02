# API Implementation Patch

## What Changed

The following API routes now query Supabase:

- `/api/health`
- `/api/admin/reports/executive`
- `/api/admin/reports/revenue`
- `/api/admin/reports/jobs`
- `/api/admin/reports/technicians`
- `/api/admin/reports/inventory`
- `/api/admin/reports/customers`
- `/api/admin/integrations`
- `/api/admin/notifications`
- `/api/admin/notification-templates`
- `/api/admin/audit-log-events`

## Tenant Selection

Each API supports either:

```text
?tenant_slug=demo-company
```

or:

```text
?tenant_id=<uuid>
```

If neither is provided, it defaults to:

```text
NEXT_PUBLIC_DEFAULT_TENANT_SLUG
```

## Example Tests

```powershell
curl "http://localhost:3000/api/health"
curl "http://localhost:3000/api/admin/reports/executive?tenant_slug=demo-company"
curl "http://localhost:3000/api/admin/integrations?tenant_slug=demo-company"
```

## Example POST Integration

```powershell
$body = @{
  provider = "stripe"
  status = "not_configured"
  public_config = "{}"
  secret_ref = "env:STRIPE_SECRET_KEY"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/admin/integrations?tenant_slug=demo-company" `
  -ContentType "application/json" `
  -Body $body
```

## Security

This patch uses the service-role key server-side. Next step is to enforce real authenticated user sessions in middleware and map Supabase auth users to `tenant_users`.
