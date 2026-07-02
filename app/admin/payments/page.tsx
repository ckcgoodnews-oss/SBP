'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows, money } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { LiveSelect } from '@/components/LiveSelect';

type Row = Record<string, unknown>;
const api = '/api/admin/payments?tenant_slug=demo-company';

export default function PaymentsPage() {
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
      <h1>Payments</h1>
      <p>Live payment records.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="invoice_id" label="Invoice" api="/api/admin/invoices?tenant_slug=demo-company" labelField="invoice_number" required />
        <label>Payment Method<select name="payment_method"><option value="cash">cash</option><option value="check">check</option><option value="card_external">card_external</option><option value="ach_external">ach_external</option><option value="other">other</option></select></label>
        <label>Amount<input name="amount" type="number" step="0.01" required /></label>
        <label>Payment Date<input name="payment_date" type="date" /></label>
        <label>Reference Number<input name="reference_number" /></label>
        <label>Notes<textarea name="notes" rows={3} /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && (
        <table>
          <thead><tr><th>Method</th><th>Amount</th><th>Date</th><th>Reference</th><th>Invoice</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={String(r.id)}><td>{String(r.payment_method)}</td><td>{money(r.amount)}</td><td>{String(r.payment_date || '—')}</td><td>{String(r.reference_number || '—')}</td><td>{String(r.invoice_id)}</td></tr>)}</tbody>
        </table>
      )}
    </main>
  );
}
