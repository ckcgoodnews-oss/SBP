import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const items = [
  ['Dashboard', '/admin'], ['Users', '/admin/users'], ['Roles', '/admin/roles'], ['Permissions', '/admin/permissions'], ['Audit', '/admin/audit'], ['Sessions', '/admin/sessions'], ['API Keys', '/admin/api-keys'], ['Tenants', '/admin/tenants'], ['Departments', '/admin/departments'], ['Locations', '/admin/locations'],
];

export function EnterpriseAdminLayout() {
  return <div className="min-h-screen bg-slate-50 flex"><aside className="w-72 bg-slate-950 text-white p-4"><div className="text-xl font-semibold mb-6">Enterprise Admin</div><nav className="space-y-1">{items.map(([label, path]) => <NavLink key={path} to={path} end={path === '/admin'} className={({ isActive }) => `block rounded px-3 py-2 text-sm ${isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}>{label}</NavLink>)}</nav></aside><main className="flex-1 p-6 overflow-auto"><Outlet /></main></div>;
}
