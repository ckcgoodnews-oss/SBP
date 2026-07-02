'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';

type IntegrationRow = {
  id: string;
  provider: string;
  status: string;
  public_config: Record<string, unknown>;
  secret_ref: string | null;
};

export default function IntegrationsPage() {
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApiRows<IntegrationRow>('/api/admin/integrations?tenant_slug=demo-company')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <h1>Integrations</h1>
      <p>Live Supabase-backed integration records.</p>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && (
        <table>
          <thead><tr><th>Provider</th><th>Status</th><th>Secret Reference</th><th>Public Config</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><a href={`/admin/integrations/${row.provider}`}>{row.provider}</a></td>
                <td><span className="badge">{row.status}</span></td>
                <td>{row.secret_ref || '—'}</td>
                <td><code>{JSON.stringify(row.public_config || {})}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
