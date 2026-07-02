const fs = require('fs');
const required = [
  'sql/PATCH_005_enterprise_iam.sql',
  'lib/validation/enterprise-iam.ts',
  'lib/auth/supabase-admin-auth.ts',
  'app/api/admin/iam/users/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/admin/iam/departments/route.ts',
  'app/api/admin/iam/roles/route.ts',
  'app/api/admin/iam/permissions/route.ts',
  'app/api/admin/iam/api-keys/route.ts',
  'app/api/admin/iam/password-reset/route.ts',
  'app/admin/users/page.tsx',
  'app/admin/iam/page.tsx',
  'app/admin/iam/departments/page.tsx',
  'app/admin/iam/roles/page.tsx',
  'app/admin/iam/permissions/page.tsx',
  'app/admin/iam/api-keys/page.tsx',
  'docs/ENTERPRISE_IAM_GUIDE.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing Enterprise IAM patch file: ${file}`);
}

console.log('Enterprise IAM patch test passed.');
