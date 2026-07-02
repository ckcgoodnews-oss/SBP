'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminTable } from '@/components/admin/AdminTable';
import { listServiceAccounts } from '@/lib/admin/enterpriseAdminService';
import type { ServiceAccountRow } from '@/types/enterprise-admin';

export default function ServiceAccountsPage() {
  const [rows, setRows] = useState<ServiceAccountRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listServiceAccounts().then((data) => setRows(data as ServiceAccountRow[])).catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ display: 'grid', gap: 18 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Service Accounts</h1>
      <AdminCard title="Integration Identities" actions={<button>Create Service Account</button>}>
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <AdminTable rows={rows} columns={[
          { key: 'name', header: 'Name', render: r => r.name },
          { key: 'status', header: 'Status', render: r => r.status || 'active' },
          { key: 'last_used_at', header: 'Last Used', render: r => r.last_used_at || 'Never' },
          { key: 'created_at', header: 'Created', render: r => r.created_at || '' },
        ]} />
      </AdminCard>
    </main>
  );
}
