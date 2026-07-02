import { NextResponse } from 'next/server';

export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; error: string; details?: unknown; code?: string; hint?: string };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiOk<T>>({ ok: true, data }, init);
}

export function fail(error: unknown, status = 500) {
  const e = error as any;
  console.error('SBP API ERROR:', e);
  return NextResponse.json<ApiFail>(
    {
      ok: false,
      error: e?.message ?? 'Unknown error',
      details: e?.details ?? e,
      code: e?.code,
      hint: e?.hint,
    },
    { status }
  );
}
