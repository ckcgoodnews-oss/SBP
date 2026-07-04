'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiResponse } from './UserTypes';

export type UserAuditEvent = {
  id: string;
  tenant_id?: string | null;
  actor_user_id?: string | null;
  actor_email?: string | null;
  action?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  target_user_id?: string | null;
  target_email?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
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
    throw new Error(json.error || 'Audit request failed');
  }

  return json.data as T;
}

export function useUserAudit() {
  const [auditEvents, setAuditEvents] = useState<UserAuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [auditError, setAuditError] = useState('');

  const refreshAudit = useCallback(async () => {
    setLoadingAudit(true);
    setAuditError('');

    try {
      const data = await api<UserAuditEvent[]>('/api/admin/users/audit');
      setAuditEvents(data ?? []);
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : 'Failed to load audit history');
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    void refreshAudit();
  }, [refreshAudit]);

  return {
    auditEvents,
    loadingAudit,
    auditError,
    refreshAudit,
  };
}