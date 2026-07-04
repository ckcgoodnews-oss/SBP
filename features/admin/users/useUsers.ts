'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  ApiResponse,
  Department,
  emptyUserForm,
  IamRole,
  TenantUser,
  UserForm,
} from './UserTypes';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || json.ok === false) {
    throw new Error(json.error || 'Request failed');
  }

  return json.data as T;
}

export function useUsers() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [roles, setRoles] = useState<IamRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [u, r, d] = await Promise.all([
        api<TenantUser[]>('/api/admin/users'),
        api<IamRole[]>('/api/admin/roles'),
        api<Department[]>('/api/admin/departments'),
      ]);

      setUsers(u ?? []);
      setRoles((r ?? []).filter((role) => role.active !== false));
      setDepartments((d ?? []).filter((department) => department.active !== false));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function createUser(form: UserForm) {
    setSaving(true);
    setError('');

    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function updateUser(id: string, form: UserForm) {
    setSaving(true);
    setError('');

    try {
      await api('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...form }),
      });

      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update user');
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function action(endpoint: string, body: Record<string, unknown>, refreshAfter = true) {
    await api(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (refreshAfter) {
      await refresh();
    }
  }

  async function runSingleAction(endpoint: string, body: Record<string, unknown>, failureMessage: string) {
    setSaving(true);
    setError('');

    try {
      await action(endpoint, body, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : failureMessage);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function runBulkAction(
    usersToUpdate: TenantUser[],
    execute: (user: TenantUser) => Promise<void>,
    failureMessage: string
  ) {
    if (usersToUpdate.length === 0) return;

    setSaving(true);
    setError('');

    try {
      for (const user of usersToUpdate) {
        await execute(user);
      }

      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : failureMessage);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return {
    loading,
    saving,
    error,

    users,
    roles,
    departments,

    refresh,
    createUser,
    updateUser,

    enableUser: (id: string) =>
      runSingleAction('/api/admin/users/enable', { id }, 'Failed to enable user'),

    disableUser: (id: string) =>
      runSingleAction('/api/admin/users/disable', { id }, 'Failed to disable user'),

    lockUser: (id: string, reason: string) =>
      runSingleAction('/api/admin/users/lock', { id, reason }, 'Failed to lock user'),

    unlockUser: (id: string) =>
      runSingleAction('/api/admin/users/unlock', { id }, 'Failed to unlock user'),

    requireMfa: (id: string, required: boolean) =>
      runSingleAction('/api/admin/users/require-mfa', { id, required }, 'Failed to update MFA'),

    resetFailedLogins: (id: string) =>
      runSingleAction('/api/admin/users/reset-failed-logins', { id }, 'Failed to reset failed logins'),

    requestPasswordReset: (userId: string, forcePasswordChange: boolean) =>
      runSingleAction(
        '/api/admin/users/password-reset',
        { userId, forcePasswordChange, actorEmail: 'admin@example.com' },
        'Failed to request password reset'
      ),

    bulkEnableUsers: (selected: TenantUser[]) =>
      runBulkAction(
        selected,
        (user) => action('/api/admin/users/enable', { id: user.id }, false),
        'Failed to bulk enable users'
      ),

    bulkDisableUsers: (selected: TenantUser[]) =>
      runBulkAction(
        selected,
        (user) => action('/api/admin/users/disable', { id: user.id }, false),
        'Failed to bulk disable users'
      ),

    bulkLockUsers: (selected: TenantUser[]) =>
      runBulkAction(
        selected,
        (user) =>
          action(
            '/api/admin/users/lock',
            { id: user.id, reason: 'Bulk lock from administration console' },
            false
          ),
        'Failed to bulk lock users'
      ),

    bulkUnlockUsers: (selected: TenantUser[]) =>
      runBulkAction(
        selected,
        (user) => action('/api/admin/users/unlock', { id: user.id }, false),
        'Failed to bulk unlock users'
      ),

    bulkRequireMfa: (selected: TenantUser[], required: boolean) =>
      runBulkAction(
        selected,
        (user) => action('/api/admin/users/require-mfa', { id: user.id, required }, false),
        'Failed to bulk update MFA'
      ),

    bulkResetFailedLogins: (selected: TenantUser[]) =>
      runBulkAction(
        selected,
        (user) => action('/api/admin/users/reset-failed-logins', { id: user.id }, false),
        'Failed to bulk reset failed logins'
      ),

    emptyUserForm,
  };
}