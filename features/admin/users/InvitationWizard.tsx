'use client';

import React, { useEffect, useState } from 'react';
import { emptyInvitationForm, IamRole, InvitationForm } from './UserTypes';

type InvitationWizardProps = {
  open: boolean;
  roles: IamRole[];
  defaultTenantId: string;
  saving: boolean;
  onClose: () => void;
  onCreate: (form: InvitationForm) => Promise<void>;
};

export default function InvitationWizard({
  open,
  roles,
  defaultTenantId,
  saving,
  onClose,
  onCreate,
}: InvitationWizardProps) {
  const [form, setForm] = useState<InvitationForm>({
    ...emptyInvitationForm,
    tenant_id: defaultTenantId,
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) return;

    setLocalError('');
    setForm({
      ...emptyInvitationForm,
      tenant_id: defaultTenantId,
      role_key: roles[0]?.role_key ?? 'staff',
    });
  }, [open, defaultTenantId, roles]);

  if (!open) return null;

  function updateForm<K extends keyof InvitationForm>(key: K, value: InvitationForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    if (!form.tenant_id.trim()) {
      setLocalError('Tenant ID is required.');
      return;
    }

    if (!form.email.trim() || !form.email.includes('@')) {
      setLocalError('A valid email address is required.');
      return;
    }

    if (!form.full_name.trim()) {
      setLocalError('Full name is required.');
      return;
    }

    if (!form.role_key.trim()) {
      setLocalError('Role is required.');
      return;
    }

    await onCreate(form);
    onClose();
  }

  return (
    <div style={backdrop}>
      <aside style={drawer}>
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>Invite User</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>
              Create a pending invitation for a new tenant user.
            </p>
          </div>

          <button type="button" style={smallButton} onClick={onClose}>
            Close
          </button>
        </div>

        {localError && <div style={errorBox}>{localError}</div>}

        <div style={formGrid}>
          <Field label="Tenant ID">
            <input
              value={form.tenant_id}
              onChange={(event) => updateForm('tenant_id', event.target.value)}
              style={input}
            />
          </Field>

          <Field label="Full Name">
            <input
              value={form.full_name}
              onChange={(event) => updateForm('full_name', event.target.value)}
              style={input}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              style={input}
            />
          </Field>

          <Field label="Role">
            <select
              value={form.role_key}
              onChange={(event) => updateForm('role_key', event.target.value)}
              style={input}
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.role_key}>
                  {role.display_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Expires In">
            <select
              value={form.expires_days}
              onChange={(event) => updateForm('expires_days', Number(event.target.value))}
              style={input}
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </Field>

          <Field label="Created By Email">
            <input
              value={form.created_by_email}
              onChange={(event) => updateForm('created_by_email', event.target.value)}
              style={input}
            />
          </Field>
        </div>

        <footer style={footer}>
          <button type="button" style={secondaryButton} onClick={onClose}>
            Cancel
          </button>

          <button type="button" disabled={saving} style={primaryButton} onClick={() => void submit()}>
            {saving ? 'Creating...' : 'Create Invitation'}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: 50,
};

const drawer: React.CSSProperties = {
  width: 480,
  maxWidth: '100%',
  background: 'white',
  height: '100%',
  padding: 24,
  boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.2)',
  overflow: 'auto',
};

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'flex-start',
};

const formGrid: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  marginTop: 20,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
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