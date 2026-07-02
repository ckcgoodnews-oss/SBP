'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';

type Row = Record<string, unknown>;

const api = '/api/admin/products?tenant_slug=demo-company';
const headers = ["SKU", "Name", "Type", "UOM", "Cost", "Retail"];
const cells = ["sku", "name", "product_type", "unit_of_measure", "cost", "retail_price"];

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    fetchApiRows<Row>(api)
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(api, { method: 'POST', body: formData });
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
      <h1>Products</h1>
      <p>Live Supabase-backed CRUD screen for demo-company.</p>

      <form className="form" onSubmit={submit}>
        <label>SKU<input name="sku" type="text" /></label>
        <label>Product Name<input name="name" type="text" /></label>
        <label>Product Type<select name="product_type"><option value="retail">retail</option><option value="service_consumable">service_consumable</option><option value="equipment">equipment</option><option value="chemical">chemical</option><option value="part">part</option><option value="bundle_component">bundle_component</option></select></label>
        <label>Unit of Measure<input name="unit_of_measure" type="text" /></label>
        <label>Cost<input name="cost" type="number" /></label>
        <label>Retail Price<input name="retail_price" type="number" /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>

      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={headers} cells={cells} rows={rows} />}
    </main>
  );
}
