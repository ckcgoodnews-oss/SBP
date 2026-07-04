'use client';

import React from 'react';
import { TenantUser } from './UserTypes';

function isLocked(user: TenantUser) {
  if (!user.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
}

export default function UserStats({ users }: { users: TenantUser[] }) {
  return (
    <section style={statsGrid}>
      <Stat label="Total Users" value={users.length} />
      <Stat label="Active" value={users.filter((u) => u.active).length} />
      <Stat label="Locked" value={users.filter(isLocked).length} />
      <Stat label="MFA Required" value={users.filter((u) => u.mfa_required).length} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 12,
  margin: '20px 0',
};

const statCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 16,
  background: 'white',
};