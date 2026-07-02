'use client';

import { useEffect, useState } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminTable } from '@/components/admin/AdminTable';
import { listAuditTimeline } from '@/lib/admin/enterpriseAdminService';
import type { AuditTimelineEvent } from '@/types/enterprise-admin';

export default function AuditTimelinePage() {
  const [rows, setRows] = useState<AuditTimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAuditTimeline(100).then((data) => setRows(data as AuditTimelineEvent[])).catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ display: 'grid', gap: 18 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Audit Timeline</h1>
      <AdminCard title="Recent Security and Data Events">
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <AdminTable rows={rows} columns={[
          { key: 'event_type', header: 'Event', render: r => r.event_type },
          { key: 'actor_user_id', header: 'Actor', render: r => r.actor_user_id || '' },
          { key: 'target_table', header: 'Target', render: r => r.target_table || '' },
          { key: 'created_at', header: 'Created', render: r => r.created_at },
        ]} />
      </AdminCard>
    </main>
  );
}
