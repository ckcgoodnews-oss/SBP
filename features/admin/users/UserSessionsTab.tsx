'use client';

import React from 'react';
import { TenantUser } from './UserTypes';
import { UserSession } from './useUserSessions';

type Props = {
  user: TenantUser;
  sessions: UserSession[];
  onRevoke: (id: string) => void;
};

export default function UserSessionsTab({ user, sessions, onRevoke }: Props) {
  const userSessions = sessions.filter(
    (session) =>
      session.tenant_user_id === user.id ||
      session.auth_user_id === user.auth_user_id ||
      session.email === user.email
  );

  return (
    <section style={section}>
      <h3 style={{ marginTop: 0 }}>Sessions for {user.full_name || user.email}</h3>

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <Th>Status</Th>
              <Th>IP</Th>
              <Th>Started</Th>
              <Th>Last Seen</Th>
              <Th>Revoked</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {userSessions.map((session) => (
              <tr key={session.id}>
                <Td>{session.revoked_at ? 'Revoked' : session.status || 'Unknown'}</Td>
                <Td>{session.ip_address || '—'}</Td>
                <Td>{session.started_at ? new Date(session.started_at).toLocaleString() : '—'}</Td>
                <Td>{session.last_seen_at ? new Date(session.last_seen_at).toLocaleString() : '—'}</Td>
                <Td>{session.revoked_at ? new Date(session.revoked_at).toLocaleString() : '—'}</Td>
                <Td>
                  {!session.revoked_at && session.status !== 'revoked' ? (
                    <button style={smallButton} onClick={() => onRevoke(session.id)}>
                      Revoke
                    </button>
                  ) : (
                    '—'
                  )}
                </Td>
              </tr>
            ))}

            {userSessions.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 18, textAlign: 'center', color: '#64748b' }}>
                  No sessions found for this user.
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

const smallButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  cursor: 'pointer',
};