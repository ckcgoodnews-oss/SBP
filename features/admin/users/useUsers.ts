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

async function api<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
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

      setRoles(
        (r ?? []).filter(role => role.active !== false)
      );

      setDepartments(
        (d ?? []).filter(dep => dep.active !== false)
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unknown error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function createUser(form: UserForm) {
    setSaving(true);

    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function updateUser(
    id: string,
    form: UserForm
  ) {
    setSaving(true);

    try {
      await api('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({
          id,
          ...form,
        }),
      });

      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function action(
    endpoint: string,
    body: Record<string, unknown>
  ) {
    setSaving(true);

    try {
      await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      await refresh();
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
      action('/api/admin/users/enable', { id }),

    disableUser: (id: string) =>
      action('/api/admin/users/disable', { id }),

    lockUser: (
      id: string,
      reason: string
    ) =>
      action('/api/admin/users/lock', {
        id,
        reason,
      }),

    unlockUser: (id: string) =>
      action('/api/admin/users/unlock', { id }),

    requireMfa: (
      id: string,
      required: boolean
    ) =>
      action('/api/admin/users/require-mfa', {
        id,
        required,
      }),

    resetFailedLogins: (id: string) =>
      action(
        '/api/admin/users/reset-failed-logins',
        {
          id,
        }
      ),

    emptyUserForm,
  };
}