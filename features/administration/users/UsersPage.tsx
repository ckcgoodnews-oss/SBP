'use client';

import React, { useEffect, useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { SimpleForm } from '@/components/admin/SimpleForm';
import { adminCreate, adminDelete, adminList, adminUpdate } from '@/lib/enterprise-admin/api';
import type { TenantUser } from '@/types/enterprise-admin';

export default function UsersPage() {
  const [rows, setRows] = useState<TenantUser[]>([]);
  const [error, setError] = useState<string>('');
  const [editing, setEditing] = useState<TenantUser | null>(null);
  const load = async () => { setRows(await adminList<TenantUser>('users')); };
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);
  return <main style={{ padding: 24 }}><h1>Enterprise Users</h1>{error && <p style={{color:'crimson'}}>{error}</p>}
    <SimpleForm key={editing?.id ?? 'new'} submitLabel={editing ? 'Update User' : 'Create User'} initialValues={editing ?? undefined} fields={[{name:'email',label:'Email',required:true},{name:'full_name',label:'Full Name'},{name:'role',label:'Role'},{name:'status',label:'Status',placeholder:'active'}]} onSubmit={async v=>{ editing ? await adminUpdate('users', editing.id, v) : await adminCreate('users', {...v,status:v.status||'active'}); setEditing(null); await load(); }} />
    <CrudTable rows={rows} columns={[{key:'email',label:'Email'},{key:'full_name',label:'Name'},{key:'role',label:'Role'},{key:'status',label:'Status'},{key:'created_at',label:'Created'}]} onEdit={setEditing} onDelete={async r=>{ if(confirm('Disable this user?')) { await adminDelete('users', r.id); await load(); } }} />
  </main>;
}
