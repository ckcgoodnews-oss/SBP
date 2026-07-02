'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { AdminDataTable } from '@/components/AdminDataTable';

type Row = Record<string, unknown>;

const api = '/api/admin/customers?tenant_slug=demo-company';
const headers = ["Name", "Type", "Email", "Phone", "Status"];
const cells = ["display_name", "customer_type", "email", "phone", "status"];

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
      <h1>Customers</h1>
      <p>Live Supabase-backed CRUD screen for demo-company.</p>

      <form className="form" onSubmit={submit}>
        <label>Display Name<input name="display_name" type="text" /></label>
        <label>Customer Type<select name="customer_type"><option value="residential">residential</option><option value="commercial">commercial</option><option value="property_manager">property_manager</option><option value="government">government</option><option value="other">other</option></select></label>
        <label>First Name<input name="first_name" type="text" /></label>
        <label>Last Name<input name="last_name" type="text" /></label>
        <label>Email<input name="email" type="email" /></label>
        <label>Phone<input name="phone" type="text" /></label>
        <label>City<input name="city" type="text" /></label>
        <label>State<input name="state" type="text" /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>

      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <AdminDataTable headers={headers} cells={cells} rows={rows} />}
    </main>
  );
}
