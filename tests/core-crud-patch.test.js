const fs = require('fs');

const required = [
  'lib/validation/core-crud.ts',
  'components/AdminDataTable.tsx',
  'app/api/admin/customers/route.ts',
  'app/api/admin/services/route.ts',
  'app/api/admin/work-orders/route.ts',
  'app/api/admin/invoices/route.ts',
  'app/api/admin/products/route.ts',
  'app/admin/customers/page.tsx',
  'app/admin/services/page.tsx',
  'app/admin/work-orders/page.tsx',
  'app/admin/invoices/page.tsx',
  'app/admin/products/page.tsx'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing core CRUD patch file: ${file}`);
}

console.log('Core CRUD patch test passed.');
