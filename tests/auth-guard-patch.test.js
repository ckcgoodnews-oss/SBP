const fs = require('fs');
const required = [
  'lib/supabase/browser.ts',
  'lib/auth/session.ts',
  'app/login/page.tsx',
  'app/logout/page.tsx',
  'app/api/auth/status/route.ts',
  'components/AuthStatus.tsx',
  'components/AuthGuardNotice.tsx',
  'middleware.ts',
  'docs/AUTH_SETUP.md'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing auth guard patch file: ${file}`);
}
console.log('Auth guard patch test passed.');
