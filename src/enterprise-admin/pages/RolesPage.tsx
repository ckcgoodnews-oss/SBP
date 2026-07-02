import { useEffect, useState } from 'react';
import { listRoles } from '../services/iamService';
import { useTenantId } from '../hooks/useTenantId';
import type { IamRole } from '../types/iam';

export function RolesPage() {
  const tenantId = useTenantId();
  const [roles, setRoles] = useState<IamRole[]>([]);
  useEffect(() => { listRoles(tenantId).then(setRoles); }, [tenantId]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Roles</h2>
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Create Role</button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((r) => (
          <div key={r.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="font-semibold">{r.name}</div>
            <div className="mt-2 text-sm text-slate-500">{r.description ?? 'No description'}</div>
            <button className="mt-4 rounded border px-3 py-1 text-sm">Edit permissions</button>
          </div>
        ))}
      </div>
    </div>
  );
}
