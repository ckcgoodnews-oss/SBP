'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiResponse, IamInvitation, InvitationForm } from './UserTypes';

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
    throw new Error(json.error || 'Invitation request failed');
  }

  return json.data as T;
}

export function useInvitations() {
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [savingInvitation, setSavingInvitation] = useState(false);
  const [invitationError, setInvitationError] = useState('');
  const [invitations, setInvitations] = useState<IamInvitation[]>([]);

  const refreshInvitations = useCallback(async () => {
    setLoadingInvitations(true);
    setInvitationError('');

    try {
      const data = await api<IamInvitation[]>('/api/admin/users/invitations');
      setInvitations(data ?? []);
    } catch (error) {
      setInvitationError(error instanceof Error ? error.message : 'Failed to load invitations');
    } finally {
      setLoadingInvitations(false);
    }
  }, []);

  useEffect(() => {
    void refreshInvitations();
  }, [refreshInvitations]);

  async function createInvitation(form: InvitationForm) {
    setSavingInvitation(true);
    setInvitationError('');

    try {
      await api<IamInvitation>('/api/admin/users/invitations', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      await refreshInvitations();
    } catch (error) {
      setInvitationError(error instanceof Error ? error.message : 'Failed to create invitation');
      throw error;
    } finally {
      setSavingInvitation(false);
    }
  }

  async function cancelInvitation(id: string) {
    setSavingInvitation(true);
    setInvitationError('');

    try {
      await api<IamInvitation>('/api/admin/users/invitations', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: 'cancelled' }),
      });

      await refreshInvitations();
    } catch (error) {
      setInvitationError(error instanceof Error ? error.message : 'Failed to cancel invitation');
      throw error;
    } finally {
      setSavingInvitation(false);
    }
  }

  return {
    invitations,
    loadingInvitations,
    savingInvitation,
    invitationError,
    refreshInvitations,
    createInvitation,
    cancelInvitation,
  };
}