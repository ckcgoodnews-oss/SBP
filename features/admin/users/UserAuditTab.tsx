'use client';

import React from 'react';
import { TenantUser } from './UserTypes';
import { UserAuditEvent } from './useUserAudit';

type Props = {
  user: TenantUser;
  events: UserAuditEvent[];
};

export default function UserAuditTab({ user, events }: Props) {
  const userEvents = events.filter(
    (event) =>
      event.target_user_id === user.id ||
      event.entity_id === user.id ||
      event.target_email === user.email
  );

  return (
    <section style={section}>
      <h3 style={{ marginTop: 0 }}>Audit History for {user.full_name || user.email}</h3>

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Action</Th>
              <Th>Actor</Th>
              <Th>Entity</Th>
            </tr>
          </thead>
          <tbody>
            {userEvents.map((event) => (
              <tr key={event.id}>
                <Td>{event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</Td>
                <Td>{event.action || '—'}</Td>
                <Td>{event.actor_email || event.actor_user_id || '—'}</Td>
                <Td>{event.entity_type || '—'}</Td>
              </tr>
            ))}

            {userEvents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 18, textAlign: 'center', color: '#64748b' }}>
                  No audit events found for this user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

const section: React.CSSProperties = { marginTop: 18 };

const tableWrap: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  overflow: 'auto',
  background: 'white',
};

const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: 13,
};

const td: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: 14,
};