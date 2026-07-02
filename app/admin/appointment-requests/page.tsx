'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';
import { LiveSelect } from '@/components/LiveSelect';

type Row = Record<string, unknown>;
const api = '/api/admin/appointment-requests?tenant_slug=demo-company';

export default function AppointmentRequestsPage() {
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
      <h1>Appointment Requests</h1>
      <p>Live customer appointment request queue.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="customer_id" label="Customer" api="/api/admin/customers?tenant_slug=demo-company" labelField="display_name" required />
        <label>Preferred Date<input name="preferred_date" type="date" /></label>
        <label>Preferred Window<input name="preferred_window" placeholder="Morning, afternoon, any time" /></label>
        <label>Service Requested<input name="service_requested" required /></label>
        <label>Status<select name="status"><option value="requested">requested</option><option value="reviewing">reviewing</option><option value="scheduled">scheduled</option><option value="declined">declined</option><option value="cancelled">cancelled</option></select></label>
        <label>Description<textarea name="description" rows={4} /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={['Service','Status','Preferred Date','Window','Customer']} cells={['service_requested','status','preferred_date','preferred_window','customer_id']} rows={rows} />}
    </main>
  );
}
