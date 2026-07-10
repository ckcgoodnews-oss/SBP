import React, { useEffect, useState } from 'react';
import { iamService } from '../services/iamService';
import { DataState } from '../../../shared/components/DataState';

export default function AuditPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { iamService.listAuditLogs().then(({ data, error }: any) => { setRows(data ?? []); setError(error?.message ?? error ?? null); setLoading(false); }); }, []);
  const columns = ['action','entity_type','entity_id','created_at'];
  return <div><div className="flex justify-between items-center mb-4"><div><h1 className="text-2xl font-bold">Audit</h1><p className="text-slate-600">Manage Audit records.</p></div><button className="px-4 py-2 rounded bg-slate-950 text-white">New</button></div><DataState loading={loading} error={error} empty={!rows.length}><div className="bg-white border rounded-lg overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-100"><tr>{columns.map((c:string)=><th key={c} className="text-left p-3">{c}</th>)}</tr></thead><tbody>{rows.map((r:any)=><tr key={r.id} className="border-t">{columns.map((c:string)=><td key={c} className="p-3">{String(r[c] ?? '')}</td>)}</tr>)}</tbody></table></div></DataState></div>;
}
