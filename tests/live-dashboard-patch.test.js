const fs = require('fs');
const required = [
  'lib/api/client.ts',
  'components/LiveState.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/reports/revenue/page.tsx',
  'app/admin/reports/jobs/page.tsx',
  'app/admin/reports/inventory/page.tsx',
  'app/admin/reports/customers/page.tsx',
  'app/admin/reports/technicians/page.tsx',
  'app/admin/integrations/page.tsx',
  'app/admin/notifications/page.tsx',
  'app/admin/audit/page.tsx'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing live dashboard patch file: ${file}`);
}
console.log('Live dashboard patch test passed.');
