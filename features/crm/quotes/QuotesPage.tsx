'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Quote } from '@/types/quotes';
import { adminGet, adminPost, adminPatch, adminDelete } from '@/lib/services/admin-api';

const emptyForm = {
  tenant_id: '',
  customer_id: '',
  quote_number: '',
  status: 'draft',
  subtotal: '',
  tax_amount: '',
  total_amount: '',
  valid_until: '',
  notes: '',
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setQuotes(await adminGet<Quote>('/api/admin/quotes'));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return quotes.filter(x =>
      (x.quote_number ?? '').toLowerCase().includes(q) ||
      (x.status ?? '').toLowerCase().includes(q) ||
      (x.customer_id ?? '').toLowerCase().includes(q)
    );
  }, [quotes, search]);

  function payload() {
    return {
      tenant_id: form.tenant_id || undefined,
      customer_id: form.customer_id || undefined,
      quote_number: form.quote_number || undefined,
      status: form.status || 'draft',
      subtotal: form.subtotal === '' ? undefined : Number(form.subtotal),
      tax_amount: form.tax_amount === '' ? undefined : Number(form.tax_amount),
      total_amount: form.total_amount === '' ? undefined : Number(form.total_amount),
      valid_until: form.valid_until || undefined,
      notes: form.notes || undefined,
    };
  }

  async function save() {
    setError(null);
    try {
      if (editingId) {
        await adminPatch('/api/admin/quotes', { id: editingId, ...payload() });
      } else {
        await adminPost('/api/admin/quotes', payload());
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'Save failed');
    }
  }

  function edit(q: Quote) {
    setEditingId(q.id);
    setForm({
      tenant_id: q.tenant_id ?? '',
      customer_id: q.customer_id ?? '',
      quote_number: q.quote_number ?? '',
      status: q.status ?? 'draft',
      subtotal: q.subtotal == null ? '' : String(q.subtotal),
      tax_amount: q.tax_amount == null ? '' : String(q.tax_amount),
      total_amount: q.total_amount == null ? '' : String(q.total_amount),
      valid_until: q.valid_until?.slice(0, 10) ?? '',
      notes: q.notes ?? '',
    });
  }

  async function remove(id: string) {
    if (!confirm('Delete this quote?')) return;
    await adminDelete('/api/admin/quotes', id);
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Quotes</h1>
      <p>Live CRM quote management wired to Supabase.</p>
      {error && <div style={{ background: '#fee', border: '1px solid #f99', padding: 12, marginBottom: 16 }}>{error}</div>}
      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <h2>{editingId ? 'Edit Quote' : 'Create Quote'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))', gap: 12 }}>
          <input placeholder="Tenant ID" value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} />
          <input placeholder="Customer ID" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} />
          <input placeholder="Quote #" value={form.quote_number} onChange={e => setForm({ ...form, quote_number: e.target.value })} />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Draft</option><option value="sent">Sent</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="converted">Converted</option>
          </select>
          <input placeholder="Subtotal" type="number" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} />
          <input placeholder="Tax" type="number" value={form.tax_amount} onChange={e => setForm({ ...form, tax_amount: e.target.value })} />
          <input placeholder="Total" type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} />
          <input placeholder="Valid Until" type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
          <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={save}>{editingId ? 'Update Quote' : 'Create Quote'}</button>
          {editingId && <button style={{ marginLeft: 8 }} onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </section>
      <input placeholder="Search quotes" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12, width: '100%', padding: 8 }} />
      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th align="left">Quote #</th><th align="left">Customer</th><th>Status</th><th>Total</th><th>Valid Until</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(q => <tr key={q.id} style={{ borderTop: '1px solid #ddd' }}>
            <td>{q.quote_number ?? q.id.slice(0, 8)}</td><td>{q.customer_id ?? '-'}</td><td>{q.status ?? '-'}</td><td>{q.total_amount ?? '-'}</td><td>{q.valid_until?.slice(0, 10) ?? '-'}</td>
            <td><button onClick={() => edit(q)}>Edit</button><button style={{ marginLeft: 8 }} onClick={() => remove(q.id)}>Delete</button></td>
          </tr>)}</tbody>
        </table>
      )}
    </main>
  );
}
