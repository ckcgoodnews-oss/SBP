# Auth Setup

## 1. Create a Supabase Auth User

In Supabase:

1. Authentication
2. Users
3. Add user
4. Email: owner@example.com
5. Password: choose a test password

## 2. Link tenant user

The seed data already includes:

```text
tenant_users.email = owner@example.com
tenant_users.role = owner
```

For production, update `tenant_users.auth_user_id` with the Supabase Auth user UUID.

## 3. Test

Go to:

```text
/login
```

Sign in with the test user.

## 4. Next hardening step

The next patch should enforce authorization inside API routes:

- Read browser session/JWT
- Resolve auth user
- Match auth user to tenant_users
- Reject access if tenant/role mismatch
