'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows, money } from '@/lib/api/client';
import { ErrorCard, LoadingCard } from '@/components/LiveState';

type Row = Record<string, unknown>;

export default function CustomerPortalPage() {
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [requests, setRequests] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchApiRows<Row>('/api/customer/invoices?tenant_slug=demo-company'),
      fetchApiRows<Row>('/api/customer/appointments?tenant_slug=demo-company')
    ])
      .then(([invoiceRows, requestRows]) => { setInvoices(invoiceRows); setRequests(requestRows); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const balance = invoices.reduce((sum, r) => sum + Number(r.total_amount || 0) - Number(r.amount_paid || 0), 0);

  return (
    <main className="main">
      <h1>Customer Portal</h1>
      <p>Live demo customer portal.</p>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && (
        <section className="grid">
          <a className="card" href="/customer/appointments"><h2>Appointment Requests</h2><p>{requests.length}</p></a>
          <a className="card" href="/customer/invoices"><h2>Open Balance</h2><p className="money">{money(balance)}</p></a>
          <a className="card" href="/customer/quotes"><h2>Quotes</h2><p>Review estimates</p></a>
          <a className="card" href="/customer/history"><h2>Service History</h2><p>View completed work</p></a>
        </section>
      )}
    </main>
  );
}
