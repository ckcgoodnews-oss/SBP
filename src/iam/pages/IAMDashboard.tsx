import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function IAMDashboard() {
  const [stats, setStats] = useState({ users: 0, locked: 0, invited: 0, sessions: 0, audit: 0 });
  useEffect(() => {
    async function load() {
      const [users, locked, invited, sessions, audit] = await Promise.all([
        supabase.from('app_users').select('id', { count: 'exact', head: true }),
        supabase.from('app_users').select('id', { count: 'exact', head: true }).eq('status', 'locked'),
        supabase.from('app_users').select('id', { count: 'exact', head: true }).eq('status', 'invited'),
        supabase.from('iam_sessions').select('id', { count: 'exact', head: true }).is('revoked_at', null),
        supabase.from('audit_log').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ users: users.count ?? 0, locked: locked.count ?? 0, invited: invited.count ?? 0, sessions: sessions.count ?? 0, audit: audit.count ?? 0 });
    }
    void load();
  }, []);
  return <div className="p-6"><h1 className="text-2xl font-semibold">Enterprise IAM</h1><div className="grid grid-cols-5 gap-4 mt-6">{Object.entries(stats).map(([k,v]) => <div key={k} className="rounded border p-4"><div className="text-sm uppercase opacity-70">{k}</div><div className="text-3xl font-bold">{v}</div></div>)}</div></div>;
}
