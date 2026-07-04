'use client';

import React from 'react';
import AdminEmptyState from './AdminEmptyState';
import AdminLoadingState from './AdminLoadingState';
import AdminSectionHeader from './AdminSectionHeader';
import { UserSession } from './useUserSessions';

type UserSessionsGridProps = {
  loading: boolean;
  sessions: UserSession[];
  onRevoke: (id: string) => void;
};

function badge(label: string, tone: 'green' | 'red' | 'yellow' | 'gray' | 'blue') {
  const colors: Record<typeof tone, string> = {
    green: '#dcfce7',
    red: '#fee2e2',
    yellow: '#fef9c3',
    gray: '#f3f4f6',
    blue: '#dbeafe',
  };

  return (
    <span style={{ background: colors[tone], borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>
      {label}
    </span>
  );
}

function sessionStatus(session: UserSession) {
  if (session.revoked_at) return badge('Revoked', 'red');
  if (session.ended_at) return badge('Ended', 'gray');
  if (session.status === 'revoked') return badge('Revoked', 'red');
  if (session.status === 'active') return badge('Active', 'green');
  return badge(session.status || 'Unknown', 'yellow');
}

export default function UserSessionsGrid({
  loading,
  sessions,
  onRevoke,
}: UserSessionsGridProps) {
  return (
    <section style={{ marginTop: 28 }}>
      <AdminSectionHeader
        title="User Sessions"
        description="Monitor active sessions, device information, IP addresses, and revoked sessions."
      />

      <div style={tableWrap}>
        {loading ? (
          <AdminLoadingState label="Loading sessions..." />
        ) : sessions.length === 0 ? (
          <AdminEmptyState
            title="No sessions found"
            message="Session records will appear here when users sign in."
          />
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Status</Th>
                <Th>IP Address</Th>
                <Th>User Agent</Th>
                <Th>Started</Th>
                <Th>Last Seen</Th>
                <Th>Revoked</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <Td>
                    <strong>{session.email || 'Unknown User'}</strong>
                    <div style={{ color: '#64748b', fontSize: 12 }}>
                      {session.tenant_user_id || session.auth_user_id || 'No user reference'}
                    </div>
                  </Td>
                  <Td>{sessionStatus(session)}</Td>
                  <Td>{session.ip_address || '—'}</Td>
                  <Td>
                    <div style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.user_agent || '—'}
                    </div>
                  </Td>
                  <Td>{session.started_at ? new Date(session.started_at).toLocaleString() : '—'}</Td>
                  <Td>{session.last_seen_at ? new Date(session.last_seen_at).toLocaleString() : '—'}</Td>
                  <Td>{session.revoked_at ? new Date(session.revoked_at).toLocaleString() : '—'}</Td>
                  <Td>
                    {!session.revoked_at && session.status !== 'revoked' ? (
                      <button style={smallButton} onClick={() => onRevoke(session.id)}>
                        Revoke
                      </button>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: 13 }}>No action</span>
                    )}
                  </Td>
                </tr>
              ))}
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

const smallButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  cursor: 'pointer',
};