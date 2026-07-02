'use client';

import React, { useEffect, useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { SimpleForm } from '@/components/admin/SimpleForm';
import { adminCreate, adminDelete, adminList, adminUpdate } from '@/lib/enterprise-admin/api';
import type { IamPermission } from '@/types/enterprise-admin';

type PermissionRow = IamPermission & {
  module_key: string;
  action_key: string;
  display_name: string;
  description?: string | null;
  created_at?: string;
};

export default function PermissionsPage() {
  const [rows, setRows] = useState<PermissionRow[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<PermissionRow | null>(null);

  const load = async () => {
    setError('');
    setRows(await adminList<PermissionRow>('permissions'));
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Permission Matrix</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <SimpleForm
        key={editing?.id ?? 'new'}
        submitLabel={editing ? 'Update Permission' : 'Create Permission'}
        initialValues={editing ?? undefined}
        fields={[
          { name: 'module_key', label: 'Module', required: true, placeholder: 'work_orders' },
          { name: 'action_key', label: 'Action', required: true, placeholder: 'view' },
          { name: 'display_name', label: 'Display Name', required: true, placeholder: 'View Work Orders' },
          { name: 'description', label: 'Description' },
        ]}
        onSubmit={async (v) => {
          const payload = {
            module_key: String(v.module_key ?? '').trim(),
            action_key: String(v.action_key ?? '').trim(),
            display_name: String(v.display_name ?? '').trim(),
            description: v.description || null,
          };

          if (editing) {
            await adminUpdate('permissions', editing.id, payload);
          } else {
            await adminCreate('permissions', payload);
          }

          setEditing(null);
          await load();
        }}
      />

      <CrudTable
        rows={rows}
        columns={[
          { key: 'module_key', label: 'Module' },
          { key: 'action_key', label: 'Action' },
          { key: 'display_name', label: 'Display Name' },
          { key: 'description', label: 'Description' },
          { key: 'created_at', label: 'Created' },
        ]}
        onEdit={setEditing}
        onDelete={async (r) => {
          if (confirm('Delete this permission?')) {
            await adminDelete('permissions', r.id);
            await load();
          }
        }}
      />
    </main>
  );
}
