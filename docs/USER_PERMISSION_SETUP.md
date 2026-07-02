# User Account and Permissions Setup

## Role Matrix

| Role | Purpose |
|---|---|
| owner | Full business control |
| admin | Administrative control |
| manager | Operations management |
| staff | Office workflow |
| technician | Field work only |
| accountant | Financial records and reports |
| customer | Customer portal only |

## Setup Steps

### 1. Create Auth User in Supabase

Supabase Dashboard:

```text
Authentication > Users > Add User
```

Create users such as:

```text
owner@example.com
admin@example.com
manager@example.com
staff@example.com
tech@example.com
accountant@example.com
customer@example.com
```

### 2. Add User in SBP

Open:

```text
/admin/users
```

Add the same email and select role.

### 3. Optional: Link Auth UUID

Copy the Supabase Auth user UUID and paste it into `auth_user_id`.

### 4. Production hardening

The next patch should enforce role checks inside every API route so users can only access modules allowed by their assigned role.
