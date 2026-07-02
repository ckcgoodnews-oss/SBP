import { useEffect, useState } from 'react';
import { listUsers, updateUserStatus } from '../services/iamService';
import type { AppUser } from '../types/iam';

export default function UserDirectory() {
  const [users, setUsers] = useState<AppUser[]>([]);
  async function reload() { setUsers(await listUsers()); }
  useEffect(() => { void reload(); }, []);
  return <div className="p-6"><h1 className="text-2xl font-semibold">Users</h1><table className="mt-4 w-full border"><thead><tr><th>Email</th><th>Name</th><th>Status</th><th>MFA</th><th>Actions</th></tr></thead><tbody>{users.map(u => <tr key={u.id} className="border-t"><td>{u.email}</td><td>{u.full_name}</td><td>{u.status}</td><td>{u.mfa_required ? 'Required' : 'Optional'}</td><td><button onClick={() => updateUserStatus(u.id, u.status === 'active' ? 'disabled' : 'active').then(reload)}>{u.status === 'active' ? 'Disable' : 'Enable'}</button></td></tr>)}</tbody></table></div>;
}
