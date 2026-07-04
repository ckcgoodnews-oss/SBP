'use client';

import React from 'react';

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export default function AdminFormField({
  id,
  label,
  hint,
  error,
  children,
}: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label htmlFor={id} style={wrap}>
      <span style={labelStyle}>{label}</span>

      {children}

      {hint && (
        <span id={hintId} style={hintStyle}>
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} style={errorStyle}>
          {error}
        </span>
      )}
    </label>
  );
}

export function fieldA11y(id: string, hint?: string, error?: string) {
  return {
    id,
    'aria-describedby': [hint ? `${id}-hint` : '', error ? `${id}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined,
    'aria-invalid': Boolean(error) || undefined,
  };
}

const wrap: React.CSSProperties = {
  display: 'grid',
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
};

const hintStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: 12,
};

const errorStyle: React.CSSProperties = {
  color: '#991b1b',
  fontSize: 12,
};