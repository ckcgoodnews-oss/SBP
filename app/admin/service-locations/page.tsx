'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';
import { LiveSelect } from '@/components/LiveSelect';

type Row = Record<string, unknown>;
const api = '/api/admin/service-locations?tenant_slug=demo-company';

export default function ServiceLocationsPage() {
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
      <h1>Service Locations</h1>
      <p>Live service locations linked to customers.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="customer_id" label="Customer" api="/api/admin/customers?tenant_slug=demo-company" labelField="display_name" required />
        <label>Address 1<input name="address1" required /></label>
        <label>Address 2<input name="address2" /></label>
        <label>City<input name="city" required /></label>
        <label>State<input name="state" required /></label>
        <label>Postal Code<input name="postal_code" required /></label>
        <label>Access Notes<textarea name="access_notes" rows={3} /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={['Address','City','State','Postal','Customer']} cells={['address1','city','state','postal_code','customer_id']} rows={rows} />}
    </main>
  );
}
