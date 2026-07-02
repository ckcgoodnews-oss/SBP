'use client';

import React, { useState } from 'react';

export type FormField = { name: string; label: string; placeholder?: string; type?: string; required?: boolean };

export function SimpleForm({ fields, submitLabel, initialValues, onSubmit }: {
  fields: FormField[];
  submitLabel: string;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    fields.forEach((f) => { v[f.name] = String(initialValues?.[f.name] ?? ''); });
    return v;
  });
  const [saving, setSaving] = useState(false);

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { await onSubmit(values); } finally { setSaving(false); } }} style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
      {fields.map((field) => (
        <label key={field.name} style={{ display: 'grid', gap: 4, fontSize: 13 }}>
          <span>{field.label}</span>
          <input
            required={field.required}
            type={field.type ?? 'text'}
            placeholder={field.placeholder}
            value={values[field.name] ?? ''}
            onChange={(e) => setValues((old) => ({ ...old, [field.name]: e.target.value }))}
            style={{ padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }}
          />
        </label>
      ))}
      <button disabled={saving} type="submit" style={{ width: 'fit-content', padding: '10px 14px', borderRadius: 8 }}>
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
