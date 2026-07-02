'use client';

import { AdminCard } from '@/components/admin/AdminCard';

export default function MfaManagementPage() {
  return (
    <main style={{ display: 'grid', gap: 18 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>MFA Management</h1>
      <AdminCard title="MFA Policy">
        <p>Configure tenant MFA requirements here. Supabase Auth MFA enrollment hooks can be wired to this screen next.</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <label><input type="checkbox" defaultChecked /> Require MFA for Owner and Administrator roles</label>
          <label><input type="checkbox" /> Require MFA for accounting and API key administrators</label>
          <label><input type="checkbox" /> Require step-up authentication before impersonation</label>
        </div>
      </AdminCard>
    </main>
  );
}
