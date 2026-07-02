import { useEffect, useState } from 'react';
import { listPermissions, listRoles } from '../services/iamService';
import type { Permission, Role } from '../types/iam';

export default function RoleBuilder() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  useEffect(() => { void Promise.all([listRoles(), listPermissions()]).then(([r,p]) => { setRoles(r); setPermissions(p); }); }, []);
  return <div className="p-6"><h1 className="text-2xl font-semibold">Role Builder</h1><div className="grid grid-cols-3 gap-6 mt-4"><div><h2 className="font-semibold">Roles</h2>{roles.map(r => <div key={r.id} className="border rounded p-2 mt-2">{r.name}</div>)}</div><div className="col-span-2"><h2 className="font-semibold">Permission Matrix</h2><table className="w-full border mt-2"><tbody>{permissions.map(p => <tr key={p.id} className="border-t"><td>{p.module}</td><td>{p.action}</td><td>{p.description}</td></tr>)}</tbody></table></div></div></div>;
}
