'use client';

import React, { useMemo, useState } from 'react';

import InvitationGrid from './InvitationGrid';
import InvitationWizard from './InvitationWizard';
import UserAuditGrid from './UserAuditGrid';
import UserGrid from './UserGrid';
import UserSessionsGrid from './UserSessionsGrid';
import UserStats from './UserStats';
import UserToolbar, { UserStatusFilter } from './UserToolbar';
import { TenantUser } from './UserTypes';
import UserWizard from './UserWizard';
import { exportUsersCsv } from './userExport';
import { useInvitations } from './useInvitations';
import { useUserAudit } from './useUserAudit';
import { useUserSessions } from './useUserSessions';
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
    bulkEnableUsers,
    bulkDisableUsers,
    bulkLockUsers,
    bulkUnlockUsers,
    bulkRequireMfa,
    bulkResetFailedLogins,
  } = useUsers();

  const {
    invitations,
    loadingInvitations,
    savingInvitation,
    invitationError,
    refreshInvitations,
    createInvitation,
    cancelInvitation,
  } = useInvitations();

  const {
    sessions,
    loadingSessions,
    savingSession,
    sessionError,
    refreshSessions,
    revokeSession,
  } = useUserSessions();

  const {
    auditEvents,
    loadingAudit,
    auditError,
    refreshAudit,
  } = useUserAudit();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
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

  async function refreshAll() {
    await Promise.all([
      refresh(),
      refreshInvitations(),
      refreshSessions(),
      refreshAudit(),
    ]);
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>User Management</h1>
          <p style={{ marginTop: 6, color: '#64748b' }}>
            Manage tenant users, invitations, sessions, audit history, MFA, lockouts, and security actions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setInviteOpen(true)} style={secondaryButton}>
            Invite User
          </button>

          <button onClick={openCreate} style={primaryButton}>
            Create User
          </button>
        </div>
      </div>

      <UserStats users={users} />

      {(error || invitationError || sessionError || auditError) && (
        <div style={{ background: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16, color: '#991b1b' }}>
          {error || invitationError || sessionError || auditError}
        </div>
      )}

      <UserToolbar
        query={query}
        statusFilter={statusFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => void refreshAll()}
        onExportCsv={() => exportUsersCsv(filteredRows)}
      />

      <UserGrid
        loading={loading || saving}
        users={filteredRows}
        roles={roles}
        onEdit={openEdit}
        onEnable={(id) => void enableUser(id)}
        onDisable={(id) => void disableUser(id)}
        onLock={(id) => void lockUser(id, 'Locked from administration console')}
        onUnlock={(id) => void unlockUser(id)}
        onRequireMfa={(id, required) => void requireMfa(id, required)}
        onResetFailedLogins={(id) => void resetFailedLogins(id)}
        onBulkEnable={(selected) => void bulkEnableUsers(selected)}
        onBulkDisable={(selected) => void bulkDisableUsers(selected)}
        onBulkLock={(selected) => void bulkLockUsers(selected)}
        onBulkUnlock={(selected) => void bulkUnlockUsers(selected)}
        onBulkRequireMfa={(selected, required) => void bulkRequireMfa(selected, required)}
        onBulkResetFailedLogins={(selected) => void bulkResetFailedLogins(selected)}
      />

      <InvitationGrid
        loading={loadingInvitations || savingInvitation}
        invitations={invitations}
        roles={roles}
        onCancel={(id) => void cancelInvitation(id)}
      />

      <UserSessionsGrid
        loading={loadingSessions || savingSession}
        sessions={sessions}
        onRevoke={(id) => void revokeSession(id)}
      />

      <UserAuditGrid
        loading={loadingAudit}
        events={auditEvents}
      />

      <UserWizard
        open={wizardOpen}
        editingUser={editingUser}
        roles={roles}
        departments={departments}
        defaultTenantId={users[0]?.tenant_id ?? invitations[0]?.tenant_id ?? sessions[0]?.tenant_id ?? auditEvents[0]?.tenant_id ?? ''}
        saving={saving}
        onClose={closeWizard}
        onCreate={createUser}
        onUpdate={updateUser}
      />

      <InvitationWizard
        open={inviteOpen}
        roles={roles}
        defaultTenantId={users[0]?.tenant_id ?? invitations[0]?.tenant_id ?? sessions[0]?.tenant_id ?? auditEvents[0]?.tenant_id ?? ''}
        saving={savingInvitation}
        onClose={() => setInviteOpen(false)}
        onCreate={createInvitation}
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

const secondaryButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};