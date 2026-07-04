'use client';

import React from 'react';

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function AdminEmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div style={wrap}>
      <div style={icon}>∅</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={messageStyle}>{message}</p>

      {actionLabel && onAction && (
        <button type="button" style={button} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const wrap: React.CSSProperties = {
  padding: 32,
  textAlign: 'center',
  color: '#64748b',
};

const icon: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: '#f1f5f9',
  color: '#64748b',
  display: 'grid',
  placeItems: 'center',
  margin: '0 auto 12px',
  fontSize: 22,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: '#0f172a',
};

const messageStyle: React.CSSProperties = {
  margin: '8px auto 16px',
  maxWidth: 440,
  lineHeight: 1.5,
};

const button: React.CSSProperties = {
  background: '#0f172a',
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};