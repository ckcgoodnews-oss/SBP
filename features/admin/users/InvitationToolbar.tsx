'use client';

import React from 'react';

export type InvitationStatusFilter = 'all' | 'pending' | 'accepted' | 'cancelled' | 'expired';

type Props = {
  query: string;
  statusFilter: InvitationStatusFilter;
  totalCount: number;
  filteredCount: number;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: InvitationStatusFilter) => void;
  onExportCsv: () => void;
};

export default function InvitationToolbar({
  query,
  statusFilter,
  totalCount,
  filteredCount,
  onQueryChange,
  onStatusFilterChange,
  onExportCsv,
}: Props) {
  return (
    <section style={toolbar} aria-label="Invitation controls">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search invitations by name, email, role, status, or creator..."
        style={input}
        aria-label="Search invitations"
      />

      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value as InvitationStatusFilter)}
        style={select}
        aria-label="Filter invitation status"
      >
        <option value="all">All invitations</option>
        <option value="pending">Pending</option>
        <option value="accepted">Accepted</option>
        <option value="cancelled">Cancelled</option>
        <option value="expired">Expired</option>
      </select>

      <span style={countText}>
        {filteredCount} of {totalCount}
      </span>

      <button type="button" style={secondaryButton} onClick={onExportCsv}>
        Export Invitations CSV
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