'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function AdminResponsivePanel({ children }: Props) {
  return <div style={panel}>{children}</div>;
}

const panel: React.CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  overflowX: 'auto',
};