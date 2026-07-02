'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';
import { LiveSelect } from '@/components/LiveSelect';

type Row = Record<string, unknown>;
const api = '/api/admin/inventory-balances?tenant_slug=demo-company';
const headers = ["Product", "Warehouse", "On Hand", "Reorder Point", "Reorder Qty"];
const cells = ["product_id", "warehouse_id", "quantity_on_hand", "reorder_point", "reorder_quantity"];

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
      <h1>Inventory Balances</h1>
      <p>Live Supabase-backed inventory operation screen.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="product_id" label="Product" api="/api/admin/products?tenant_slug=demo-company" labelField="name" required />
        <LiveSelect name="warehouse_id" label="Warehouse" api="/api/admin/warehouses?tenant_slug=demo-company" labelField="name" required />
        <label>Quantity On Hand<input name="quantity_on_hand" type="number" step="0.01" /></label>
        <label>Reorder Point<input name="reorder_point" type="number" step="0.01" /></label>
        <label>Reorder Quantity<input name="reorder_quantity" type="number" step="0.01" /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={headers} cells={cells} rows={rows} />}
    </main>
  );
}
