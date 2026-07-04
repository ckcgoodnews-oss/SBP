'use client';

import React, { useMemo, useState } from 'react';

import UserGrid from './UserGrid';
import UserStats from './UserStats';
import UserToolbar, { UserStatusFilter } from './UserToolbar';
import UserWizard from './UserWizard';
import { TenantUser } from './UserTypes';
import { useUsers } from './useUsers';

function isLocked(user: TenantUser) {
  if (!user.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
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
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
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

      <UserStats users={users} />

      {error && (
        <div style={{ background: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16, color: '#991b1b' }}>
          {error}
        </div>
      )}

      <UserToolbar
        query={query}
        statusFilter={statusFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => void refresh()}
      />

      <UserGrid
        loading={loading}
        users={filteredRows}
        roles={roles}
        onEdit={openEdit}
        onEnable={(id) => void enableUser(id)}
        onDisable={(id) => void disableUser(id)}
        onLock={(id) => void lockUser(id, 'Locked from administration console')}
        onUnlock={(id) => void unlockUser(id)}
        onRequireMfa={(id, required) => void requireMfa(id, required)}
        onResetFailedLogins={(id) => void resetFailedLogins(id)}
      />

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

const primaryButton: React.CSSProperties = {
  background: '#0f172a',
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};