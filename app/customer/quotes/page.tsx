'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { PortalTable } from '@/components/PortalTable';

type Row = Record<string, unknown>;
const api = '/api/customer/quotes?tenant_slug=demo-company';
const headers = ["Quote", "Status", "Total"];
const cells = ["quote_number", "status", "total_amount"];

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  async function load() {
    setLoading(true);
    setError('');
    fetchApiRows<Row>(api).then(setRows).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="main">
      <h1>Quotes</h1>
      <p>Live customer portal data.</p>

      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <PortalTable headers={headers} cells={cells} rows={rows} />}
    </main>
  );
}
