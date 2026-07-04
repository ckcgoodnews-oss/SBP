'use client';

import React from 'react';
import { TenantUser, UserForm } from './UserTypes';

type Props = {
  user: TenantUser;
  form: UserForm;
  saving: boolean;
  onChange: <K extends keyof UserForm>(key: K, value: UserForm[K]) => void;
  onSave: () => void;
  onEnable: () => void;
  onDisable: () => void;
  onLock: () => void;
  onUnlock: () => void;
  onResetFailedLogins: () => void;
};

function isLocked(user: TenantUser) {
  if (!user.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
}

export default function UserSecurityTab({
  user,
  form,
  saving,
  onChange,
  onSave,
  onEnable,
  onDisable,
  onLock,
  onUnlock,
  onResetFailedLogins,
}: Props) {
  const locked = isLocked(user);

  return (
    <section style={section}>
      <div style={card}>
        <h3 style={heading}>Security Status</h3>
        <Info label="Account Active" value={user.active ? 'Yes' : 'No'} />
        <Info label="Locked" value={locked ? 'Yes' : 'No'} />
        <Info label="Lock Reason" value={user.lock_reason || '—'} />
        <Info label="Failed Login Count" value={String(user.failed_login_count ?? 0)} />
        <Info label="Last Login" value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'} />
      </div>

      <div style={card}>
        <h3 style={heading}>Security Policy</h3>

        <label style={checkRow}>
          <input
            type="checkbox"
            checked={form.mfa_required}
            onChange={(e) => onChange('mfa_required', e.target.checked)}
          />
          Require MFA
        </label>

        <button type="button" disabled={saving} onClick={onSave} style={primaryButton}>
          {saving ? 'Saving...' : 'Save Security Policy'}
        </button>
      </div>

      <div style={actionGrid}>
        {user.active ? (
          <button type="button" style={secondaryButton} onClick={onDisable}>
            Disable User
          </button>
        ) : (
          <button type="button" style={secondaryButton} onClick={onEnable}>
            Enable User
          </button>
        )}

        {locked ? (
          <button type="button" style={secondaryButton} onClick={onUnlock}>
            Unlock User
          </button>
        ) : (
          <button type="button" style={secondaryButton} onClick={onLock}>
            Lock User
          </button>
        )}

        <button type="button" style={secondaryButton} onClick={onResetFailedLogins}>
          Reset Failed Logins
        </button>

        <button type="button" style={disabledButton} disabled>
          Password Reset Coming Next
        </button>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoRow}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const section: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  marginTop: 18,
};

const card: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 14,
  background: '#f8fafc',
};

const heading: React.CSSProperties = {
  margin: '0 0 12px',
};

const infoRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '6px 0',
};

const checkRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
};

const actionGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
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

const disabledButton: React.CSSProperties = {
  background: '#f1f5f9',
  color: '#64748b',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
};