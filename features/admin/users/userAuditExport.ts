import { UserAuditEvent } from './useUserAudit';

function metadataToText(metadata?: Record<string, unknown> | null) {
  if (!metadata) return '';

  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('; ');
}

export function exportUserAuditCsv(events: UserAuditEvent[]) {
  const headers = [
    'Time',
    'Action',
    'Target Email',
    'Target User ID',
    'Actor',
    'Entity Type',
    'Entity ID',
    'Metadata',
  ];

  const rows = events.map((event) => [
    event.created_at ?? '',
    event.action ?? '',
    event.target_email ?? '',
    event.target_user_id ?? '',
    event.actor_email ?? event.actor_user_id ?? '',
    event.entity_type ?? '',
    event.entity_id ?? '',
    metadataToText(event.metadata),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `sbp-user-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}