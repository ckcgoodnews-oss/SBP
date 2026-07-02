import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-admin';

const table = 'quotes';
const insertFields = ['tenant_id','customer_id','quote_number','status','subtotal','tax_amount','total_amount','valid_until','notes'];
const updateFields = ['customer_id','quote_number','status','subtotal','tax_amount','total_amount','valid_until','notes'];

function pick(input: Record<string, unknown>, allowed: string[]) {
  return Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)));
}

function errorJson(err: any) {
  console.error('QUOTES API ERROR:', { message: err?.message, details: err?.details, hint: err?.hint, code: err?.code, err });
  return NextResponse.json({ error: err?.message ?? 'Unknown error', details: err?.details, hint: err?.hint, code: err?.code }, { status: 500 });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return errorJson(err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = pick(body, insertFields);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return errorJson(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    delete body.id;
    const payload = pick(body, updateFields);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return errorJson(err);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return errorJson(err);
  }
}
