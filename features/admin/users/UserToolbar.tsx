'use client';

import React from 'react';

export type UserStatusFilter = 'all' | 'active' | 'inactive' | 'locked' | 'mfa';

type UserToolbarProps = {
  query: string;
  statusFilter: UserStatusFilter;
  pageSize: number;
  totalCount: number;
  filteredCount: number;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: UserStatusFilter) => void;
  onPageSizeChange: (value: number) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
};

export default function UserToolbar({
  query,
  statusFilter,
  pageSize,
  totalCount,
  filteredCount,
  onQueryChange,
  onStatusFilterChange,
  onPageSizeChange,
  onRefresh,
  onExportCsv,
}: UserToolbarProps) {
  return (
    <section style={toolbar} aria-label="User search and table controls">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search users by name, email, role, or title..."
        style={input}
        aria-label="Search users"
      />

      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value as UserStatusFilter)}
        style={select}
        aria-label="Filter by user status"
      >
        <option value="all">All users</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="locked">Locked</option>
        <option value="mfa">MFA required</option>
      </select>

      <select
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        style={select}
        aria-label="Rows per page"
      >
        <option value={10}>10 / page</option>
        <option value={25}>25 / page</option>
        <option value={50}>50 / page</option>
        <option value={100}>100 / page</option>
      </select>

      <span style={countText}>
        {filteredCount} of {totalCount}
      </span>

      <button type="button" onClick={onRefresh} style={secondaryButton}>
        Refresh
      </button>

      <button type="button" onClick={onExportCsv} style={secondaryButton}>
        Export CSV
      </button>
    </section>
  );
}

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 16,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const input: React.CSSProperties = {
  flex: '1 1 260px',
  minWidth: 220,
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const select: React.CSSProperties = {
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  minWidth: 130,
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