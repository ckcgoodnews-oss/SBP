'use client';

import React, { useEffect, useRef } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;

    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div style={backdrop} role="presentation">
      <aside
        style={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h2 id="confirm-dialog-title" style={{ margin: 0 }}>
          {title}
        </h2>

        <p id="confirm-dialog-message" style={{ color: '#64748b', lineHeight: 1.5 }}>
          {message}
        </p>

        <footer style={footer}>
          <button
            ref={cancelButtonRef}
            type="button"
            style={secondaryButton}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            style={{
              ...primaryButton,
              background: danger ? '#991b1b' : '#0f172a',
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </footer>
      </aside>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 100,
};

const dialog: React.CSSProperties = {
  width: 420,
  maxWidth: 'calc(100% - 32px)',
  background: 'white',
  borderRadius: 14,
  padding: 24,
  boxShadow: '0 25px 70px rgba(15, 23, 42, 0.28)',
};

const footer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 20,
};

const primaryButton: React.CSSProperties = {
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};

const secondaryButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};