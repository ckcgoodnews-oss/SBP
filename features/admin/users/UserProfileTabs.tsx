'use client';

import React from 'react';

export type UserProfileTab =
  | 'overview'
  | 'security'
  | 'roles'
  | 'locations'
  | 'sessions'
  | 'audit'
  | 'apiKeys';

type Props = {
  activeTab: UserProfileTab;
  onChange: (tab: UserProfileTab) => void;
};

const tabs: Array<{ key: UserProfileTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'security', label: 'Security' },
  { key: 'roles', label: 'Roles' },
  { key: 'locations', label: 'Locations' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'audit', label: 'Audit' },
  { key: 'apiKeys', label: 'API Keys' },
];

export default function UserProfileTabs({ activeTab, onChange }: Props) {
  return (
    <div style={tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          style={{
            ...tabButton,
            borderBottomColor: activeTab === tab.key ? '#0f172a' : 'transparent',
            color: activeTab === tab.key ? '#0f172a' : '#64748b',
            fontWeight: activeTab === tab.key ? 700 : 500,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

const tabBar: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  borderBottom: '1px solid #e2e8f0',
  marginTop: 18,
  overflowX: 'auto',
};

const tabButton: React.CSSProperties = {
  background: 'transparent',
  border: 0,
  borderBottom: '2px solid transparent',
  padding: '10px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};