'use client';

import React, { useMemo, useState } from 'react';

import AdminToast from './AdminToast';
import AdminUsersWorkspaceTabs, { AdminUsersWorkspaceTab } from './AdminUsersWorkspaceTabs';
import InvitationGrid from './InvitationGrid';
import InvitationWizard from './InvitationWizard';
import UserAuditGrid from './UserAuditGrid';
import UserAuditToolbar, { UserAuditActionFilter } from './UserAuditToolbar';
import UserGrid, { SortDirection, UserSortKey } from './UserGrid';
import UserPagination from './UserPagination';
import UserProfileDrawer from './UserProfileDrawer';
import UserSessionsGrid from './UserSessionsGrid';
import UserStats from './UserStats';
import UserToolbar, { UserStatusFilter } from './UserToolbar';
import { TenantUser } from './UserTypes';
import UserWizard from './UserWizard';
import { exportUsersCsv } from './userExport';
import { exportUserAuditCsv } from './userAuditExport';
import { useAdminFeedback } from './useAdminFeedback';
import { useInvitations } from './useInvitations';
import { useUserAudit, UserAuditEvent } from './useUserAudit';
import { useUserSessions } from './useUserSessions';
import { useUsers } from './useUsers';

function isLocked(user: TenantUser) {
  if (!user.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
}

function sortValue(user: TenantUser, key: UserSortKey) {
  const value = user[key];

  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value;
  if (!value) return '';

  return String(value).toLowerCase();
}

function auditMatchesFilter(event: UserAuditEvent, filter: UserAuditActionFilter) {
  if (filter === 'all') return true;

  const action = event.action ?? '';
  const entity = event.entity_type ?? '';

  if (filter === 'password_reset') return action.includes('password');
  if (filter === 'locations') return action.includes('location');
  if (filter === 'session') return entity.includes('session') || action.includes('session');
  if (filter === 'invitation') return entity.includes('invitation') || action.includes('invitation');
  if (filter === 'user') return entity.includes('user') || entity.includes('tenant_user');

  return true;
}

function auditMatchesQuery(event: UserAuditEvent, query: string) {
  const text = query.trim().toLowerCase();
  if (!text) return true;

  const searchable = [
    event.action,
    event.actor_email,
    event.actor_user_id,
    event.target_email,
    event.target_user_id,
    event.entity_type,
    event.entity_id,
    event.metadata ? JSON.stringify(event.metadata) : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchable.includes(text);
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
    requestPasswordReset,
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

  const { auditEvents, loadingAudit, auditError, refreshAudit } = useUserAudit();
  const { toast, notifySuccess, notifyError, clearToast } = useAdminFeedback();

  const [workspaceTab, setWorkspaceTab] = useState<AdminUsersWorkspaceTab>('users');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [sortKey, setSortKey] = useState<UserSortKey>('full_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [auditQuery, setAuditQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<UserAuditActionFilter>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<TenantUser | null>(null);

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

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const aValue = sortValue(a, sortKey);
      const bValue = sortValue(b, sortKey);

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortKey, sortDirection]);

  const pagedRows = useMemo(() => {
    const safePage = Math.max(1, page);
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  const filteredAuditEvents = useMemo(() => {
    return auditEvents.filter(
      (event) => auditMatchesFilter(event, auditActionFilter) && auditMatchesQuery(event, auditQuery)
    );
  }, [auditEvents, auditActionFilter, auditQuery]);

  function changeSort(key: UserSortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }

    setPage(1);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function changeStatus(value: UserStatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function changePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  async function refreshAll() {
    await Promise.all([refresh(), refreshInvitations(), refreshSessions(), refreshAudit()]);
    notifySuccess('Administration data refreshed.');
  }

  function runAction(action: () => Promise<unknown>, successMessage: string) {
    void (async () => {
      try {
        await action();
        notifySuccess(successMessage);
      } catch (err) {
        notifyError(err instanceof Error ? err.message : 'Action failed');
      }
    })();
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

          <button onClick={() => setWizardOpen(true)} style={primaryButton}>
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

      <AdminUsersWorkspaceTabs
        activeTab={workspaceTab}
        onChange={setWorkspaceTab}
        invitationCount={invitations.length}
        sessionCount={sessions.length}
        auditCount={auditEvents.length}
      />

      {workspaceTab === 'users' && (
        <>
          <UserToolbar
            query={query}
            statusFilter={statusFilter}
            pageSize={pageSize}
            totalCount={users.length}
            filteredCount={filteredRows.length}
            onQueryChange={changeQuery}
            onStatusFilterChange={changeStatus}
            onPageSizeChange={changePageSize}
            onRefresh={() => void refreshAll()}
            onExportCsv={() => {
              exportUsersCsv(sortedRows);
              notifySuccess('CSV export created.');
            }}
          />

          <UserGrid
            loading={loading || saving}
            users={pagedRows}
            roles={roles}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={changeSort}
            onEdit={setProfileUser}
            onEnable={(id) => runAction(() => enableUser(id), 'User enabled.')}
            onDisable={(id) => runAction(() => disableUser(id), 'User disabled.')}
            onLock={(id) => runAction(() => lockUser(id, 'Locked from administration console'), 'User locked.')}
            onUnlock={(id) => runAction(() => unlockUser(id), 'User unlocked.')}
            onRequireMfa={(id, required) =>
              runAction(() => requireMfa(id, required), required ? 'MFA required.' : 'MFA requirement removed.')
            }
            onResetFailedLogins={(id) => runAction(() => resetFailedLogins(id), 'Failed login count reset.')}
            onBulkEnable={(selected) => runAction(() => bulkEnableUsers(selected), 'Selected users enabled.')}
            onBulkDisable={(selected) => runAction(() => bulkDisableUsers(selected), 'Selected users disabled.')}
            onBulkLock={(selected) => runAction(() => bulkLockUsers(selected), 'Selected users locked.')}
            onBulkUnlock={(selected) => runAction(() => bulkUnlockUsers(selected), 'Selected users unlocked.')}
            onBulkRequireMfa={(selected, required) =>
              runAction(
                () => bulkRequireMfa(selected, required),
                required ? 'MFA required for selected users.' : 'MFA removed for selected users.'
              )
            }
            onBulkResetFailedLogins={(selected) =>
              runAction(() => bulkResetFailedLogins(selected), 'Failed login counts reset.')
            }
          />

          <UserPagination
            page={page}
            pageSize={pageSize}
            totalCount={sortedRows.length}
            onPageChange={setPage}
          />
        </>
      )}

      {workspaceTab === 'invitations' && (
        <InvitationGrid
          loading={loadingInvitations || savingInvitation}
          invitations={invitations}
          roles={roles}
          onCancel={(id) => runAction(() => cancelInvitation(id), 'Invitation cancelled.')}
        />
      )}

      {workspaceTab === 'sessions' && (
        <UserSessionsGrid
          loading={loadingSessions || savingSession}
          sessions={sessions}
          onRevoke={(id) => runAction(() => revokeSession(id), 'Session revoked.')}
        />
      )}

      {workspaceTab === 'audit' && (
        <>
          <UserAuditToolbar
            query={auditQuery}
            actionFilter={auditActionFilter}
            filteredCount={filteredAuditEvents.length}
            totalCount={auditEvents.length}
            onQueryChange={setAuditQuery}
            onActionFilterChange={setAuditActionFilter}
            onExportCsv={() => {
              exportUserAuditCsv(filteredAuditEvents);
              notifySuccess('Audit CSV export created.');
            }}
          />

          <UserAuditGrid loading={loadingAudit} events={filteredAuditEvents} />
        </>
      )}

      <UserWizard
        open={wizardOpen}
        editingUser={null}
        roles={roles}
        departments={departments}
        defaultTenantId={users[0]?.tenant_id ?? invitations[0]?.tenant_id ?? sessions[0]?.tenant_id ?? auditEvents[0]?.tenant_id ?? ''}
        saving={saving}
        onClose={() => setWizardOpen(false)}
        onCreate={async (form) => {
          await createUser(form);
          notifySuccess('User created.');
        }}
        onUpdate={updateUser}
      />

      <InvitationWizard
        open={inviteOpen}
        roles={roles}
        defaultTenantId={users[0]?.tenant_id ?? invitations[0]?.tenant_id ?? sessions[0]?.tenant_id ?? auditEvents[0]?.tenant_id ?? ''}
        saving={savingInvitation}
        onClose={() => setInviteOpen(false)}
        onCreate={async (form) => {
          await createInvitation(form);
          notifySuccess('Invitation created.');
        }}
      />

      <UserProfileDrawer
        open={Boolean(profileUser)}
        user={profileUser}
        roles={roles}
        departments={departments}
        sessions={sessions}
        auditEvents={auditEvents}
        saving={saving || savingSession}
        onClose={() => setProfileUser(null)}
        onUpdate={async (id, form) => {
          await updateUser(id, form);
          notifySuccess('User profile updated.');
        }}
        onEnable={(id) => enableUser(id)}
        onDisable={(id) => disableUser(id)}
        onLock={(id, reason) => lockUser(id, reason)}
        onUnlock={(id) => unlockUser(id)}
        onRequireMfa={(id, required) => requireMfa(id, required)}
        onResetFailedLogins={(id) => resetFailedLogins(id)}
        onRevokeSession={(id) => revokeSession(id)}
        onPasswordReset={async (id, force, redirectTo) => {
          await requestPasswordReset(id, force, redirectTo);
          notifySuccess('Password reset link generated.');
        }}
      />

      <AdminToast toast={toast} onClose={clearToast} />
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