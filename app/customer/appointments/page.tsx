'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { PortalTable } from '@/components/PortalTable';

type Row = Record<string, unknown>;
const api = '/api/customer/appointment-requests?tenant_slug=demo-company';
const headers = ["Service", "Status", "Preferred Date", "Window"];
const cells = ["service_requested", "status", "preferred_date", "preferred_window"];

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = event.currentTarget;
    try {
      const response = await fetch('/api/customer/appointment-requests?tenant_slug=demo-company', { method: 'POST', body: new FormData(form) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Save failed.');
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }


  async function load() {
    setLoading(true);
    setError('');
    fetchApiRows<Row>(api).then(setRows).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="main">
      <h1>Appointment Requests</h1>
      <p>Live customer portal data.</p>

      <form className="form" onSubmit={submit}>
        <label>Preferred Date<input name="preferred_date" type="date" /></label>
        <label>Preferred Window<input name="preferred_window" /></label>
        <label>Service Requested<input name="service_requested" required /></label>
        <label>Description<textarea name="description" rows={4} /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit Request'}</button>
      </form>

      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <PortalTable headers={headers} cells={cells} rows={rows} />}
    </main>
  );
}
