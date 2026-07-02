'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const nav = [
  ['Security Dashboard', '/admin/security'],
  ['Users', '/admin/users'],
  ['Roles', '/admin/roles'],
  ['Permissions', '/admin/permissions'],
  ['Audit Timeline', '/admin/audit'],
  ['Sessions', '/admin/sessions'],
  ['API Keys', '/admin/api-keys'],
  ['Service Accounts', '/admin/service-accounts'],
  ['MFA', '/admin/mfa'],
  ['Tenants', '/admin/tenants'],
  ['Departments', '/admin/departments'],
  ['Locations', '/admin/locations'],
  ['Impersonation', '/admin/impersonation'],
];

export function EnterpriseAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: '#f8fafc' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', padding: 20, background: '#0f172a', color: '#fff' }}>
        <h1 style={{ fontSize: 20, marginBottom: 24 }}>SBP Enterprise Admin</h1>
        <nav style={{ display: 'grid', gap: 6 }}>
          {nav.map(([label, href]) => {
            const active = pathname === href;
            return <Link key={href} href={href} style={{ color: '#fff', textDecoration: 'none', padding: '9px 10px', borderRadius: 8, background: active ? '#334155' : 'transparent' }}>{label}</Link>;
          })}
        </nav>
      </aside>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}
