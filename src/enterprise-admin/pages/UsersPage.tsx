import { useEffect, useState } from 'react';
import { listTenantUsers } from '../services/iamService';
import { useTenantId } from '../hooks/useTenantId';
import type { TenantUser } from '../types/iam';

export function UsersPage() {
  const tenantId = useTenantId();
  const [users, setUsers] = useState<TenantUser[]>([]);

  useEffect(() => {
    listTenantUsers(tenantId).then(setUsers);
  }, [tenantId]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Invite User</button>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-3">Name</th><th>Email</th><th>Status</th><th>Last Login</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.full_name ?? '—'}</td>
                <td>{u.email}</td>
                <td>{u.status ?? 'active'}</td>
                <td>{u.last_login_at ?? '—'}</td>
                <td className="text-right p-3"><button className="rounded border px-3 py-1">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
