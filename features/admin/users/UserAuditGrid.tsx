'use client';

import React from 'react';
import { UserAuditEvent } from './useUserAudit';

type UserAuditGridProps = {
  loading: boolean;
  events: UserAuditEvent[];
};

function actionLabel(action?: string | null) {
  if (!action) return 'Unknown';

  return action
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function metadataPreview(metadata?: Record<string, unknown> | null) {
  if (!metadata) return '—';

  const entries = Object.entries(metadata).slice(0, 3);

  if (entries.length === 0) return '—';

  return entries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(', ');
}

function badge(label: string) {
  return (
    <span style={badgeStyle}>
      {label}
    </span>
  );
}

export default function UserAuditGrid({ loading, events }: UserAuditGridProps) {
  return (
    <section style={{ marginTop: 28 }}>
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>User Audit History</h2>
          <p style={{ marginTop: 6, color: '#64748b' }}>
            Review recent user administration and security events.
          </p>
        </div>
      </div>

      <div style={tableWrap}>
        {loading ? (
          <div style={{ padding: 24 }}>Loading audit history...</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Action</Th>
                <Th>Target</Th>
                <Th>Actor</Th>
                <Th>Entity</Th>
                <Th>Metadata</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <Td>{event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</Td>
                  <Td>{badge(actionLabel(event.action))}</Td>
                  <Td>
                    <strong>{event.target_email || '—'}</strong>
                    <div style={{ color: '#64748b', fontSize: 12 }}>
                      {event.target_user_id || event.entity_id || ''}
                    </div>
                  </Td>
                  <Td>{event.actor_email || event.actor_user_id || '—'}</Td>
                  <Td>{event.entity_type || '—'}</Td>
                  <Td>
                    <div style={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {metadataPreview(event.metadata)}
                    </div>
                  </Td>
                </tr>
              ))}

              {events.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                    No audit events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={td}>{children}</td>;
}

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'center',
  marginBottom: 12,
};

const tableWrap: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  overflow: 'auto',
  background: 'white',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: 13,
};

const td: React.CSSProperties = {
  padding: '12px 10px',
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
  fontSize: 14,
};

const badgeStyle: React.CSSProperties = {
  background: '#dbeafe',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 12,
  whiteSpace: 'nowrap',
};