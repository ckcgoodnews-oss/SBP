const fs = require('fs');
for (const file of ['app/admin/dashboard/page.tsx','app/admin/integrations/page.tsx','sql/060_reports_integrations.sql']) {
  if (!fs.existsSync(file)) throw new Error(`Smoke test failed. Missing ${file}`);
}
console.log('Smoke test passed.');
