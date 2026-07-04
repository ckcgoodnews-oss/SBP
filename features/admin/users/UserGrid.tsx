'use client';

import React from 'react';
import { IamRole, TenantUser } from './UserTypes';

type UserGridProps = {
  loading: boolean;
  users: TenantUser[];
  roles: IamRole[];
  onEdit: (user: TenantUser) => void;
  onEnable: (id: string) => void;
  onDisable: (id: string) => void;
  onLock: (id: string) => void;
  onUnlock: (id: string) => void;
  onRequireMfa: (id: string, required: boolean) => void;
  onResetFailedLogins: (id: string) => void;
};

function isLocked(user: TenantUser) {
  if (!user.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
}

function badge(label: string, tone: 'green' | 'red' | 'yellow' | 'gray' | 'blue') {
  const colors: Record<typeof tone, string> = {
    green: '#dcfce7',
    red: '#fee2e2',
    yellow: '#fef9c3',
    gray: '#f3f4f6',
    blue: '#dbeafe',
  };

  return (
    <span style={{ background: colors[tone], borderRadius: 999, padding: '2px 8px', fontSize: 12, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

export default function UserGrid({
  loading,
  users,
  roles,
  onEdit,
  onEnable,
  onDisable,
  onLock,
  onUnlock,
  onRequireMfa,
  onResetFailedLogins,
}: UserGridProps) {
  function getRoleDisplayName(roleKey?: string | null) {
    if (!roleKey) return '—';
    return roles.find((role) => role.role_key === roleKey)?.display_name ?? roleKey;
  }

  return (
    <div style={tableWrap}>
      {loading ? (
        <div style={{ padding: 24 }}>Loading users...</div>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Security</Th>
              <Th>Failed Logins</Th>
              <Th>Last Login</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <Td>
                  <strong>{user.full_name || 'Unnamed User'}</strong>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{user.email}</div>
                </Td>
                <Td>{getRoleDisplayName(user.role)}</Td>
                <Td>{user.title || '—'}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {user.active ? badge('Active', 'green') : badge('Inactive', 'gray')}
                    {isLocked(user) && badge('Locked', 'red')}
                  </div>
                </Td>
                <Td>{user.mfa_required ? badge('MFA', 'blue') : badge('No MFA', 'yellow')}</Td>
                <Td>{user.failed_login_count ?? 0}</Td>
                <Td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button style={smallButton} onClick={() => onEdit(user)}>Edit</button>
                    {user.active ? (
                      <button style={smallButton} onClick={() => onDisable(user.id)}>Disable</button>
                    ) : (
                      <button style={smallButton} onClick={() => onEnable(user.id)}>Enable</button>
                    )}
                    {isLocked(user) ? (
                      <button style={smallButton} onClick={() => onUnlock(user.id)}>Unlock</button>
                    ) : (
                      <button style={smallButton} onClick={() => onLock(user.id)}>Lock</button>
                    )}
                    <button style={smallButton} onClick={() => onRequireMfa(user.id, !user.mfa_required)}>
                      {user.mfa_required ? 'Remove MFA' : 'Require MFA'}
                    </button>
                    <button style={smallButton} onClick={() => onResetFailedLogins(user.id)}>Reset Logins</button>
                  </div>
                </Td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={td}>{children}</td>;
}

const tableWrap: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'auto', background: 'white' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const th: React.CSSProperties = { textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13 };
const td: React.CSSProperties = { padding: '12px 10px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top', fontSize: 14 };
const smallButton: React.CSSProperties = { background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer' };