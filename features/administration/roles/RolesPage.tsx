'use client';

import React, { useEffect, useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { SimpleForm } from '@/components/admin/SimpleForm';
import { adminCreate, adminDelete, adminList, adminUpdate } from '@/lib/enterprise-admin/api';
import type { IamRole } from '@/types/enterprise-admin';

type RoleRow = IamRole & {
  role_key: string;
  display_name: string;
  description?: string | null;
  system_role?: boolean;
  active?: boolean;
  created_at?: string;
};

export default function RolesPage() {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<RoleRow | null>(null);

  const load = async () => {
    setError('');
    setRows(await adminList<RoleRow>('roles'));
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Enterprise Roles</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <SimpleForm
        key={editing?.id ?? 'new'}
        submitLabel={editing ? 'Update Role' : 'Create Role'}
        initialValues={editing ?? undefined}
        fields={[
          { name: 'role_key', label: 'Role Key', required: true, placeholder: 'dispatcher' },
          { name: 'display_name', label: 'Display Name', required: true, placeholder: 'Dispatcher' },
          { name: 'description', label: 'Description' },
          { name: 'system_role', label: 'System Role', type: 'checkbox' },
          { name: 'active', label: 'Active', type: 'checkbox' },
        ]}
        onSubmit={async (v) => {
          const payload = {
            role_key: String(v.role_key ?? '').trim(),
            display_name: String(v.display_name ?? '').trim(),
            description: v.description || null,
            system_role: Boolean(v.system_role),
            active: v.active === undefined ? true : Boolean(v.active),
          };

          if (editing) {
            await adminUpdate('roles', editing.id, payload);
          } else {
            await adminCreate('roles', payload);
          }

          setEditing(null);
          await load();
        }}
      />

      <CrudTable
        rows={rows}
        columns={[
          { key: 'role_key', label: 'Role Key' },
          { key: 'display_name', label: 'Display Name' },
          { key: 'description', label: 'Description' },
          { key: 'system_role', label: 'System' },
          { key: 'active', label: 'Active' },
          { key: 'created_at', label: 'Created' },
        ]}
        onEdit={setEditing}
        onDelete={async (r) => {
          if (confirm('Delete this role?')) {
            await adminDelete('roles', r.id);
            await load();
          }
        }}
      />
    </main>
  );
}
