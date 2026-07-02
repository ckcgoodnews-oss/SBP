import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['Dashboard', '/admin'],
  ['Users', '/admin/users'],
  ['Roles', '/admin/roles'],
  ['Permissions', '/admin/permissions'],
  ['Audit', '/admin/audit'],
  ['Sessions', '/admin/sessions'],
  ['API Keys', '/admin/api-keys'],
  ['Tenants', '/admin/tenants'],
  ['Departments', '/admin/departments'],
  ['Locations', '/admin/locations'],
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 border-r bg-white p-4">
        <h1 className="mb-6 text-xl font-bold">Enterprise Admin</h1>
        <nav className="space-y-1">
          {links.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
