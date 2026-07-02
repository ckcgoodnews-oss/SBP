'use client';

import { useState } from 'react';
import { ErrorCard } from '@/components/LiveState';
import { LiveSelect } from '@/components/LiveSelect';

export default function CompleteJobPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const form = event.currentTarget;

    try {
      const response = await fetch('/api/technician/work-completions?tenant_slug=demo-company', { method: 'POST', body: new FormData(form) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Save failed.');
      form.reset();
      setMessage('Work completion saved and work order marked completed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="main">
      <h1>Complete Job</h1>
      <p>Submit work completion for an assigned work order.</p>
      <form className="form" onSubmit={submit}>
        <LiveSelect name="work_order_id" label="Work Order" api="/api/technician/jobs?tenant_slug=demo-company" labelField="work_order_number" required />
        <label>Completion Notes<textarea name="completion_notes" rows={5} /></label>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Complete Job'}</button>
      </form>
      {message && <div className="card"><p>{message}</p></div>}
      {error && <ErrorCard message={error} />}
    </main>
  );
}
