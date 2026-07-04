'use client';

import React, { useMemo, useState } from 'react';

import UserWizard from './UserWizard';
import { TenantUser } from './UserTypes';
import { useUsers } from './useUsers';

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
    <span
      style={{
        background: colors[tone],
        borderRadius: 999,
        padding: '2px 8px',
        fontSize: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export default function AdminUsersPage() {
  const {
    loading,
    saving,
    error,
    users,
    roles,
    departments,
    refresh,
    createUser,
    updateUser,
    enableUser,
    disableUser,
    lockUser,
    unlockUser,
    requireMfa,
    resetFailedLogins,
  } = useUsers();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'locked' | 'mfa'>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);

  const filteredRows = useMemo(() => {
    const text = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesText =
        !text ||
        user.email?.toLowerCase().includes(text) ||
        user.full_name?.toLowerCase().includes(text) ||
        user.role?.toLowerCase().includes(text) ||
        user.title?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.active) ||
        (statusFilter === 'inactive' && !user.active) ||
        (statusFilter === 'locked' && isLocked(user)) ||
        (statusFilter === 'mfa' && user.mfa_required);

      return matchesText && matchesStatus;
    });
  }, [users, query, statusFilter]);

  function getRoleDisplayName(roleKey?: string | null) {
    if (!roleKey) return '—';
    return roles.find((role) => role.role_key === roleKey)?.display_name ?? roleKey;
  }

  function openCreate() {
    setEditingUser(null);
    setWizardOpen(true);
  }

  function openEdit(user: TenantUser) {
    setEditingUser(user);
    setWizardOpen(true);
  }

  function closeWizard() {
    setWizardOpen(false);
    setEditingUser(null);
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>User Management</h1>
          <p style={{ marginTop: 6, color: '#64748b' }}>
            Manage tenant users, account status, MFA, lockouts, and security actions.
          </p>
        </div>

        <button onClick={openCreate} style={primaryButton}>
          Create User
        </button>
      </div>

      <section style={statsGrid}>
        <Stat label="Total Users" value={users.length} />
        <Stat label="Active" value={users.filter((u) => u.active).length} />
        <Stat label="Locked" value={users.filter(isLocked).length} />
        <Stat label="MFA Required" value={users.filter((u) => u.mfa_required).length} />
      </section>

      {error && (
        <div style={{ background: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16, color: '#991b1b' }}>
          {error}
        </div>
      )}

      <section style={toolbar}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users by name, email, role, or title..."
          style={input}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          style={select}
        >
          <option value="all">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
          <option value="mfa">MFA required</option>
        </select>

        <button onClick={() => void refresh()} style={secondaryButton}>
          Refresh
        </button>
      </section>

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
              {filteredRows.map((user) => (
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
                  <Td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {user.mfa_required ? badge('MFA', 'blue') : badge('No MFA', 'yellow')}
                    </div>
                  </Td>
                  <Td>{user.failed_login_count ?? 0}</Td>
                  <Td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button style={smallButton} onClick={() => openEdit(user)}>
                        Edit
                      </button>

                      {user.active ? (
                        <button style={smallButton} onClick={() => void disableUser(user.id)}>
                          Disable
                        </button>
                      ) : (
                        <button style={smallButton} onClick={() => void enableUser(user.id)}>
                          Enable
                        </button>
                      )}

                      {isLocked(user) ? (
                        <button style={smallButton} onClick={() => void unlockUser(user.id)}>
                          Unlock
                        </button>
                      ) : (
                        <button
                          style={smallButton}
                          onClick={() => void lockUser(user.id, 'Locked from administration console')}
                        >
                          Lock
                        </button>
                      )}

                      <button style={smallButton} onClick={() => void requireMfa(user.id, !user.mfa_required)}>
                        {user.mfa_required ? 'Remove MFA' : 'Require MFA'}
                      </button>

                      <button style={smallButton} onClick={() => void resetFailedLogins(user.id)}>
                        Reset Logins
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
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

      <UserWizard
        open={wizardOpen}
        editingUser={editingUser}
        roles={roles}
        departments={departments}
        defaultTenantId={users[0]?.tenant_id ?? ''}
        saving={saving}
        onClose={closeWizard}
        onCreate={createUser}
        onUpdate={updateUser}
      />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={td}>{children}</td>;
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 12,
  margin: '20px 0',
};

const statCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 16,
  background: 'white',
};

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: 12,
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

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const select: React.CSSProperties = {
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const primaryButton: React.CSSProperties = {
  background: '#0f172a',
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};

const secondaryButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
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