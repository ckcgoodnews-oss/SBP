'use client';

import React, { useMemo, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
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
  onBulkEnable: (users: TenantUser[]) => void;
  onBulkDisable: (users: TenantUser[]) => void;
  onBulkLock: (users: TenantUser[]) => void;
  onBulkUnlock: (users: TenantUser[]) => void;
  onBulkRequireMfa: (users: TenantUser[], required: boolean) => void;
  onBulkResetFailedLogins: (users: TenantUser[]) => void;
};

type PendingConfirm = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  action: () => void;
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
  onBulkEnable,
  onBulkDisable,
  onBulkLock,
  onBulkUnlock,
  onBulkRequireMfa,
  onBulkResetFailedLogins,
}: UserGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedIds.has(user.id)),
    [users, selectedIds]
  );

  const allVisibleSelected = users.length > 0 && users.every((user) => selectedIds.has(user.id));

  function getRoleDisplayName(roleKey?: string | null) {
    if (!roleKey) return '—';
    return roles.find((role) => role.role_key === roleKey)?.display_name ?? roleKey;
  }

  function displayName(user: TenantUser) {
    return user.full_name || user.email || 'this user';
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldSelectAll = !allVisibleSelected;

      for (const user of users) {
        if (shouldSelectAll) next.add(user.id);
        else next.delete(user.id);
      }

      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function confirmAction(confirm: PendingConfirm) {
    setPendingConfirm(confirm);
  }

  function runConfirmedAction() {
    pendingConfirm?.action();
    setPendingConfirm(null);
  }

  function confirmBulk(
    title: string,
    message: string,
    confirmLabel: string,
    action: (users: TenantUser[]) => void,
    danger = false
  ) {
    if (selectedUsers.length === 0) return;

    confirmAction({
      title,
      message,
      confirmLabel,
      danger,
      action: () => {
        action(selectedUsers);
        clearSelection();
      },
    });
  }

  return (
    <div>
      {selectedUsers.length > 0 && (
        <section style={bulkBar}>
          <strong>{selectedUsers.length} selected</strong>

          <button
            style={smallButton}
            onClick={() =>
              confirmBulk(
                'Enable selected users',
                `Enable ${selectedUsers.length} selected user account(s)?`,
                'Enable',
                onBulkEnable
              )
            }
          >
            Enable
          </button>

          <button
            style={smallButton}
            onClick={() =>
              confirmBulk(
                'Disable selected users',
                `Disable ${selectedUsers.length} selected user account(s)? They may lose access.`,
                'Disable',
                onBulkDisable,
                true
              )
            }
          >
            Disable
          </button>

          <button
            style={smallButton}
            onClick={() =>
              confirmBulk(
                'Lock selected users',
                `Lock ${selectedUsers.length} selected user account(s)?`,
                'Lock',
                onBulkLock,
                true
              )
            }
          >
            Lock
          </button>

          <button
            style={smallButton}
            onClick={() =>
              confirmBulk(
                'Unlock selected users',
                `Unlock ${selectedUsers.length} selected user account(s)?`,
                'Unlock',
                onBulkUnlock
              )
            }
          >
            Unlock
          </button>

          <button
            style={smallButton}
            onClick={() =>
              confirmBulk(
                'Require MFA',
                `Require MFA for ${selectedUsers.length} selected user account(s)?`,
                'Require MFA',
                (rows) => onBulkRequireMfa(rows, true)
              )
            }
          >
            Require MFA
          </button>

          <button
            style={smallButton}
            onClick={() =>
              confirmBulk(
                'Remove MFA requirement',
                `Remove MFA requirement for ${selectedUsers.length} selected user account(s)?`,
                'Remove MFA',
                (rows) => onBulkRequireMfa(rows, false)
              )
            }
          >
            Remove MFA
          </button>

          <button
            style={smallButton}
            onClick={() =>
              confirmBulk(
                'Reset failed logins',
                `Reset failed login counts for ${selectedUsers.length} selected user account(s)?`,
                'Reset',
                onBulkResetFailedLogins
              )
            }
          >
            Reset Logins
          </button>

          <button style={smallButton} onClick={clearSelection}>
            Clear
          </button>
        </section>
      )}

      <div style={tableWrap}>
        {loading ? (
          <div style={{ padding: 24 }}>Loading users...</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <Th>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />
                </Th>
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
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelected(user.id)}
                    />
                  </Td>
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
                        <button
                          style={smallButton}
                          onClick={() =>
                            confirmAction({
                              title: 'Disable user',
                              message: `Disable ${displayName(user)}? This may prevent access.`,
                              confirmLabel: 'Disable',
                              danger: true,
                              action: () => onDisable(user.id),
                            })
                          }
                        >
                          Disable
                        </button>
                      ) : (
                        <button style={smallButton} onClick={() => onEnable(user.id)}>Enable</button>
                      )}

                      {isLocked(user) ? (
                        <button style={smallButton} onClick={() => onUnlock(user.id)}>Unlock</button>
                      ) : (
                        <button
                          style={smallButton}
                          onClick={() =>
                            confirmAction({
                              title: 'Lock user',
                              message: `Lock ${displayName(user)}?`,
                              confirmLabel: 'Lock',
                              danger: true,
                              action: () => onLock(user.id),
                            })
                          }
                        >
                          Lock
                        </button>
                      )}

                      <button
                        style={smallButton}
                        onClick={() =>
                          confirmAction({
                            title: user.mfa_required ? 'Remove MFA requirement' : 'Require MFA',
                            message: user.mfa_required
                              ? `Remove MFA requirement for ${displayName(user)}?`
                              : `Require MFA for ${displayName(user)}?`,
                            confirmLabel: user.mfa_required ? 'Remove MFA' : 'Require MFA',
                            action: () => onRequireMfa(user.id, !user.mfa_required),
                          })
                        }
                      >
                        {user.mfa_required ? 'Remove MFA' : 'Require MFA'}
                      </button>

                      <button
                        style={smallButton}
                        onClick={() =>
                          confirmAction({
                            title: 'Reset failed logins',
                            message: `Reset failed login count for ${displayName(user)}?`,
                            confirmLabel: 'Reset',
                            action: () => onResetFailedLogins(user.id),
                          })
                        }
                      >
                        Reset Logins
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.title ?? ''}
        message={pendingConfirm?.message ?? ''}
        confirmLabel={pendingConfirm?.confirmLabel ?? 'Confirm'}
        danger={pendingConfirm?.danger}
        onConfirm={runConfirmedAction}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={td}>{children}</td>;
}

const bulkBar: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
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

const smallButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  cursor: 'pointer',
};