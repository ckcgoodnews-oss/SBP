import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AuditLogViewer() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    void supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <table className="w-full border text-sm"><thead><tr className="bg-gray-100"><th>Time</th><th>Event</th><th>Entity</th><th>Details</th></tr></thead><tbody>
        {rows.map(r => <tr key={r.id} className="border-t"><td className="p-2">{new Date(r.created_at).toLocaleString()}</td><td>{r.event_type}</td><td>{r.entity_type}</td><td><pre className="max-w-xl overflow-auto">{JSON.stringify(r.new_value, null, 2)}</pre></td></tr>)}
      </tbody></table>
    </div>
  );
}
