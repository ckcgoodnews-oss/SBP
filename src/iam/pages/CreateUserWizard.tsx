import { useEffect, useState } from 'react';
import { createApplicationUser, getCurrentAppUser, listRoles } from '../services/iamService';
import type { Role } from '../types/iam';

export default function CreateUserWizard() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', title: '', phone: '', role_ids: [] as string[] });

  useEffect(() => {
    void listRoles().then(setRoles);
    void getCurrentAppUser().then(u => setOrganizationId(u?.organization_id ?? ''));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createApplicationUser({ ...form, organization_id: organizationId });
    window.location.href = '/admin/iam/users';
  }

  return (
    <form onSubmit={submit} className="p-6 max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Create User</h1>
      <input required placeholder="Full name" className="w-full border p-2" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
      <input required type="email" placeholder="Email" className="w-full border p-2" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Title" className="w-full border p-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <input placeholder="Phone" className="w-full border p-2" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      <div className="border p-3">
        <div className="font-medium mb-2">Roles</div>
        {roles.map(r => (
          <label key={r.id} className="block">
            <input type="checkbox" className="mr-2" checked={form.role_ids.includes(r.id)} onChange={e => setForm({ ...form, role_ids: e.target.checked ? [...form.role_ids, r.id] : form.role_ids.filter(id => id !== r.id) })} />
            {r.name}
          </label>
        ))}
      </div>
      <button disabled={saving} className="rounded bg-black px-4 py-2 text-white">{saving ? 'Creating...' : 'Create User'}</button>
    </form>
  );
}
