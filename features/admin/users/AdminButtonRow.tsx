'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function AdminButtonRow({ children }: Props) {
  return <div style={row}>{children}</div>;
}

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center',
};