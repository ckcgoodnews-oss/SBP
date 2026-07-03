'use client';

import React, { useEffect, useMemo, useState } from 'react';

type TenantUser = {
  id: string;
  tenant_id: string;
  auth_user_id?: string | null;
  email: string;
  full_name: string;
  role?: string | null;
  active?: boolean | null;
  locked_until?: string | null;
  lock_reason?: string | null;
  mfa_required?: boolean | null;
  last_login_at?: string | null;
  department_id?: string | null;
  title?: string | null;
  phone?: string | null;
  updated_at?: string | null;
  failed_login_count?: number | null;
};

type IamRole = {
  id: string;
  role_key: string;
  display_name: string;
  description?: string | null;
  active?: boolean | null;
};

type Department = {
  id: string;
  name: string;
  description?: string | null;
  active?: boolean | null;
};

type ApiResponse<T> = {
  ok?: boolean;
  data?: T;
  error?: string;
};

const emptyForm = {
  tenant_id: '',
  email: '',
  full_name: '',
  role: 'staff',
  title: '',
  phone: '',
  department_id: '',
  mfa_required: false,
  active: true,
};

type UserForm = typeof emptyForm;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || json.ok === false) {
    throw new Error(json.error || `Request failed: ${response.status}`);
  }

  return json.data as T;
}

function isLocked(user: TenantUser) {
  if (!user.locked_until) return false;
  return new Date(user.locked_until).getTime() > Date.now();
}

