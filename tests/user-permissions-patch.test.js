const fs = require('fs');
const required = [
  'lib/auth/roles.ts',
  'lib/validation/users.ts',
  'app/api/admin/users/route.ts',
  'app/admin/users/page.tsx',
  'sql/PATCH_004_user_permissions_support.sql',
  'docs/USER_PERMISSION_SETUP.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing user permissions patch file: ${file}`);
}

console.log('User permissions patch test passed.');
