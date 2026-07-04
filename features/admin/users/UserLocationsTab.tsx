'use client';

import React, { useEffect, useState } from 'react';
import { TenantUser } from './UserTypes';
import { useUserLocations } from './useUserLocations';

type Props = {
  user: TenantUser;
};

function locationLabel(location: {
  name?: string | null;
  display_name?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  const name = location.display_name || location.name || 'Unnamed Location';
  const area = [location.city, location.state].filter(Boolean).join(', ');
  return area ? `${name} — ${area}` : name;
}

export default function UserLocationsTab({ user }: Props) {
  const {
    locations,
    assignedLocationIds,
    loadingLocations,
    savingLocations,
    locationError,
    saveLocations,
  } = useUserLocations(user.id);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(assignedLocationIds);
  }, [assignedLocationIds]);

  function toggleLocation(locationId: string) {
    setSelectedIds((current) => {
      if (current.includes(locationId)) {
        return current.filter((id) => id !== locationId);
      }

      return [...current, locationId];
    });
  }

  function selectAll() {
    setSelectedIds(locations.map((location) => location.id));
  }

  function clearAll() {
    setSelectedIds([]);
  }

  return (
    <section style={section}>
      <div style={header}>
        <div>
          <h3 style={{ margin: 0 }}>Location Access</h3>
          <p style={{ marginTop: 6, color: '#64748b' }}>
            Restrict this user to specific branches, service areas, or operating locations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={secondaryButton} onClick={selectAll}>
            Select All
          </button>

          <button type="button" style={secondaryButton} onClick={clearAll}>
            Clear
          </button>
        </div>
      </div>

      {locationError && <div style={errorBox}>{locationError}</div>}

      {loadingLocations ? (
        <div style={loadingBox}>Loading locations...</div>
      ) : (
        <div style={locationGrid}>
          {locations.map((location) => (
            <label key={location.id} style={locationCard}>
              <input
                type="checkbox"
                checked={selectedIds.includes(location.id)}
                onChange={() => toggleLocation(location.id)}
              />

              <span>
                <strong>{locationLabel(location)}</strong>
                <br />
                <span style={{ color: '#64748b', fontSize: 12 }}>
                  {location.address || location.id}
                </span>
              </span>
            </label>
          ))}

          {locations.length === 0 && (
            <div style={emptyBox}>
              No service locations found for this tenant.
            </div>
          )}
        </div>
      )}

      <footer style={footer}>
        <div style={{ color: '#64748b', fontSize: 13 }}>
          {selectedIds.length} selected
        </div>

        <button
          type="button"
          disabled={savingLocations}
          style={primaryButton}
          onClick={() => void saveLocations(selectedIds)}
        >
          {savingLocations ? 'Saving...' : 'Save Locations'}
        </button>
      </footer>
    </section>
  );
}

const section: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  marginTop: 18,
};

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'flex-start',
};

const locationGrid: React.CSSProperties = {
  display: 'grid',
  gap: 10,
};

const locationCard: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 12,
  background: 'white',
};

const footer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  borderTop: '1px solid #e2e8f0',
  paddingTop: 14,
};

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
  padding: '7px 10px',
  cursor: 'pointer',
};

const errorBox: React.CSSProperties = {
  background: '#fee2e2',
  color: '#991b1b',
  borderRadius: 8,
  padding: 10,
  fontSize: 13,
};

const loadingBox: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 18,
  color: '#64748b',
};

const emptyBox: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 18,
  color: '#64748b',
  textAlign: 'center',
};