'use client';

import React from 'react';
import { TenantUser } from './UserTypes';

export default function UserApiKeysTab({ user }: { user: TenantUser }) {
  return (
    <section style={section}>
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>API Keys</h3>
        <p style={{ color: '#64748b' }}>
          API key assignment for <strong>{user.full_name || user.email}</strong> will be connected to the{' '}
          <code>api_keys</code> and <code>service_accounts</code> administration modules.
        </p>

        <button type="button" style={disabledButton} disabled>
          API Key Management Coming Soon
        </button>
      </div>
    </section>
  );
}

const section: React.CSSProperties = {
  marginTop: 18,
};

const card: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 14,
  background: 'white',
};

const disabledButton: React.CSSProperties = {
  background: '#f1f5f9',
  color: '#64748b',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
};