'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';

type NotificationRow = {
  id: string;
  channel: string;
  recipient: string;
  subject: string | null;
  status: string;
  provider: string | null;
};

export default function NotificationsPage() {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApiRows<NotificationRow>('/api/admin/notifications?tenant_slug=demo-company')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <h1>Notifications</h1>
      <p>Live queued notifications.</p>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && (
        <table>
          <thead><tr><th>Channel</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Provider</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td>{r.channel}</td><td>{r.recipient}</td><td>{r.subject || '—'}</td><td>{r.status}</td><td>{r.provider || '—'}</td></tr>)}</tbody>
        </table>
      )}
    </main>
  );
}
