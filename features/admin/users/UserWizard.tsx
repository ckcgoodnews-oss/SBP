'use client';

import React, { useMemo, useState } from 'react';

import {
  Department,
  emptyUserForm,
  IamRole,
  TenantUser,
  UserForm,
  UserWizardStep,
} from './UserTypes';

type UserWizardProps = {
  open: boolean;
  editingUser: TenantUser | null;
  roles: IamRole[];
  departments: Department[];
  defaultTenantId: string;
  saving: boolean;
  onClose: () => void;
  onCreate: (form: UserForm) => Promise<void>;
  onUpdate: (id: string, form: UserForm) => Promise<void>;
};

function buildInitialForm(
  editingUser: TenantUser | null,
  roles: IamRole[],
  defaultTenantId: string
): UserForm {
  if (!editingUser) {
    return {
      ...emptyUserForm,
      tenant_id: defaultTenantId,
      role: roles[0]?.role_key ?? 'staff',
    };
  }

  return {
    tenant_id: editingUser.tenant_id ?? defaultTenantId,
    email: editingUser.email ?? '',
    full_name: editingUser.full_name ?? '',
    role: editingUser.role ?? roles[0]?.role_key ?? 'staff',
    title: editingUser.title ?? '',
    phone: editingUser.phone ?? '',
    department_id: editingUser.department_id ?? '',
    mfa_required: Boolean(editingUser.mfa_required),
    active: Boolean(editingUser.active),
  };
}

function validateStep(step: UserWizardStep, form: UserForm) {
  if (step === 1) {
    if (!form.tenant_id.trim()) return 'Tenant ID is required.';
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!form.email.includes('@')) return 'Enter a valid email address.';
  }

  if (step === 2) {
    if (!form.role.trim()) return 'Role is required.';
  }

  return '';
}

