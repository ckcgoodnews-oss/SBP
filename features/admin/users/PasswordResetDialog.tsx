'use client';

import React, { useEffect, useState } from 'react';
import { TenantUser } from './UserTypes';

type Props = {
  open: boolean;
  user: TenantUser | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (userId: string, forcePasswordChange: boolean, redirectTo: string) => Promise<unknown>;
};

export default function PasswordResetDialog({
  open,
  user,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  const [redirectTo, setRedirectTo] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) return;

    setForcePasswordChange(true);
    setLocalError('');

    if (typeof window !== 'undefined') {
      setRedirectTo(`${window.location.origin}/login`);
    }
  }, [open]);

  if (!open || !user) return null;

  const activeUser = user;

  async function submit() {
    if (!activeUser.id) {
      setLocalError('Missing user id.');
      return;
    }

    if (!redirectTo.trim()) {
      setLocalError('Redirect URL is required.');
      return;
    }

    setLocalError('');
    await onSubmit(activeUser.id, forcePasswordChange, redirectTo.trim());
    onClose();
  }

  return (
    <div style={backdrop}>
      <aside style={dialog}>
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>Password Reset</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>
              Generate a Supabase recovery link for this user.
            </p>
          </div>

          <button type="button" style={smallButton} onClick={onClose}>
            Close
          </button>
        </div>

        {localError && <div style={errorBox}>{localError}</div>}

        <div style={card}>
          <div style={{ color: '#64748b', fontSize: 13 }}>User</div>
          <strong>{activeUser.full_name || activeUser.email}</strong>
          <div style={{ color: '#64748b', fontSize: 13 }}>{activeUser.email}</div>
        </div>

        <label style={field}>
          <span style={label}>Redirect URL</span>
          <input
            value={redirectTo}
            onChange={(event) => setRedirectTo(event.target.value)}
            style={input}
          />
          <span style={hint}>
            This should point to your app page that handles password recovery.
          </span>
        </label>

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
              Recorded in audit metadata now; enforcement hook will be wired in a later login-policy sprint.
            </span>
          </span>
        </label>

        <footer style={footer}>
          <button type="button" style={secondaryButton} onClick={onClose}>
            Cancel
          </button>

          <button type="button" disabled={saving} style={primaryButton} onClick={() => void submit()}>
            {saving ? 'Generating...' : 'Generate Reset Link'}
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
  zIndex: 80,
};

const dialog: React.CSSProperties = {
  width: 500,
  maxWidth: 'calc(100% - 32px)',
  background: 'white',
  borderRadius: 14,
  padding: 24,
  boxShadow: '0 25px 70px rgba(15, 23, 42, 0.28)',
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
  marginBottom: 14,
};

const field: React.CSSProperties = {
  display: 'grid',
  gap: 5,
  marginBottom: 14,
};

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
};

const hint: React.CSSProperties = {
  color: '#64748b',
  fontSize: 12,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const checkRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 14,
};

const footer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 20,
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