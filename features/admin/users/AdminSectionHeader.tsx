'use client';

import React from 'react';

type Props = {
  title: string;
  description: string;
  right?: React.ReactNode;
};

export default function AdminSectionHeader({
  title,
  description,
  right,
}: Props) {
  return (
    <div style={header}>
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p style={{ marginTop: 6, color: '#64748b' }}>{description}</p>
      </div>

      {right && <div>{right}</div>}
    </div>
  );
}

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'center',
  marginBottom: 12,
};