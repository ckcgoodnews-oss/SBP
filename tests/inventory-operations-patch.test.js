const fs = require('fs');
const required = [
  'lib/validation/inventory-operations.ts',
  'app/api/admin/product-categories/route.ts',
  'app/api/admin/vendors/route.ts',
  'app/api/admin/warehouses/route.ts',
  'app/api/admin/inventory-balances/route.ts',
  'app/api/admin/inventory-adjustments/route.ts',
  'app/api/admin/purchase-orders/route.ts',
  'app/api/admin/purchase-order-items/route.ts',
  'app/admin/product-categories/page.tsx',
  'app/admin/vendors/page.tsx',
  'app/admin/warehouses/page.tsx',
  'app/admin/inventory-balances/page.tsx',
  'app/admin/inventory-adjustments/page.tsx',
  'app/admin/purchase-orders/page.tsx',
  'app/admin/purchase-order-items/page.tsx'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing inventory operations patch file: ${file}`);
}
console.log('Inventory operations patch test passed.');
