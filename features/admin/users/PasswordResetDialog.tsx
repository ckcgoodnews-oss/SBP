'use client';

import React, { useState } from 'react';
import { TenantUser } from './UserTypes';

type Props = {
  open: boolean;
  user: TenantUser | null;
  saving: boolean;
  onClose: () => void;
  onSend: (userId: string, forcePasswordChange: boolean) => Promise<unknown>;
};

export default function PasswordResetDialog({
  open,
  user,
  saving,
  onClose,
  onSend,
}: Props) {
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  const [localError, setLocalError] = useState('');

  React.useEffect(() => {
    if (!open) return;
    setForcePasswordChange(true);
    setLocalError('');
  }, [open]);

  if (!open || !user) return null;

  const currentUser = user;

  async function submit() {
    setLocalError('');

    try {
      await onSend(currentUser.id, forcePasswordChange);
      onClose();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to request password reset');
    }
  }

  return (
    <div style={backdrop}>
      <aside style={dialog}>
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>Password Reset</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>
              Send a password reset request for this user.
            </p>
          </div>

          <button type="button" style={smallButton} onClick={onClose}>
            Close
          </button>
        </div>

        {localError && <div style={errorBox}>{localError}</div>}

        <div style={card}>
          <div style={{ color: '#64748b', fontSize: 13 }}>User</div>
          <strong>{currentUser.full_name || currentUser.email}</strong>
          <div style={{ color: '#64748b', marginTop: 4 }}>{currentUser.email}</div>
        </div>

        <label style={checkRow}>
          <input
            type="checkbox"
            checked={forcePasswordChange}
            onChange={(event) => setForcePasswordChange(event.target.checked)}
          />
          <span>
            <strong>Force password change at next login</strong>
            <br />
            <span style={{ color: '#64748b', fontSize: 13 }}>
              The reset request will be marked as requiring a password change.
            </span>
          </span>
        </label>

        <footer style={footer}>
          <button type="button" style={secondaryButton} onClick={onClose}>
            Cancel
          </button>

          <button type="button" disabled={saving} style={primaryButton} onClick={() => void submit()}>
            {saving ? 'Sending...' : 'Send Reset Email'}
          </button>
        </footer>
      </aside>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.45)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 80,
};

const dialog: React.CSSProperties = {
  width: 460,
  maxWidth: 'calc(100vw - 32px)',
  background: 'white',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
};

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'flex-start',
};

const card: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 14,
  background: '#f8fafc',
  marginTop: 18,
};

const checkRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  marginTop: 18,
};

const footer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 24,
  borderTop: '1px solid #e2e8f0',
  paddingTop: 16,
};

const primaryButton: React.CSSProperties = {
  background: '#0f172a',
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

const smallButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  cursor: 'pointer',
};

const errorBox: React.CSSProperties = {
  background: '#fee2e2',
  color: '#991b1b',
  borderRadius: 8,
  padding: 10,
  marginTop: 16,
  fontSize: 13,
};