'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { IamTable } from '@/components/IamTable';

type Row = Record<string, unknown>;
const api = '/api/admin/iam/departments?tenant_slug=demo-company';

export default function DepartmentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    fetchApiRows<Row>(api).then(setRows).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    try {
      const response = await fetch(api, { method: 'POST', body: new FormData(form) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Save failed.');
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally { setSaving(false); }
  }

  return (
    <main className="main">
      <h1>Departments</h1>
      <form className="form" onSubmit={submit}>
        <label>Name<input name="name" required /></label>
        <label>Description<textarea name="description" rows={3} /></label>
        <button disabled={saving}>{saving ? 'Saving...' : 'Save Department'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <IamTable headers={['Name','Description','Active']} cells={['name','description','active']} rows={rows} />}
    </main>
  );
}
