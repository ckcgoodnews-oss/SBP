'use client';

import React from 'react';

export type AdminUsersWorkspaceTab = 'users' | 'invitations' | 'sessions' | 'audit';

type Props = {
  activeTab: AdminUsersWorkspaceTab;
  onChange: (tab: AdminUsersWorkspaceTab) => void;
  invitationCount: number;
  sessionCount: number;
  auditCount: number;
};

const tabs: Array<{ key: AdminUsersWorkspaceTab; label: string }> = [
  { key: 'users', label: 'Users' },
  { key: 'invitations', label: 'Invitations' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'audit', label: 'Audit' },
];

export default function AdminUsersWorkspaceTabs({
  activeTab,
  onChange,
  invitationCount,
  sessionCount,
  auditCount,
}: Props) {
  function countFor(tab: AdminUsersWorkspaceTab) {
    if (tab === 'invitations') return invitationCount;
    if (tab === 'sessions') return sessionCount;
    if (tab === 'audit') return auditCount;
    return null;
  }

  return (
    <section style={wrap} aria-label="User management workspace sections">
      {tabs.map((tab) => {
        const count = countFor(tab.key);
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-pressed={active}
            style={{
              ...tabButton,
              background: active ? '#0f172a' : 'white',
              color: active ? 'white' : '#0f172a',
              borderColor: active ? '#0f172a' : '#cbd5e1',
            }}
          >
            {tab.label}
            {count !== null && <span style={badge}>{count}</span>}
          </button>
        );
      })}
    </section>
  );
}

const wrap: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 16,
  overflowX: 'auto',
  paddingBottom: 2,
};

const tabButton: React.CSSProperties = {
  border: '1px solid',
  borderRadius: 999,
  padding: '8px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 38,
};

const badge: React.CSSProperties = {
  background: '#f1f5f9',
  color: '#0f172a',
  borderRadius: 999,
  padding: '1px 7px',
  fontSize: 12,
};