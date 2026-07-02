const fs = require('fs');
const required = [
  'lib/validation/workflow-crud.ts',
  'components/LiveSelect.tsx',
  'app/api/admin/service-locations/route.ts',
  'app/api/admin/appointment-requests/route.ts',
  'app/api/admin/payments/route.ts',
  'app/admin/service-locations/page.tsx',
  'app/admin/appointment-requests/page.tsx',
  'app/admin/payments/page.tsx',
  'app/admin/work-orders/page.tsx',
  'app/admin/invoices/page.tsx'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing workflow CRUD patch file: ${file}`);
}
console.log('Workflow CRUD patch test passed.');
