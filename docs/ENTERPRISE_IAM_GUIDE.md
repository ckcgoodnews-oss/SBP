# Enterprise IAM Guide

## Setup Order

1. Install patch files.
2. Run `sql/PATCH_005_enterprise_iam.sql`.
3. Restart Next.js.
4. Open `/admin/users`.
5. Create users with roles.
6. Open `/admin/iam/roles` to add custom roles.
7. Open `/admin/iam/permissions` to view granular permission catalog.
8. Open `/admin/iam/departments` to define departments.
9. Open `/admin/iam/api-keys` to create service accounts and API keys.

## One-click user creation

The `/admin/users` page now calls a server API that creates a Supabase Auth user and saves the SBP tenant user record.

## Important production notes

- API keys currently use a placeholder hash. Replace with a real server-side SHA-256/HMAC hash before production.
- MFA fields are stored, but enforcement requires Supabase MFA policy/workflow wiring.
- Session revocation and impersonation are foundation tables/APIs, not yet full UI workflows.
- The next patch should enforce role/permission checks in every API route.
