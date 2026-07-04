'use client';

import React, { useEffect } from 'react';

export type AdminToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

type AdminToastProps = {
  toast: AdminToastState;
  onClose: () => void;
};

export default function AdminToast({ toast, onClose }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
      style={{
        ...toastBox,
        background: isSuccess ? '#dcfce7' : '#fee2e2',
        color: isSuccess ? '#166534' : '#991b1b',
        borderColor: isSuccess ? '#86efac' : '#fecaca',
      }}
    >
      <strong>{isSuccess ? 'Success' : 'Error'}</strong>
      <span>{toast.message}</span>

      <button type="button" aria-label="Dismiss notification" onClick={onClose} style={closeButton}>
        ×
      </button>
    </div>
  );
}

const toastBox: React.CSSProperties = {
  position: 'fixed',
  right: 24,
  bottom: 24,
  zIndex: 120,
  minWidth: 320,
  maxWidth: 460,
  border: '1px solid',
  borderRadius: 12,
  padding: '12px 40px 12px 14px',
  display: 'grid',
  gap: 4,
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
};

const closeButton: React.CSSProperties = {
  position: 'absolute',
  right: 10,
  top: 8,
  border: 0,
  background: 'transparent',
  fontSize: 22,
  cursor: 'pointer',
  color: 'inherit',
};