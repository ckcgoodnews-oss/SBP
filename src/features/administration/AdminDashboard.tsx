import React, { useEffect, useState } from 'react';
import { iamService } from './services/iamService';
import { DataState } from '../../shared/components/DataState';

export function AdminDashboard() {
  const [state, setState] = useState<any>({ loading: true });
  useEffect(() => { iamService.dashboardStats().then((data) => setState({ loading: false, ...data })); }, []);
  const cards = [['Users', state.users ?? 0], ['Pending Invitations', state.pendingInvitations ?? 0], ['Locked Accounts', state.lockedAccounts ?? 0], ['Active Sessions', state.activeSessions ?? 0]];
  return <div><h1 className="text-2xl font-bold mb-1">Enterprise Administration</h1><p className="text-slate-600 mb-6">Security, users, roles, permissions, and tenant administration.</p><DataState loading={state.loading} error={state.error}><div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">{cards.map(([label, value]) => <div key={label as string} className="bg-white border rounded-lg p-4"><div className="text-sm text-slate-500">{label}</div><div className="text-3xl font-semibold">{value}</div></div>)}</div><section className="bg-white border rounded-lg p-4"><h2 className="font-semibold mb-3">Recent Security Events</h2>{(state.recentEvents ?? []).map((e: any) => <div key={e.id} className="py-2 border-t text-sm"><b>{e.action}</b><span className="text-slate-500 ml-2">{e.created_at}</span></div>)}</section></DataState></div>;
}
