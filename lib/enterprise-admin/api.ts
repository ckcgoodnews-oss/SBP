export async function adminList<T>(entity: string): Promise<T[]> {
  const res = await fetch(`/api/admin/${entity}`, { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Failed to load ${entity}`);
  return json.data ?? [];
}

export async function adminCreate<T>(entity: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/admin/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Failed to create ${entity}`);
  return json.data;
}

export async function adminUpdate<T>(entity: string, id: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/admin/${entity}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...payload }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Failed to update ${entity}`);
  return json.data;
}

export async function adminDelete(entity: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/${entity}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Failed to delete ${entity}`);
}
