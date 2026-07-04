'use client';

import React from 'react';

export type UserStatusFilter = 'all' | 'active' | 'inactive' | 'locked' | 'mfa';

type UserToolbarProps = {
  query: string;
  statusFilter: UserStatusFilter;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: UserStatusFilter) => void;
  onRefresh: () => void;
};

export default function UserToolbar({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  onRefresh,
}: UserToolbarProps) {
  return (
    <section style={toolbar}>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search users by name, email, role, or title..."
        style={input}
      />

      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value as UserStatusFilter)}
        style={select}
      >
        <option value="all">All users</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="locked">Locked</option>
        <option value="mfa">MFA required</option>
      </select>

      <button onClick={onRefresh} style={secondaryButton}>
        Refresh
      </button>
    </section>
  );
}

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 16,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const select: React.CSSProperties = {
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const secondaryButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};