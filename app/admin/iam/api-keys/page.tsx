'use client';

import { useEffect, useState } from 'react';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';

type ServiceAccount = { id: string; name: string; active: boolean };
type ApiKey = { id: string; key_name: string; key_prefix: string; scopes: string[]; active: boolean; service_account_id: string };

const api = '/api/admin/iam/api-keys?tenant_slug=demo-company';

export default function ApiKeysPage() {
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastKey, setLastKey] = useState('');

  async function load() {
    setLoading(true);
    const response = await fetch(api, { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'Load failed.');
    setServiceAccounts(payload.service_accounts || []);
    setApiKeys(payload.api_keys || []);
    setLoading(false);
  }

  useEffect(() => { load().catch((err) => { setError(err.message); setLoading(false); }); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLastKey('');
    const form = event.currentTarget;
    const response = await fetch(api, { method: 'POST', body: new FormData(form) });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      setError(payload.error || 'Save failed.');
      return;
    }
    if (payload.api_key_once) setLastKey(payload.api_key_once);
    form.reset();
    await load();
  }

  return (
    <main className="main">
      <h1>API Keys & Service Accounts</h1>
      <form className="form" onSubmit={submit}>
        <label>Mode<select name="mode"><option value="service_account">Create Service Account</option><option value="api_key">Create API Key</option></select></label>
        <label>Service Account Name<input name="name" placeholder="For service account mode" /></label>
        <label>Description<textarea name="description" rows={2} /></label>
        <label>Service Account for API Key<select name="service_account_id"><option value="">Select service account</option>{serviceAccounts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>API Key Name<input name="key_name" placeholder="For api_key mode" /></label>
        <label>Scopes, comma separated<input name="scopes" placeholder="crm.view,reports.export" /></label>
        <button type="submit">Save</button>
      </form>

      {lastKey && <div className="notice"><p><strong>Copy this API key now:</strong></p><code>{lastKey}</code></div>}
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && serviceAccounts.length === 0 && apiKeys.length === 0 && <EmptyCard />}

      <h2>Service Accounts</h2>
      <table><thead><tr><th>Name</th><th>Active</th></tr></thead><tbody>{serviceAccounts.map((s) => <tr key={s.id}><td>{s.name}</td><td>{String(s.active)}</td></tr>)}</tbody></table>

      <h2>API Keys</h2>
      <table><thead><tr><th>Name</th><th>Prefix</th><th>Scopes</th><th>Active</th></tr></thead><tbody>{apiKeys.map((k) => <tr key={k.id}><td>{k.key_name}</td><td>{k.key_prefix}</td><td>{JSON.stringify(k.scopes || [])}</td><td>{String(k.active)}</td></tr>)}</tbody></table>
    </main>
  );
}
