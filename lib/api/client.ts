export type ApiResult<T> = {
  ok: boolean;
  rows?: T[];
  row?: T;
  error?: string;
  details?: unknown;
  [key: string]: unknown;
};

export async function fetchApiRows<T>(url: string): Promise<T[]> {
  const response = await fetch(url, { cache: 'no-store' });
  const payload: ApiResult<T> = await response.json();

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `API request failed: ${url}`);
  }

  return payload.rows || [];
}

export function money(value: unknown): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

export function numberFmt(value: unknown): string {
  return new Intl.NumberFormat('en-US').format(Number(value || 0));
}
