import { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../services/iamService';
import { useTenantId } from '../hooks/useTenantId';
import type { AdminDashboardStats } from '../types/iam';

export function AdminDashboard() {
  const tenantId = useTenantId();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminDashboardStats(tenantId).then(setStats).catch((e) => setError(e.message));
  }, [tenantId]);

  if (error) return <div className="rounded bg-red-50 p-4 text-red-700">{error}</div>;
  if (!stats) return <div>Loading administration dashboard...</div>;

  const cards = [
    ['Users', stats.users],
    ['Pending Invitations', stats.pendingInvitations],
    ['Locked Accounts', stats.lockedAccounts],
    ['Active Sessions', stats.activeSessions],
    ['Recent Security Events', stats.recentSecurityEvents],
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Enterprise Administration Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
