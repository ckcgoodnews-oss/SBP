'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminTable } from '@/components/admin/AdminTable';
import { listImpersonationEvents } from '@/lib/admin/enterpriseAdminService';
import type { ImpersonationEventRow } from '@/types/enterprise-admin';

export default function ImpersonationPage() {
  const [rows, setRows] = useState<ImpersonationEventRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listImpersonationEvents().then((data) => setRows(data as ImpersonationEventRow[])).catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ display: 'grid', gap: 18 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Impersonation</h1>
      <AdminCard title="Impersonation Events">
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <AdminTable rows={rows} columns={[
          { key: 'admin_user_id', header: 'Admin User', render: r => r.admin_user_id || '' },
          { key: 'impersonated_user_id', header: 'Impersonated User', render: r => r.impersonated_user_id || '' },
          { key: 'reason', header: 'Reason', render: r => r.reason || '' },
          { key: 'started_at', header: 'Started', render: r => r.started_at || '' },
          { key: 'ended_at', header: 'Ended', render: r => r.ended_at || 'Active/Unknown' },
        ]} />
      </AdminCard>
    </main>
  );
}
