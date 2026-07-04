'use client';

import React from 'react';

type Props = {
  label?: string;
  rows?: number;
};

export default function AdminLoadingState({
  label = 'Loading...',
  rows = 5,
}: Props) {
  return (
    <div style={wrap}>
      <div style={labelStyle}>{label}</div>

      <div style={skeletonGrid}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} style={skeletonRow}>
            <div style={{ ...skeletonCell, width: '28%' }} />
            <div style={{ ...skeletonCell, width: '18%' }} />
            <div style={{ ...skeletonCell, width: '22%' }} />
            <div style={{ ...skeletonCell, width: '12%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  padding: 24,
};

const labelStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: 14,
  marginBottom: 14,
};

const skeletonGrid: React.CSSProperties = {
  display: 'grid',
  gap: 10,
};

const skeletonRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
};

const skeletonCell: React.CSSProperties = {
  height: 14,
  borderRadius: 999,
  background: '#e2e8f0',
};