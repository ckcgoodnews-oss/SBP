'use client';

import React, { useEffect, useState } from 'react';

import PasswordResetDialog from './PasswordResetDialog';
import UserApiKeysTab from './UserApiKeysTab';
import UserAuditTab from './UserAuditTab';
import UserLocationsTab from './UserLocationsTab';
import UserOverviewTab from './UserOverviewTab';
import UserProfileTabs, { UserProfileTab } from './UserProfileTabs';
import UserRolesTab from './UserRolesTab';
import UserSecurityTab from './UserSecurityTab';
import UserSessionsTab from './UserSessionsTab';
import { Department, IamRole, TenantUser, UserForm } from './UserTypes';
import { UserAuditEvent } from './useUserAudit';
import { UserSession } from './useUserSessions';

type Props = {
  open: boolean;
  user: TenantUser | null;
  roles: IamRole[];
  departments: Department[];
  sessions: UserSession[];
  auditEvents: UserAuditEvent[];
  saving: boolean;
  onClose: () => void;
  onUpdate: (id: string, form: UserForm) => Promise<void>;
  onEnable: (id: string) => Promise<unknown>;
  onDisable: (id: string) => Promise<unknown>;
  onLock: (id: string, reason: string) => Promise<unknown>;
  onUnlock: (id: string) => Promise<unknown>;
  onRequireMfa: (id: string, required: boolean) => Promise<unknown>;
  onResetFailedLogins: (id: string) => Promise<unknown>;
  onRevokeSession: (id: string) => Promise<unknown>;
  onPasswordReset: (id: string, forcePasswordChange: boolean, redirectTo: string) => Promise<unknown>;
};

function buildForm(user: TenantUser | null): UserForm {
  return {
    tenant_id: user?.tenant_id ?? '',
    email: user?.email ?? '',
    full_name: user?.full_name ?? '',
    role: user?.role ?? 'staff',
    title: user?.title ?? '',
    phone: user?.phone ?? '',
    department_id: user?.department_id ?? '',
    mfa_required: Boolean(user?.mfa_required),
    active: Boolean(user?.active),
  };
}

export default function UserProfileDrawer({
  open,
  user,
  roles,
  departments,
  sessions,
  auditEvents,
  saving,
  onClose,
  onUpdate,
  onEnable,
  onDisable,
  onLock,
  onUnlock,
  onRequireMfa,
  onResetFailedLogins,
  onRevokeSession,
  onPasswordReset,
}: Props) {
  const [activeTab, setActiveTab] = useState<UserProfileTab>('overview');
  const [form, setForm] = useState<UserForm>(() => buildForm(user));
  const [localError, setLocalError] = useState('');
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveTab('overview');
    setLocalError('');
    setPasswordResetOpen(false);
    setForm(buildForm(user));
  }, [open, user]);

  if (!open || !user) return null;

  const activeUser = user;

  function updateForm<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!form.email.includes('@')) {
      setLocalError('A valid email is required.');
      return;
    }

    if (!form.full_name.trim()) {
      setLocalError('Full name is required.');
      return;
    }

    setLocalError('');
    await onUpdate(activeUser.id, form);
  }

  async function saveSecurity() {
    await onRequireMfa(activeUser.id, form.mfa_required);
    await save();
  }

  return (
    <div style={backdrop}>
      <aside style={drawer}>
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>{activeUser.full_name || activeUser.email}</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>{activeUser.email}</p>
          </div>

          <button type="button" style={smallButton} onClick={onClose}>
            Close
          </button>
        </div>

        <UserProfileTabs activeTab={activeTab} onChange={setActiveTab} />

        {localError && <div style={errorBox}>{localError}</div>}

        {activeTab === 'overview' && (
          <UserOverviewTab
            user={activeUser}
            form={form}
            roles={roles}
            departments={departments}
            onChange={updateForm}
            onSave={() => void save()}
            saving={saving}
          />
        )}

        {activeTab === 'security' && (
          <UserSecurityTab
            user={activeUser}
            form={form}
            saving={saving}
            onChange={updateForm}
            onSave={() => void saveSecurity()}
            onEnable={() => void onEnable(activeUser.id)}
            onDisable={() => void onDisable(activeUser.id)}
            onLock={() => void onLock(activeUser.id, 'Locked from user profile drawer')}
            onUnlock={() => void onUnlock(activeUser.id)}
            onResetFailedLogins={() => void onResetFailedLogins(activeUser.id)}
            onPasswordReset={() => setPasswordResetOpen(true)}
          />
        )}

        {activeTab === 'roles' && <UserRolesTab user={activeUser} roles={roles} />}

        {activeTab === 'locations' && <UserLocationsTab user={activeUser} />}

        {activeTab === 'sessions' && (
          <UserSessionsTab user={activeUser} sessions={sessions} onRevoke={(id) => void onRevokeSession(id)} />
        )}

        {activeTab === 'audit' && <UserAuditTab user={activeUser} events={auditEvents} />}

        {activeTab === 'apiKeys' && <UserApiKeysTab user={activeUser} />}
      </aside>

      <PasswordResetDialog
        open={passwordResetOpen}
        user={activeUser}
        saving={saving}
        onClose={() => setPasswordResetOpen(false)}
        onSubmit={onPasswordReset}
      />
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: 60,
};

const drawer: React.CSSProperties = {
  width: 760,
  maxWidth: '100%',
  background: 'white',
  height: '100%',
  padding: 24,
  boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.2)',
  overflow: 'auto',
};

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'flex-start',
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

const errorBox: React.CSSProperties = {
  background: '#fee2e2',
  color: '#991b1b',
  borderRadius: 8,
  padding: 10,
  marginTop: 16,
  fontSize: 13,
};