'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiResponse, ServiceLocation } from './UserTypes';

type UserLocationsResponse = {
  locations: ServiceLocation[];
  assigned_location_ids: string[];
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
    throw new Error(json.error || 'Location request failed');
  }

  return json.data as T;
}

export function useUserLocations(userId?: string | null) {
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [assignedLocationIds, setAssignedLocationIds] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [savingLocations, setSavingLocations] = useState(false);
  const [locationError, setLocationError] = useState('');

  const refreshLocations = useCallback(async () => {
    if (!userId) {
      setLocations([]);
      setAssignedLocationIds([]);
      return;
    }

    setLoadingLocations(true);
    setLocationError('');

    try {
      const data = await api<UserLocationsResponse>(
        `/api/admin/users/locations?userId=${encodeURIComponent(userId)}`
      );

      setLocations((data.locations ?? []).filter((location) => location.active !== false));
      setAssignedLocationIds(data.assigned_location_ids ?? []);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to load user locations');
    } finally {
      setLoadingLocations(false);
    }
  }, [userId]);

  useEffect(() => {
    void refreshLocations();
  }, [refreshLocations]);

  async function saveLocations(locationIds: string[]) {
    if (!userId) return;

    setSavingLocations(true);
    setLocationError('');

    try {
      await api('/api/admin/users/locations', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          locationIds,
          actorEmail: 'admin@example.com',
        }),
      });

      await refreshLocations();
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to save user locations');
      throw error;
    } finally {
      setSavingLocations(false);
    }
  }

  return {
    locations,
    assignedLocationIds,
    loadingLocations,
    savingLocations,
    locationError,
    refreshLocations,
    saveLocations,
  };
}