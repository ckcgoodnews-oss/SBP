'use client';

import React from 'react';
import { Department, IamRole, TenantUser, UserForm } from './UserTypes';

type Props = {
  user: TenantUser;
  form: UserForm;
  roles: IamRole[];
  departments: Department[];
  onChange: <K extends keyof UserForm>(key: K, value: UserForm[K]) => void;
  onSave: () => void;
  saving: boolean;
};

export default function UserOverviewTab({
  form,
  roles,
  departments,
  onChange,
  onSave,
  saving,
}: Props) {
  return (
    <section style={section}>
      <div style={grid}>
        <Field label="Tenant ID">
          <input value={form.tenant_id} onChange={(e) => onChange('tenant_id', e.target.value)} style={input} />
        </Field>

        <Field label="Full Name">
          <input value={form.full_name} onChange={(e) => onChange('full_name', e.target.value)} style={input} />
        </Field>

        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} style={input} />
        </Field>

        <Field label="Title">
          <input value={form.title} onChange={(e) => onChange('title', e.target.value)} style={input} />
        </Field>

        <Field label="Phone">
          <input value={form.phone} onChange={(e) => onChange('phone', e.target.value)} style={input} />
        </Field>

        <Field label="Role">
          <select value={form.role} onChange={(e) => onChange('role', e.target.value)} style={input}>
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.role_key}>
                {role.display_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Department">
          <select value={form.department_id} onChange={(e) => onChange('department_id', e.target.value)} style={input}>
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </Field>

        <label style={checkRow}>
          <input type="checkbox" checked={form.active} onChange={(e) => onChange('active', e.target.checked)} />
          Active account
        </label>
      </div>

      <button type="button" disabled={saving} onClick={onSave} style={primaryButton}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </section>
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

const section: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  marginTop: 18,
};

const grid: React.CSSProperties = {
  display: 'grid',
  gap: 12,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const checkRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const primaryButton: React.CSSProperties = {
  background: '#0f172a',
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};