'use client';

import React from 'react';

type Tone = 'green' | 'red' | 'yellow' | 'gray' | 'blue';

type Props = {
  label: string;
  tone: Tone;
};

export default function AdminStatusBadge({ label, tone }: Props) {
  const colors: Record<Tone, { background: string; color: string }> = {
    green: { background: '#dcfce7', color: '#166534' },
    red: { background: '#fee2e2', color: '#991b1b' },
    yellow: { background: '#fef9c3', color: '#854d0e' },
    gray: { background: '#f3f4f6', color: '#374151' },
    blue: { background: '#dbeafe', color: '#1e40af' },
  };

  return (
    <span
      style={{
        ...badge,
        background: colors[tone].background,
        color: colors[tone].color,
      }}
    >
      {label}
    </span>
  );
}

const badge: React.CSSProperties = {
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 12,
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
};