'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';
import { LiveSelect } from '@/components/LiveSelect';

type Row = Record<string, unknown>;
const api = '/api/admin/work-orders?tenant_slug=demo-company';

export default function WorkOrdersPage() {
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
      <h1>Work Orders</h1>
      <p>Live work orders with customer and service dropdowns.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="customer_id" label="Customer" api="/api/admin/customers?tenant_slug=demo-company" labelField="display_name" required />
        <LiveSelect name="service_id" label="Service" api="/api/admin/services?tenant_slug=demo-company" labelField="name" />
        <label>Work Order Number<input name="work_order_number" required /></label>
        <label>Status<select name="status"><option value="new">new</option><option value="quoted">quoted</option><option value="scheduled">scheduled</option><option value="dispatched">dispatched</option><option value="in_progress">in_progress</option><option value="completed">completed</option><option value="cancelled">cancelled</option><option value="invoiced">invoiced</option><option value="paid">paid</option></select></label>
        <label>Priority<select name="priority"><option value="normal">normal</option><option value="low">low</option><option value="urgent">urgent</option><option value="emergency">emergency</option></select></label>
        <label>Summary<input name="summary" required /></label>
        <label>Instructions<textarea name="instructions" rows={4} /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={['Number','Status','Priority','Summary','Customer']} cells={['work_order_number','status','priority','summary','customer_id']} rows={rows} />}
    </main>
  );
}