export default function UserWizard({
  open,
  editingUser,
  roles,
  departments,
  defaultTenantId,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: UserWizardProps) {
  const [step, setStep] = useState<UserWizardStep>(1);
  const [form, setForm] = useState<UserForm>(() =>
    buildInitialForm(editingUser, roles, defaultTenantId)
  );
  const [localError, setLocalError] = useState('');

  React.useEffect(() => {
    if (!open) return;

    setStep(1);
    setLocalError('');
    setForm(buildInitialForm(editingUser, roles, defaultTenantId));
  }, [open, editingUser, roles, defaultTenantId]);

  const selectedRole = useMemo(
    () => roles.find((role) => role.role_key === form.role),
    [roles, form.role]
  );

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === form.department_id),
    [departments, form.department_id]
  );

  if (!open) return null;

  function updateForm<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function nextStep() {
    const error = validateStep(step, form);
    if (error) {
      setLocalError(error);
      return;
    }

    setLocalError('');
    setStep((current) => Math.min(4, current + 1) as UserWizardStep);
  }

  function previousStep() {
    setLocalError('');
    setStep((current) => Math.max(1, current - 1) as UserWizardStep);
  }

  async function submit() {
    const stepOneError = validateStep(1, form);
    const stepTwoError = validateStep(2, form);

    if (stepOneError || stepTwoError) {
      setLocalError(stepOneError || stepTwoError);
      return;
    }

    const payload: UserForm = {
      ...form,
      title: form.title || '',
      phone: form.phone || '',
      department_id: form.department_id || '',
    };

    if (editingUser) {
      await onUpdate(editingUser.id, payload);
    } else {
      await onCreate(payload);
    }

    onClose();
  }

  return (
    <div style={drawerBackdrop}>
      <aside style={drawer}>
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>{editingUser ? 'Edit User' : 'Create User'}</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>
              {editingUser
                ? 'Update the user profile, role, department, and security options.'
                : 'Create a new tenant user with role, department, and security settings.'}
            </p>
          </div>

          <button type="button" style={smallButton} onClick={onClose}>
            Close
          </button>
        </div>

        <StepIndicator step={step} />

        {localError && (
          <div style={errorBox}>
            {localError}
          </div>
        )}

        <section style={{ marginTop: 20 }}>
          {step === 1 && (
            <div style={sectionGrid}>
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

              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(event) => updateForm('phone', event.target.value)}
                  style={input}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div style={sectionGrid}>
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(event) => updateForm('role', event.target.value)}
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

              <Field label="Department">
                <select
                  value={form.department_id}
                  onChange={(event) => updateForm('department_id', event.target.value)}
                  style={input}
                >
                  <option value="">No department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </Field>

              <InfoCard
                title={selectedRole?.display_name ?? 'No role selected'}
                body={selectedRole?.description ?? 'Choose a role to define the user’s default access level.'}
              />

              <InfoCard
                title={selectedDepartment?.name ?? 'No department selected'}
                body={
                  selectedDepartment?.description ??
                  'Department assignment helps segment users by business function.'
                }
              />
            </div>
          )}

          {step === 3 && (
            <div style={sectionGrid}>
              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateForm('active', event.target.checked)}
                />
                <span>
                  <strong>Active account</strong>
                  <br />
                  <span style={mutedText}>Inactive users cannot access tenant workflows.</span>
                </span>
              </label>

              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={form.mfa_required}
                  onChange={(event) => updateForm('mfa_required', event.target.checked)}
                />
                <span>
                  <strong>Require MFA</strong>
                  <br />
                  <span style={mutedText}>The user will be required to use multi-factor authentication.</span>
                </span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div style={reviewGrid}>
              <Review label="Tenant ID" value={form.tenant_id} />
              <Review label="Name" value={form.full_name} />
              <Review label="Email" value={form.email} />
              <Review label="Title" value={form.title || '—'} />
              <Review label="Phone" value={form.phone || '—'} />
              <Review label="Role" value={selectedRole?.display_name ?? form.role} />
              <Review label="Department" value={selectedDepartment?.name ?? '—'} />
              <Review label="Status" value={form.active ? 'Active' : 'Inactive'} />
              <Review label="MFA" value={form.mfa_required ? 'Required' : 'Not required'} />
            </div>
          )}
        </section>

        <footer style={footer}>
          <button type="button" style={secondaryButton} onClick={step === 1 ? onClose : previousStep}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 4 ? (
            <button type="button" style={primaryButton} onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="button" disabled={saving} style={primaryButton} onClick={() => void submit()}>
              {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}

function StepIndicator({ step }: { step: UserWizardStep }) {
  const steps = ['Profile', 'Organization', 'Security', 'Review'];

  return (
    <div style={stepWrap}>
      {steps.map((label, index) => {
        const number = (index + 1) as UserWizardStep;
        const active = number === step;
        const complete = number < step;

        return (
          <div key={label} style={stepItem}>
            <div
              style={{
                ...stepCircle,
                background: active || complete ? '#0f172a' : 'white',
                color: active || complete ? 'white' : '#64748b',
              }}
            >
              {number}
            </div>
            <span style={{ fontSize: 12, color: active ? '#0f172a' : '#64748b' }}>{label}</span>
          </div>
        );
      })}
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

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={infoCard}>
      <strong>{title}</strong>
      <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>{body}</p>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div style={reviewItem}>
      <div style={{ color: '#64748b', fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const drawerBackdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: 50,
};

const drawer: React.CSSProperties = {
  width: 520,
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

const stepWrap: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 8,
  marginTop: 20,
};

const stepItem: React.CSSProperties = {
  display: 'grid',
  justifyItems: 'center',
  gap: 6,
};

const stepCircle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  border: '1px solid #cbd5e1',
  display: 'grid',
  placeItems: 'center',
  fontSize: 13,
  fontWeight: 700,
};

const sectionGrid: React.CSSProperties = {
  display: 'grid',
  gap: 14,
};

const reviewGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
};

const reviewItem: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: 12,
  background: '#f8fafc',
};

const infoCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: 12,
  background: '#f8fafc',
};

const footer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 24,
  borderTop: '1px solid #e2e8f0',
  paddingTop: 16,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
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

const checkRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: 12,
};

const mutedText: React.CSSProperties = {
  color: '#64748b',
  fontSize: 13,
};