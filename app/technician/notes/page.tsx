'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { LiveSelect } from '@/components/LiveSelect';
import { PortalTable } from '@/components/PortalTable';

type Row = Record<string, unknown>;
const api = '/api/technician/job-notes?tenant_slug=demo-company';

export default function TechnicianNotesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    fetchApiRows<Row>(api).then(setRows).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = event.currentTarget;
    try {
      const response = await fetch(api, { method: 'POST', body: new FormData(form) });
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

  return (
    <main className="main">
      <h1>Technician Notes</h1>
      <p>Live technician notes.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="work_order_id" label="Work Order" api="/api/technician/jobs?tenant_slug=demo-company" labelField="work_order_number" required />
        <label>Note<textarea name="note" rows={4} required /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <PortalTable headers={['Work Order','Note','Created']} cells={['work_order_id','note','created_at']} rows={rows} />}
    </main>
  );
}
