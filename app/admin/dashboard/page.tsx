'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows, money, numberFmt } from '@/lib/api/client';
import { ErrorCard, LoadingCard } from '@/components/LiveState';

type ExecutiveRow = {
  tenant_id: string;
  total_revenue: number;
  total_jobs: number;
  total_customers: number;
  open_requests: number;
};

export default function ExecutiveDashboardPage() {
  const [rows, setRows] = useState<ExecutiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const row = rows[0];

  useEffect(() => {
    fetchApiRows<ExecutiveRow>('/api/admin/reports/executive?tenant_slug=demo-company')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <h1>Executive Dashboard</h1>
      <p>Live Supabase-backed executive metrics for demo-company.</p>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {row && (
        <section className="grid">
          <article className="card"><h2>Total Revenue</h2><p className="money">{money(row.total_revenue)}</p></article>
          <article className="card"><h2>Total Jobs</h2><p className="money">{numberFmt(row.total_jobs)}</p></article>
          <article className="card"><h2>Total Customers</h2><p className="money">{numberFmt(row.total_customers)}</p></article>
          <article className="card"><h2>Open Requests</h2><p className="money">{numberFmt(row.open_requests)}</p></article>
        </section>
      )}
    </main>
  );
}
