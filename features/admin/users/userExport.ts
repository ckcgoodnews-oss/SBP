import { TenantUser } from './UserTypes';

function isLocked(user: TenantUser) {
  if (!user.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
}

export function exportUsersCsv(users: TenantUser[]) {
  const headers = [
    'Full Name',
    'Email',
    'Role',
    'Title',
    'Active',
    'Locked',
    'MFA Required',
    'Failed Logins',
    'Last Login',
    'Updated At',
  ];

  const rows = users.map((user) => [
    user.full_name ?? '',
    user.email ?? '',
    user.role ?? '',
    user.title ?? '',
    user.active ? 'Yes' : 'No',
    isLocked(user) ? 'Yes' : 'No',
    user.mfa_required ? 'Yes' : 'No',
    String(user.failed_login_count ?? 0),
    user.last_login_at ?? '',
    user.updated_at ?? '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `sbp-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}