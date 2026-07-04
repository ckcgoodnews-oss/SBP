import { IamInvitation, IamRole } from './UserTypes';

function roleName(roleKey: string | null | undefined, roles: IamRole[]) {
  if (!roleKey) return '';
  return roles.find((role) => role.role_key === roleKey)?.display_name ?? roleKey;
}

export function exportInvitationsCsv(invitations: IamInvitation[], roles: IamRole[]) {
  const headers = [
    'Full Name',
    'Email',
    'Role',
    'Status',
    'Expires At',
    'Created By',
    'Created At',
    'Invitation Token',
  ];

  const rows = invitations.map((invitation) => [
    invitation.full_name ?? '',
    invitation.email ?? '',
    roleName(invitation.role_key, roles),
    invitation.status ?? '',
    invitation.expires_at ?? '',
    invitation.created_by_email ?? '',
    invitation.created_at ?? '',
    invitation.invitation_token ?? '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `sbp-user-invitations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}