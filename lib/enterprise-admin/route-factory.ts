import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-admin';

export type RouteConfig = {
  table: string;
  defaultOrder?: string;
  defaultOrderAscending?: boolean;
  insertFields?: string[];
  updateFields?: string[];
  softDeleteField?: string;
  softDeleteValue?: unknown;
  select?: string;
};

function pick(input: Record<string, unknown>, allowed?: string[]) {
  if (!allowed) return input;
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => allowed.includes(key))
  );
}

function apiError(config: RouteConfig, err: any) {
  console.error('CRUD ERROR:', {
    table: config.table,
    error: err,
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    code: err?.code,
  });

  return NextResponse.json(
    {
      table: config.table,
      error: err?.message ?? 'Unknown error',
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
    },
    { status: 500 }
  );
}

export function makeCrudHandlers(config: RouteConfig) {
  async function GET() {
    try {
      const supabase = getSupabaseAdmin();
      let query = supabase.from(config.table).select(config.select ?? '*');

      if (config.defaultOrder) {
        query = query.order(config.defaultOrder, {
          ascending: config.defaultOrderAscending ?? false,
        });
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;

      return NextResponse.json({ data });
    } catch (err: any) {
      return apiError(config, err);
    }
  }

  async function POST(request: Request) {
    try {
      const body = await request.json();
      const payload = pick(body, config.insertFields);
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from(config.table)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ data });
    } catch (err: any) {
      return apiError(config, err);
    }
  }

  async function PATCH(request: Request) {
    try {
      const body = await request.json();
      const id = body.id;

      if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
      }

      delete body.id;
      const payload = pick(body, config.updateFields);
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from(config.table)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ data });
    } catch (err: any) {
      return apiError(config, err);
    }
  }

  async function DELETE(request: Request) {
    try {
      const { id } = await request.json();

      if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
      }

      const supabase = getSupabaseAdmin();
      const query = config.softDeleteField
        ? supabase
            .from(config.table)
            .update({ [config.softDeleteField]: config.softDeleteValue ?? 'inactive' })
            .eq('id', id)
        : supabase.from(config.table).delete().eq('id', id);

      const { error } = await query;
      if (error) throw error;

      return NextResponse.json({ ok: true });
    } catch (err: any) {
      return apiError(config, err);
    }
  }

  return { GET, POST, PATCH, DELETE };
}