function badge(label: string, tone: 'green' | 'red' | 'yellow' | 'gray' | 'blue') {
  const colors: Record<typeof tone, string> = {
    green: '#dcfce7',
    red: '#fee2e2',
    yellow: '#fef9c3',
    gray: '#f3f4f6',
    blue: '#dbeafe',
  };

  return (
    <span
      style={{
        background: colors[tone],
        borderRadius: 999,
        padding: '2px 8px',
        fontSize: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<TenantUser[]>([]);
  const [roles, setRoles] = useState<IamRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'locked' | 'mfa'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TenantUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [usersData, rolesData, departmentsData] = await Promise.all([
        api<TenantUser[]>('/api/admin/users'),
        api<IamRole[]>('/api/admin/roles'),
        api<Department[]>('/api/admin/departments'),
      ]);

      setRows(usersData ?? []);
      setRoles((rolesData ?? []).filter((role) => role.active !== false));
      setDepartments((departmentsData ?? []).filter((department) => department.active !== false));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user administration data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredRows = useMemo(() => {
    const text = query.trim().toLowerCase();

    return rows.filter((user) => {
      const matchesText =
        !text ||
        user.email?.toLowerCase().includes(text) ||
        user.full_name?.toLowerCase().includes(text) ||
        user.role?.toLowerCase().includes(text) ||
        user.title?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.active) ||
        (statusFilter === 'inactive' && !user.active) ||
        (statusFilter === 'locked' && isLocked(user)) ||
        (statusFilter === 'mfa' && user.mfa_required);

      return matchesText && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      tenant_id: rows[0]?.tenant_id ?? '',
      role: roles[0]?.role_key ?? 'staff',
    });
    setDrawerOpen(true);
  }

  function openEdit(user: TenantUser) {
    setEditing(user);
    setForm({
      tenant_id: user.tenant_id ?? '',
      email: user.email ?? '',
      full_name: user.full_name ?? '',
      role: user.role ?? roles[0]?.role_key ?? 'staff',
      title: user.title ?? '',
      phone: user.phone ?? '',
      department_id: user.department_id ?? '',
      mfa_required: Boolean(user.mfa_required),
      active: Boolean(user.active),
    });
    setDrawerOpen(true);
  }

  function updateForm<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        title: form.title || null,
        phone: form.phone || null,
        department_id: form.department_id || null,
      };

      if (editing) {
        await api<TenantUser>('/api/admin/users', {
          method: 'PATCH',
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        await api<TenantUser>('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setDrawerOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(path: string, body: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      await api<TenantUser>(path, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  }

  function getRoleDisplayName(roleKey?: string | null) {
    if (!roleKey) return '—';
    return roles.find((role) => role.role_key === roleKey)?.display_name ?? roleKey;
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>User Management</h1>
          <p style={{ marginTop: 6, color: '#64748b' }}>
            Manage tenant users, account status, MFA, lockouts, and security actions.
          </p>
        </div>

        <button onClick={openCreate} style={primaryButton}>
          Create User
        </button>
      </div>

      <section style={statsGrid}>
        <Stat label="Total Users" value={rows.length} />
        <Stat label="Active" value={rows.filter((u) => u.active).length} />
        <Stat label="Locked" value={rows.filter(isLocked).length} />
        <Stat label="MFA Required" value={rows.filter((u) => u.mfa_required).length} />
      </section>

      {error && (
        <div style={{ background: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16, color: '#991b1b' }}>
          {error}
        </div>
      )}

      <section style={toolbar}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users by name, email, role, or title..."
          style={input}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          style={select}
        >
          <option value="all">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
          <option value="mfa">MFA required</option>
        </select>

        <button onClick={() => void load()} style={secondaryButton}>
          Refresh
        </button>
      </section>

      <div style={tableWrap}>
        {loading ? (
          <div style={{ padding: 24 }}>Loading users...</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Security</Th>
                <Th>Failed Logins</Th>
                <Th>Last Login</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((user) => (
                <tr key={user.id}>
                  <Td>
                    <strong>{user.full_name || 'Unnamed User'}</strong>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{user.email}</div>
                  </Td>
                  <Td>{getRoleDisplayName(user.role)}</Td>
                  <Td>{user.title || '—'}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {user.active ? badge('Active', 'green') : badge('Inactive', 'gray')}
                      {isLocked(user) && badge('Locked', 'red')}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {user.mfa_required ? badge('MFA', 'blue') : badge('No MFA', 'yellow')}
                    </div>
                  </Td>
                  <Td>{user.failed_login_count ?? 0}</Td>
                  <Td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button style={smallButton} onClick={() => openEdit(user)}>
                        Edit
                      </button>

                      {user.active ? (
                        <button style={smallButton} onClick={() => void runAction('/api/admin/users/disable', { id: user.id })}>
                          Disable
                        </button>
                      ) : (
                        <button style={smallButton} onClick={() => void runAction('/api/admin/users/enable', { id: user.id })}>
                          Enable
                        </button>
                      )}

                      {isLocked(user) ? (
                        <button style={smallButton} onClick={() => void runAction('/api/admin/users/unlock', { id: user.id })}>
                          Unlock
                        </button>
                      ) : (
                        <button
                          style={smallButton}
                          onClick={() =>
                            void runAction('/api/admin/users/lock', {
                              id: user.id,
                              reason: 'Locked from administration console',
                            })
                          }
                        >
                          Lock
                        </button>
                      )}

                      <button
                        style={smallButton}
                        onClick={() =>
                          void runAction('/api/admin/users/require-mfa', {
                            id: user.id,
                            required: !user.mfa_required,
                          })
                        }
                      >
                        {user.mfa_required ? 'Remove MFA' : 'Require MFA'}
                      </button>

                      <button style={smallButton} onClick={() => void runAction('/api/admin/users/reset-failed-logins', { id: user.id })}>
                        Reset Logins
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {drawerOpen && (
        <div style={drawerBackdrop}>
          <aside style={drawer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{editing ? 'Edit User' : 'Create User'}</h2>
              <button style={smallButton} onClick={() => setDrawerOpen(false)}>
                Close
              </button>
            </div>

            <form onSubmit={submitForm} style={{ display: 'grid', gap: 12 }}>
              <Field label="Tenant ID">
                <input
                  value={form.tenant_id}
                  onChange={(event) => updateForm('tenant_id', event.target.value)}
                  required
                  style={input}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm('email', event.target.value)}
                  required
                  style={input}
                />
              </Field>

              <Field label="Full Name">
                <input
                  value={form.full_name}
                  onChange={(event) => updateForm('full_name', event.target.value)}
                  required
                  style={input}
                />
              </Field>

              <Field label="Role">
                <select value={form.role} onChange={(event) => updateForm('role', event.target.value)} required style={input}>
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.role_key}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Title">
                <input value={form.title} onChange={(event) => updateForm('title', event.target.value)} style={input} />
              </Field>

              <Field label="Phone">
                <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} style={input} />
              </Field>

              <Field label="Department">
                <select value={form.department_id} onChange={(event) => updateForm('department_id', event.target.value)} style={input}>
                  <option value="">No department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </Field>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={form.active} onChange={(event) => updateForm('active', event.target.checked)} />
                Active
              </label>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={form.mfa_required} onChange={(event) => updateForm('mfa_required', event.target.checked)} />
                Require MFA
              </label>

              <button disabled={saving} style={primaryButton}>
                {saving ? 'Saving...' : editing ? 'Update User' : 'Create User'}
              </button>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={td}>{children}</td>;
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 12,
  margin: '20px 0',
};

const statCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 16,
  background: 'white',
};

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 16,
};

const tableWrap: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  overflow: 'auto',
  background: 'white',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: 13,
};

const td: React.CSSProperties = {
  padding: '12px 10px',
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
  fontSize: 14,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const select: React.CSSProperties = {
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
};

const primaryButton: React.CSSProperties = {
  background: '#0f172a',
  color: 'white',
  border: 0,
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};

const secondaryButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '9px 14px',
  cursor: 'pointer',
};

const smallButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  cursor: 'pointer',
};

const drawerBackdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: 50,
};

const drawer: React.CSSProperties = {
  width: 440,
  maxWidth: '100%',
  background: 'white',
  height: '100%',
  padding: 24,
  boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.2)',
  overflow: 'auto',
};