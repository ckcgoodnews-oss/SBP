'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows, money } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { LiveSelect } from '@/components/LiveSelect';

type Row = Record<string, unknown>;
const api = '/api/admin/invoices?tenant_slug=demo-company';

export default function InvoicesPage() {
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
      <h1>Invoices</h1>
      <p>Live invoices with customer and work-order dropdowns.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="customer_id" label="Customer" api="/api/admin/customers?tenant_slug=demo-company" labelField="display_name" required />
        <LiveSelect name="work_order_id" label="Work Order" api="/api/admin/work-orders?tenant_slug=demo-company" labelField="work_order_number" />
        <label>Invoice Number<input name="invoice_number" required /></label>
        <label>Status<select name="status"><option value="draft">draft</option><option value="issued">issued</option><option value="partially_paid">partially_paid</option><option value="paid">paid</option><option value="void">void</option><option value="past_due">past_due</option></select></label>
        <label>Subtotal<input name="subtotal" type="number" step="0.01" /></label>
        <label>Tax Amount<input name="tax_amount" type="number" step="0.01" /></label>
        <label>Discount Amount<input name="discount_amount" type="number" step="0.01" /></label>
        <label>Total Amount<input name="total_amount" type="number" step="0.01" /></label>
        <label>Amount Paid<input name="amount_paid" type="number" step="0.01" /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && (
        <table>
          <thead><tr><th>Invoice</th><th>Status</th><th>Total</th><th>Paid</th><th>Customer</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={String(r.id)}><td>{String(r.invoice_number)}</td><td>{String(r.status)}</td><td>{money(r.total_amount)}</td><td>{money(r.amount_paid)}</td><td>{String(r.customer_id)}</td></tr>)}</tbody>
        </table>
      )}
    </main>
  );
}
