'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';

type Row = Record<string, unknown>;

const api = '/api/admin/services?tenant_slug=demo-company';
const headers = ["Name", "Pricing Model", "Duration", "Active"];
const cells = ["name", "pricing_model", "default_duration_minutes", "active"];

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
      <h1>Services</h1>
      <p>Live Supabase-backed CRUD screen for demo-company.</p>

      <form className="form" onSubmit={submit}>
        <label>Service Name<input name="name" type="text" /></label>
        <label>Description<textarea name="description" rows={4} /></label>
        <label>Default Duration Minutes<input name="default_duration_minutes" type="number" /></label>
        <label>Pricing Model<select name="pricing_model"><option value="tenant_configured">tenant_configured</option><option value="flat_rate">flat_rate</option><option value="hourly">hourly</option><option value="per_room">per_room</option><option value="per_sqft">per_sqft</option><option value="custom">custom</option></select></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>

      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={headers} cells={cells} rows={rows} />}
    </main>
  );
}
