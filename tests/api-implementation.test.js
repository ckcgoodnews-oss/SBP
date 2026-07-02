const fs = require('fs');

const required = [
  'lib/supabase/server-admin.ts',
  'lib/api/http.ts',
  'lib/api/tenant.ts',
  'app/api/health/route.ts',
  'app/api/admin/reports/executive/route.ts',
  'app/api/admin/reports/revenue/route.ts',
  'app/api/admin/integrations/route.ts',
  'app/api/admin/notifications/route.ts',
  'app/api/admin/notification-templates/route.ts',
  'app/api/admin/audit-log-events/route.ts'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing API implementation file: ${file}`);
  }
}

const health = fs.readFileSync('app/api/health/route.ts', 'utf8');
if (!health.includes("from('tenants')")) {
  throw new Error('Health route does not query Supabase tenants.');
}

console.log('API implementation patch test passed.');
