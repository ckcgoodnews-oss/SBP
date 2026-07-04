'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiResponse } from './UserTypes';

export type UserSession = {
  id: string;
  tenant_id?: string | null;
  tenant_user_id?: string | null;
  auth_user_id?: string | null;
  email?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  status?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  last_seen_at?: string | null;
  revoked_at?: string | null;
  revoked_by_tenant_user_id?: string | null;
  revoke_reason?: string | null;
};

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
    throw new Error(json.error || 'Session request failed');
  }

  return json.data as T;
}

export function useUserSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const refreshSessions = useCallback(async () => {
    setLoadingSessions(true);
    setSessionError('');

    try {
      const data = await api<UserSession[]>('/api/admin/users/sessions');
      setSessions(data ?? []);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  async function revokeSession(id: string, reason = 'Revoked from administration console') {
    setSavingSession(true);
    setSessionError('');

    try {
      await api<UserSession>('/api/admin/users/sessions/revoke', {
        method: 'POST',
        body: JSON.stringify({ id, reason }),
      });

      await refreshSessions();
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Failed to revoke session');
      throw error;
    } finally {
      setSavingSession(false);
    }
  }

  return {
    sessions,
    loadingSessions,
    savingSession,
    sessionError,
    refreshSessions,
    revokeSession,
  };
}