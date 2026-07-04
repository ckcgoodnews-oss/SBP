'use client';

import React from 'react';

export type UserAuditActionFilter =
  | 'all'
  | 'password_reset'
  | 'locations'
  | 'session'
  | 'invitation'
  | 'user';

type Props = {
  query: string;
  actionFilter: UserAuditActionFilter;
  filteredCount: number;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onActionFilterChange: (value: UserAuditActionFilter) => void;
  onExportCsv: () => void;
};

export default function UserAuditToolbar({
  query,
  actionFilter,
  filteredCount,
  totalCount,
  onQueryChange,
  onActionFilterChange,
  onExportCsv,
}: Props) {
  return (
    <section style={toolbar} aria-label="Audit history controls">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search audit by action, actor, target, or entity..."
        style={input}
        aria-label="Search audit history"
      />

      <select
        value={actionFilter}
        onChange={(event) => onActionFilterChange(event.target.value as UserAuditActionFilter)}
        style={select}
        aria-label="Filter audit action"
      >
        <option value="all">All audit events</option>
        <option value="password_reset">Password reset</option>
        <option value="locations">Locations</option>
        <option value="session">Sessions</option>
        <option value="invitation">Invitations</option>
        <option value="user">User profile/security</option>
      </select>

      <span style={countText}>
        {filteredCount} of {totalCount}
      </span>

      <button type="button" style={secondaryButton} onClick={onExportCsv}>
        Export Audit CSV
      </button>
    </section>
  );
}

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: 16,
};

const input: React.CSSProperties = {
  flex: '1 1 300px',
  minWidth: 240,
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const select: React.CSSProperties = {
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const countText: React.CSSProperties = {
  color: '#64748b',
  fontSize: 13,
  whiteSpace: 'nowrap',
};

const secondaryButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};