const fs = require('fs');
const required = [
  'lib/validation/portal-live.ts',
  'components/PortalTable.tsx',
  'app/api/customer/demo-profile/route.ts',
  'app/api/customer/appointment-requests/route.ts',
  'app/api/customer/quotes/route.ts',
  'app/api/customer/invoices/route.ts',
  'app/api/customer/history/route.ts',
  'app/api/technician/jobs/route.ts',
  'app/api/technician/job-notes/route.ts',
  'app/api/technician/work-completions/route.ts',
  'app/customer/page.tsx',
  'app/customer/appointments/page.tsx',
  'app/customer/quotes/page.tsx',
  'app/customer/invoices/page.tsx',
  'app/customer/history/page.tsx',
  'app/technician/page.tsx',
  'app/technician/jobs/page.tsx',
  'app/technician/notes/page.tsx',
  'app/technician/jobs/complete/page.tsx'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing portal live patch file: ${file}`);
}
console.log('Portal live patch test passed.');
