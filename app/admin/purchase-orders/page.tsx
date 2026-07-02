'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';
import { LiveSelect } from '@/components/LiveSelect';

type Row = Record<string, unknown>;
const api = '/api/admin/purchase-orders?tenant_slug=demo-company';
const headers = ["PO Number", "Vendor", "Status", "Total"];
const cells = ["po_number", "vendor_id", "status", "total_amount"];

export default function Page() {
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
      <h1>Purchase Orders</h1>
      <p>Live Supabase-backed inventory operation screen.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="vendor_id" label="Vendor" api="/api/admin/vendors?tenant_slug=demo-company" labelField="name" required />
        <label>PO Number<input name="po_number" type="text" /></label>
        <label>Status<select name="status"><option value="draft">draft</option><option value="ordered">ordered</option><option value="partially_received">partially_received</option><option value="received">received</option><option value="cancelled">cancelled</option></select></label>
        <label>Total Amount<input name="total_amount" type="number" step="0.01" /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={headers} cells={cells} rows={rows} />}
    </main>
  );
}
