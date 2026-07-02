import React, { useEffect, useState } from 'react';
import { iamService } from '../services/iamService';
import { DataState } from '../../../shared/components/DataState';

export default function SessionsPage() {
  const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = () => iamService.listSessions().then(({ data, error }: any) => { setRows(data ?? []); setError(error?.message ?? error ?? null); setLoading(false); });
  useEffect(() => { load(); }, []);
  return <div><h1 className="text-2xl font-bold mb-4">Active Sessions</h1><DataState loading={loading} error={error} empty={!rows.length}><div className="bg-white border rounded-lg overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-3 text-left">User</th><th className="p-3 text-left">IP</th><th className="p-3 text-left">Last Seen</th><th className="p-3 text-left">Revoked</th><th className="p-3"></th></tr></thead><tbody>{rows.map((r:any)=><tr key={r.id} className="border-t"><td className="p-3">{r.tenant_user_id ?? r.auth_user_id}</td><td className="p-3">{r.ip_address}</td><td className="p-3">{r.last_seen_at}</td><td className="p-3">{r.revoked_at ? 'Yes' : 'No'}</td><td className="p-3 text-right"><button disabled={!!r.revoked_at} onClick={async()=>{await iamService.revokeSession(r.id); load();}} className="px-3 py-1 rounded border">Revoke</button></td></tr>)}</tbody></table></div></DataState></div>;
}
