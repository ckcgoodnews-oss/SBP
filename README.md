# SBP Admin Schema-Aligned Files

Copy/unzip this package into `C:\SBP_Project\master-app\`.

Fixes:
- Roles UI now uses `role_key`, `display_name`, `system_role`, `active`, `created_at`.
- Permissions UI now uses `module_key`, `action_key`, `display_name`, `description`, `created_at`.
- Roles API orders by `created_at`.
- Permissions API orders by `module_key`.

Test:
```powershell
npm run typecheck
npm run dev
```

Open:
- http://localhost:3000/admin/roles
- http://localhost:3000/api/admin/roles
- http://localhost:3000/admin/permissions
- http://localhost:3000/api/admin/permissions
```
