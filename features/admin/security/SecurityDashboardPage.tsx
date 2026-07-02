'use client';

import { AdminCard } from '@/components/admin/AdminCard';

const metrics = [
  { label: 'Active Sessions', value: 'Live', helper: 'Review and revoke from Sessions.' },
  { label: 'MFA Coverage', value: 'Ready', helper: 'Connect Supabase MFA enrollment next.' },
  { label: 'Audit Logging', value: 'Enabled', helper: 'Reads from audit_logs.' },
  { label: 'Service Accounts', value: 'Managed', helper: 'API integrations separated from users.' },
];

export default function SecurityDashboardPage() {
  return (
    <main style={{ display: 'grid', gap: 18 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Security Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {metrics.map((m) => (
          <AdminCard key={m.label} title={m.label}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{m.value}</div>
            <p style={{ color: '#6b7280' }}>{m.helper}</p>
          </AdminCard>
        ))}
      </div>
      <AdminCard title="Recommended Controls">
        <ul>
          <li>Require MFA for Owner, Administrator, and API Service Account administrators.</li>
          <li>Use service accounts for integrations instead of human user accounts.</li>
          <li>Review active sessions and failed access events daily.</li>
          <li>Require a reason for every impersonation event.</li>
        </ul>
      </AdminCard>
    </main>
  );
}
